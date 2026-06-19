# probe-nvwax-routes.ps1 — 探测 NvwaX 是否提供独立注册路径
$urls = @(
  'https://account.proclaw.cc/register',
  'https://account.proclaw.cc/signup',
  'https://account.proclaw.cc/sign-up',
  'https://account.proclaw.cc/oauth/signup',
  'https://account.proclaw.cc/oauth/register',
  'https://account.proclaw.cc/oauth/sign_up',
  'https://account.proclaw.cc/'
)
foreach ($u in $urls) {
  $code = (curl.exe -s -o NUL -w '%{http_code}' $u)
  Write-Host ("  {0}  {1}" -f $code, $u)
}
