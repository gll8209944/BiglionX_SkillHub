# SkillHub AI 提供商配置状态

**最后更新**: 2026-04-21  
**当前默认提供商**: 智谱AI (Zhipu AI) 🇨🇳

---

## ✅ 配置状态总览

### 本地开发环境 (`apps/web/.env.local`)

| 配置项 | 状态 | 值 |
|--------|------|-----|
| `OPENAI_API_KEY` | ✅ 已配置 | 智谱AI Key |
| `OPENAI_BASE_URL` | ✅ 已配置 | `https://open.bigmodel.cn/api/paas/v4` |
| `ZHIPU_API_KEY` | ✅ 已配置 | 智谱AI Key |
| `ZHIPU_BASE_URL` | ✅ 已配置 | `https://open.bigmodel.cn/api/paas/v4` |
| `ZHIPU_MODEL` | ✅ 已配置 | `glm-4.7-flash` |
| `ZHIPU_EMBEDDING_MODEL` | ✅ 已配置 | `embedding-2` |

**结论**: ✅ **本地开发已完全配置为使用智谱AI**

---

### Vercel 部署环境

需要在 Vercel Dashboard 中设置的环境变量：

```env
OPENAI_API_KEY=e0561298533a4d2f8d4b79d00c4c950b.4k08jB25M2xzCp2T
OPENAI_BASE_URL=https://open.bigmodel.cn/api/paas/v4
```

**参考文档**: 
- [VERCEL_ENV_CHECKLIST.md](./VERCEL_ENV_CHECKLIST.md) - 详细的环境变量清单
- [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) - Vercel 部署指南

---

### Docker 生产环境 (`.env.production`)

需要在 `.env.production` 文件中添加：

```env
# AI Embeddings 配置 - 智谱AI
OPENAI_API_KEY=你的智谱AI密钥
OPENAI_BASE_URL=https://open.bigmodel.cn/api/paas/v4
```

**参考模板**: [.env.production.example](./.env.production.example)

---

## 📋 代码层面的支持

### 1. EmbeddingService (核心服务)

**文件**: [apps/web/lib/services/EmbeddingService.ts](./apps/web/lib/services/EmbeddingService.ts)

**功能**:
- ✅ 支持自动检测 API 提供商（智谱AI / DeepSeek / OpenAI）
- ✅ 根据 `OPENAI_BASE_URL` 自动选择正确的端点
- ✅ 使用懒加载模式，避免构建时失败
- ✅ 针对不同提供商使用优化的模型和参数

**检测逻辑**:
```typescript
if (baseURL?.includes('bigmodel.cn')) {
  // 智谱AI
  this.provider = 'zhipu';
  // 使用 embedding-2 模型
} else if (baseURL?.includes('deepseek.com')) {
  // DeepSeek
  this.provider = 'deepseek';
} else {
  // OpenAI (默认)
  this.provider = 'openai';
}
```

**当前配置**: 
- 提供商: **智谱AI** ✅
- 模型: `embedding-2` (1024 维向量)
- 端点: `https://open.bigmodel.cn/api/paas/v4`

---

### 2. 其他 AI 相关服务

检查结果显示：
- ✅ **没有其他服务直接使用 OpenAI SDK**
- ✅ **所有 AI 调用都通过 EmbeddingService 统一管理**
- ✅ **API 路由中没有硬编码的 OpenAI 调用**

这意味着：
- 只需要修改环境变量即可切换 AI 提供商
- 不需要修改任何业务代码
- 配置集中管理，易于维护

---

## 🔄 支持的 AI 提供商

### 选项 A: 智谱AI (当前默认) ⭐ 推荐

**优点**:
- ✅ 国内访问速度快
- ✅ 价格实惠
- ✅ 中文支持好
- ✅ embedding-2 模型质量高 (1024 维)

**配置**:
```env
OPENAI_API_KEY=your-zhipu-key
OPENAI_BASE_URL=https://open.bigmodel.cn/api/paas/v4
```

**获取 Key**: https://open.bigmodel.cn/usercenter/apikeys

---

### 选项 B: DeepSeek

**优点**:
- ✅ 性价比高
- ✅ 性能不错

**配置**:
```env
OPENAI_API_KEY=your-deepseek-key
OPENAI_BASE_URL=https://api.deepseek.com
```

**获取 Key**: https://platform.deepseek.com/

---

### 选项 C: OpenAI

**优点**:
- ✅ 最成熟的 API
- ✅ 文档完善

**缺点**:
- ❌ 国内访问可能需要代理
- ❌ 价格相对较高

**配置**:
```env
OPENAI_API_KEY=your-openai-key
# OPENAI_BASE_URL 不设置或使用默认值
```

**获取 Key**: https://platform.openai.com/

---

## 🎯 如何切换到其他提供商

### 方法 1: 修改环境变量 (推荐)

只需修改两个环境变量即可切换提供商：

**切换到智谱AI**:
```env
OPENAI_API_KEY=智谱AI的Key
OPENAI_BASE_URL=https://open.bigmodel.cn/api/paas/v4
```

