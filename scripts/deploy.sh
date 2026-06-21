#!/bin/bash

# SkillHub 生产环境部署脚本
# 使用方法:
#   ./scripts/deploy.sh          # 智能检测 + 增量构建
#   ./scripts/deploy.sh --web   # 仅构建 + 重启 web
#   ./scripts/deploy.sh --quick # 仅 git pull + 重启 web（不重建）

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置
PROJECT_NAME="skillhub"
DOCKER_COMPOSE_FILE="docker-compose.yml"

# 解析参数
DEPLOY_MODE=${1:-smart}

# 检查依赖
check_dependencies() {
    echo -e "\n${YELLOW}检查依赖...${NC}"

    if ! command -v docker &> /dev/null; then
        echo -e "${RED}错误: Docker 未安装${NC}"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}错误: Docker Compose 未安装${NC}"
        exit 1
    fi

    echo -e "${GREEN}✓ 依赖检查通过${NC}"
}

# 检查环境变量文件
check_env_file() {
    echo -e "\n${YELLOW}检查环境变量文件...${NC}"

    if [ ! -f ".env.production" ]; then
        echo -e "${RED}错误: .env.production 文件不存在${NC}"
        echo -e "请创建 .env.production 文件并配置必要的环境变量"
        exit 1
    fi

    echo -e "${GREEN}✓ 环境变量文件存在${NC}"
}

# 拉取最新代码
pull_latest_code() {
    echo -e "\n${YELLOW}拉取最新代码...${NC}"

    git pull origin master

    echo -e "${GREEN}✓ 代码更新完成${NC}"
}

