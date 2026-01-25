# EasyDynasty Web 前端功能报告

> 目的：为重写为纯 HTML/CSS/JS 版本提供完整技术参考
>
> 生成时间：2026-01-24

---

## 一、项目概览

| 属性 | 值 |
|------|------|
| **技术栈** | Next.js 16 + React 19 + TypeScript |
| **样式系统** | Tailwind CSS v4 |
| **主题风格** | 东方古典 + Glassmorphism（毛玻璃） |
| **核心功能** | 塔罗占卜 + AI 流式解读 |
| **API 集成** | 后端 SSE 流式接口 |

---

## 二、页面结构（路由表）

```
/                    - 首页（品牌展示 + 入口导航）
/draw               - 抽牌页面（扇形选牌交互）
/analysis           - AI 解读页面（流式输出）
/wiki               - 牌灵图鉴（78张牌详情）
/deck-preview       - 牌组预览
```

### 2.1 首页 (`app/page.tsx`)

**功能**：
- 品牌印章展示（塔罗标识）
- 导航按钮：开启占卜、牌灵图鉴
- 沉浸式背景动画

**关键代码逻辑**：
```typescript
// 挂载动画控制
const [mounted, setMounted] = useState(false);
useEffect(() => {
    setMounted(true);
}, []);
```

---

## 三、数据类型定义 (`types/tarot.ts`)

### 3.1 核心类型

```typescript
// 塔罗牌基础信息
interface TarotCard {
    id: string | number;      // 牌ID
    name: string;             // 中文名
    englishName: string;      // 英文名
    suit: string;             // 花色
    uprightKeywords: string[];    // 正位关键词
    reversedKeywords: string[];   // 逆位关键词
}

// 牌阵位置信息
interface Position {
    id: number;
    name: string;
    description: string;
}

// 抽取的牌（含状态）
interface DrawnCard {
    card: TarotCard;          // 牌信息
    isReversed: boolean;      // 是否逆位
    position: Position;       // 牌阵位置
}

// 牌阵信息
interface Spread {
    id: string;               // 牌阵ID（如 "three-card"）
    name: string;             // 中文名
    englishName: string;      // 英文名
    description: string;      // 描述
    cardCount: number;        // 需要抽牌数
    positions: Position[];    // 位置定义
}

// 历史记录
interface ReadingHistory {
    id: string;
    timestamp: number;
    question: string;
    spreadName: string;
    spreadId: string;
    drawnCards: DrawnCard[];
    analysis: string;         // AI 解读结果
    type?: 'tarot' | 'bazi';
}

// API 配置
interface ApiConfig {
    baseUrl: string | null;
    apiKey: string | null;
    model: string;
}

// 聊天消息
interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
```

---

## 四、状态管理（Context 系统）

### 4.1 DeckContext (`context/DeckContext.tsx`)

**管理的状态**：
```typescript
- deck: TarotCard[]              // 当前牌组（78张或已洗牌）
- drawnCards: DrawnCard[]        // 已抽取的牌
- spread: Spread | null          // 选中的牌阵
- currentQuestion: string        // 当前问题
```

**核心方法**：
```typescript
- shuffleDeck(): 洗牌
- drawCard(count): 抽牌
- resetDeck(): 重置牌组
- setSpread(spread): 设置牌阵
```

### 4.2 SoundContext (`context/SoundContext.tsx`)

**管理的状态**：
```typescript
- enabled: boolean               // 音效开关
- volume: number                 // 音量 (0-1)
- soundEnabled: boolean          // 全局音效状态
```

---

## 五、核心业务逻辑

### 5.1 AI 分析 Hook (`hooks/useTarotAnalysis.ts`)

**核心功能**：处理塔罗分析请求，SSE 流式接收响应

**状态**：
```typescript
interface AnalysisState {
    analysis: string;        // 解读文本（流式累积）
    isLoading: boolean;     // 加载中
    error: string;          // 错误信息
    chatHistory: ChatMessage[];  // 对话历史
}
```