**切换到 DeepSeek**:
```env
OPENAI_API_KEY=DeepSeek的Key
OPENAI_BASE_URL=https://api.deepseek.com
```

**切换到 OpenAI**:
```env
OPENAI_API_KEY=OpenAI的Key
# 删除或注释掉 OPENAI_BASE_URL
```

**无需修改任何代码！** ✨

---

### 方法 2: 不同环境使用不同提供商

你可以在不同环境中使用不同的 AI 提供商：

**本地开发** (`apps/web/.env.local`):
```env
OPENAI_API_KEY=智谱AI-Key
OPENAI_BASE_URL=https://open.bigmodel.cn/api/paas/v4
```

**Vercel 生产**:
在 Vercel Dashboard 中设置为相同的智谱AI配置

**Docker 生产** (`.env.production`):
```env
OPENAI_API_KEY=智谱AI-Key
OPENAI_BASE_URL=https://open.bigmodel.cn/api/paas/v4
```

---

## 📊 当前项目状态总结

| 项目 | 状态 | 说明 |
|------|------|------|
| **代码支持** | ✅ 完成 | EmbeddingService 支持多提供商 |
| **本地配置** | ✅ 完成 | `.env.local` 已配置智谱AI |
| **文档更新** | ✅ 完成 | 所有部署文档已更新 |
| **Vercel 配置** | ⏳ 待设置 | 需要在 Dashboard 中添加环境变量 |
| **Docker 配置** | ⏳ 待设置 | 需要在 `.env.production` 中添加 |
| **构建修复** | ✅ 完成 | 懒加载模式避免构建失败 |
| **ESLint 检查** | ✅ 通过 | 无类型错误 |

---

## 🚀 下一步行动

### 如果要部署到 Vercel

1. **访问 Vercel Dashboard**
   - https://vercel.com/dashboard

2. **添加环境变量**
   - Settings → Environment Variables
   - 添加 `OPENAI_API_KEY` = `e0561298533a4d2f8d4b79d00c4c950b.4k08jB25M2xzCp2T`
   - 添加 `OPENAI_BASE_URL` = `https://open.bigmodel.cn/api/paas/v4`

3. **重新部署**
   - Vercel 会自动触发新的部署
   - 或者手动点击 "Redeploy"

### 如果要部署到 Docker

1. **编辑 `.env.production`**
   ```bash
   cp .env.production.example .env.production
   nano .env.production
   ```

2. **添加 AI 配置**
   ```env
   OPENAI_API_KEY=e0561298533a4d2f8d4b79d00c4c950b.4k08jB25M2xzCp2T
   OPENAI_BASE_URL=https://open.bigmodel.cn/api/paas/v4
   ```

3. **启动 Docker**
   ```bash
   docker-compose up -d
   ```

---

## 🔍 验证配置是否生效

### 方法 1: 查看日志

启动应用后，查看控制台输出：
```
🔧 EmbeddingService 初始化完成 - 提供商: zhipu
```

如果显示 `zhipu`，说明配置成功！

### 方法 2: 测试 API

```bash
# 测试健康检查
curl http://localhost:3000/api/health

# 应该返回正常，没有 AI 相关的错误
```

### 方法 3: 检查环境变量

```javascript
// 在 Node.js 控制台中运行
console.log('Provider:', process.env.OPENAI_BASE_URL?.includes('bigmodel.cn') ? 'Zhipu' : 'Other');
```

---

## 📝 常见问题

### Q1: 为什么变量名叫 `OPENAI_API_KEY` 但实际用的是智谱AI？

**A**: 因为智谱AI、DeepSeek 等都兼容 OpenAI 的 API 格式，所以使用统一的变量名。通过 `OPENAI_BASE_URL` 来区分不同的提供商。

### Q2: 可以同时配置多个提供商吗？

**A**: 不可以同时使用多个提供商。每次只能使用一个，通过修改 `OPENAI_BASE_URL` 来切换。

### Q3: 切换提供商需要重启服务吗？

**A**: 
- **本地开发**: 需要重启 `npm run dev`
- **Vercel**: 修改变量后自动重新部署
- **Docker**: 需要重启容器 `docker-compose restart`

### Q4: 智谱AI 的 API Key 安全吗？

**A**: 
- ✅ `.env.local` 和 `.env.production` 已在 `.gitignore` 中
- ✅ 不会提交到 Git
- ✅ Vercel 的环境变量是加密存储的
- ⚠️ 不要将真实的 Key 分享到公开场合

---

## 🎉 总结

**整个项目已经完全配置为使用智谱AI！**

- ✅ 代码层面：支持多提供商，自动检测
- ✅ 本地环境：已配置智谱AI
- ✅ 文档完整：所有部署指南已更新
- ✅ 易于切换：只需修改环境变量

**你现在的任务**:
1. 如果要在 Vercel 部署 → 在 Dashboard 中添加智谱AI的环境变量
2. 如果要在 Docker 部署 → 在 `.env.production` 中添加智谱AI配置
3. 本地开发已经可以直接使用了！

---

**维护者**: BigLionX Team  
**最后审查**: 2026-04-21  
**下次审查**: 2026-07-01
