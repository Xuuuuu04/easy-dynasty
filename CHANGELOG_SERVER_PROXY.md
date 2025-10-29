# 服务器代理与密钥保护 - 变更日志

## 📋 变更摘要

本次更新实现了服务器端代理机制，以保护默认 LLM 配置的敏感信息不被暴露到客户端，同时保持用户使用自定义配置时的隐私保护。

## 🔐 安全改进

### 之前的问题
- 使用 `NEXT_PUBLIC_*` 环境变量存储 API 密钥
- 敏感信息（端点 URL 和 API Key）打包到客户端代码
- 任何人都可以在浏览器中查看默认的 API 密钥

### 现在的解决方案
- **默认配置**：通过服务器端 API 路由代理，密钥完全不暴露
- **用户配置**：直接从浏览器请求，保护用户隐私

## 📁 新增文件

1. **`/app/api/chat/route.ts`**
   - Next.js API 路由处理器
   - 代理默认 LLM 请求
   - 支持流式响应
   - 错误处理和日志记录

2. **`.env.example`**
   - 环境变量配置模板
   - 区分服务器端和客户端变量
   - 包含详细注释说明

3. **`DEPLOYMENT.md`**
   - 完整的部署指南
   - 多平台配置示例
   - 安全检查清单
   - 故障排查指南

4. **`CHANGELOG_SERVER_PROXY.md`**
   - 本文件，记录变更

## 📝 修改文件

### 1. `/utils/llmConfig.ts`
**变更**：
- 移除 `baseUrl` 和 `apiKey` 字段的客户端暴露
- 新增 `available` 字段标识默认 LLM 是否可用
- 实现服务器端/客户端双模式检测
- 客户端仅能知道默认 LLM 是否可用，无法获取敏感信息

**影响**：
- 现有代码需要使用新的接口结构
- 安全性大幅提升

### 2. `/app/analysis/page.tsx`
**变更**：
- 实现条件路由逻辑
- 检测是否使用默认配置或用户自定义配置
- 默认配置：请求 `/api/chat` 代理端点
- 自定义配置：直接请求用户指定的端点

**新增逻辑**：
```typescript
if (hasLocalConfig) {
  // 用户自定义配置，直接请求
  response = await fetch(`${localBaseUrl}/chat/completions`, ...)
} else {
  // 默认配置，通过服务器代理
  response = await fetch('/api/chat', ...)
}
```

### 3. `/app/settings/page.tsx`
**变更**：
- 移除对 `defaultConfig.baseUrl` 和 `defaultConfig.apiKey` 的引用
- 删除"默认 LLM 已禁用"的警告框（因为客户端无法知道详细状态）
- 更新安全提示文案，说明双模式机制

### 4. `/README.md`
**变更**：
- 更新环境变量配置说明
- 区分服务器端和客户端变量
- 添加安全机制说明
- 更新隐私与安全章节

## 🔧 环境变量变更

### 废弃（不再使用）
```bash
NEXT_PUBLIC_DEFAULT_LLM_ENABLED      # ❌ 移除
NEXT_PUBLIC_DEFAULT_LLM_BASE_URL     # ❌ 移除（安全风险）
NEXT_PUBLIC_DEFAULT_LLM_API_KEY      # ❌ 移除（安全风险）
NEXT_PUBLIC_DEFAULT_LLM_MODEL        # 🔄 保留但仅用于显示
```

### 新增（服务器端）
```bash
DEFAULT_LLM_ENABLED        # 启用/禁用默认 LLM
DEFAULT_LLM_BASE_URL       # 端点 URL（服务器端）
DEFAULT_LLM_API_KEY        # API 密钥（服务器端，不暴露）
DEFAULT_LLM_MODEL          # 模型名称（服务器端）
```

### 新增（客户端）
```bash
NEXT_PUBLIC_DEFAULT_LLM_AVAILABLE   # 是否可用（布尔值）
NEXT_PUBLIC_DEFAULT_LLM_MODEL       # 模型名称（仅显示）
```

## 🚀 迁移指南

### 对于新部署

1. 复制 `.env.example` 到 `.env.local`
2. 填写实际的配置值
3. 部署应用

### 对于现有部署

1. **更新环境变量**：
   ```bash
   # 旧的（需要删除）
   unset NEXT_PUBLIC_DEFAULT_LLM_ENABLED
   unset NEXT_PUBLIC_DEFAULT_LLM_BASE_URL
   unset NEXT_PUBLIC_DEFAULT_LLM_API_KEY
   
   # 新的（需要添加）
   export DEFAULT_LLM_ENABLED=true
   export DEFAULT_LLM_BASE_URL=https://api.openai.com/v1
   export DEFAULT_LLM_API_KEY=sk-your-key
   export DEFAULT_LLM_MODEL=gpt-4o-mini
   export NEXT_PUBLIC_DEFAULT_LLM_AVAILABLE=true
   export NEXT_PUBLIC_DEFAULT_LLM_MODEL=gpt-4o-mini
   ```

2. **重新构建和部署**：
   ```bash
   npm run build
   # 然后部署到您的平台
   ```

3. **验证**：
   - 检查主页是否正常
   - 尝试使用默认配置进行占卜
   - 在浏览器 Network 标签验证请求发送到 `/api/chat`
   - 确认没有暴露敏感信息

## ✅ 测试清单

- [x] 构建成功（`npm run build`）
- [x] TypeScript 编译无错误
- [x] API 路由创建成功（`/api/chat`）
- [x] 默认配置走服务器代理
- [x] 用户配置直连端点
- [x] 敏感信息不暴露到客户端
- [x] 文档完整且清晰

## 📚 相关文档

- `README.md` - 项目概述和快速开始
- `DEPLOYMENT.md` - 详细部署指南
- `.env.example` - 环境变量模板

## 🤝 贡献

如果发现安全问题或改进建议，请：
1. 不要在公开 issue 中暴露敏感信息
2. 通过安全渠道联系项目维护者
3. 提供详细的复现步骤

---

**日期**：2024
**版本**：实现服务器代理机制
**状态**：✅ 已完成并测试
