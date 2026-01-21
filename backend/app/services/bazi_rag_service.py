import os
import httpx
import jieba
import json
import datetime
from typing import List, AsyncGenerator, Optional
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain_community.retrievers import BM25Retriever
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_core.documents import Document
from lunar_python import Solar
from app.services.settings_service import SettingsService

class BaziRAGService:
    def __init__(self):
        self._vectorstore = None
        self._bm25_retriever = None
        self._llm = None
        self._embeddings = None

    def _get_config(self):
        return {
            "api_key": SettingsService.get("DEFAULT_LLM_API_KEY"),
            "base_url": SettingsService.get("LLM_BASE_URL", "https://api.siliconflow.cn/v1"),
            "bazi_model": SettingsService.get("BAZI_MODEL", "moonshotai/Kimi-K2-Instruct-0905"),
            "embedding_model": "Qwen/Qwen3-Embedding-8B",
            "rerank_model": "Qwen/Qwen3-Reranker-8B"
        }

    def _init_resources(self):
        config = self._get_config()
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        persist_dir = os.path.join(base_dir, "chroma_db")

        if not self._embeddings:
            self._embeddings = OpenAIEmbeddings(
                model=config["embedding_model"],
                api_key=config["api_key"],
                base_url=config["base_url"]
            )
        
        if not self._vectorstore:
            self._vectorstore = Chroma(
                persist_directory=persist_dir,
                embedding_function=self._embeddings
            )
            
            try:
                all_docs_data = self._vectorstore.get()
                all_documents = [Document(page_content=d, metadata=m or {{}}) for d, m in zip(all_docs_data['documents'], all_docs_data['metadatas'] or [{{}} for _ in all_docs_data['documents']])]
                if all_documents:
                    self._bm25_retriever = BM25Retriever.from_documents(all_documents, preprocess_func=lambda text: jieba.lcut(text))
                    self._bm25_retriever.k = 10
            except:
                pass

        self._llm = ChatOpenAI(
            model=config["bazi_model"],
            api_key=config["api_key"],
            base_url=config["base_url"],
            streaming=True
        )

    async def rerank_documents(self, query: str, documents: List[str], top_n: int = 5) -> List[str]:
        config = self._get_config()
        if not config["api_key"] or not documents: return documents[:top_n]
        url = f"{config['base_url']}/rerank"
        payload = {"model": config["rerank_model"], "query": query, "documents": documents, "top_n": top_n}
        async with httpx.AsyncClient() as client:
            try:
                resp = await client.post(url, json=payload, headers={"Authorization": f"Bearer {config['api_key']}"}, timeout=10.0)
                if resp.status_code == 200:
                    return [documents[item.get("index")] for item in resp.json().get("results", [])]
            except: pass
        return documents[:top_n]

    async def hybrid_retrieve(self, query: str, top_n: int = 7) -> str:
        self._init_resources()
        vector_docs = self._vectorstore.similarity_search(query, k=15)
        bm25_docs = self._bm25_retriever.invoke(query) if self._bm25_retriever else []
        all_candidate_texts = list(set([d.page_content for d in (vector_docs + bm25_docs)]))
        final_texts = await self.rerank_documents(query, all_candidate_texts, top_n=top_n)
        return "\n---\n".join(final_texts)

    def get_current_time_context(self) -> str:
        now = datetime.datetime.now()
        solar = Solar.fromYmdHms(now.year, now.month, now.day, now.hour, now.minute, now.second)
        lunar = solar.getLunar()
        return f"当前公历：{now.strftime('%Y-%m-%d')}\n当前流年：{lunar.getYearInGanZhi()}年\n当前流月：{lunar.getMonthInGanZhi()}月"

    async def analyze_with_rag(self, bazi_data: dict, query: str, gender: str = "未知") -> AsyncGenerator[str, None]:
        """
        Autonomous Multi-Turn Agent for Bazi Analysis.
        The Agent decides what to search and when it has enough info.
        """
        self._init_resources()

        yield f"data: {json.dumps({'type': 'thought', 'content': '正在校准时空坐标，开启命理推演...'})}\n\n"

        context_accumulator = []
        max_rounds = 3

        time_context = self.get_current_time_context()
        gender_str = "男" if gender == "male" else "女" if gender == "female" else gender
        bazi_info_str = f"性别：{gender_str}\n{time_context}\n排盘数据：{str(bazi_data)}"

        # Agent Reasoning Loop
        for round_idx in range(1, max_rounds + 1):
            current_knowledge = "\n".join(context_accumulator) if context_accumulator else "无"

            planner_prompt = f"""你是一位顶级命理大师。你正在为用户进行深度八字分析。
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

请直接输出指令。"""

            try:
                plan_resp = await self._llm.ainvoke(planner_prompt)
                plan_text = plan_resp.content

                if "[SEARCH]" in plan_text:
                    parts = plan_text.split("[SEARCH]")
                    thought = parts[0].replace("[THOUGHT]", "").strip()
                    search_query = parts[1].strip()

                    yield f"data: {json.dumps({'type': 'thought', 'content': f'第{round_idx}轮推演：{thought}'})}\n\n"
                    yield f"data: {json.dumps({'type': 'action', 'content': f'查阅古籍：{search_query}'})}\n\n"

                    new_context = await self.hybrid_retrieve(search_query, top_n=5)
                    context_accumulator.append(f"--- 检索轮次 {round_idx} ({search_query}) ---\n{new_context}")

                elif "[FINISH]" in plan_text or round_idx == max_rounds:
                    thought = plan_text.replace("[FINISH]", "").strip()
                    finish_msg = thought if thought else "信息已充足，开始撰写深度报告..."
                    yield f"data: {json.dumps({'type': 'thought', 'content': f'最终推演确认：{finish_msg}'})}\n\n"
                    break
                else:
                    yield f"data: {json.dumps({'type': 'thought', 'content': '正在整理资料...'})}\n\n"
                    break
            except Exception as e:
                print(f"Agent Loop Error: {e}")
                yield f"data: {json.dumps({'type': 'thought', 'content': f'推演遇到异常，正在整理已有信息...'})}\n\n"
                break

        # Final Synthesis
        all_context = "\n\n".join(context_accumulator)
        final_prompt = f"""你是一位精通《子平真诠》、《渊海子平》、《三命通会》、《滴天髓》等命理经典的顶级大师。
请根据排盘数据、当前时间节点（流年流月）和检索到的经典依据，为用户撰写一份**极具实战指导意义**的命理分析报告。

【当前时空与排盘】
{bazi_info_str}

【经典依据】
{all_context}

【用户问题】
{query}

报告结构：
# 命理启示录

## 一、运势总览
一针见血地概括当前流年的核心能量。

## 二、命局核心
分析格局名称、成格条件、日主旺衰、用神取法。必须引用检索到的经典论述支持观点。

## 三、大运与流年实战
分析当前大运的吉凶，当前流年应事（财富、事业、感情）。注意流年流月的具体应验。

## 四、行动指南
提供切实可行的趋吉避凶建议。如流年不利，如何化解；如流年有利，如何把握。

请输出 Markdown 格式，层次清晰，论述严谨，避免空洞。"""

        # Streaming final response
        async for chunk in self._llm.stream(final_prompt):
            content = chunk.content if hasattr(chunk, 'content') else str(chunk)
            yield f"data: {json.dumps({'type': 'content', 'content': content})}\n\n"

bazi_rag_service = BaziRAGService()