# 智能检测变更范围
detect_changes() {
    echo -e "\n${YELLOW}检测代码变更范围...${NC}"

    # 获取当前 HEAD 和 origin/master 的差异
    if ! git diff --quiet origin/master 2>/dev/null; then
        CHANGES=$(git diff --name-only origin/master)
    else
        echo -e "${BLUE}ℹ 代码已是最新，无需部署${NC}"
        exit 0
    fi

    echo -e "${BLUE}变更文件:${NC}"
    echo "$CHANGES" | head -20
    echo ""

    # 检测变更类型
    WEB_CHANGED=false
    SEARCH_SDK_CHANGED=false
    WIDGET_CHANGED=false
    DB_CHANGED=false

    while IFS= read -r file; do
        case "$file" in
            apps/web/*)
                WEB_CHANGED=true
                ;;
            packages/search-sdk/*)
                SEARCH_SDK_CHANGED=true
                ;;
            packages/widget/*)
                WIDGET_CHANGED=true
                ;;
            scripts/*|docker-compose*|Dockerfile*|package.json|package-lock.json|pnpm-lock.yaml)
                WEB_CHANGED=true
                ;;
        esac
    done <<< "$CHANGES"

    # 如果 search-sdk 或 widget 变更，web 也需要重建
    if [ "$SEARCH_SDK_CHANGED" = true ] || [ "$WIDGET_CHANGED" = true ]; then
        WEB_CHANGED=true
    fi

    echo -e "${BLUE}检测结果:${NC}"
    [ "$WEB_CHANGED" = true ] && echo -e "  ${GREEN}✓${NC} Web 应用需要重建"
    [ "$SEARCH_SDK_CHANGED" = true ] && echo -e "  ${GREEN}✓${NC} Search SDK 需要重建"
    [ "$WIDGET_CHANGED" = true ] && echo -e "  ${GREEN}✓${NC} Widget 需要重建"
    [ "$DB_CHANGED" = true ] && echo -e "  ${YELLOW}⚠${NC} 数据库配置变更（需要完整重建）"

    # db/redis 永远不重建，它们只是数据容器
    echo -e "${BLUE}  ${YELLOW}ℹ${NC} DB/Redis 容器保持不变"
}

# 仅构建 web 服务（最快路径）
build_web_only() {
    echo -e "\n${YELLOW}仅构建 Web 服务...${NC}"

    docker-compose -f ${DOCKER_COMPOSE_FILE} build --no-cache web

    echo -e "${GREEN}✓ Web 镜像构建完成${NC}"
}

# 仅重启 web 服务
restart_web_only() {
    echo -e "\n${YELLOW}仅重启 Web 服务...${NC}"

    docker-compose -f ${DOCKER_COMPOSE_FILE} up -d web

    echo -e "${GREEN}✓ Web 服务已启动${NC}"
}

# 健康检查
health_check() {
    echo -e "\n${YELLOW}执行健康检查...${NC}"

    MAX_RETRIES=30
    RETRY_COUNT=0

    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
            echo -e "${GREEN}✓ 应用健康检查通过${NC}"
            return 0
        fi

        RETRY_COUNT=$((RETRY_COUNT + 1))
        echo -e "${YELLOW}等待应用启动... (${RETRY_COUNT}/${MAX_RETRIES})${NC}"
        sleep 2
    done

    echo -e "${RED}✗ 应用启动超时${NC}"
    return 1
}

# 显示部署信息
show_info() {
    echo -e "\n${GREEN}================================${NC}"
    echo -e "${GREEN}  部署完成！${NC}"
    echo -e "${GREEN}================================${NC}"
    echo -e "\n访问地址:"
    echo -e "  Web 应用: ${GREEN}http://localhost:3000${NC}"
    echo -e "\n查看日志:"
    echo -e "  ${YELLOW}docker-compose logs -f web${NC}"
    echo -e "\n查看所有容器状态:"
    echo -e "  ${YELLOW}docker-compose ps${NC}"
}

# 完整构建（db/redis 配置变更时使用）
full_build() {
    echo -e "\n${YELLOW}执行完整构建...${NC}"

    docker-compose -f ${DOCKER_COMPOSE_FILE} build --no-cache

    echo -e "${GREEN}✓ 所有镜像构建完成${NC}"
}

# 主流程 - 智能模式
main_smart() {
    check_dependencies
    check_env_file
    pull_latest_code
    detect_changes

    if [ "$DB_CHANGED" = true ]; then
        echo -e "\n${YELLOW}检测到基础设施变更，执行完整构建...${NC}"
        docker-compose -f ${DOCKER_COMPOSE_FILE} down
        full_build
        docker-compose -f ${DOCKER_COMPOSE_FILE} up -d
    else
        echo -e "\n${YELLOW}执行增量构建（仅 Web 服务）...${NC}"
        build_web_only
        restart_web_only
    fi

    health_check
    show_info
}

# 主流程 - 快速模式（仅重启）
main_quick() {
    check_dependencies
    check_env_file
    pull_latest_code

    echo -e "\n${YELLOW}快速重启 Web 服务（不重建镜像）...${NC}"
    restart_web_only

    health_check
    show_info
}

# 主流程 - Web 模式（强制重建 web）
main_web() {
    check_dependencies
    check_env_file
    pull_latest_code

    echo -e "\n${YELLOW}强制重建 Web 服务...${NC}"
    build_web_only
    restart_web_only

    health_check
    show_info
}

# 显示帮助
show_help() {
    echo -e "${GREEN}SkillHub 部署脚本${NC}"
    echo ""
    echo "使用方法:"
    echo "  $0                # 智能检测变更 + 增量构建（推荐）"
    echo "  $0 --web          # 强制重建 Web 服务"
    echo "  $0 --quick        # 仅 git pull + 重启 web（不重建镜像）"
    echo "  $0 --help         # 显示此帮助"
    echo ""
    echo "说明:"
    echo "  --smart (默认)    检测代码变更，仅重建受影响的服务"
    echo "  --web             强制重建 web 服务（跳过变更检测）"
    echo "  --quick           最快路径：git pull + 重启容器（代码未变时）"
}

# 执行
case "$DEPLOY_MODE" in
    --smart|"")
        main_smart
        ;;
    --web)
        main_web
        ;;
    --quick)
        main_quick
        ;;
    --help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}未知参数: $DEPLOY_MODE${NC}"
        show_help
        exit 1
        ;;
esac

echo -e "\n${GREEN}部署成功！🎉${NC}"
