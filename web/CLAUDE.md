[根目录](../CLAUDE.md) > **web**

---

# Web 模块 - Next.js 16 + React 19 前端应用

> 最后更新：2026-01-20 18:27:24

## 变更记录 (Changelog)

### 2026-01-20
- 初始化 web 模块文档
- 记录 Next.js App Router 结构和组件架构
- 详述双 LLM 配置和数据流

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

**`app/layout.tsx`** - 根布局组件

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono, Cinzel, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "TarotWhisper | Mystical Tarot & Astrology Insights",
  description: "TarotWhisper 将塔罗与占星的灵感融合，为你带来沉浸式的神秘占卜体验。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} ${playfair.variable} antialiased`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
```

**`app/page.tsx`** - 首页（问题输入 + 牌阵选择）

### 启动命令

```bash
cd web

# 安装依赖（首次）
npm install

# 开发模式
npm run dev        # Webpack（默认）
npm run dev:turbo  # Turbopack（更快，实验性）

# 生产构建
npm run build
npm start

# 代码检查
npm run lint
```

**访问地址**：
- 开发服务器：http://localhost:3000
- 生产构建：http://localhost:3000

---

## 对外接口（API Routes）

### 默认 LLM 代理 API

**`app/api/chat/route.ts`** - 服务器端 OpenAI 兼容 API 代理

**功能**：
- 接收前端聊天请求
- 代理到服务器配置的默认 LLM（保护 API 密钥）
- 支持 SSE 流式响应
- 完整的请求验证（消息数量、内容长度、角色类型）

**请求格式**：
```typescript
POST /api/chat
Content-Type: application/json

