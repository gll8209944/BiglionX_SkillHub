@echo off
REM SkillHub 新功能快速启动脚本
REM Windows PowerShell 版本

echo ========================================
echo   SkillHub 新功能部署脚本
echo ========================================
echo.

REM 检查是否在正确的目录
if not exist "apps\web\package.json" (
    echo [错误] 请在项目根目录运行此脚本
    pause
    exit /b 1
)

echo [步骤 1/4] 进入 web 应用目录...
cd apps\web

echo.
echo [步骤 2/4] 安装依赖...
call npm install
if errorlevel 1 (
    echo [错误] 依赖安装失败
    pause
    exit /b 1
)

echo.
echo [步骤 3/4] 运行数据库迁移...
call npx prisma migrate dev --name add_api_keys
if errorlevel 1 (
    echo [警告] 数据库迁移失败,请检查数据库连接
    echo 您可以稍后手动运行: npx prisma migrate dev
)

echo.
echo [步骤 4/4] 生成 Prisma Client...
call npx prisma generate

echo.
echo ========================================
echo   部署完成!
echo ========================================
echo.
echo 新功能包括:
echo   - Settings 设置系统 (个人资料、安全、通知、API密钥)
echo   - Analytics 数据分析页面
echo   - Toast 通知系统
echo   - Skeleton 骨架屏组件
echo.
echo 访问地址:
echo   - 主页: http://localhost:3000
echo   - Settings: http://localhost:3000/dashboard/settings
echo   - Analytics: http://localhost:3000/dashboard/analytics
echo.
echo 启动开发服务器:
echo   npm run dev
echo.

cd ..\..
pause
