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

## 🖥️ 服务器配置说明 (维护指南)

此处记录服务器的关键配置，便于后续 AI 维护和接手。

- **IP**: `8.155.162.119`
- **用户**: `root`
- **域名**: `https://tarot.oyemoye.top`
- **项目根目录**: `/root/tarot`

### 目录结构 (服务器)
```
/root/tarot/
├── backend/            # 后端 Python 代码
│   ├── .env            # 环境变量 (含 API Key)
│   └── venv/           # Python 虚拟环境
└── web/                # 前端 Next.js 代码
    └── .next/          # 构建产物
```

### 服务管理

| 服务名称 | 类型 | 端口 | 管理命令 |
|----------|------|------|----------|
| **后端 API** | Systemd | 8001 | `systemctl restart tarot-backend` |
| **前端 UI** | PM2 | 3000 | `pm2 restart tarot-frontend` |
| **Redis** | Systemd | 6379 | `systemctl restart redis-server` |
| **Nginx** | Systemd | 80/443 | `systemctl reload nginx` |
| **API 访问** | Nginx 反代 | `/api -> 8001` | Nginx 配置中转发 |

### 常用命令速查

**1. 查看日志**
- 后端日志: `journalctl -u tarot-backend -f`
- 前端日志: `pm2 logs tarot-frontend`

**2. 更新部署**
通常流程：
1. 本地打包代码 (`tar -czf ...`)
2. 上传至服务器 (`scp ...`)
3. 服务器解压覆盖 (`tar -xzf ...`)
4. 重启对应服务 (`systemctl restart ...` 或 `pm2 restart ...`)

**3. 环境变量**
后端配置位于 `/root/tarot/backend/.env`。修改后必需重启 `tarot-backend` 服务。

### 🚨 常见问题处理

- **服务繁忙 / 500 错误**:
  - 检查 Redis 是否运行: `systemctl status redis-server`
  - 检查 API Key 是否过期.
- **前端页面无法加载**:
  - 检查 PM2 状态: `pm2 list`
  - 检查 Nginx 配置: `nginx -t`

## 📄 免责声明
本系统仅供娱乐，不提供任何专业建议。