**API 配置状态**：
```typescript
interface ApiConfigState {
    hasCustomApiConfig: boolean;   // 是否有自定义配置
    customApiBaseUrl: string | null;
    customApiKey: string | null;
    selectedModel: string;         // 选中模型
}
```

**核心方法 `performAnalysis`**：
```typescript
async function performAnalysis(
    question: string,
    spread: Spread,
    cards: DrawnCard[],
    overrideModel?: string
): Promise<boolean>
```

**执行流程**：
1. 检查 API 配置（本地 localStorage 优先，否则使用默认）
2. 构建 prompt（调用 `constructTarotPrompts`）
3. 发送 POST 请求到 `/api/v1/tarot/analyze`
4. 使用 `parseSSEStream` 解析流式响应
5. 使用 RAF 批量更新优化渲染性能
6. 保存到历史记录（`historyManager.saveReading`）

### 5.2 SSE 解析器 (`utils/sseParser.ts`)

**核心功能**：解析 Server-Sent Events 流

```typescript
export async function* parseSSEStream(
    reader: ReadableStreamDefaultReader<Uint8Array>
): AsyncGenerator<SSEChunk, void, unknown>
```

**数据格式**：
```typescript
interface SSEChunk {
    choices?: Array<{
        delta?: {
            content?: string;
            role?: string;
        };
        finish_reason?: string | null;
    }>;
    content?: string;          // 自定义流格式
    type?: 'thought' | 'action' | 'content';
    id?: string;
    object?: string;
    created?: number;
    model?: string;
}
```

**解析逻辑**：
1. 使用 `TextDecoder` 解码二进制数据（`stream: true` 处理多字节字符）
2. 按换行符分割，保留不完整行到缓冲区
3. 跳过空行和注释（`:` 开头）
4. 解析 `data:` 前缀的 JSON 数据
5. 处理 `[DONE]` 标记
6. 释放 reader 锁

### 5.3 Prompt 构建 (`utils/prompts.ts`)

**系统 Prompt 结构**：
- 人设：塔罗师"易朝"
- 风格：直击要害、温暖坚定、结构清晰、因人而异
- 思考过程（Chain of Thought）：
  - step 1. 核心元素的能量流向
  - step 2. 关键牌的互动
  - step 3. 位置的叙事逻辑
  - step 4. 提炼核心洞察
- 输出格式：Markdown（牌阵总览、逐层拆解、大师建议、易朝寄语）

**用户 Prompt 格式**：
```typescript
const userPrompt = `
**求问者问题**：${question}
**使用牌阵**：${spreadName}
**抽牌结果**：
${cardsDescription}

请作为"易朝"大师，运用你的直觉与智慧，结合上述牌阵为我进行深度解读。
`;
```

---

## 六、组件清单

### 6.1 布局组件

| 组件 | 文件 | 功能 |
|------|------|------|
| NavBar | `components/NavBar.tsx` | 顶部导航栏，包含网站标题和导航链接 |
| Layout | `app/layout.tsx` | 根布局，定义字体、全局样式、ToastProvider |

### 6.2 塔罗核心组件

| 组件 | 文件 | 功能 |
|------|------|------|
| FanDeck | `components/FanDeck.tsx` | **扇形选牌**（核心交互），鼠标跟随效果 |
| FlipCard | `components/FlipCard.tsx` | 翻转动画，CSS 3D transform |
| TarotCard | `components/TarotCard.tsx` | 单张牌展示，支持正逆位 |
| SpreadLayout | `components/SpreadLayout.tsx` | 牌阵布局，根据不同牌阵排列卡片 |
| SpreadSelect | `components/SpreadSelect.tsx` | 牌阵选择器，展示可选牌阵 |
| DrawnCardsDisplay | `components/DrawnCardsDisplay.tsx` | 已抽牌展示 |

### 6.3 交互组件

| 组件 | 文件 | 功能 |
|------|------|------|
| CardDetailModal | `components/CardDetailModal.tsx` | 牌面详情弹窗 |
| DisclaimerModal | `components/DisclaimerModal.tsx` | 免责声明（首次访问） |
| ExportReportModal | `components/ExportReportModal.tsx` | 导出报告（使用 jsPDF） |
| Toast | `components/Toast.tsx` | 全局消息提示系统 |

