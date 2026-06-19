# ============================================
# SkillHub OIDC 验证脚本（PowerShell 版）
# 关键：必须用 curl.exe（GNU），不能用 PowerShell 的 curl 别名
# ============================================

$ErrorActionPreference = "Stop"
$baseColor = "Cyan"

# ---------- 验证 1：根域可达 ----------
Write-Host "`n[1] GET https://skillhub.proclaw.cc/" -ForegroundColor $baseColor
$out1 = curl.exe -I -L -s -o NUL -w "HTTP=%{http_code}`tFinalURL=%{url_effective}`n" https://skillhub.proclaw.cc/
Write-Host "    $out1"

# ---------- 验证 2：触发 OIDC 跳转链 ----------
Write-Host "`n[2] GET https://skillhub.proclaw.cc/auth/login (follow redirects, max=5)" -ForegroundColor $baseColor
$headers2 = curl.exe -I -L -s --max-redirs 5 -D - -o NUL https://skillhub.proclaw.cc/auth/login

# 把 headers 按行拆开，逐行打印
$lines2 = $headers2 -split "`r?`n"
foreach ($line in $lines2) {
  if ($line -match "^(HTTP/|location:|Location:)" -or $line.Trim() -eq "") {
    Write-Host "    $line"
  }
}

# ---------- 验证 2.1：解析最后一个 Location 的 query string ----------
Write-Host "`n[2.1] 跳转链 + query string 解析" -ForegroundColor $baseColor
$locations = @()
foreach ($line in $lines2) {
  if ($line -match "^[Ll]ocation:\s*(.+)$") {
    $locations += $Matches[1].Trim()
  }
}
Write-Host "    跳转跳数: $($locations.Count)"
for ($i = 0; $i -lt $locations.Count; $i++) {
  $loc = $locations[$i]
  Write-Host "    [$i] $loc"
  if ($loc -match "\?") {
    try {
      $u = [uri]$loc
      $qs = [System.Web.HttpUtility]::ParseQueryString($u.Query)
      Write-Host "        client_id              = $($qs['client_id'])"
      Write-Host "        response_type          = $($qs['response_type'])"
      Write-Host "        code_challenge_method  = $($qs['code_challenge_method'])"
      $cc = $qs['code_challenge']
      if ($cc) {
        $ccShort = $cc.Substring(0, [Math]::Min(16, $cc.Length))
        Write-Host "        code_challenge         = $ccShort... (len=$($cc.Length))"
      } else {
        Write-Host "        code_challenge         = (missing)"
      }
      $rd = $qs['redirect_uri']
      if ($rd) { Write-Host "        redirect_uri (decoded) = $([uri]::UnescapeDataString($rd))" }
      Write-Host "        scope                  = $($qs['scope'])"
      $st = $qs['state']
      if ($st) { Write-Host "        state (first 16)       = $($st.Substring(0, [Math]::Min(16, $st.Length)))..." }
    } catch {
      Write-Host "        [parse error] $_" -ForegroundColor Yellow
    }
  }
}

# ---------- 验证 3：直接探测 NvwaX authorize 端点 ----------
Write-Host "`n[3] GET https://account.proclaw.cc/oauth/authorize?client_id=skillhub-web&..." -ForegroundColor $baseColor
$authUrl = "https://account.proclaw.cc/oauth/authorize?response_type=code&client_id=skillhub-web&redirect_uri=https%3A%2F%2Fskillhub.proclaw.cc%2Foauth%2Fcallback&code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM&code_challenge_method=S256&state=verify123&scope=openid+profile+email"
$out3 = curl.exe -I -L -s -o NUL -w "HTTP=%{http_code}`tFinalURL=%{url_effective}`n" "$authUrl"
Write-Host "    $out3"

# ---------- 最终断言 ----------
Write-Host "`n[ASSERT]" -ForegroundColor Green
$ok = $true

# 断言 [2.1] 至少有一个 authorize 跳转
$authLoc = $locations | Where-Object { $_ -like "https://account.proclaw.cc/oauth/authorize*" } | Select-Object -First 1
if (-not $authLoc) {
  Write-Host "  [FAIL] 没找到跳到 account.proclaw.cc/oauth/authorize 的 Location" -ForegroundColor Red
  $ok = $false
} else {
  $u = [uri]$authLoc
  $qs = [System.Web.HttpUtility]::ParseQueryString($u.Query)
  if ($qs['client_id'] -ne 'skillhub-web') {
    Write-Host "  [FAIL] client_id = '$($qs['client_id'])' (期望 'skillhub-web')" -ForegroundColor Red
    $ok = $false
  } else {
    Write-Host "  [PASS] client_id = skillhub-web" -ForegroundColor Green
  }
  if ($qs['code_challenge_method'] -ne 'S256') {
    Write-Host "  [FAIL] code_challenge_method = '$($qs['code_challenge_method'])' (期望 'S256')" -ForegroundColor Red
    $ok = $false
  } else {
    Write-Host "  [PASS] code_challenge_method = S256" -ForegroundColor Green
  }
  if (-not $qs['code_challenge']) {
    Write-Host "  [FAIL] code_challenge 缺失" -ForegroundColor Red
    $ok = $false
  } else {
    Write-Host "  [PASS] code_challenge 存在 (len=$($qs['code_challenge'].Length))" -ForegroundColor Green
  }
  if ($qs['response_type'] -ne 'code') {
    Write-Host "  [FAIL] response_type = '$($qs['response_type'])' (期望 'code')" -ForegroundColor Red
    $ok = $false
  } else {
    Write-Host "  [PASS] response_type = code" -ForegroundColor Green
  }
}

# 断言 [3] NvwaX authorize 端点 200
if ($out3 -notmatch "HTTP=(\d+)") {
  Write-Host "  [FAIL] 验证 3 没拿到 HTTP 状态码" -ForegroundColor Red
  $ok = $false
} else {
  $code3 = $Matches[1]
  if ($code3 -eq "200") {
    Write-Host "  [PASS] NvwaX authorize 端点 HTTP=$code3" -ForegroundColor Green
  } else {
    Write-Host "  [FAIL] NvwaX authorize 端点 HTTP=$code3 (期望 200)" -ForegroundColor Red
    $ok = $false
  }
}

Write-Host ""
if ($ok) {
  Write-Host "ALL PASS - Vercel SKILLHUB_OIDC_CLIENT_ID 已生效" -ForegroundColor Green
} else {
  Write-Host "SOMETHING FAILED - 请把整段输出贴回对话" -ForegroundColor Red
}
Write-Host ""
