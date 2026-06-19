#!/usr/bin/env bash
# ============================================================
# SkillHub ↔ NvwaX OIDC PKCE 端到端验证脚本
# ============================================================
#
# 用途：
#   在本地手动画一遍 OIDC Authorization Code + PKCE 全流程，
#   验证 NvwaX IdP（account.proclaw.cc）配置是否正确：
#     Step 0  生成 PKCE verifier / challenge / state
#     Step 1  GET  /oauth/authorize       （浏览器完成登录）
#     Step 2  POST /oauth/token           （用 code + verifier 换 token）
#     Step 3  GET  /oauth/userinfo        （拿用户信息）
#
# 调用方式（Git Bash on Windows）：
#   1) 在 PowerShell 中进入 Git Bash：
#        & "d:\Git\bin\bash.exe"
#   2) 在 bash 中执行：
#        cd /d/BigLionX/SkillHub/apps/web
#        bash ./scripts/oidc-e2e-pkce.sh
#   3) 按提示把 authorize URL 粘到浏览器，登录授权后
#      把地址栏的 callback URL 粘回终端
#
# ⚠️ 限速提醒：
#   NvwaX /oauth/authorize 端点限速 5 次 / 5 分钟
#   （响应头：X-RateLimit-Limit: 5，X-RateLimit-Window: 300）
#   反复点击会返回 401 Unauthorized
#   触发限速后请等待 5 分钟再重试整个流程
#
# 与 lib/oidc-rp.ts 的契约对应关系：
#   ┌──────────────────────┬──────────────────────────────────┐
#   │ 本脚本常量           │ lib/oidc-rp.ts                   │
#   ├──────────────────────┼──────────────────────────────────┤
#   │ CLIENT_ID            │ DEFAULT_CLIENT_ID = 'skillhub-web'│
#   │ REDIRECT_URI         │ OIDC_CONFIG.redirectUri（生产） │
#   │ SCOPE_RAW            │ scope = 'openid profile email'  │
#   │ code_challenge       │ generatePKCE() -> codeChallenge  │
#   │ code_verifier        │ generatePKCE() -> codeVerifier   │
#   │ code_challenge_method│ 'S256'（强制）                   │
#   │ token_endpoint_auth  │ 'none'（public client，不传 secret）│
#   └──────────────────────┴──────────────────────────────────┘
#   token 端点 body 与 exchangeCodeForToken() 完全对齐：
#     grant_type=authorization_code
#     code=<callback>
#     redirect_uri=<必须与 Step 1 一致>
#     client_id=skillhub-web
#     code_verifier=<Step 0 生成>
#
# 关联：
#   - IdP 端点：https://account.proclaw.cc（discovery 动态发现）
#   - 客户端：https://skillhub.proclaw.cc/oauth/callback
# ============================================================

set -euo pipefail

# ---------------- 固定契约（与 oidc-rp.ts 一致） ----------------
CLIENT_ID="skillhub-web"
REDIRECT_URI="https://skillhub.proclaw.cc/oauth/callback"
# URL 预编码版本（redirect_uri 与 scope）
ENC_REDIRECT="https%3A%2F%2Fskillhub.proclaw.cc%2Foauth%2Fcallback"
ENC_SCOPE="openid+profile+email"

ISSUER="https://account.proclaw.cc"
AUTHORIZE_URL="${ISSUER}/oauth/authorize"
TOKEN_URL="${ISSUER}/oauth/token"
USERINFO_URL="${ISSUER}/oauth/userinfo"

# ---------------- 工具函数 ----------------
# RFC 4648 base64url（无 padding）
b64url() { openssl base64 -A | tr '+/' '-_' | tr -d '='; }

# 提取 JSON 字段（避免依赖 jq）
json_field() { sed -n "s/.*\"$1\" *: *\"\\([^\"]*\\)\".*/\\1/p"; }

# ---------------- Step 0: PKCE + state ----------------
echo "============================================================"
echo "[Step 0] 生成 PKCE verifier/challenge + state"
echo "============================================================"
VERIFIER=$(openssl rand 32 | b64url)
CHALLENGE=$(printf '%s' "$VERIFIER" | openssl dgst -sha256 -binary | b64url)
STATE=$(openssl rand 16 | b64url)

