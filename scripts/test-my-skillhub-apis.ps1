# "我的SkillHub" API 测试脚本 (PowerShell版本)
# 使用方法: .\test-my-skillhub-apis.ps1

$BASE_URL = "http://localhost:3000"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  我的SkillHub API 测试套件" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 测试结果计数
$PASS = 0
$FAIL = 0

# 测试函数
function Test-API {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [string]$Body = $null
    )
    
    Write-Host "测试: $Name" -ForegroundColor Yellow
    
    try {
        $params = @{
            Uri = "$BASE_URL$Url"
            Method = $Method
            TimeoutSec = 10
        }
        
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params -ErrorAction Stop
        Write-Host "✓ 通过" -ForegroundColor Green
        $script:PASS++
    }
    catch {
        Write-Host "✗ 失败: $($_.Exception.Message)" -ForegroundColor Red
        $script:FAIL++
    }
    
    Write-Host ""
}

Write-Host "开始测试..." -ForegroundColor Green
Write-Host ""

# ==========================================
# 1. 测试Skills查询API
# ==========================================
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "1. Skills查询API测试" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Test-API "基础查询" "/api/skills?page=1&limit=5"
Test-API "搜索功能" "/api/skills?search=test"
Test-API "状态筛选(单个)" "/api/skills?status=APPROVED"
Test-API "状态筛选(多个)" "/api/skills?status=APPROVED,DRAFT"
Test-API "草稿箱模式" "/api/skills?draft=true"
Test-API "按下载量排序" "/api/skills?sortBy=downloadCount&sortOrder=desc"
Test-API "按更新时间排序" "/api/skills?sortBy=updatedAt&sortOrder=desc"

# ==========================================
# 2. 测试个人统计API
# ==========================================
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "2. 个人统计API测试" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Test-API "统计数据(全部时间)" "/api/analytics/personal?timeRange=all"
Test-API "统计数据(本月)" "/api/analytics/personal?timeRange=month"
Test-API "统计数据(本周)" "/api/analytics/personal?timeRange=week"
Test-API "统计数据(今日)" "/api/analytics/personal?timeRange=today"

# ==========================================
# 3. 测试批量操作API（需要认证）
# ==========================================
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "3. 批量操作API测试（需要登录）" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "注意: 以下测试需要先登录获取token" -ForegroundColor Yellow
Write-Host "请手动测试或使用Postman" -ForegroundColor Yellow
Write-Host ""

# ==========================================
# 4. 测试版本管理API
# ==========================================
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "4. 版本管理API测试" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "示例: 获取版本历史" -ForegroundColor White
Write-Host "GET /api/skills/[slug]/versions" -ForegroundColor Gray
Write-Host ""

Write-Host "示例: 创建新版本" -ForegroundColor White
Write-Host "POST /api/skills/[slug]/versions" -ForegroundColor Gray
Write-Host 'Body: {"version": "1.0.0", "changelog": "初始版本"}' -ForegroundColor Gray
Write-Host ""

# ==========================================
# 测试结果汇总
# ==========================================
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  测试结果汇总" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "通过: $PASS" -ForegroundColor Green
Write-Host "失败: $FAIL" -ForegroundColor Red
Write-Host "总计: $($PASS + $FAIL)" -ForegroundColor White
Write-Host ""

if ($FAIL -eq 0) {
    Write-Host "🎉 所有测试通过！" -ForegroundColor Green
} else {
    Write-Host "⚠️  有 $FAIL 个测试失败，请检查" -ForegroundColor Red
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  测试完成" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
