# 路由冲突修复 - 重启指南

## ⚠️ 重要提示

已删除冲突的 `(dashboard)` 路由组，但 Next.js 开发服务器可能仍在使用旧的缓存。

## 🔧 解决步骤

### 方法 1：重启开发服务器（推荐）

1. **停止当前的开发服务器**
   - 在终端中按 `Ctrl + C`

2. **清理缓存**
   ```bash
   # 删除 .next 目录
   rm -rf .next
   
   # 或在 Windows PowerShell 中
   Remove-Item -Path ".next" -Recurse -Force
   ```

3. **重新启动开发服务器**
   ```bash
   npm run dev
   ```

### 方法 2：使用清理脚本

```bash
# Windows PowerShell
.\clean-cache.ps1

# 然后重启
npm run dev
```

### 方法 3：完全清理（如果上述方法无效）

```bash
# 1. 停止开发服务器 (Ctrl + C)

# 2. 删除所有缓存
rm -rf .next
rm -rf node_modules/.cache
rm tsconfig.tsbuildinfo

# 3. 重新安装依赖（可选）
npm install

# 4. 重新启动
npm run dev
```

## ✅ 验证修复

启动后，检查：

1. **控制台应该没有路由冲突错误**
   ```
   ❌ 之前: You cannot have two parallel pages that resolve to the same path
   ✅ 现在: 无错误
   ```

2. **访问公开页面**
   ```
   http://localhost:3000/          → 主页
   http://localhost:3000/skills    → Skills 市场（无需登录）
   ```

3. **访问受保护页面**
   ```
   http://localhost:3000/dashboard         → 重定向到登录
   http://localhost:3000/dashboard/skills  → 重定向到登录
   ```

## 📁 当前路由结构

```
app/
├── (auth)/              # 认证路由组
│   ├── login/
│   └── register/
├── page.tsx             → /
├── skills/              → /skills (公开)
└── dashboard/           → /dashboard/* (需要登录)
    ├── page.tsx
    ├── skills/
    ├── namespaces/
    └── settings/
```

## 🐛 如果问题仍然存在

### 检查是否还有 `(dashboard)` 目录

```bash
# Windows PowerShell
Get-ChildItem -Path "app" -Filter "(dashboard)" -Directory -Recurse

# 应该没有任何输出
```

### 检查文件是否有语法错误

```bash
npm run lint
```

### 尝试生产构建

```bash
npm run build
```

如果构建成功，说明路由没有问题，只是开发服务器的缓存问题。

## 📝 相关文档

- [ROUTE_CONFLICT_FIX.md](./ROUTE_CONFLICT_FIX.md) - 详细的路由冲突分析和修复说明
- [PUBLIC_SKILLS_PAGE_FIX.md](./PUBLIC_SKILLS_PAGE_FIX.md) - 公开 Skills 页面的修复

---

**最后更新**: 2026-04-17  
**状态**: ✅ 路由冲突已修复，需要重启开发服务器