### 6.4 AI 对话组件

| 组件 | 文件 | 功能 |
|------|------|------|
| TarotChat | `components/TarotChat.tsx` | 流式对话界面，支持追问 |
| AnalysisDisplay | `components/AnalysisDisplay.tsx` | Markdown 渲染展示 |
| ModelSelector | `components/ModelSelector.tsx` | 模型选择器 |

### 6.5 背景与装饰组件

| 组件 | 文件 | 功能 |
|------|------|------|
| AtmosphereBackground | `components/AtmosphereBackground.tsx` | 氛围背景，雾气动画 |
| BackgroundPoetry | `components/BackgroundPoetry.tsx` | 背景诗句，增强文化氛围 |
| Icons | `components/Icons.tsx` | 图标组件库 |
| FlyingCard | `components/FlyingCard.tsx` | 飞牌动画组件 |

### 6.6 其他组件

| 组件 | 文件 | 功能 |
|------|------|------|
| CardShowcase | `components/CardShowcase.tsx` | 牌面展示组件 |
| WikiCard | `components/WikiCard.tsx` | 图鉴卡片组件 |
| useSpreadSlot | `components/spreads/useSpreadSlot.tsx` | 牌槽管理 Hook |

---

## 七、样式系统 (`app/globals.css`)

### 7.1 CSS 变量

```css
:root {
    --ink-primary: #1c1917;      /* 墨色 */
    --ink-secondary: #44403c;    /* 次级墨色 */
    --paper-bg: #f5f5f0;         /* 宣纸白 */
    --seal-red: #9a2b2b;         /* 印泥红 */
    --gold: #b4a078;             /* 鎏金色 */

    /* 强制 sRGB 色彩空间（修复 html2canvas oklab 错误） */
    color-scheme: light;
    --color-interpolation-method: in srgb;
}
```

### 7.2 工具类

```css
.ink-input      /* 墨色输入框 */
    - w-full bg-transparent border-b-2 border-stone-300
    - py-3 text-lg focus:outline-none focus:border-stone-800

.ink-card       /* 墨色卡片（毛玻璃） */
    - bg-white/60 backdrop-blur-sm border border-stone-200/50

.btn-seal       /* 印章按钮 */
    - bg-[#9a2b2b] text-[#f5f5f0]
    - hover:bg-[#852222] hover:scale-105
```

### 7.3 动画定义

```css
@keyframes inkSpread      /* 墨色扩散 */
@keyframes float          /* 浮动 */
@keyframes fadeIn         /* 淡入 */
@keyframes fadeInUp       /* 向上淡入 */
@keyframes fadeInDropdown /* 下拉淡入 */
@keyframes mistFlow1/2/3  /* 雾气流动 */
@keyframes particleFloat  /* 粒子浮动 */
```

### 7.4 背景图片

```css
background-image: url('/rice-paper-2.png');
background-blend-mode: multiply;
```

---

## 八、API 集成

### 8.1 核心接口

| 端点 | 方法 | 功能 |
|------|------|------|
| `/api/v1/tarot/analyze` | POST | 塔罗分析（SSE流式） |

**环境变量**：
```typescript
NEXT_PUBLIC_API_URL    // API 基础 URL
```

### 8.2 请求格式

```typescript
POST /api/v1/tarot/analyze
Headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer {token}"
}
Body: {
    question: string,           // 求问问题
    spreadName: string,         // 牌阵名称
    spreadId: string,           // 牌阵ID
    drawnCards: Array<{
        card: {
            id: string,         // 牌ID
            name: string,       // 牌名
            englishName: string // 英文名
        },
        isReversed: boolean,    // 是否逆位
        position: Position      // 位置信息
    }>
}
```

### 8.3 响应格式（SSE 流式）

```
data: {"choices":[{"delta":{"content":"文本片段"}}]}

data: {"content":"自定义格式内容"}

data: [DONE]
```

---

## 九、LocalStorage 数据结构

