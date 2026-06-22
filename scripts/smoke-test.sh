#!/bin/bash
# ECS 冒烟测试 — 部署后验证 Web 服务可用
# 用法: BASE_URL=http://8.136.122.123:3000 bash scripts/smoke-test.sh

set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
BASE_URL="${BASE_URL%/}"

echo "=========================================="
echo "  SkillHub 冒烟测试"
echo "  BASE_URL=${BASE_URL}"
echo "=========================================="

pass=0
fail=0

check() {
  local name="$1"
  local cmd="$2"
  echo -n "  ${name} ... "
  if eval "$cmd" > /dev/null 2>&1; then
    echo "OK"
    pass=$((pass + 1))
  else
    echo "FAIL"
    fail=$((fail + 1))
  fi
}

check "健康检查 /api/health" "curl -sf '${BASE_URL}/api/health'"
check "登录页 /login" "curl -sf '${BASE_URL}/login'"
check "登录页含 GitHub 按钮" "curl -sf '${BASE_URL}/login' | grep -q 'GitHub'"

echo ""
echo "通过: ${pass}  失败: ${fail}"

if [ "$fail" -gt 0 ]; then
  echo "冒烟测试未通过"
  exit 1
fi

echo "冒烟测试全部通过"
