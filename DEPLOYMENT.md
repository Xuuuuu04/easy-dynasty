# 🚀 TarotWhisper 部署指南

## 环境变量配置

### 必需配置

TarotWhisper 支持两种运行模式：

1. **仅用户自定义模式**：用户必须在设置页面填写自己的 API 配置
2. **混合模式**：提供默认 LLM，用户也可选择使用自己的配置

### 配置默认 LLM（可选但推荐）

如果您想为用户提供开箱即用的体验，可以配置默认的 LLM：

#### 服务器端环境变量（必需，保持私密）

这些变量包含敏感信息，**绝对不要**使用 `NEXT_PUBLIC_` 前缀：

```bash
# 启用默认 LLM
DEFAULT_LLM_ENABLED=true

# LLM 端点地址
DEFAULT_LLM_BASE_URL=https://api.openai.com/v1

# API 密钥（敏感信息，不会暴露到客户端）
DEFAULT_LLM_API_KEY=sk-your-actual-api-key-here

# 默认模型名称（可选）
DEFAULT_LLM_MODEL=gpt-4o-mini
```

#### 客户端环境变量（用于 UI 显示）

这些变量会打包到客户端，**不包含敏感信息**：

```bash
# 告知客户端默认 LLM 可用
NEXT_PUBLIC_DEFAULT_LLM_AVAILABLE=true

# 模型名称（用于 UI 显示，可选）
NEXT_PUBLIC_DEFAULT_LLM_MODEL=gpt-4o-mini
```

### 安全机制说明

#### 🔒 默认配置（服务器代理模式）

当用户使用默认 LLM 时：

1. **客户端**发送请求到 `/api/chat`（内部 API 路由）
2. **服务器**从环境变量读取 API 密钥
3. **服务器**代理请求到实际的 LLM 端点
4. **服务器**流式返回响应给客户端

**优点**：
- ✅ API 密钥完全不暴露到客户端
- ✅ 用户可以立即开始使用，无需配置
- ✅ 您可以集中管理和监控 API 使用

#### 🔓 用户自定义配置（直连模式）

当用户填写自己的 API 配置时：

1. **客户端**直接从浏览器发送请求到用户指定的端点
2. 使用用户在 localStorage 中的 API 密钥
3. 完全不经过您的服务器

**优点**：
- ✅ 保护用户隐私
- ✅ 不消耗您的 API 配额
- ✅ 用户可以使用任何 OpenAI 兼容的端点

## 部署平台配置示例

### Vercel

在项目设置中添加环境变量：

```
Settings → Environment Variables

# 服务器端（所有环境）
DEFAULT_LLM_ENABLED=true
DEFAULT_LLM_BASE_URL=https://api.openai.com/v1
DEFAULT_LLM_API_KEY=sk-***（使用 Sensitive 标记）
DEFAULT_LLM_MODEL=gpt-4o-mini

# 客户端（所有环境）
NEXT_PUBLIC_DEFAULT_LLM_AVAILABLE=true
NEXT_PUBLIC_DEFAULT_LLM_MODEL=gpt-4o-mini
```

### Netlify

在 `netlify.toml` 或网站设置中配置：

```toml
[build.environment]
  DEFAULT_LLM_ENABLED = "true"
  DEFAULT_LLM_BASE_URL = "https://api.openai.com/v1"
  DEFAULT_LLM_API_KEY = "sk-***"
  DEFAULT_LLM_MODEL = "gpt-4o-mini"
  NEXT_PUBLIC_DEFAULT_LLM_AVAILABLE = "true"
  NEXT_PUBLIC_DEFAULT_LLM_MODEL = "gpt-4o-mini"
```

### Docker

创建 `.env` 文件（不要提交到 Git）：

```bash
DEFAULT_LLM_ENABLED=true
DEFAULT_LLM_BASE_URL=https://api.openai.com/v1
DEFAULT_LLM_API_KEY=sk-***
DEFAULT_LLM_MODEL=gpt-4o-mini
NEXT_PUBLIC_DEFAULT_LLM_AVAILABLE=true
NEXT_PUBLIC_DEFAULT_LLM_MODEL=gpt-4o-mini
```

然后在 `docker-compose.yml` 中引用：

```yaml
version: '3.8'
services:
  tarot-whisper:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
```

## 仅用户自定义模式

如果您不想提供默认 LLM，只需不设置或禁用这些变量：

```bash
# 方式1：不设置任何默认 LLM 变量
# （用户将看到必须配置 API 的提示）

# 方式2：明确禁用
DEFAULT_LLM_ENABLED=false
NEXT_PUBLIC_DEFAULT_LLM_AVAILABLE=false
```

## 验证配置

部署后，访问网站并检查：

1. **主页**：
   - 如果配置了默认 LLM：不显示警告，可以直接使用
   - 如果未配置：显示黄色警告，提示需要配置 API

2. **设置页面**：
   - 如果配置了默认 LLM：显示绿色提示"🌟 默认 LLM 已启用"
   - 如果未配置：不显示任何提示

3. **开发者工具**：
   - 检查 Network 标签
   - 使用默认配置时：请求发送到 `/api/chat`
   - 使用自定义配置时：请求发送到用户指定的端点
   - **绝对不应该**在客户端代码或网络请求中看到 `DEFAULT_LLM_API_KEY`

## 安全检查清单

- [ ] 服务器端变量**没有**使用 `NEXT_PUBLIC_` 前缀
- [ ] API 密钥存储在安全的环境变量中（不在代码中）
- [ ] `.env.local` 已添加到 `.gitignore`
- [ ] 生产环境使用平台的 Secret/Sensitive 功能存储密钥
- [ ] 测试默认配置时，确认请求通过 `/api/chat` 代理
- [ ] 测试自定义配置时，确认请求直接到用户端点
- [ ] 在浏览器开发者工具中验证没有暴露敏感信息

## 故障排查

### 问题：用户报告"API 配置缺失"

**可能原因**：
- `DEFAULT_LLM_ENABLED` 未设置为 `true`
- `DEFAULT_LLM_BASE_URL` 或 `DEFAULT_LLM_API_KEY` 为空
- `NEXT_PUBLIC_DEFAULT_LLM_AVAILABLE` 与服务器端配置不一致

**解决方案**：
1. 检查所有环境变量是否正确设置
2. 重新部署以应用环境变量更改
3. 清除浏览器缓存后重新测试

### 问题：默认 LLM 请求失败

**检查**：
1. 服务器日志中的错误信息
2. LLM 端点是否可访问
3. API 密钥是否有效且有足够配额
4. 模型名称是否正确

### 问题：客户端代码中能看到 API 密钥

**紧急**：
1. 立即禁用该 API 密钥
2. 检查是否错误使用了 `NEXT_PUBLIC_DEFAULT_LLM_API_KEY`
3. 重新生成新密钥并正确配置（不带 `NEXT_PUBLIC_` 前缀）
4. 清除所有构建缓存并重新部署

## 监控建议

建议监控以下指标：

1. `/api/chat` 端点的请求量和成功率
2. LLM API 的配额使用情况
3. 响应时间和错误率
4. 用户是否更倾向于使用默认配置还是自定义配置

---

**注意**：本文档中的所有 `sk-***` 应替换为您的实际 API 密钥，请妥善保管。