| Key | 类型 | 说明 |
|-----|------|------|
| `token` | string | 用户认证令牌 |
| `tarot_api_base_url` | string | 自定义 API 地址 |
| `tarot_api_key` | string | 自定义 API 密钥 |
| `tarot_api_model` | string | 选中的模型 |
| `tarot_history` | ReadingHistory[] | 占卜历史记录 |
| `disclaimer_accepted` | boolean | 免责声明已接受 |

---

## 十、纯前端重写要点

### 10.1 路由系统

使用原生 Hash 路由：

```javascript
// 简单路由实现
const Router = {
    routes: {
        '/': 'home',
        '/draw': 'draw',
        '/analysis': 'analysis',
        '/wiki': 'wiki',
        '/deck-preview': 'deck-preview'
    },

    init() {
        window.addEventListener('hashchange', () => this.render());
        this.render();
    },

    navigate(path) {
        window.location.hash = path;
    },

    render() {
        const path = window.location.hash.slice(1) || '/';
        const page = this.routes[path] || 'home';
        this.showPage(page);
    },

    showPage(pageName) {
        // 隐藏所有页面
        document.querySelectorAll('.page').forEach(el => el.hidden = true);
        // 显示目标页面
        const target = document.getElementById(`page-${pageName}`);
        if (target) target.hidden = false;
    }
};
```

### 10.2 状态管理

```javascript
// 全局状态管理（观察者模式）
const Store = {
    state: {
        deck: [],
        drawnCards: [],
        spread: null,
        question: '',
        apiConfig: {
            baseUrl: localStorage.getItem('tarot_api_base_url'),
            apiKey: localStorage.getItem('tarot_api_key'),
            model: localStorage.getItem('tarot_api_model') || ''
        },
        analysis: '',
        isLoading: false,
        error: ''
    },

    listeners: [],

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
    },

    subscribe(callback) {
        this.listeners.push(callback);
    },

    notify() {
        this.listeners.forEach(cb => cb(this.state));
    }
};
```

### 10.3 SSE 流式处理

```javascript
// SSE 流式请求
async function streamAnalysis(question, spread, cards) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/v1/tarot/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            question,
            spreadName: spread.name,
            spreadId: spread.id,
            drawnCards: cards
        })
    });

    if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';

    // 使用 RAF 批量更新
    let rafId = null;
    let pendingText = '';

    const flush = () => {
        if (pendingText) {
            updateDisplay(pendingText);
        }
        rafId = null;
    };

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(':')) continue;
            if (trimmed.startsWith('data: ')) {
                const data = trimmed.slice(6);
                if (data === '[DONE]') continue;

                try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content || parsed.content;
                    if (content) {
                        fullText += content;
                        pendingText = fullText;
                        if (!rafId) {
                            rafId = requestAnimationFrame(flush);
                        }
                    }
                } catch (e) {
                    console.error('JSON parse error:', e);
                }
            }
        }
    }

    // 确保最后更新
    if (rafId) cancelAnimationFrame(rafId);
    flush();

    return fullText;
}
```

### 10.4 扇形选牌布局计算

```javascript
// 扇形布局计算
function createFanDeck(cards, container) {
    const totalAngle = 120; // 总角度
    const angleStep = cards.length > 1 ? totalAngle / (cards.length - 1) : 0;
    const startAngle = -totalAngle / 2;

    cards.forEach((card, i) => {
        const angle = startAngle + (i * angleStep);
        const rad = angle * Math.PI / 180;
        const z = Math.cos(rad) * 200; // 深度

        const cardEl = createCardElement(card);
        cardEl.style.transform = `
            translateZ(${z}px)
            rotateY(${angle}deg)
            rotateX(${10 - Math.cos(rad) * 20}deg)
        `;
        cardEl.style.zIndex = Math.round(z + 200);
        container.appendChild(cardEl);
    });
}

// 鼠标跟随效果
function addMouseFollowEffect(deck) {
    deck.addEventListener('mousemove', (e) => {
        const rect = deck.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;

        deck.style.transform = `
            rotateY(${x * 10}deg)
            rotateX(${-y * 10}deg)
        `;
    });

    deck.addEventListener('mouseleave', () => {
        deck.style.transform = '';
    });
}
```

