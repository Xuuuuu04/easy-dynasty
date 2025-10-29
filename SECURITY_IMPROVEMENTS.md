# 🔐 安全改进说明

## 问题描述

在之前的实现中，默认 LLM 配置使用 `NEXT_PUBLIC_*` 环境变量存储，这导致：

1. **API 密钥暴露**：`NEXT_PUBLIC_DEFAULT_LLM_API_KEY` 被打包到客户端代码
2. **端点暴露**：`NEXT_PUBLIC_DEFAULT_LLM_BASE_URL` 在客户端可见
3. **安全风险**：任何人都可以在浏览器开发者工具中查看这些敏感信息

## 解决方案

### 架构改进

实现了**双模式路由机制**：

```
用户使用默认配置？
├─ 是 → 浏览器 → /api/chat (服务器代理) → LLM API
│       ✅ 密钥安全：API Key 仅在服务器端
│       ✅ 集中管理：统一监控和控制
│
└─ 否 → 浏览器 → 用户的 LLM 端点
        ✅ 用户隐私：请求不经过我们的服务器
        ✅ 灵活性：用户可以使用任何兼容端点
```

### 技术实现

#### 1. 服务器端 API 路由
- 文件：`/app/api/chat/route.ts`
- 功能：代理默认 LLM 请求
- 安全：API 密钥仅在服务器端访问

#### 2. 环境变量隔离
```bash
# ❌ 旧方式（不安全）
NEXT_PUBLIC_DEFAULT_LLM_API_KEY=sk-xxx

# ✅ 新方式（安全）
DEFAULT_LLM_API_KEY=sk-xxx              # 服务器端
NEXT_PUBLIC_DEFAULT_LLM_AVAILABLE=true  # 客户端（无敏感信息）
```

#### 3. 条件路由逻辑
```typescript
// 在 app/analysis/page.tsx
if (hasLocalConfig) {
  // 用户自定义 → 直连
  fetch(`${userBaseUrl}/chat/completions`, {
    headers: { Authorization: `Bearer ${userApiKey}` }
  })
} else {
  // 默认配置 → 服务器代理
  fetch('/api/chat', { /* 无需 API Key */ })
}
```

## 安全保证

### ✅ 已实现的保护

1. **密钥隔离**：服务器密钥永不暴露到客户端
2. **用户隐私**：自定义配置不经过服务器
3. **环境隔离**：服务器/客户端变量明确分离
4. **日志安全**：API 路由不记录敏感信息
5. **流式支持**：代理完整支持 SSE 流式响应

### ✅ 代码审计通过

- 无 `NEXT_PUBLIC_*` 敏感变量
- 服务器密钥仅在 API 路由中使用
- 客户端代码无法访问服务器环境变量
- `.env*` 文件已在 `.gitignore` 中

## 迁移步骤

### 对于已部署项目

1. **更新环境变量**（详见 `DEPLOYMENT.md`）
2. **重新构建和部署**
3. **验证安全性**：
   ```bash
   # 检查客户端代码
   curl https://your-domain.com/_next/static/chunks/*.js | grep -i "api.*key"
   # 应该返回空（没有匹配）
   ```

### 对于新部署

1. 复制 `.env.example` 到 `.env.local`
2. 填写配置
3. 部署

## 验证清单

部署后请验证：

- [ ] 主页可以正常访问
- [ ] 使用默认配置时，Network 中显示请求到 `/api/chat`
- [ ] 使用自定义配置时，Network 中显示请求到用户端点
- [ ] 在浏览器源代码中搜索不到 API 密钥
- [ ] 在 Network 请求头中看不到默认的 API 密钥
- [ ] AI 分析功能正常工作（流式响应正常）

## 性能影响

### 默认配置（服务器代理）
- **延迟增加**：约 10-50ms（取决于服务器位置）
- **优势**：集中管理、监控、限流

### 自定义配置（直连）
- **延迟**：无额外延迟
- **优势**：最佳性能、用户隐私

## 相关文档

- 📖 **DEPLOYMENT.md** - 详细部署指南
- 📝 **CHANGELOG_SERVER_PROXY.md** - 完整变更记录
- 🔧 **.env.example** - 环境变量模板
- 📚 **README.md** - 项目概述（已更新）

## 支持

如果遇到问题：
1. 查看 `DEPLOYMENT.md` 的故障排查章节
2. 验证环境变量是否正确设置
3. 检查服务器日志的错误信息
4. 确认 LLM 端点可访问且密钥有效

---

**重要**：此安全改进向后不兼容。请务必更新环境变量配置。
