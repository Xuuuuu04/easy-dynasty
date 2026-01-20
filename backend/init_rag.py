import os
from langchain_community.document_loaders import TextLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from dotenv import load_dotenv

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)

# SiliconFlow Config (Using OpenAI-compatible API)
BASE_URL = "https://api.siliconflow.cn/v1"
API_KEY = os.getenv("DEFAULT_LLM_API_KEY")
EMBEDDING_MODEL = "Qwen/Qwen3-Embedding-8B" # User specified high-quality embedding

KNOWLEDGE_BASE_DIR = "knowledge_base/bazi"
PERSIST_DIR = "chroma_db"

def init_knowledge_base():
    print("Initializing knowledge base...")
    
    # 1. Load documents
    print(f"Loading documents from {KNOWLEDGE_BASE_DIR}...")
    loader = DirectoryLoader(
        KNOWLEDGE_BASE_DIR, 
        glob="**/*.md", 
        loader_cls=TextLoader,
        loader_kwargs={'encoding': 'utf8'}
    )
    docs = loader.load()
    print(f"Loaded {len(docs)} documents.")

    # 2. Split documents
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000, 
        chunk_overlap=200,
        separators=["\n\n", "\n", "。", "！", "？", " ", ""]
    )
    splits = text_splitter.split_documents(docs)
    print(f"Split into {len(splits)} chunks.")

    # 3. Create Vector Store
    print("Creating vector store (this may take a while)...")
    if not API_KEY:
        print("ERROR: DEFAULT_LLM_API_KEY not found in environment.")
        return
    
    # Explicitly set environment variable as well
    os.environ["OPENAI_API_KEY"] = API_KEY
    os.environ["OPENAI_API_BASE"] = BASE_URL

    embeddings = OpenAIEmbeddings(
        model=EMBEDDING_MODEL,
        api_key=API_KEY,
        base_url=BASE_URL
    )
    
    vectorstore = Chroma.from_documents(
        documents=splits, 
        embedding=embeddings,
        persist_directory=PERSIST_DIR
    )
    
    print(f"Knowledge base initialized and persisted to {PERSIST_DIR}.")

if __name__ == "__main__":
    init_knowledge_base()
