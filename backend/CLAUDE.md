[根目录](../CLAUDE.md) > **backend**

---

# Backend 模块 - Python FastAPI 后端服务

> 最后更新：2026-01-20 18:27:24

## 变更记录 (Changelog)

### 2026-01-20
- 初始化 backend 模块文档
- 识别 FastAPI 应用结构和数据库配置
- 记录依赖库和入口文件

---

## 模块职责

Backend 模块是 EasyDynasty 的后端 API 服务，负责：

1. **API 服务**：提供 RESTful API 端点（当前仅基础路由）
2. **数据库交互**：通过 SQLAlchemy ORM 管理 MySQL 数据库
3. **命理计算**：集成 `lunar-python`（农历）和 `iztro-py`（紫微斗数）库
4. **CORS 支持**：允许前端跨域访问（端口 3000、3001）
5. **配置管理**：使用 Pydantic Settings 集中管理环境变量

---

## 入口与启动

### 主入口文件

**`main.py`** - FastAPI 应用入口

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Welcome to EasyDynasty API"}

@app.get("/health")
def health_check():
    return {"status": "ok", "db_connection": "pending_check"}
```

### 启动命令

```bash
cd backend

# 激活虚拟环境
source venv/bin/activate  # Windows: venv\Scripts\activate

# 开发模式（自动重载）
uvicorn main:app --reload --port 8000

# 生产模式
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

**访问地址**：
- API 根路径：http://localhost:8000
- Swagger UI：http://localhost:8000/docs
- ReDoc：http://localhost:8000/redoc

---

## 对外接口

### 当前 API 端点

| 方法 | 路径 | 描述 | 返回值 |
|------|------|------|--------|
| GET | `/` | 欢迎消息 | `{"message": "Welcome to EasyDynasty API"}` |
| GET | `/health` | 健康检查 | `{"status": "ok", "db_connection": "pending_check"}` |

### 待扩展端点（建议）

**塔罗牌相关**：
- `POST /api/v1/tarot/draw` - 抽牌
- `POST /api/v1/tarot/analyze` - AI 解读（后端代理）

**命理计算**：
- `POST /api/v1/bazi/calculate` - 八字计算
- `POST /api/v1/ziwei/chart` - 紫微斗数盘面
- `POST /api/v1/lunar/date` - 农历转换

**用户与历史**：
- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/login` - 用户登录
- `GET /api/v1/history` - 获取历史记录
- `POST /api/v1/history` - 保存历史记录

---

## 关键依赖与配置

### 依赖列表（requirements.txt）

```
fastapi==0.109.0          # Web 框架
uvicorn==0.27.0           # ASGI 服务器
sqlalchemy==2.0.25        # ORM
pymysql==1.1.0            # MySQL 驱动
python-dotenv==1.0.1      # 环境变量加载
lunar-python==1.3.10      # 农历计算
iztro-py==0.3.3           # 紫微斗数
pydantic==2.6.0           # 数据验证
pydantic-settings==2.1.0  # Pydantic 配置管理
cryptography              # 加密库
```

### 配置文件（app/core/config.py）

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "EasyDynasty API"
    API_V1_STR: str = "/api/v1"

    # Database
    DB_USER: str = "root"
    DB_PASSWORD: str = "xsy19507"
    DB_HOST: str = "localhost"
    DB_PORT: str = "3306"
    DB_NAME: str = "easydynasty"

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
```

**环境变量文件（.env）**：
```bash
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306
DB_NAME=easydynasty
```

---

## 数据模型

### ORM 基类（app/db/base.py）

```python
from typing import Any
from sqlalchemy.ext.declarative import as_declarative, declared_attr

@as_declarative()
class Base:
    id: Any
    __name__: str

    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower()
```

**说明**：
- 所有 ORM 模型继承此 `Base` 类
- 表名自动生成（类名转小写）

### 数据库会话（app/db/session.py）

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    pool_pre_ping=True,  # 验证连接存活
    echo=True            # 开发模式打印 SQL（生产环境设为 False）
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

**使用方式**：
```python
from app.db.session import SessionLocal

db = SessionLocal()
try:
    # 数据库操作
    db.query(User).first()
finally:
    db.close()
```

### 待扩展数据模型（建议）

