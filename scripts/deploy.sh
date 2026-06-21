#!/bin/bash

# SkillHub 生产环境部署脚本
# 使用方法: ./scripts/deploy.sh [environment]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 环境变量
ENVIRONMENT=${1:-production}
PROJECT_NAME="skillhub"
DOCKER_COMPOSE_FILE="docker-compose.yml"

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}  SkillHub 部署脚本${NC}"
echo -e "${GREEN}  环境: ${ENVIRONMENT}${NC}"
echo -e "${GREEN}================================${NC}"

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
    
    if [ ! -f ".env.${ENVIRONMENT}" ]; then
        echo -e "${RED}错误: .env.${ENVIRONMENT} 文件不存在${NC}"
        echo -e "请创建 .env.${ENVIRONMENT} 文件并配置必要的环境变量"
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

# 构建 Docker 镜像
build_images() {
    echo -e "\n${YELLOW}构建 Docker 镜像...${NC}"
    
    docker-compose -f ${DOCKER_COMPOSE_FILE} build --no-cache
    
    echo -e "${GREEN}✓ 镜像构建完成${NC}"
}

# 停止旧容器
stop_containers() {
    echo -e "\n${YELLOW}停止旧容器...${NC}"
    
    docker-compose -f ${DOCKER_COMPOSE_FILE} down
    
    echo -e "${GREEN}✓ 旧容器已停止${NC}"
}

# 启动新容器
start_containers() {
    echo -e "\n${YELLOW}启动新容器...${NC}"
    
    docker-compose -f ${DOCKER_COMPOSE_FILE} up -d
    
    echo -e "${GREEN}✓ 容器启动完成${NC}"
}

# 运行数据库迁移
run_migrations() {
    echo -e "\n${YELLOW}运行数据库迁移...${NC}"
    
    docker-compose -f ${DOCKER_COMPOSE_FILE} exec -T web npx prisma migrate deploy
    
    echo -e "${GREEN}✓ 数据库迁移完成${NC}"
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
    echo -e "  ${YELLOW}docker-compose logs -f${NC}"
    echo -e "\n停止服务:"
    echo -e "  ${YELLOW}docker-compose down${NC}"
    echo -e "\n重启服务:"
    echo -e "  ${YELLOW}docker-compose restart${NC}"
}

# 主流程
main() {
    check_dependencies
    check_env_file
    pull_latest_code
    build_images
    stop_containers
    start_containers
    run_migrations
    health_check
    show_info
}

# 执行主流程
main

echo -e "\n${GREEN}部署成功！🎉${NC}"
