#!/bin/bash
# ============================================
# SkillHub 数据库自动备份脚本
# ============================================
# 用法: ./backup-database.sh
# 建议配置 cron: 0 2 * * * /path/to/backup-database.sh
# ============================================

set -e

# 配置
BACKUP_DIR="${BACKUP_DIR:-/backups/postgres}"
DB_CONTAINER="${DB_CONTAINER:-skillhub-db-1}"
DB_USER="${DB_USER:-skillhub}"
DB_NAME="${DB_NAME:-skillhub}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/skillhub_$TIMESTAMP.sql.gz"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}SkillHub 数据库备份开始${NC}"
echo -e "${GREEN}========================================${NC}"
echo "时间: $(date)"
echo "备份文件: $BACKUP_FILE"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 检查 Docker 容器是否运行
if ! docker ps | grep -q "$DB_CONTAINER"; then
    echo -e "${RED}错误: 数据库容器 $DB_CONTAINER 未运行${NC}"
    exit 1
fi

# 执行备份
echo -e "${YELLOW}正在执行数据库备份...${NC}"
docker exec -T "$DB_CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"

# 检查备份是否成功
if [ $? -eq 0 ] && [ -f "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✓ 备份成功！${NC}"
    echo "  文件大小: $BACKUP_SIZE"
    echo "  文件路径: $BACKUP_FILE"
else
    echo -e "${RED}✗ 备份失败！${NC}"
    exit 1
fi

# 验证备份文件
echo -e "${YELLOW}验证备份文件完整性...${NC}"
if gunzip -t "$BACKUP_FILE" 2>/dev/null; then
    echo -e "${GREEN}✓ 备份文件验证通过${NC}"
else
    echo -e "${RED}✗ 备份文件损坏！${NC}"
    rm -f "$BACKUP_FILE"
    exit 1
fi

# 清理旧备份（保留最近 N 天）
echo -e "${YELLOW}清理 $RETENTION_DAYS 天前的旧备份...${NC}"
DELETED_COUNT=0
while IFS= read -r -d '' old_backup; do
    rm -f "$old_backup"
    DELETED_COUNT=$((DELETED_COUNT + 1))
    echo "  已删除: $(basename "$old_backup")"
done < <(find "$BACKUP_DIR" -name "skillhub_*.sql.gz" -type f -mtime +$RETENTION_DAYS -print0)

if [ $DELETED_COUNT -eq 0 ]; then
    echo "  没有需要清理的旧备份"
else
    echo "  共删除 $DELETED_COUNT 个旧备份"
fi

# 列出当前所有备份
echo -e "\n${YELLOW}当前可用的备份:${NC}"
ls -lh "$BACKUP_DIR"/skillhub_*.sql.gz 2>/dev/null | tail -10 || echo "  无备份文件"

# 上传到云存储（可选，需要配置 AWS CLI）
if [ -n "$AWS_S3_BUCKET" ]; then
    echo -e "${YELLOW}上传备份到 S3...${NC}"
    if aws s3 cp "$BACKUP_FILE" "s3://$AWS_S3_BUCKET/$(basename "$BACKUP_FILE")"; then
        echo -e "${GREEN}✓ S3 上传成功${NC}"
    else
        echo -e "${RED}✗ S3 上传失败${NC}"
    fi
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}备份完成！${NC}"
echo -e "${GREEN}========================================${NC}"

# 发送通知（可选）
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -s -X POST "$SLACK_WEBHOOK_URL" \
        -H 'Content-type: application/json' \
        --data "{
            \"text\": \"✅ SkillHub 数据库备份成功\",
            \"blocks\": [
                {
                    \"type\": \"section\",
                    \"text\": {
                        \"type\": \"mrkdwn\",
                        \"text\": \"*SkillHub 数据库备份成功*\\n时间: $(date)\\n文件: $(basename "$BACKUP_FILE")\\n大小: $BACKUP_SIZE\"
                    }
                }
            ]
        }" > /dev/null
fi

exit 0

