#!/bin/bash

# ============================================
# SkillHub 部署前清理脚本
# ============================================
# 用途: 清理临时文件、构建缓存和归档文档
# 使用: ./scripts/cleanup-before-deploy.sh
# ============================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 获取项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo ""
echo "=========================================="
echo "  SkillHub 部署前清理"
echo "=========================================="
echo ""

# 确认操作
read -p "⚠️  此操作将删除临时文件和构建缓存。是否继续？(y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_warning "操作已取消"
    exit 0
fi

# ============================================
# 1. 清理根目录临时文件
# ============================================
log_info "清理根目录临时文件..."

TEMP_FILES=(
    "check-user.js"
    "reset-password.js"
    "logo.jpeg"
    "logo2.png"
    "favcion.png"
    "3fd35a3ffd8fbb96f250fac4afccf612.jpg"
)

for file in "${TEMP_FILES[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        log_success "已删除: $file"
    fi
done

# ============================================
# 2. 清理 apps/web 临时文件
# ============================================
log_info "清理 Web 应用临时文件..."

cd apps/web

WEB_TEMP_FILES=(
    "check-skills.js"
    "check-status.js"
    "clean-cache.ps1"
    "restart-dev.ps1"
    "tsconfig.tsbuildinfo"
)

for file in "${WEB_TEMP_FILES[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        log_success "已删除: apps/web/$file"
    fi
done

# 清理空的 docs 目录
if [ -d "docs" ] && [ -z "$(ls -A docs)" ]; then
    rmdir docs
    log_success "已删除空目录: apps/web/docs"
fi

cd ../..

# ============================================
# 3. 清理构建缓存
# ============================================
log_info "清理构建缓存..."

BUILD_DIRS=(
    "apps/web/.next"
    "apps/web/.swc"
    ".turbo/cache"
)

for dir in "${BUILD_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        rm -rf "$dir"
        log_success "已删除: $dir"
    fi
done

# ============================================
# 4. 归档开发文档
# ============================================
log_info "归档开发文档..."

ARCHIVE_DIR="docs/archive/2024-development"
COMPLETED_DIR="docs/archive/completed-features"
PLANNING_DIR="docs/archive/planning"

# 创建归档目录
mkdir -p "$ARCHIVE_DIR"
mkdir -p "$COMPLETED_DIR"
mkdir -p "$PLANNING_DIR"

# 归档开发进度文档
DEVELOPMENT_DOCS=(
    "MY_SKILLHUB_DELIVERY_CHECKLIST.md"
    "MY_SKILLHUB_DEVELOPMENT_PROGRESS.md"
    "MY_SKILLHUB_DEVELOPMENT_TASKS.md"
    "MY_SKILLHUB_FINAL_REPORT.md"
    "MY_SKILLHUB_OPTIMIZATION_PLAN.md"
    "MY_SKILLHUB_OPTIMIZATION_SUMMARY.md"
    "MY_SKILLHUB_TASK_TRACKER.md"
    "MY_SKILLHUB_WEEK3_4_COMPLETION.md"
)

for doc in "${DEVELOPMENT_DOCS[@]}"; do
    if [ -f "docs/$doc" ]; then
        mv "docs/$doc" "$ARCHIVE_DIR/"
        log_success "已归档: docs/$doc -> $ARCHIVE_DIR/"
    fi
done

# 归档已完成的功能文档
COMPLETED_DOCS=(
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
)

for doc in "${COMPLETED_DOCS[@]}"; do
    if [ -f "docs/$doc" ]; then
        mv "docs/$doc" "$COMPLETED_DIR/"
        log_success "已归档: docs/$doc -> $COMPLETED_DIR/"
    fi
done

# 归档计划文档
PLANNING_DOCS=(
    "SKILLHUB_DEVELOPMENT_PLAN_V2.md"
    "SKILLHUB_PLAN_COMPARISON.md"
    "COMMUNITY_BUILDING_PLAN.md"
    "COMMUNITY_FEATURES_PROGRESS.md"
)

for doc in "${PLANNING_DOCS[@]}"; do
    if [ -f "docs/$doc" ]; then
        mv "docs/$doc" "$PLANNING_DIR/"
        log_success "已归档: docs/$doc -> $PLANNING_DIR/"
    fi
done

# 归档临时文档
if [ -f "docs/GIT_PUSH_SUMMARY_20260422.md" ]; then
    mv "docs/GIT_PUSH_SUMMARY_20260422.md" "docs/archive/"
    log_success "已归档: docs/GIT_PUSH_SUMMARY_20260422.md -> docs/archive/"
fi

# ============================================
# 5. 检查敏感信息
# ============================================
log_info "检查敏感信息..."

# 检查是否有硬编码的密钥
if grep -r "sk_live_" --include="*.ts" --include="*.tsx" --include="*.js" apps/ 2>/dev/null | grep -v "node_modules" | grep -v ".env"; then
    log_warning "发现可能的硬编码 API Key (sk_live_)"
fi

if grep -r "ghp_" --include="*.ts" --include="*.tsx" --include="*.js" apps/ 2>/dev/null | grep -v "node_modules" | grep -v ".env"; then
    log_warning "发现可能的硬编码 GitHub Token (ghp_)"
fi

# ============================================
# 6. 验证 .gitignore
# ============================================
log_info "验证 .gitignore 配置..."

REQUIRED_IGNORES=(
    ".env"
    ".env.local"
    ".next/"
    "node_modules/"
    ".turbo/"
    "*.tsbuildinfo"
)

for pattern in "${REQUIRED_IGNORES[@]}"; do
    if ! grep -q "^$pattern" .gitignore 2>/dev/null; then
        log_warning ".gitignore 中缺少: $pattern"
    fi
done

# ============================================
# 完成
# ============================================
echo ""
log_success "✅ 清理完成！"
echo ""
echo "=========================================="
echo "  清理摘要"
echo "=========================================="
echo ""
echo "📝 已删除临时文件"
echo "🗄️  已清理构建缓存"
echo "📚 已归档开发文档"
echo "🔐 已检查敏感信息"
echo ""
echo "=========================================="
echo "  下一步操作"
echo "=========================================="
echo ""
echo "1️⃣  查看更改:"
echo "   git status"
echo ""
echo "2️⃣  运行测试:"
echo "   npm test"
echo "   cd apps/web && npm run cypress:run"
echo ""
echo "3️⃣  构建验证:"
echo "   cd apps/web && npm run build"
echo ""
echo "4️⃣  提交更改:"
echo "   git add ."
echo '   git commit -m "chore: cleanup before deployment"'
echo ""
echo "5️⃣  查看归档文档:"
echo "   ls docs/archive/"
echo ""
echo "=========================================="
echo ""
log_success "祝部署顺利！🚀"
echo ""