{
  "model": "gpt-4o-mini",
  "messages": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "..." }
  ],
  "stream": true
}
```

**响应格式**：
- 流式：`text/event-stream`
- 非流式：`application/json`

**安全验证**：
- 最多 50 条消息
- 每条消息最多 10000 字符
- 角色仅限：`system`、`user`、`assistant`

---

## 关键依赖与配置

### 核心依赖（package.json）

```json
{
  "name": "easy-dynasty",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --webpack",
    "dev:turbo": "next dev",
    "build": "next build --webpack",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "next": "16.0.10",
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "react-markdown": "^10.1.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.0.0",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

### 环境变量配置

**`.env.example`** - 环境变量模板

```bash
# 服务器端配置 - 不会暴露到客户端，保护密钥安全
DEFAULT_LLM_ENABLED=false
DEFAULT_LLM_BASE_URL=https://api.openai.com/v1
DEFAULT_LLM_API_KEY=sk-your-api-key-here
DEFAULT_LLM_MODEL=gpt-4o-mini

# 客户端配置 - 仅用于告知客户端默认配置是否可用
# 注意：不要在这里放置敏感信息！
NEXT_PUBLIC_DEFAULT_LLM_AVAILABLE=false
NEXT_PUBLIC_DEFAULT_LLM_MODEL=gpt-4o-mini
```

**说明**：
- `DEFAULT_LLM_*`：服务器端变量，用于 `/api/chat` 代理
- `NEXT_PUBLIC_*`：客户端变量，仅用于显示默认配置是否可用

### TypeScript 配置

**`tsconfig.json`**：
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## 数据模型

### TypeScript 类型定义（types/tarot.ts）

```typescript
/**
 * 塔罗牌位置信息
 */
export interface Position {
  id: number
  name: string
  description: string
}

/**
 * 塔罗牌基础信息
 */
export interface TarotCard {
  id: string | number
  name: string
  englishName: string
  suit: string
  uprightKeywords: string[]
  reversedKeywords: string[]
}

/**
 * 抽取的牌（包含位置和正逆位信息）
 */
export interface DrawnCard {
  card: TarotCard
  isReversed: boolean
  position: Position
}

/**
 * 牌阵信息
 */
export interface Spread {
  id: string
  name: string
  englishName: string
  description: string
  cardCount: number
  positions: Position[]
}

/**
 * 占卜历史记录
 */
export interface ReadingHistory {
  id: string
  timestamp: number
  question: string
  spreadName: string
  spreadId: string
  drawnCards: DrawnCard[]
  analysis: string
}

/**
 * API 配置
 */
export interface ApiConfig {
  baseUrl: string | null
  apiKey: string | null
  model: string
}

/**
 * 聊天消息
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}
```

### 静态数据

**`data/tarot-cards.json`** - 78 张塔罗牌数据

```json
{
  "majorArcana": [
    {
      "id": 0,
      "name": "愚人",
      "englishName": "The Fool",
      "suit": "major",
      "uprightKeywords": ["新开始", "冒险", "纯真", "自由", "潜力"],
      "reversedKeywords": ["鲁莽", "缺乏计划", "愚蠢", "风险", "不成熟"]
    },
    // ... 21张大阿卡纳
  ],
  "minorArcana": {
    "wands": [...],   // 16张权杖
    "cups": [...],    // 16张圣杯
    "swords": [...],  // 16张宝剑
    "pentacles": [...] // 16张星币
  }
}
```

**`data/spreads.json`** - 6 种牌阵定义

```json
{
  "spreads": [
    {
      "id": "three_card_spread",
      "name": "三牌阵",
      "englishName": "Three Card Spread",
      "description": "简单而经典的三牌阵，适合快速回答具体问题，分别代表过去、现在和未来。",
      "cardCount": 3,
      "positions": [
        { "id": 1, "name": "过去", "description": "过去的影响" },
        { "id": 2, "name": "现在", "description": "当前的状况" },
        { "id": 3, "name": "未来", "description": "未来的发展" }
      ]
    },
    // ... 其他5种牌阵
  ]
}
```

---

## 页面结构（App Router）

### 页面列表

| 路径 | 文件 | 功能 | 客户端组件 |
|------|------|------|-----------|
| `/` | `app/page.tsx` | 首页（问题输入 + 牌阵选择） | ✓ |
| `/draw` | `app/draw/page.tsx` | 抽牌页面（扇形牌阵选牌） | ✓ |
| `/analysis` | `app/analysis/page.tsx` | AI 解读页面 + 追问聊天 | ✓ |
| `/history` | `app/history/page.tsx` | 历史记录列表 | ✓ |
| `/history/[id]` | `app/history/[id]/page.tsx` | 历史记录详情 | ✓ |
| `/settings` | `app/settings/page.tsx` | API 设置页面 | ✓ |

### 数据流

**页面间数据传递**（使用 `sessionStorage`）：

```typescript
// 1. Home → Draw
sessionStorage.setItem('tarot_question', question)
sessionStorage.setItem('tarot_spread', selectedSpread)

// 2. Draw → Analysis
sessionStorage.setItem('tarot_drawn_cards', JSON.stringify(drawnCards))

// 3. Analysis 保存历史
historyManager.saveReading(question, spreadName, spreadId, cards, analysis)
```

**持久化数据**（使用 `localStorage`）：
- API 配置：`tarot_api_key`、`tarot_api_base_url`、`tarot_api_model`
- 历史记录：`tarot_reading_history`（最多 50 条）

---

## 组件架构

### 核心组件列表

| 组件 | 文件 | 功能 | 特点 |
|------|------|------|------|
| **FanDeck** | `components/FanDeck.tsx` | 扇形牌阵选牌 | 160° 弧，380px 半径，悬停/选中状态 |
| **FlipCard** | `components/FlipCard.tsx` | 3D 翻转牌 | CSS transform preserve-3d |
| **FlyingCard** | `components/FlyingCard.tsx` | 飞牌动画 | DOM refs 动画移动 |
| **SpreadLayout** | `components/SpreadLayout.tsx` | 牌阵布局 | 根据 spread.id 渲染不同布局 |
| **TarotCard** | `components/TarotCard.tsx` | 单张塔罗牌 | 正逆位显示、关键词展示 |
| **AnalysisDisplay** | `components/AnalysisDisplay.tsx` | 解读结果展示 | Markdown 渲染、流式更新 |
| **TarotChat** | `components/TarotChat.tsx` | 追问聊天 | SSE 流式响应、对话历史 |
| **ModelSelector** | `components/ModelSelector.tsx` | 模型选择器 | 下拉选择、自定义输入 |
| **DrawnCardsDisplay** | `components/DrawnCardsDisplay.tsx` | 抽中的牌展示 | 牌阵布局、正逆位标注 |
| **Toast** | `components/Toast.tsx` | 提示消息 | 上下文管理、自动消失 |

### 组件示例

**FanDeck.tsx** - 扇形牌阵选牌

```typescript
'use client'

import { useState } from 'react'
import { tarotCards } from '@/data/tarot-cards.json'
import { FlipCard } from './FlipCard'

export function FanDeck() {
  const [selectedCards, setSelectedCards] = useState<number[]>([])

  // Fisher-Yates 洗牌 + 50% 逆位概率
  const shuffleDeck = () => {
    const deck = [...tarotCards]
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[deck[i], deck[j]] = [deck[j], deck[i]]
    }
    return deck
  }

  return (
    <div className="relative w-[800px] h-[600px]">
      {shuffleDeck().map((card, index) => {
        const angle = (index - 39) * 2 // 160° 弧
        const radius = 380
        // 渲染扇形排列的牌
      })}
    </div>
  )
}
```

---

## 工具函数与 Hooks

### 自定义 Hooks

**`hooks/useTarotAnalysis.ts`** - AI 分析主 Hook

**功能**：
- 管理分析状态（`analysis`、`isLoading`、`error`、`chatHistory`）
- 双 LLM 配置切换（默认 vs 自定义）
- SSE 流式解析
- 自动保存历史记录

**使用示例**：
```typescript
const { analysis, isLoading, error, performAnalysis } = useTarotAnalysis()

// 执行分析
await performAnalysis(question, spread, drawnCards)
```

### 工具函数列表

| 工具函数 | 文件 | 功能 |
|---------|------|------|
| **constructTarotPrompts** | `utils/prompts.ts` | 构建 AI 系统提示词和用户提示词 |
| **parseSSEStream** | `utils/sseParser.ts` | 解析 SSE 流式响应 |
| **historyManager** | `utils/historyManager.ts` | 历史记录管理（单例模式） |
| **getDefaultLlmConfig** | `utils/llmConfig.ts` | 获取默认 LLM 配置 |
| **isDefaultLlmUsable** | `utils/llmConfig.ts` | 检查默认 LLM 是否可用 |
| **getCardImagePath** | `utils/cardImages.ts` | 获取卡牌图片路径 |

### 工具函数示例

**`utils/prompts.ts`** - AI 提示词工程

```typescript
export function constructTarotPrompts(
  question: string,
  spreadName: string,
  spreadId: string,
  cards: DrawnCard[]
) {
  // 系统提示词
  let systemPrompt = `你是一位专业的塔罗占卜师...
解读原则：
- 保持客观中立...
- 适量使用表情符号...
- 输出结构：整体能量、逐张牌解读、互动关系、实用建议...`

  // 用户提示词
  const userPrompt = `请为我进行专业的塔罗解读 🔮
[我的问题] ${question}
[我选择的牌阵] ${spreadName}
[我抽到的牌] ${JSON.stringify(cardsData)}`

  return { systemPrompt, userPrompt }
}
```

**`utils/sseParser.ts`** - SSE 流式解析

```typescript
export async function* parseSSEStream(reader: ReadableStreamDefaultReader) {
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') return
        try {
          yield JSON.parse(data)
        } catch (e) {
          console.error('JSON parse error:', e)
        }
      }
    }
  }
}
```

---

## 双 LLM 配置模式

### 配置逻辑

**1. 默认 LLM（服务器端）**

- 请求路径：`/api/chat` → 服务器 → LLM API
- 优点：保护服务器端 API 密钥，用户无需配置
- 缺点：数据经过服务器，隐私性较低，服务器承担成本

**配置方式**（`.env`）：
```bash
DEFAULT_LLM_ENABLED=true
DEFAULT_LLM_BASE_URL=https://api.openai.com/v1
DEFAULT_LLM_API_KEY=sk-your-api-key-here
DEFAULT_LLM_MODEL=gpt-4o-mini
```

**2. 自定义 LLM（用户配置）**

- 请求路径：浏览器 → 用户配置的 LLM API
- 优点：隐私性高（数据不经过服务器），支持各种 OpenAI 兼容 API
- 缺点：用户需自行配置 API

**配置方式**（设置页面 → localStorage）：
```typescript
localStorage.setItem('tarot_api_key', 'sk-user-api-key')
localStorage.setItem('tarot_api_base_url', 'https://api.deepseek.com/v1')
localStorage.setItem('tarot_api_model', 'deepseek-chat')
```

### 切换逻辑

**优先级**：自定义 LLM > 默认 LLM

```typescript
const hasLocalConfig = Boolean(localBaseUrl && localApiKey)
const useDefaultConfig = !hasLocalConfig && isDefaultLlmUsable()

if (hasLocalConfig) {
  // 直接请求用户配置的 API
  response = await fetch(`${localBaseUrl}/chat/completions`, { ... })
} else if (useDefaultConfig) {
  // 代理到服务器端默认 API
  response = await fetch('/api/chat', { ... })
} else {
  // 提示用户配置 API
  showToast('请先配置您的 API', 'warning')
}
```

---

## 测试与质量

### 当前状态
- **无测试文件**（待补充）

### 建议添加

**组件测试**（Jest + React Testing Library）：
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

**E2E 测试**（Playwright）：
```bash
npm install --save-dev @playwright/test
```

**测试结构**：
```
web/
└── __tests__/
    ├── unit/
    │   ├── components/
    │   │   ├── FlipCard.test.tsx
    │   │   └── FanDeck.test.tsx
    │   └── utils/
    │       ├── prompts.test.ts
    │       └── sseParser.test.ts
    └── e2e/
        ├── draw-flow.spec.ts    # 抽牌流程
        ├── analysis-flow.spec.ts # 解读流程
        └── history-flow.spec.ts  # 历史记录流程
```

### 代码质量工具

**当前配置**：
- **ESLint**：`eslint.config.mjs`
- **TypeScript**：严格模式（`strict: true`）

**建议添加**：
- **Prettier**：代码格式化
- **Husky + lint-staged**：Git hooks 自动检查
- **Commitlint**：提交信息规范

---

## 样式系统

### Tailwind CSS v4

**配置文件**：`postcss.config.mjs`

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

**全局样式**：`app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 自定义动画 */
@keyframes pulse-glow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}

/* Glassmorphism 风格 */
.glass-panel {
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
}
```

### 设计规范

**色彩**：
- Primary：紫色（`#7C3AED`）
- Secondary：靛蓝（`#6366F1`）
- Background：深空黑（`#0A0A0F`）

**字体**：
- 标题：Cinzel、Playfair Display（衬线体）
- 正文：Geist Sans（无衬线体）
- 代码：Geist Mono（等宽字体）

**组件风格**：
- Glassmorphism（毛玻璃效果）
- 渐变边框、阴影发光
- 微交互动画（悬停、点击、过渡）

---

## 常见问题 (FAQ)

### Q1: 为什么所有页面都使用 `'use client'`？
**A**: 当前所有页面都需要与浏览器交互（localStorage、sessionStorage、动画等）。如需 SSR 优化，可拆分服务端组件和客户端组件。

### Q2: 如何添加新的牌阵？
**A**:
1. 在 `data/spreads.json` 添加牌阵定义
2. 可选：在 `utils/prompts.ts` 的 `spreadPromptGuidance` 添加解读指导
3. 可选：在 `app/draw/page.tsx` 的 `renderSpreadLayout()` 添加布局逻辑

### Q3: 如何自定义 AI 解读风格？
**A**: 编辑 `utils/prompts.ts` 的系统提示词和用户提示词，调整解读原则、输出结构和语气。

### Q4: 为什么使用 SSE 而不是 WebSocket？
**A**:
- SSE 是单向流（服务器 → 客户端），适合 AI 流式响应
- WebSocket 是双向通信，适合实时聊天
- SSE 更简单、轻量，支持自动重连

### Q5: 如何优化首屏加载速度？
**A**:
- 图片懒加载（`<Image loading="lazy">`）
- 代码分割（`dynamic import`）
- 预加载关键资源（`<link rel="preload">`）
- 启用 Next.js ISR（增量静态再生）

---

## 相关文件清单

### 核心页面
- `app/layout.tsx` - 根布局
- `app/page.tsx` - 首页（问题 + 牌阵选择）
- `app/draw/page.tsx` - 抽牌页面
- `app/analysis/page.tsx` - AI 解读页面
- `app/history/page.tsx` - 历史记录列表
- `app/history/[id]/page.tsx` - 历史记录详情
- `app/settings/page.tsx` - API 设置页面

### API Routes
- `app/api/chat/route.ts` - 默认 LLM 代理 API

### 组件
- `components/FanDeck.tsx` - 扇形牌阵选牌
- `components/FlipCard.tsx` - 3D 翻转牌
- `components/FlyingCard.tsx` - 飞牌动画
- `components/SpreadLayout.tsx` - 牌阵布局
- `components/TarotCard.tsx` - 单张塔罗牌
- `components/AnalysisDisplay.tsx` - 解读结果展示
- `components/TarotChat.tsx` - 追问聊天
- `components/ModelSelector.tsx` - 模型选择器
- `components/DrawnCardsDisplay.tsx` - 抽中的牌展示
- `components/Toast.tsx` - 提示消息

### Hooks
- `hooks/useTarotAnalysis.ts` - AI 分析主 Hook

### 工具函数
- `utils/prompts.ts` - AI 提示词工程
- `utils/sseParser.ts` - SSE 流式解析
- `utils/historyManager.ts` - 历史记录管理
- `utils/llmConfig.ts` - LLM 配置工具
- `utils/cardImages.ts` - 卡牌图片映射

### 类型定义
- `types/tarot.ts` - 塔罗相关类型

### 静态数据
- `data/tarot-cards.json` - 78 张塔罗牌数据
- `data/spreads.json` - 6 种牌阵定义

### 配置文件
- `package.json` - Node.js 依赖
- `tsconfig.json` - TypeScript 配置
- `next.config.ts` - Next.js 配置
- `eslint.config.mjs` - ESLint 配置
- `postcss.config.mjs` - PostCSS 配置
- `.env.example` - 环境变量示例

---

## 开发建议

### 短期目标
1. **补充测试**：组件测试 + E2E 测试
2. **性能优化**：图片懒加载、代码分割
3. **错误处理**：统一错误边界和日志记录
4. **无障碍访问**：ARIA 标签、键盘导航

### 中期目标
1. **状态管理**：引入 Zustand（如状态复杂化）
2. **表单验证**：Zod 或 Yup 验证库
3. **国际化**：next-intl 多语言支持
4. **PWA 支持**：离线可用、桌面图标

### 长期目标
1. **微前端**：拆分塔罗、八字、紫微斗数模块
2. **3D 场景**：Three.js 沉浸式占卜体验
3. **AI 语音**：Web Speech API 语音解读
4. **社区功能**：分享、评论、点赞

---

## 相关链接

- **返回根文档**: [../CLAUDE.md](../CLAUDE.md)
- **后端文档**: [../backend/CLAUDE.md](../backend/CLAUDE.md)
- **项目路径**: `/Users/xushaoyang/Desktop/命理与塔罗/EasyDynasty/web`
- **初始化时间**: 2026-01-20 18:27:24
