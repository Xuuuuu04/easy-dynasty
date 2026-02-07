# EasyDynasty（命理与塔罗智能系统）- 项目体检

最后复核：2026-02-05

## 状态
- 状态标签：active
- 定位：Next.js 前端 + FastAPI 后端的“命理/塔罗”智能助手；后端含 Redis 限流与日志中间件。

## 架构速览
- 前端：`web/`（Next.js 16 + React 19 + Tailwind + TS）
- 后端：`backend/main.py`（FastAPI）
  - API 路由聚合：`backend/app/api/api.py`（当前仅挂 `tarot`）
  - 配置：`backend/app/core/config.py`（`.env` 驱动）
  - 限流：`fastapi-limiter` + `redis://localhost:6379`（初始化失败则降级为“无速率限制”）
  - 日志：`backend/app/core/logger.py` + `log_requests` 中间件

## 文档与运维信息
- `README.md` 内包含线上维护信息（域名/IP/目录/服务命令）。若计划对外分享仓库，建议将运维信息迁移到 `docs/private/` 并做脱敏。

## 风险与建议（优先级）
- 后端静态挂载部分指向 `html-web/`，但当前前端实际位于 `web/`（Next.js）。建议确认是否存在历史遗留目录与无用逻辑，避免混淆。
- 建议增加 `.env.example`（如果后端需要 `.env`，只提供模板，不放 key）。
- 建议补最小“接口与数据结构”文档（输入/输出 schema、错误码），便于交接与复盘。

