#!/bin/bash
# "我的SkillHub" API 测试脚本
# 使用方法: bash test-my-skillhub-apis.sh

BASE_URL="http://localhost:3000"

echo "=========================================="
echo "  我的SkillHub API 测试套件"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试结果计数
PASS=0
FAIL=0

# 测试函数
test_api() {
  local name=$1
  local url=$2
  local method=${3:-GET}
  local data=$4
  
  echo -e "${YELLOW}测试: $name${NC}"
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" "$BASE_URL$url")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" \
      -H "Content-Type: application/json" \
      -d "$data" \
      "$BASE_URL$url")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
    echo -e "${GREEN}✓ 通过 (HTTP $http_code)${NC}"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}✗ 失败 (HTTP $http_code)${NC}"
    echo "响应: $body"
    FAIL=$((FAIL + 1))
  fi
  
  echo ""
}

echo "开始测试..."
echo ""

# ==========================================
# 1. 测试Skills查询API
# ==========================================
echo "=========================================="
echo "1. Skills查询API测试"
echo "=========================================="
echo ""

test_api "基础查询" "/api/skills?page=1&limit=5"
test_api "搜索功能" "/api/skills?search=test"
test_api "状态筛选(单个)" "/api/skills?status=APPROVED"
test_api "状态筛选(多个)" "/api/skills?status=APPROVED,DRAFT"
test_api "草稿箱模式" "/api/skills?draft=true"
test_api "按下载量排序" "/api/skills?sortBy=downloadCount&sortOrder=desc"
test_api "按更新时间排序" "/api/skills?sortBy=updatedAt&sortOrder=desc"

# ==========================================
# 2. 测试个人统计API
# ==========================================
echo "=========================================="
echo "2. 个人统计API测试"
echo "=========================================="
echo ""

test_api "统计数据(全部时间)" "/api/analytics/personal?timeRange=all"
test_api "统计数据(本月)" "/api/analytics/personal?timeRange=month"
test_api "统计数据(本周)" "/api/analytics/personal?timeRange=week"
test_api "统计数据(今日)" "/api/analytics/personal?timeRange=today"

# ==========================================
# 3. 测试批量操作API（需要认证）
# ==========================================
echo "=========================================="
echo "3. 批量操作API测试（需要登录）"
echo "=========================================="
echo ""

echo -e "${YELLOW}注意: 以下测试需要先登录获取token${NC}"
echo "请手动测试或使用Postman"
echo ""

# ==========================================
# 4. 测试版本管理API
# ==========================================
echo "=========================================="
echo "4. 版本管理API测试"
echo "=========================================="
echo ""

echo "示例: 获取版本历史"
echo "GET /api/skills/[slug]/versions"
echo ""

echo "示例: 创建新版本"
echo "POST /api/skills/[slug]/versions"
echo 'Body: {"version": "1.0.0", "changelog": "初始版本"}'
echo ""

# ==========================================
# 测试结果汇总
# ==========================================
echo "=========================================="
echo "  测试结果汇总"
echo "=========================================="
echo ""
echo -e "通过: ${GREEN}$PASS${NC}"
echo -e "失败: ${RED}$FAIL${NC}"
echo "总计: $((PASS + FAIL))"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}🎉 所有测试通过！${NC}"
else
  echo -e "${RED}⚠️  有 $FAIL 个测试失败，请检查${NC}"
fi

echo ""
echo "=========================================="
echo "  测试完成"
echo "=========================================="
