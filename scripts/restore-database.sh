#!/bin/bash
# ============================================
# SkillHub 数据库恢复脚本
# ============================================
# 用法: ./restore-database.sh <backup_file.sql.gz>
# 示例: ./restore-database.sh /backups/postgres/skillhub_20260420_020000.sql.gz
# ============================================

set -e

# 配置
DB_CONTAINER="${DB_CONTAINER:-skillhub-db-1}"
DB_USER="${DB_USER:-skillhub}"
DB_NAME="${DB_NAME:-skillhub}"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查参数
if [ -z "$1" ]; then
    echo -e "${RED}错误: 请指定备份文件路径${NC}"
    echo "用法: $0 <backup_file.sql.gz>"
    echo ""
    echo "可用的备份文件:"
    ls -lh /backups/postgres/skillhub_*.sql.gz 2>/dev/null || echo "  未找到备份文件"
    exit 1
fi

BACKUP_FILE="$1"

# 检查备份文件是否存在
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}错误: 备份文件不存在: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}SkillHub 数据库恢复${NC}"
echo -e "${GREEN}========================================${NC}"
echo "时间: $(date)"
echo "备份文件: $BACKUP_FILE"
echo "文件大小: $(du -h "$BACKUP_FILE" | cut -f1)"

# 确认操作
echo -e "${YELLOW}⚠️  警告: 此操作将覆盖当前数据库的所有数据！${NC}"
read -p "确定要继续吗？(yes/no): " -r
echo
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo -e "${YELLOW}操作已取消${NC}"
    exit 0
fi

# 检查 Docker 容器是否运行
if ! docker ps | grep -q "$DB_CONTAINER"; then
    echo -e "${RED}错误: 数据库容器 $DB_CONTAINER 未运行${NC}"
    exit 1
fi

# 验证备份文件完整性
echo -e "${YELLOW}验证备份文件完整性...${NC}"
if ! gunzip -t "$BACKUP_FILE" 2>/dev/null; then
    echo -e "${RED}✗ 备份文件损坏，无法恢复！${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 备份文件验证通过${NC}"

# 创建恢复前备份
echo -e "${YELLOW}创建恢复前的数据库备份...${NC}"
PRE_RESTORE_BACKUP="/backups/postgres/pre_restore_$(date +%Y%m%d_%H%M%S).sql.gz"
mkdir -p /backups/postgres
docker exec -T "$DB_CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$PRE_RESTORE_BACKUP"

if [ $? -eq 0 ] && [ -f "$PRE_RESTORE_BACKUP" ]; then
    echo -e "${GREEN}✓ 恢复前备份已创建: $PRE_RESTORE_BACKUP${NC}"
else
    echo -e "${RED}✗ 恢复前备份失败！${NC}"
    read -p "是否继续恢复？(yes/no): " -r
    echo
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        echo -e "${YELLOW}操作已取消${NC}"
        exit 0
    fi
fi

# 执行恢复
echo -e "${YELLOW}正在恢复数据库...${NC}"
gunzip -c "$BACKUP_FILE" | docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 数据库恢复成功！${NC}"
else
    echo -e "${RED}✗ 数据库恢复失败！${NC}"
    echo -e "${YELLOW}尝试从恢复前备份回滚...${NC}"
    gunzip -c "$PRE_RESTORE_BACKUP" | docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME"
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 已回滚到恢复前状态${NC}"
    else
        echo -e "${RED}✗ 回滚失败！请手动检查数据库状态${NC}"
    fi
    exit 1
fi

# 验证恢复
echo -e "${YELLOW}验证恢复结果...${NC}"
TABLE_COUNT=$(docker exec -T "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';")
echo "  公共模式中的表数量: $TABLE_COUNT"

if [ "$TABLE_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ 数据库验证通过${NC}"
else
    echo -e "${RED}✗ 数据库验证失败：未找到表${NC}"
    exit 1
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}数据库恢复完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "建议操作:"
echo "1. 重启应用服务以清除缓存"
echo "2. 验证应用功能是否正常"
echo "3. 检查日志是否有错误"
echo ""
echo "如需回滚，可使用备份文件: $PRE_RESTORE_BACKUP"

exit 0