echo "verifier   = ${VERIFIER}  (len=${#VERIFIER})"
echo "challenge  = ${CHALLENGE}  (len=${#CHALLENGE})"
echo "state      = ${STATE}"
echo

# ---------------- Step 1: authorize ----------------
echo "============================================================"
echo "[Step 1] 复制下面整行 URL 到浏览器完成登录"
echo "============================================================"
AUTH_URL="${AUTHORIZE_URL}?client_id=${CLIENT_ID}\
&redirect_uri=${ENC_REDIRECT}\
&response_type=code\
&scope=${ENC_SCOPE}\
&state=${STATE}\
&code_challenge=${CHALLENGE}\
&code_challenge_method=S256"
echo "$AUTH_URL"
echo

# ---------------- 解析回调 ----------------
echo "操作步骤："
echo "  1) 在浏览器打开上面 URL，用 ProClaw 账号登录并授权"
echo "  2) 浏览器会跳转到 https://skillhub.proclaw.cc/oauth/callback?code=...&state=..."
echo "  3) 页面会 404/错误（web 应用没跑），从地址栏复制完整 URL"
echo "  4) 回到本终端粘贴整行 URL"
echo
read -r -p "粘贴 callback URL（整行）: " CALLBACK_URL
[[ -z "$CALLBACK_URL" ]] && { echo "未输入，退出"; exit 1; }

CODE=$(printf '%s' "$CALLBACK_URL" | json_field code)
RET_STATE=$(printf '%s' "$CALLBACK_URL" | json_field state)
ERR=$(printf '%s' "$CALLBACK_URL" | json_field error)

if [[ -n "$ERR" ]]; then
  echo "!!! authorize 端返回错误: $ERR"
  printf '%s' "$CALLBACK_URL" | json_field error_description
  echo
  exit 1
fi
[[ -z "$CODE" || -z "$RET_STATE" ]] && {
  echo "!!! 无法从回调 URL 解析出 code/state"
  echo "    回调: $CALLBACK_URL"
  exit 1
}

echo "code  = $CODE"
echo "state = $RET_STATE"
if [[ "$RET_STATE" != "$STATE" ]]; then
  echo "!!! state 校验失败（CSRF 防护），放弃"
  exit 1
fi
echo "✓ state 校验通过"
echo

# ---------------- Step 2: token exchange ----------------
echo "============================================================"
echo "[Step 2] 交换 code → token（POST ${TOKEN_URL}）"
echo "============================================================"
TOKEN_BODY="grant_type=authorization_code&code=${CODE}\
&redirect_uri=${ENC_REDIRECT}\
&client_id=${CLIENT_ID}\
&code_verifier=${VERIFIER}"

TOKEN_RESP=$(curl -sS -X POST "$TOKEN_URL" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Accept: application/json" \
  -d "$TOKEN_BODY")

echo "Response:"
echo "$TOKEN_RESP" | sed 's/,"/,\n  "/g'
echo

ACCESS_TOKEN=$(printf '%s' "$TOKEN_RESP" | json_field access_token)
REFRESH_TOKEN=$(printf '%s' "$TOKEN_RESP" | json_field refresh_token)
ID_TOKEN=$(printf '%s' "$TOKEN_RESP" | json_field id_token)

[[ -z "$ACCESS_TOKEN" ]] && { echo "!!! 未拿到 access_token"; exit 1; }
echo "✓ access_token  = ${ACCESS_TOKEN:0:30}..."
[[ -n "$REFRESH_TOKEN" ]] && echo "  refresh_token = ${REFRESH_TOKEN:0:30}..."
[[ -n "$ID_TOKEN"      ]] && echo "  id_token      = ${ID_TOKEN:0:30}..."
echo

# ---------------- Step 3: userinfo ----------------
echo "============================================================"
echo "[Step 3] 拉取 userinfo（GET ${USERINFO_URL}）"
echo "============================================================"
USERINFO=$(curl -sS "$USERINFO_URL" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Accept: application/json")
echo "$USERINFO" | sed 's/,/,\n  /g'
echo
echo "============================================================"
echo "全部完成 ✓"
echo "============================================================"
