@echo off
REM ============================================
REM SkillHub 部署前清理脚本 (Windows)
REM ============================================
REM 用途: 清理临时文件、构建缓存和归档文档
REM 使用: scripts\cleanup-before-deploy.bat
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ==========================================
echo   SkillHub 部署前清理
echo ==========================================
echo.

REM 确认操作
set /p confirm="⚠️  此操作将删除临时文件和构建缓存。是否继续？(y/N) "
if /i not "!confirm!"=="y" (
    echo ⚠️  操作已取消
    exit /b 0
)

REM 获取项目根目录
cd /d "%~dp0.."

echo [INFO] 清理根目录临时文件...

REM 清理根目录临时文件
if exist "check-user.js" del /f "check-user.js" && echo [SUCCESS] 已删除: check-user.js
if exist "reset-password.js" del /f "reset-password.js" && echo [SUCCESS] 已删除: reset-password.js
if exist "logo.jpeg" del /f "logo.jpeg" && echo [SUCCESS] 已删除: logo.jpeg
if exist "logo2.png" del /f "logo2.png" && echo [SUCCESS] 已删除: logo2.png
if exist "favcion.png" del /f "favcion.png" && echo [SUCCESS] 已删除: favcion.png
if exist "3fd35a3ffd8fbb96f250fac4afccf612.jpg" del /f "3fd35a3ffd8fbb96f250fac4afccf612.jpg" && echo [SUCCESS] 已删除: 3fd35a3ffd8fbb96f250fac4afccf612.jpg

echo.
echo [INFO] 清理 Web 应用临时文件...
cd apps\web

REM 清理 web 临时文件
if exist "check-skills.js" del /f "check-skills.js" && echo [SUCCESS] 已删除: apps/web/check-skills.js
if exist "check-status.js" del /f "check-status.js" && echo [SUCCESS] 已删除: apps/web/check-status.js
if exist "clean-cache.ps1" del /f "clean-cache.ps1" && echo [SUCCESS] 已删除: apps/web/clean-cache.ps1
if exist "restart-dev.ps1" del /f "restart-dev.ps1" && echo [SUCCESS] 已删除: apps/web/restart-dev.ps1
if exist "tsconfig.tsbuildinfo" del /f "tsconfig.tsbuildinfo" && echo [SUCCESS] 已删除: apps/web/tsconfig.tsbuildinfo

REM 清理空的 docs 目录
if exist "docs" (
    dir /b "docs" | findstr . >nul 2>&1
    if errorlevel 1 (
        rmdir "docs"
        echo [SUCCESS] 已删除空目录: apps/web/docs
    )
)

cd ..\..

echo.
echo [INFO] 清理构建缓存...

REM 清理构建缓存
if exist "apps\web\.next" rmdir /s /q "apps\web\.next" && echo [SUCCESS] 已删除: apps/web/.next
if exist "apps\web\.swc" rmdir /s /q "apps\web\.swc" && echo [SUCCESS] 已删除: apps/web/.swc
if exist ".turbo\cache" rmdir /s /q ".turbo\cache" && echo [SUCCESS] 已删除: .turbo/cache

echo.
echo [INFO] 归档开发文档...

REM 创建归档目录
if not exist "docs\archive\2024-development" mkdir "docs\archive\2024-development"
if not exist "docs\archive\completed-features" mkdir "docs\archive\completed-features"
if not exist "docs\archive\planning" mkdir "docs\archive\planning"

REM 归档开发进度文档
for %%f in (
    "MY_SKILLHUB_DELIVERY_CHECKLIST.md"
    "MY_SKILLHUB_DEVELOPMENT_PROGRESS.md"
    "MY_SKILLHUB_DEVELOPMENT_TASKS.md"
    "MY_SKILLHUB_FINAL_REPORT.md"
    "MY_SKILLHUB_OPTIMIZATION_PLAN.md"
    "MY_SKILLHUB_OPTIMIZATION_SUMMARY.md"
    "MY_SKILLHUB_TASK_TRACKER.md"
    "MY_SKILLHUB_WEEK3_4_COMPLETION.md"
) do (
    if exist "docs\%%~f" (
        move "docs\%%~f" "docs\archive\2024-development\" >nul
        echo [SUCCESS] 已归档: docs/%%~f
    )
)

REM 归档已完成的功能文档
for %%f in (
    "PASSWORD_LOGIN_FINAL_FIX.md"
    "PASSWORD_LOGIN_FIX.md"
    "AUTH_PAGES_LOGO_IMPROVEMENT.md"
    "LOGOUT_REDIRECT_STRATEGY.md"
    "WIDGET_DEMO_SEO_OPTIMIZATION.md"
    "WIDGET_DEVELOPMENT_SUMMARY.md"
    "WIDGET_INTEGRATION_REPORT.md"
    "WIDGET_MODULE_FIX.md"
    "WIDGET_PROMOTION_SUMMARY.md"
    "WIDGET_QUICK_START.md"
    "PROMO_CARDS_OPTIMIZATION.md"
    "LOGO_IMAGE_UPDATE.md"
) do (
    if exist "docs\%%~f" (
        move "docs\%%~f" "docs\archive\completed-features\" >nul
        echo [SUCCESS] 已归档: docs/%%~f
    )
)

REM 归档计划文档
for %%f in (
    "SKILLHUB_DEVELOPMENT_PLAN_V2.md"
    "SKILLHUB_PLAN_COMPARISON.md"
    "COMMUNITY_BUILDING_PLAN.md"
    "COMMUNITY_FEATURES_PROGRESS.md"
) do (
    if exist "docs\%%~f" (
        move "docs\%%~f" "docs\archive\planning\" >nul
        echo [SUCCESS] 已归档: docs/%%~f
    )
)

REM 归档临时文档
if exist "docs\GIT_PUSH_SUMMARY_20260422.md" (
    move "docs\GIT_PUSH_SUMMARY_20260422.md" "docs\archive\" >nul
    echo [SUCCESS] 已归档: docs/GIT_PUSH_SUMMARY_20260422.md
)

echo.
echo [SUCCESS] ✅ 清理完成！
echo.
echo ==========================================
echo   清理摘要
echo ==========================================
echo.
echo 📝 已删除临时文件
echo 🗄️  已清理构建缓存
echo 📚 已归档开发文档
echo 🔐 请手动检查敏感信息
echo.
echo ==========================================
echo   下一步操作
echo ==========================================
echo.
echo 1️⃣  查看更改:
echo    git status
echo.
echo 2️⃣  运行测试:
echo    npm test
echo    cd apps/web ^&^& npm run cypress:run
echo.
echo 3️⃣  构建验证:
echo    cd apps/web ^&^& npm run build
echo.
echo 4️⃣  提交更改:
echo    git add .
echo    git commit -m "chore: cleanup before deployment"
echo.
echo 5️⃣  查看归档文档:
echo    dir docs\archive\
echo.
echo ==========================================
echo.
echo 🚀 祝部署顺利！
echo.

endlocal

