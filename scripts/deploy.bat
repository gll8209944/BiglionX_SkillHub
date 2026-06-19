@echo off
REM SkillHub Windows 生产环境部署脚本
REM 使用方法: scripts\deploy.bat [environment]

setlocal enabledelayedexpansion

REM 环境变量
set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=production
set PROJECT_NAME=skillhub
set DOCKER_COMPOSE_FILE=docker-compose.yml

echo =================================
echo   SkillHub 部署脚本 (Windows)
echo   环境: %ENVIRONMENT%
echo =================================

REM 检查依赖
echo.
echo 检查依赖...
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: Docker 未安装
    exit /b 1
)

where docker-compose >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: Docker Compose 未安装
    exit /b 1
)

echo ✓ 依赖检查通过

REM 检查环境变量文件
echo.
echo 检查环境变量文件...
if not exist ".env.%ENVIRONMENT%" (
    echo 错误: .env.%ENVIRONMENT% 文件不存在
    echo 请创建 .env.%ENVIRONMENT% 文件并配置必要的环境变量
    exit /b 1
)

echo ✓ 环境变量文件存在

REM 拉取最新代码
echo.
echo 拉取最新代码...
git pull origin main
if %errorlevel% neq 0 (
    echo 警告: 代码拉取失败，继续部署...
)

echo ✓ 代码更新完成

REM 构建 Docker 镜像
echo.
echo 构建 Docker 镜像...
docker-compose -f %DOCKER_COMPOSE_FILE% build --no-cache
if %errorlevel% neq 0 (
    echo 错误: 镜像构建失败
    exit /b 1
)

echo ✓ 镜像构建完成

REM 停止旧容器
echo.
echo 停止旧容器...
docker-compose -f %DOCKER_COMPOSE_FILE% down

echo ✓ 旧容器已停止

REM 启动新容器
echo.
echo 启动新容器...
docker-compose -f %DOCKER_COMPOSE_FILE% up -d
if %errorlevel% neq 0 (
    echo 错误: 容器启动失败
    exit /b 1
)

echo ✓ 容器启动完成

REM 运行数据库迁移
echo.
echo 运行数据库迁移...
docker-compose -f %DOCKER_COMPOSE_FILE% exec -T web npx prisma migrate deploy

echo ✓ 数据库迁移完成

REM 健康检查
echo.
echo 执行健康检查...
set MAX_RETRIES=30
set RETRY_COUNT=0

:health_check_loop
if %RETRY_COUNT% geq %MAX_RETRIES% (
    echo ✗ 应用启动超时
    exit /b 1
)

curl -f http://localhost:3000/api/health >nul 2>nul
if %errorlevel% equ 0 (
    echo ✓ 应用健康检查通过
    goto health_check_passed
)

set /a RETRY_COUNT+=1
echo 等待应用启动... (%RETRY_COUNT%/%MAX_RETRIES%)
timeout /t 2 /nobreak >nul
goto health_check_loop

:health_check_passed

REM 显示部署信息
echo.
echo =================================
echo   部署完成！
echo =================================
echo.
echo 访问地址:
echo   Web 应用: http://localhost:3000
echo.
echo 查看日志:
echo   docker-compose logs -f
echo.
echo 停止服务:
echo   docker-compose down
echo.
echo 重启服务:
echo   docker-compose restart

echo.
echo 部署成功！🎉
endlocal
