#!/bin/bash
# ECS 远程部署脚本 — 由 GitHub Actions SSH 调用，不在 ECS 上 git pull
# 前置条件: /home/guolinlin/SkillHub/.env.production 已存在且配置正确

set -e

APP_DIR="${APP_DIR:-/home/guolinlin/SkillHub}"
DEPLOY_DIR="${APP_DIR}/deploy"
IMAGE_TAR="${DEPLOY_DIR}/skillhub-web.tar.gz"

echo "==> SkillHub ECS 部署开始"
cd "${APP_DIR}"

if [ ! -f ".env.production" ]; then
  echo "错误: .env.production 不存在，请先在 ECS 上创建（参考 .env.production.example）"
  exit 1
fi

# 校验 OAuth 必需项（缺项会导致 state_mismatch / redirect 到 localhost）
missing=0
for key in NEXTAUTH_URL SESSION_COOKIE_SECURE SESSION_SECRET GITHUB_CLIENT_ID GITHUB_CLIENT_SECRET; do
  if ! grep -qE "^${key}=" .env.production; then
    echo "警告: .env.production 缺少 ${key}"
    missing=$((missing + 1))
  fi
done
if [ "$missing" -gt 0 ]; then
  echo "请补全 .env.production 后重试（HTTP 部署需 SESSION_COOKIE_SECURE=false）"
  exit 1
fi

if [ ! -f "${IMAGE_TAR}" ]; then
  echo "错误: 镜像包不存在 ${IMAGE_TAR}"
  exit 1
fi

echo "==> 加载 Docker 镜像"
docker load < "${IMAGE_TAR}"

# 同步 compose（仅 web+redis，DB 仍用宿主机已有中间件）
if [ -f "${DEPLOY_DIR}/docker-compose.yml" ]; then
  cp "${DEPLOY_DIR}/docker-compose.yml" "${APP_DIR}/docker-compose.yml"
fi

echo "==> 重启 web 容器（保留 redis 与 .env.production）"
docker compose up -d web

echo "==> 等待服务启动"
sleep 30

APP_URL=$(grep -E '^NEXTAUTH_URL=' .env.production | head -1 | cut -d= -f2- | tr -d '"')
APP_URL="${APP_URL:-http://localhost:3000}"

if [ -f "${DEPLOY_DIR}/smoke-test.sh" ]; then
  BASE_URL="${APP_URL}" bash "${DEPLOY_DIR}/smoke-test.sh"
elif [ -f "${APP_DIR}/scripts/smoke-test.sh" ]; then
  BASE_URL="${APP_URL}" bash "${APP_DIR}/scripts/smoke-test.sh"
else
  curl -sf "${APP_URL}/api/health"
fi

echo "==> 清理镜像包"
rm -f "${IMAGE_TAR}"

echo "==> 部署完成: ${APP_URL}"