### 10.5 翻转动画

```javascript
function flipCard(cardEl, isReversed) {
    cardEl.classList.add('flipping');

    // 强制重绘
    cardEl.offsetHeight;

    if (isReversed) {
        cardEl.classList.add('reversed');
    } else {
        cardEl.classList.remove('reversed');
    }

    setTimeout(() => {
        cardEl.classList.remove('flipping');
    }, 600);
}
```

```css
/* 翻转动画 CSS */
.flip-card {
    transform-style: preserve-3d;
    transition: transform 0.6s;
}

.flip-card.flipping {
    transform: rotateY(180deg);
}

.flip-card.reversed {
    transform: rotateY(180deg);
}
```

### 10.6 Markdown 渲染

使用 `marked.js` CDN：

```html
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<script>
function renderMarkdown(content) {
    return marked.parse(content);
}

function updateAnalysisDisplay(content) {
    const container = document.getElementById('analysis-content');
    container.innerHTML = renderMarkdown(content);
}
</script>
```

### 10.7 历史记录管理

```javascript
const HistoryManager = {
    KEY: 'tarot_history',
    MAX_SIZE: 50,

    saveReading(question, spreadName, spreadId, cards, analysis) {
        const history = this.getHistory();
        const record = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            question,
            spreadName,
            spreadId,
            drawnCards: cards,
            analysis
        };

        history.unshift(record);
        if (history.length > this.MAX_SIZE) {
            history.pop();
        }

        localStorage.setItem(this.KEY, JSON.stringify(history));
    },

    getHistory() {
        const data = localStorage.getItem(this.KEY);
        return data ? JSON.parse(data) : [];
    },

    clearHistory() {
        localStorage.removeItem(this.KEY);
    }
};
```

---

## 十一、依赖清单（纯前端替代方案）

| 原依赖 | 用途 | 纯前端替代 |
|--------|------|-----------|
| React | 组件框架 | 原生 JS + 模板字符串 |
| Next.js | 框架 | 原生 Hash 路由 |
| Tailwind CSS | 样式 | 手写 CSS 或 Tailwind CDN |
| react-markdown | Markdown 渲染 | `marked.js` CDN |
| howler | 音效 | `Howler.js` CDN |
| jspdf | 导出 PDF | `jsPDF` CDN |
| modern-screenshot | 截图 | `html2canvas` CDN |

### 推荐 CDN

```html
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- Marked.js (Markdown) -->
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>

<!-- Howler.js (音效) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.4/howler.min.js"></script>

<!-- jsPDF (导出) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

<!-- html2canvas (截图) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
```

---

## 十二、文件结构建议

```
├── index.html              # 主入口
├── css/
│   ├── main.css            # 主样式
│   ├── animations.css      # 动画定义
│   └── components.css      # 组件样式
├── js/
│   ├── app.js              # 应用入口
│   ├── router.js           # 路由
│   ├── store.js            # 状态管理
│   ├── api.js              # API 封装
│   ├── sse.js              # SSE 处理
│   ├── history.js          # 历史记录
│   ├── components/         # 组件
│   │   ├── NavBar.js
│   │   ├── FanDeck.js
│   │   ├── FlipCard.js
│   │   ├── TarotChat.js
│   │   ├── SpreadSelect.js
│   │   └── ...
│   ├── utils/
│   │   ├── markdown.js     # Markdown 渲染
│   │   ├── dom.js          # DOM 工具
│   │   └── animation.js    # 动画工具
│   └── data/
│       ├── tarot-cards.json
│       └── spreads.json
├── assets/
│   ├── images/
│   │   └── rice-paper-2.png
│   ├── cards/              # 78张牌图片
│   └── sounds/             # 音效文件
└── dist/                   # 构建输出（可选）
```

---

## 十三、关键技术点总结

