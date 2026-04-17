# Next.js 缓存清理脚本
# 使用方法: .\clean-cache.ps1

Write-Host "🧹 清理 Next.js 缓存..." -ForegroundColor Cyan

# 删除 .next 目录
if (Test-Path ".next") {
    Write-Host "  删除 .next 目录..." -ForegroundColor Yellow
    Remove-Item -Path ".next" -Recurse -Force
    Write-Host "  ✅ .next 已删除" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  .next 目录不存在" -ForegroundColor Gray
}

# 删除 node_modules/.cache
if (Test-Path "node_modules\.cache") {
    Write-Host "  删除 node_modules/.cache..." -ForegroundColor Yellow
    Remove-Item -Path "node_modules\.cache" -Recurse -Force
    Write-Host "  ✅ node_modules/.cache 已删除" -ForegroundColor Green
}

# 删除 TypeScript 构建产物
if (Test-Path "tsconfig.tsbuildinfo") {
    Write-Host "  删除 tsconfig.tsbuildinfo..." -ForegroundColor Yellow
    Remove-Item -Path "tsconfig.tsbuildinfo" -Force
    Write-Host "  ✅ tsconfig.tsbuildinfo 已删除" -ForegroundColor Green
}

Write-Host ""
Write-Host "✨ 缓存清理完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📝 下一步：" -ForegroundColor Cyan
Write-Host "  1. 重新启动开发服务器: npm run dev" -ForegroundColor White
Write-Host "  2. 如果仍有问题，尝试: npm run build" -ForegroundColor White
Write-Host ""
