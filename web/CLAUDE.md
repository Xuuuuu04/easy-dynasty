[根目录](../CLAUDE.md) > **web**

---

# Web 模块 - Next.js 16 + React 19 前端应用

> 最后更新：2026-01-24 21:12:04

## 变更记录 (Changelog)

### 2026-01-24
- 更新文档时间戳与导航面包屑。
- 确认项目结构与依赖版本。

### 2026-01-20
- 初始化 web 模块文档。
- 记录 Next.js App Router 结构和组件架构。
- 详述双 LLM 配置和数据流。

---

## 模块职责

Web 模块是 EasyDynasty 的前端用户界面，负责：

1. **塔罗占卜体验**：问题输入、牌阵选择、抽牌动画、AI 解读
2. **双 LLM 配置**：支持服务器默认 LLM 和用户自定义 LLM
3. **流式 AI 解读**：SSE（Server-Sent Events）实时流式响应
4. **历史记录管理**：本地存储占卜历史（最多 50 条）
5. **精美 UI 设计**：Glassmorphism 风格、3D 翻转动画、飞牌效果

---

## 入口与启动

### 主入口文件

**`app/layout.tsx`** - 根布局组件 (定义字体、全局样式、ToastProvider)
**`app/page.tsx`** - 首页（问题输入 + 牌阵选择）

### 启动命令

```bash
cd web

# 安装依赖
npm install

# 开发模式
npm run dev        # Webpack (默认)
npm run dev:turbo  # Turbopack

# 生产构建
npm run build
npm start
```

**访问地址**：http://localhost:3000

---

## 对外接口（API Routes）

### 默认 LLM 代理 API

**`app/api/chat/route.ts`**
- **功能**: 代理服务器端 LLM 请求，保护 API 密钥。
- **特性**: 支持 SSE 流式响应，包含请求验证。
- **路径**: `POST /api/chat`

---

## 关键依赖与配置

### 核心依赖
- **框架**: `next` (16.0.10), `react` (19.2.0)
- **UI/样式**: `tailwindcss` (v4), `@tailwindcss/typography`
- **功能库**: `howler` (音效), `jspdf` (导出), `modern-screenshot` (截图), `react-markdown` (渲染)

### 环境变量
- `DEFAULT_LLM_*`: 服务器端 LLM 配置。
- `NEXT_PUBLIC_*`: 客户端公开配置。

---

## 数据模型

主要类型定义位于 `types/tarot.ts`：
- `TarotCard`: 塔罗牌基础信息
- `Spread`: 牌阵定义
- `DrawnCard`: 抽取的牌（含正逆位）
- `ReadingHistory`: 历史记录

静态数据：
- `data/tarot-cards.json`: 78 张牌数据
- `data/spreads.json`: 牌阵定义

---

## 页面结构（App Router）

| 路径 | 文件 | 功能 |
| --- | --- | --- |
| `/` | `app/page.tsx` | 首页 |
| `/draw` | `app/draw/page.tsx` | 抽牌页面 (扇形交互) |
| `/analysis` | `app/analysis/page.tsx` | AI 解读与追问 |
| `/history` | `app/history/page.tsx` | 历史记录 |
| `/settings` | `app/settings/page.tsx` | API 设置 |

---

## 组件架构

- **3D/动画**: `FanDeck` (扇形选牌), `FlipCard` (翻转), `FlyingCard` (飞牌)
- **展示**: `SpreadLayout` (牌阵布局), `TarotCard`, `AnalysisDisplay`
- **交互**: `TarotChat` (流式对话), `ModelSelector`

---

## 样式系统

- **引擎**: Tailwind CSS v4
- **风格**: Glassmorphism (毛玻璃), 深色模式 (深空黑背景)
- **字体**: Cinzel/Playfair Display (标题), Geist Sans (正文)

---

## 相关文件清单

- `app/layout.tsx`: 根布局
- `hooks/useTarotAnalysis.ts`: AI 分析核心逻辑
- `utils/prompts.ts`: 提示词工程
- `utils/sseParser.ts`: SSE 流式解析器

---

## 相关链接

- **返回根文档**: [../CLAUDE.md](../CLAUDE.md)
- **后端文档**: [../backend/CLAUDE.md](../backend/CLAUDE.md)
