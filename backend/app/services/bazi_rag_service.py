import os
import httpx
import jieba
import json
import datetime
from typing import List, AsyncGenerator
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain_community.retrievers import BM25Retriever
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_core.documents import Document
from lunar_python import Solar
from dotenv import load_dotenv

# Load environment variables
base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
dotenv_path = os.path.join(base_dir, '.env')
load_dotenv(dotenv_path)

BASE_URL = "https://api.siliconflow.cn/v1"
API_KEY = os.getenv("DEFAULT_LLM_API_KEY", "").strip()
EMBEDDING_MODEL = "Qwen/Qwen3-Embedding-8B"
RERANK_MODEL = "Qwen/Qwen3-Reranker-8B"
LLM_MODEL = "moonshotai/Kimi-K2-Instruct-0905"

PERSIST_DIR = os.path.join(base_dir, "chroma_db")

class BaziRAGService:
    def __init__(self):
        if not API_KEY:
            print("CRITICAL: DEFAULT_LLM_API_KEY is not set.")
        
        self.embeddings = OpenAIEmbeddings(
            model=EMBEDDING_MODEL,
            api_key=API_KEY,
            base_url=BASE_URL
        )
        self.vectorstore = Chroma(
            persist_directory=PERSIST_DIR,
            embedding_function=self.embeddings
        )
        
        # Initialize Hybrid Search (BM25)
        try:
            all_docs_data = self.vectorstore.get()
            all_documents = []
            for i in range(len(all_docs_data['documents'])):
                all_documents.append(Document(
                    page_content=all_docs_data['documents'][i],
                    metadata=all_docs_data['metadatas'][i] if all_docs_data['metadatas'] else {}
                ))
            
            if all_documents:
                self.bm25_retriever = BM25Retriever.from_documents(
                    all_documents, 
                    preprocess_func=lambda text: jieba.lcut(text)
                )
                self.bm25_retriever.k = 15
            else:
                self.bm25_retriever = None
        except Exception as e:
            print(f"Error initializing BM25: {e}")
            self.bm25_retriever = None

        self.llm = ChatOpenAI(
            model=LLM_MODEL,
            api_key=API_KEY,
            base_url=BASE_URL,
            streaming=True
        )

    async def rerank_documents(self, query: str, documents: List[str], top_n: int = 5) -> List[str]:
        if not API_KEY or not documents:
            return documents[:top_n]

        url = "https://api.siliconflow.cn/v1/rerank"
        headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
        payload = {"model": RERANK_MODEL, "query": query, "documents": documents, "top_n": top_n}
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, json=payload, timeout=30.0)
                if response.status_code == 200:
                    result = response.json()
                    return [documents[item.get("index")] for item in result.get("results", [])]
                return documents[:top_n]
            except Exception:
                return documents[:top_n]

    async def hybrid_retrieve(self, query: str, top_n: int = 7) -> str:
        """
        Internal tool for the agent to retrieve knowledge.
        """
        # 1. Vector + BM25
        vector_docs = self.vectorstore.similarity_search(query, k=15)
        bm25_docs = self.bm25_retriever.invoke(query) if self.bm25_retriever else []
        
        # 2. Dedup
        all_candidate_texts = list(set([d.page_content for d in (vector_docs + bm25_docs)]))
        
        # 3. Rerank
        final_texts = await self.rerank_documents(query, all_candidate_texts, top_n=top_n)
        return "\n---\n".join(final_texts)

    def get_current_time_context(self) -> str:
        now = datetime.datetime.now()
        solar = Solar.fromYmdHms(now.year, now.month, now.day, now.hour, now.minute, now.second)
        lunar = solar.getLunar()
        return f"""
        当前公历：{now.strftime('%Y-%m-%d')}
        当前流年：{lunar.getYearInGanZhi()}年 ({lunar.getYear()})
        当前流月：{lunar.getMonthInGanZhi()}月
        当前流日：{lunar.getDayInGanZhi()}日
        """

    async def analyze_with_rag(self, bazi_data: dict, query: str, gender: str = "未知") -> AsyncGenerator[str, None]:
        """
        Comprehensive Bazi analysis using an Autonomous Multi-Turn Agent.
        The Agent decides what to search and when it has enough info.
        """
        # Yield immediate initialization event
        yield f"data: {json.dumps({'type': 'thought', 'content': '正在校准时空坐标，开启命理推演...'})}\n\n"

        context_accumulator = []
        max_rounds = 3
        
        time_context = self.get_current_time_context()
        gender_str = "男" if gender == "male" else "女" if gender == "female" else gender
        
        # Initial prompt to set the stage
        bazi_info_str = f"性别：{gender_str}\n{time_context}\n排盘数据：{str(bazi_data)}"
        
        # 1. Start the Reasoning Loop
        for round_idx in range(1, max_rounds + 1):
            current_knowledge = "\n".join(context_accumulator) if context_accumulator else "无"
            
            planner_prompt = f"""
你是一位顶级命理大师。你正在为用户进行深度八字分析。
当前排盘数据：{bazi_info_str}
用户的问题：{query}
已搜集到的知识：{current_knowledge}

你的目标是生成一份包含以下结构的报告：
1. **高层概览**：一针见血的年度/运势关键点。
2. **命局核心**：格局、用神、强弱。
3. **大运趋势**：当前大运的吉凶判断。
4. **流年流月实战**：针对当前流年（及关键流月）的财富、事业、感情分析。
5. **行动指南**：具体的建议。

请分析当前信息，指出还需要查阅哪些古籍（如子平真诠、滴天髓、三命通会）关于格局、流年应事、大运神煞的论述。
如果信息不足，请输出：[THOUGHT] 你的思考过程 [SEARCH] 具体的检索关键词
如果认为信息已充足，请输出：[FINISH] 你的简短总结

请直接输出指令。
"""
            try:
                plan_resp = await self.llm.ainvoke(planner_prompt)
                plan_text = plan_resp.content
                
                if "[SEARCH]" in plan_text:
                    parts = plan_text.split("[SEARCH]")
                    thought = parts[0].replace("[THOUGHT]", "").strip()
                    search_query = parts[1].strip()
                    
                    t_str = f"第{round_idx}轮推演：{thought}"
                    a_str = f"查阅古籍：{search_query}"
                    yield f"data: {json.dumps({'type': 'thought', 'content': t_str})}\n\n"
                    yield f"data: {json.dumps({'type': 'action', 'content': a_str})}\n\n"
                    
                    new_context = await self.hybrid_retrieve(search_query, top_n=5)
                    context_accumulator.append(f"--- 检索轮次 {round_idx} ({search_query}) ---\n{new_context}")
                    
                elif "[FINISH]" in plan_text or round_idx == max_rounds:
                    thought = plan_text.replace("[FINISH]", "").strip()
                    finish_msg = thought if thought else "信息已充足，开始撰写深度报告..."
                    t_str = f"最终推演确认：{finish_msg}"
                    yield f"data: {json.dumps({'type': 'thought', 'content': t_str})}\n\n"
                    break
                else:
                    yield f"data: {json.dumps({'type': 'thought', 'content': '正在整理资料...'})}\n\n"
                    break
            except Exception as e:
                print(f"Agent Loop Error: {e}")
                break

        # 2. Final Synthesis (Streaming)
        all_context = "\n\n".join(context_accumulator)
        final_prompt = """
你是一位精通《子平真诠》、《渊海子平》、《三命通会》、《滴天髓》等命理经典的顶级大师。
请根据排盘数据、当前时间节点（流年流月）和检索到的经典依据，为用户撰写一份**极具实战指导意义**的命理分析报告。

【当前时空与排盘】
{bazi_info}

【经典依据】
{context}

【用户问题】
{question}

请严格按照以下结构输出 Markdown 格式报告：

# 易 · 深度启示录

## I. 高层概览 (Executive Summary)
> 用引言风格，一针见血地指出命主当前的核心运势特征（例如：“今年是破局之年”或“韬光养晦之时”），列出 3 个年度关键点。

## II. 命局核心 (The Core)
*   **格局定位**：基于古籍明确指出格局（如“七杀格”、“伤官佩印”等），引用《子平》或《滴天髓》原文佐证。
*   **强弱与用神**：分析日主得令得地情况，明确指出“最喜五行”和“最忌五行”。

## III. 大运与流年 (The Trend & The Weather)
*   **大运审视**：当前大运是顺风还是逆风？
*   **流年实战 ({current_ganzhi_year}年)**：
    *   **财富运**：财星透出还是被劫？投资建议。
    *   **事业运**：官杀是否有制？升迁机会。
    *   **感情运**：桃花、合冲情况。
*   **关键流月预警**：指出未来一年中需要特别注意的 1-2 个月份（好或坏），并说明理由。

## IV. 行动指南 (Action Plan)
*   **趋吉避凶**：颜色、方位、饰品建议。
*   **心态心法**：送给命主的一句古籍金句或人生箴言。

**要求：**
1.  **文风优美**：使用半文半白的专业命理风格，但解释要通俗易懂。
2.  **拒绝模棱两可**：观点要鲜明，好就是好，坏就是坏（但要给出化解之道）。
3.  **实时性**：必须紧扣“当前流年”进行分析，不要只讲大道理。

开始输出：
"""
        
        # Extract current year ganzhi for the prompt placeholder
        import re
        current_ganzhi_year = "本"
        match = re.search(r"当前流年：(..)年", time_context)
        if match:
            current_ganzhi_year = match.group(1)

        prompt = ChatPromptTemplate.from_template(final_prompt)
        chain = prompt | self.llm | StrOutputParser()

        async for chunk in chain.astream({
            "context": all_context,
            "bazi_info": bazi_info_str,
            "question": query,
            "current_ganzhi_year": current_ganzhi_year
        }):
            yield f"data: {json.dumps({'type': 'content', 'content': chunk})}\n\n"

bazi_rag_service = BaziRAGService()