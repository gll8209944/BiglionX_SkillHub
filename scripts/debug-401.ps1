# debug-401.ps1 — 探测 Vercel + NvwaX 端当前状态
$ErrorActionPreference = "Continue"
# 自动定位仓库根目录（脚本在 scripts/，所以上溯一级），避免硬编码绝对路径
$tmpDir = (Resolve-Path "$PSScriptRoot/..").Path

# 清旧
Remove-Item -Force "$tmpDir\.tmp-*.txt" -ErrorAction SilentlyContinue

# URL 提取到变量（避免 & 在参数上下文被当 call operator）
$nvAuthUrl = 'https://account.proclaw.cc/oauth/authorize?response_type=code&client_id=skillhub-web&redirect_uri=https%3A%2F%2Fskillhub.proclaw.cc%2Foauth%2Fcallback&code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM&code_challenge_method=S256&state=v1&scope=openid+profile+email'
$nvPostBody = 'response_type=code&client_id=skillhub-web&redirect_uri=https%3A%2F%2Fskillhub.proclaw.cc%2Foauth%2Fcallback&code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM&code_challenge_method=S256&state=v2&scope=openid+profile+email'
$discUrl = 'https://account.proclaw.cc/.well-known/openid-configuration'

# [A] 根域
Write-Host "[A] GET https://skillhub.proclaw.cc/" -ForegroundColor Cyan
curl.exe -s -L -o NUL -w "HTTP=%{http_code}  FinalURL=%{url_effective}`n" 'https://skillhub.proclaw.cc/' | Out-File -Encoding utf8 "$tmpDir\.tmp-root.txt"

# [B] /auth/login 跳转链
Write-Host "[B] GET https://skillhub.proclaw.cc/auth/login" -ForegroundColor Cyan
$loginHeaders = curl.exe -I -L -s --max-redirs 3 -D - -o NUL 'https://skillhub.proclaw.cc/auth/login' 2>&1
$loginHeaders | Out-File -Encoding utf8 "$tmpDir\.tmp-login.txt"

# [C] NvwaX authorize GET — 状态码
Write-Host "[C] GET NvwaX authorize (client_id=skillhub-web)" -ForegroundColor Cyan
curl.exe -s -o NUL -w "HTTP=%{http_code}`n" $nvAuthUrl | Out-File -Encoding utf8 "$tmpDir\.tmp-nvwax-get.txt"

# [D] NvwaX authorize GET — 完整 headers
Write-Host "[D] GET NvwaX authorize (with headers)" -ForegroundColor Cyan
$nvHeaders = curl.exe -I -L -s --max-redirs 3 -D - -o NUL $nvAuthUrl 2>&1
$nvHeaders | Out-File -Encoding utf8 "$tmpDir\.tmp-nvwax-headers.txt"

# [E] NvwaX authorize POST（模拟浏览器表单）
Write-Host "[E] POST NvwaX authorize" -ForegroundColor Cyan
$nvPost = curl.exe -s -X POST -D - -o NUL 'https://account.proclaw.cc/oauth/authorize' --data $nvPostBody 2>&1
$nvPost | Out-File -Encoding utf8 "$tmpDir\.tmp-nvwax-post.txt"

# [F] NvwaX discovery
Write-Host "[F] GET NvwaX discovery" -ForegroundColor Cyan
$disc = curl.exe -s $discUrl 2>&1
$disc | Out-File -Encoding utf8 "$tmpDir\.tmp-discovery.json"

Write-Host "DONE" -ForegroundColor Green
