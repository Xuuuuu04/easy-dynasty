# 易朝 (EasyDynasty) - 命理与塔罗智能系统

融合传统东方八字与西方塔罗的智能命理助手，基于 Next.js 和 FastAPI 构建。

## 🛠️ 技术栈

- **前端**: Next.js 16 (React 19), TailwindCSS, TypeScript
- **后端**: FastAPI, Python 3.10, Uvicorn
- **AI 模型**: Qwen/Qwen3-Next-80B-A3B-Instruct (via SiliconFlow API)
- **数据库/缓存**: Redis (用于 API 限流)
- **部署**: Nginx (反代), PM2 (前端进程), Systemd (后端进程)

## 🚀 快速开始

### 本地开发

1. **后端启动**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```

2. **前端启动**:
   ```bash
   cd web
   pnpm install
   pnpm dev
   ```
   访问: http://localhost:3000

## 🖥️ 部署与运维说明

为满足公开仓库安全要求，README 不再包含服务器 IP、用户、目录等敏感运维信息。

- 公开部署流程：请参考 `docs/DEPLOY.md`（如不存在请在后续补齐）
- 私有运维信息：请存放在未纳入版本控制的私有文档中

### 🚨 常见问题处理

- **服务繁忙 / 500 错误**:
  - 检查 Redis 是否运行: `systemctl status redis-server`
  - 检查 API Key 是否过期.
- **前端页面无法加载**:
  - 检查 PM2 状态: `pm2 list`
  - 检查 Nginx 配置: `nginx -t`

## 📄 免责声明
本系统仅供娱乐，不提供任何专业建议。


## 开发进度（截至 2026-02-07）
- 已完成可公开仓库基线整理：补齐许可证、清理敏感与内部说明文件。
- 当前版本可构建/可运行，后续迭代以 issue 与提交记录持续公开追踪。

## Language
- 中文：[`README.md`](./README.md)
- English：[`README_EN.md`](./README_EN.md)

## 统一源码目录
- 源码入口：[`src/`](./src)

## 目录结构
- 结构说明：[`docs/PROJECT_STRUCTURE.md`](./docs/PROJECT_STRUCTURE.md)