| 技术点 | 实现方式 |
|--------|----------|
| **扇形选牌** | CSS 3D Transform + 三角函数计算角度 |
| **流式输出** | Fetch API + ReadableStream + requestAnimationFrame 批量更新 |
| **状态管理** | 观察者模式 + localStorage 持久化 |
| **路由** | Hash 模式（部署友好，无需服务器配置） |
| **动画** | CSS Keyframes + transition |
| **翻转效果** | transform: rotateY(180deg) + preserve-3d |
| **毛玻璃** | backdrop-filter: blur() + 半透明背景 |
| **Markdown** | marked.js 解析 |
| **导出PDF** | jsPDF + html2canvas |

---

## 十四、核心代码示例

### 14.1 完整的 Store 实现

```javascript
// store.js
const Store = {
    state: {
        // 塔罗数据
        deck: [],
        drawnCards: [],
        spread: null,
        question: '',

        // UI 状态
        currentPage: 'home',
        isMenuOpen: false,

        // API 配置
        apiConfig: {
            baseUrl: localStorage.getItem('tarot_api_base_url'),
            apiKey: localStorage.getItem('tarot_api_key'),
            model: localStorage.getItem('tarot_api_model') || ''
        },

        // 分析状态
        analysis: '',
        isLoading: false,
        error: ''
    },

    listeners: {},

    setState(key, value) {
        this.state[key] = value;
        this.notify(key, value);
    },

    getState(key) {
        return this.state[key];
    },

    subscribe(key, callback) {
        if (!this.listeners[key]) {
            this.listeners[key] = [];
        }
        this.listeners[key].push(callback);
    },

    notify(key, value) {
        if (this.listeners[key]) {
            this.listeners[key].forEach(cb => cb(value));
        }
    }
};
```

### 14.2 完整的 Router 实现

```javascript
// router.js
const Router = {
    routes: {
        '/': 'home',
        '/draw': 'draw',
        '/analysis': 'analysis',
        '/wiki': 'wiki',
        '/deck-preview': 'deck-preview'
    },

    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        // 初始化路由
        this.handleRoute();
    },

    handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        const pageName = this.routes[hash] || 'home';

        // 更新状态
        Store.setState('currentPage', pageName);

        // 切换页面显示
        document.querySelectorAll('.page').forEach(el => {
            el.hidden = true;
            el.classList.remove('active');
        });

        const targetPage = document.getElementById(`page-${pageName}`);
        if (targetPage) {
            targetPage.hidden = false;
            setTimeout(() => targetPage.classList.add('active'), 10);
        }

        // 更新导航状态
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${hash}`) {
                link.classList.add('active');
            }
        });
    },

    navigate(path) {
        window.location.hash = path;
    }
};
```

### 14.3 完整的 API 封装

```javascript
// api.js
const API = {
    baseUrl: window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : '', // 生产环境根据实际配置

    get token() {
        return localStorage.getItem('token');
    },

    get headers() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
        };
    },

    async analyzeTarot(question, spread, cards) {
        const response = await fetch(`${this.baseUrl}/api/v1/tarot/analyze`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                question,
                spreadName: spread.name,
                spreadId: spread.id,
                drawnCards: cards.map(c => ({
                    card: {
                        id: String(c.card.id),
                        name: c.card.name,
                        englishName: c.card.englishName
                    },
                    isReversed: c.isReversed,
                    position: c.position
                }))
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || `请求失败: ${response.status}`);
        }

        return response.body.getReader();
    }
};
```

---

## 十五、重写检查清单

- [ ] 路由系统（Hash 模式）
- [ ] 状态管理（Store + 观察者模式）
- [ ] 首页（品牌展示 + 导航）
- [ ] 抽牌页面（扇形选牌交互）
- [ ] 牌阵选择器
- [ ] 翻转动画
- [ ] 飞牌动画
- [ ] AI 解读页面
- [ ] SSE 流式处理
- [ ] Markdown 渲染
- [ ] 追问功能
- [ ] 历史记录
- [ ] 牌灵图鉴
- [ ] 音效系统
- [ ] 导出 PDF 功能
- [ ] 免责声明弹窗
- [ ] 响应式设计
- [ ] 错误处理

---

*报告结束*
