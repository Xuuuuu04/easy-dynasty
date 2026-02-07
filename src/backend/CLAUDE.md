[根目录](../CLAUDE.md) > **backend**

---

# Backend 模块 - FastAPI 后端服务

> 最后更新：2026-01-24 21:12:04

## 变更记录 (Changelog)

- **2026-01-24**: 初始化后端模块文档；扫描 API 结构与依赖。

## 模块职责

Backend 模块是 EasyDynasty 的核心业务逻辑层，负责：
1. **API 网关**: 提供统一的 RESTful API 接口。
2. **AI 代理**: 集成 OpenAI/LangChain，处理塔罗解读请求。
3. **速率限制**: 基于 Redis 的请求限流 (Rate Limiting)。
4. **服务集成**: 邮件服务、位置服务等。

## 入口与启动

### 入口文件
- **`main.py`**: 应用入口，配置 FastAPI 实例、CORS、中间件及路由挂载。
- **`app/api/api.py`**: 路由分发中心。

### 启动命令
```bash
# 激活虚拟环境
.\venv\Scripts\activate

# 启动开发服务器
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 对外接口

API 路由挂载于 `/api/v1` (由配置决定)，主要端点包括：
- `GET /health`: 健康检查。
- `GET /`: 根路径欢迎信息。
- **Tarot**: 塔罗牌相关业务 (见 `app/api/endpoints/tarot.py`)。

## 关键依赖与配置

### 核心依赖 (`requirements.txt`)
- **Web 框架**: `fastapi`, `uvicorn`
- **AI/LLM**: `langchain-openai`
- **工具库**: `lunar-python` (农历/命理计算), `pydantic`
- **存储/缓存**: `redis`
- **安全**: `python-jose`, `passlib`

### 环境变量 (`.env`)
需配置以下核心变量：
- `PROJECT_NAME`: 项目名称
- `API_V1_STR`: API 版本前缀
- `Redis`: 连接地址 (默认 localhost:6379)

## 目录结构

```text
backend/
├── app/
│   ├── api/          # 路由定义
│   ├── core/         # 核心配置 (config, logger, security)
│   ├── schemas/      # Pydantic 数据模型
│   ├── services/     # 业务逻辑服务 (email, location, settings)
│   └── main.py       # (部分旧入口，以根目录 main.py 为准)
├── logs/             # 系统日志
├── main.py           # 主入口
├── requirements.txt  # 依赖清单
└── pyproject.toml    # 工具配置
```

## 数据模型

主要数据模型位于 `app/schemas/`：
- **Tarot**: 塔罗牌抽取、阵法定义、解读结果模型。

## 测试与质量

- **Linting**: 建议使用 `ruff` 或 `flake8`。
- **Formatting**: 建议使用 `black`。
- **Tests**: 尚未检测到 `tests` 目录，建议建立 `tests/` 并使用 `pytest`。

## 常见问题 (FAQ)

- **Q: Redis 连接失败怎么办？**
  - A: 确保本地 Redis 服务已启动 (默认端口 6379)。如果连接失败，Rate Limiting 功能将自动降级关闭，不影响主业务。
- **Q: 如何添加新的 API 端点？**
  - A: 在 `app/api/endpoints/` 创建新文件，在 `app/api/api.py` 中注册 Router。
