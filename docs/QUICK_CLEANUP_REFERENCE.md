# 部署前清理 - 快速参考

## 🚀 一键清理

### Linux/Mac

```bash
./scripts/cleanup-before-deploy.sh
```

### Windows

```batch
scripts\cleanup-before-deploy.bat
```

## 📋 手动清理步骤

如果不想使用脚本，可以手动执行：

### 1. 删除临时文件

```bash
# 根目录
rm -f check-user.js reset-password.js logo.jpeg logo2.png favcion.png *.jpg

# Web 应用
cd apps/web
rm -f check-skills.js check-status.js *.ps1 tsconfig.tsbuildinfo
cd ../..
```

### 2. 清理构建缓存

```bash
rm -rf apps/web/.next apps/web/.swc .turbo/cache
```

### 3. 归档文档（可选）

```bash
mkdir -p docs/archive/{2024-development,completed-features,planning}
mv docs/MY_SKILLHUB_*.md docs/archive/2024-development/
mv docs/PASSWORD_LOGIN_*.md docs/WIDGET_*.md docs/archive/completed-features/
```

## ✅ 验证清单

清理后运行：

```bash
# 1. 查看更改
git status

# 2. 运行测试
npm test

# 3. 构建项目
cd apps/web && npm run build

# 4. 提交更改
git add .
git commit -m "chore: cleanup before deployment"
```

## 📚 相关文档

- [完整清理指南](DEPLOYMENT_CLEANUP_GUIDE.md)
- [部署前检查清单](PRE_DEPLOYMENT_CHECKLIST.md)
- [清理总结](CLEANUP_SUMMARY.md)

## ⚠️ 注意事项

1. **备份**: 清理前确保已提交重要更改
2. **测试**: 清理后运行完整测试套件
3. **团队**: 通知团队成员即将进行清理
4. **回滚**: 如有问题，使用 `git reset` 恢复

---

**提示**: 建议将此文件添加到书签，每次部署前参考。
