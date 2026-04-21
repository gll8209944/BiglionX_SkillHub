# 重启开发服务器并更新 Prisma 客户端
Write-Host "🔄 正在停止开发服务器..." -ForegroundColor Yellow

# 查找并停止 Next.js 开发服务器进程
$nextjsProcesses = Get-Process | Where-Object { 
    $_.ProcessName -eq "node" -and 
    $_.CommandLine -like "*next*" 
}

if ($nextjsProcesses) {
    $nextjsProcesses | Stop-Process -Force
    Write-Host "✓ 开发服务器已停止" -ForegroundColor Green
    Start-Sleep -Seconds 2
} else {
    Write-Host "⚠ 未找到运行中的开发服务器" -ForegroundColor Yellow
}

Write-Host "`n🔧 正在更新 Prisma 客户端..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Prisma 客户端更新成功" -ForegroundColor Green
} else {
    Write-Host "✗ Prisma 客户端更新失败" -ForegroundColor Red
    exit 1
}

Write-Host "`n🚀 正在启动开发服务器..." -ForegroundColor Yellow
npm run dev