**用户模型**：
```python
from app.db.base import Base
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
```

**占卜历史模型**：
```python
class ReadingHistory(Base):
    __tablename__ = "reading_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    question = Column(String(500))
    spread_id = Column(String(50))
    cards_json = Column(JSON)  # 存储抽中的牌
    analysis = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
```

---

## 数据库初始化

### 初始化脚本（init_db.py）

当前文件存在但内容未在扫描中读取。建议实现：

```python
from app.db.base import Base
from app.db.session import engine

def init_db():
    """创建所有表"""
    Base.metadata.create_all(bind=engine)
    print("数据库表创建成功")

if __name__ == "__main__":
    init_db()
```

**执行初始化**：
```bash
python init_db.py
```

---

## 测试与质量

### 当前状态
- **无测试文件**（待补充）

### 建议添加

**单元测试**（pytest）：
```bash
pip install pytest pytest-asyncio httpx
```

**测试结构**：
```
backend/
└── tests/
    ├── __init__.py
    ├── conftest.py           # pytest fixtures
    ├── test_main.py          # API 端点测试
    ├── test_db.py            # 数据库测试
    └── test_lunar.py         # 命理计算测试
```

**示例测试**：
```python
# tests/test_main.py
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to EasyDynasty API"}

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
```

### 代码质量工具

建议添加：
- **Black**：代码格式化
- **Flake8**：代码风格检查
- **MyPy**：类型检查
- **Pytest-Cov**：测试覆盖率

---

## 常见问题 (FAQ)

### Q1: 如何修改数据库连接配置？
**A**:
1. 编辑 `.env` 文件（推荐）
2. 或直接修改 `app/core/config.py` 中的默认值

### Q2: 如何添加新的 API 端点？
**A**:
在 `main.py` 中添加路由函数：
```python
@app.post("/api/v1/tarot/draw")
def draw_cards(count: int = 3):
    # 业务逻辑
    return {"cards": [...]}
```

### Q3: 如何使用 lunar-python 库？
**A**:
```python
from lunar import Lunar

# 阳历转农历
lunar = Lunar.fromYmd(2026, 1, 20)
print(lunar.toFullString())  # "二〇二六年正月初三"
```

### Q4: 如何使用 iztro-py 库？
**A**:
```python
from iztro import getHoroscope

# 生成紫微斗数盘面
horoscope = getHoroscope(2000, 1, 1, 2, 0, False, "男")
print(horoscope.toFullString())
```

---

## 相关文件清单

### 核心文件
- `main.py` - FastAPI 应用入口
- `init_db.py` - 数据库初始化脚本
- `requirements.txt` - Python 依赖列表

### 配置与数据库
- `app/core/config.py` - Pydantic Settings 配置
- `app/db/base.py` - SQLAlchemy ORM 基类
- `app/db/session.py` - 数据库会话管理

### 待补充
- `app/api/` - API 路由模块（建议创建）
- `app/models/` - 数据库模型（建议创建）
- `app/schemas/` - Pydantic Schemas（建议创建）
- `app/crud.py` - CRUD 操作（建议创建）

---

## 开发建议

### 短期目标
1. **补充 API 端点**：添加塔罗牌、八字、紫微斗数相关接口
2. **完善数据库模型**：用户、历史记录、占卜结果
3. **添加测试**：单元测试 + 集成测试
4. **错误处理**：统一异常处理和日志记录

### 中期目标
1. **用户认证**：JWT Token、OAuth2
2. **数据验证**：Pydantic Schemas 严格验证
3. **API 版本控制**：`/api/v1/`、`/api/v2/`
4. **异步操作**：使用 `async/await` 提升性能

### 长期目标
1. **微服务拆分**：塔罗、八字、紫微斗数独立服务
2. **消息队列**：Celery + Redis 处理异步任务
3. **缓存优化**：Redis 缓存热门数据
4. **监控告警**：Prometheus + Grafana

---

## 相关链接

- **返回根文档**: [../CLAUDE.md](../CLAUDE.md)
- **前端文档**: [../web/CLAUDE.md](../web/CLAUDE.md)
- **项目路径**: `/Users/xushaoyang/Desktop/命理与塔罗/EasyDynasty/backend`
- **初始化时间**: 2026-01-20 18:27:24
