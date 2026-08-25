# One-off: mint a short-lived admin session for E2E testing.
$ADMIN_ID = "mn72pzw7xwahq4cdyxk9xbx5g18cyktp"
$now = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$token = "e2e-kyc-admin-$now"
# Compact JSON, then escape quotes as \" so they survive PS→cmd→argv parsing
$json = '{"userId":"' + $ADMIN_ID + '","token":"' + $token + '","role":"super_admin","expiresAt":' + ($now + 7200000) + ',"createdAt":' + $now + '}'
$jsonArg = $json -replace '"', '\"'

Remove-Item "kyctest-out.txt" -ErrorAction SilentlyContinue
Remove-Item "kyctest-e.txt" -ErrorAction SilentlyContinue

$p = Start-Process -FilePath "npx.cmd" `
  -ArgumentList @("convex", "run", "auth:createSession", $jsonArg) `
  -WorkingDirectory $PSScriptRoot `
  -NoNewWindow -Wait -PassThru `
  -RedirectStandardOutput "kyctest-out.txt" `
  -RedirectStandardError "kyctest-e.txt"

Get-Content "kyctest-out.txt"
$err = Get-Content "kyctest-e.txt" -ErrorAction SilentlyContinue
if ($err) { Write-Host $err }

if ($p.ExitCode -eq 0) {
  Set-Content -Path "$PSScriptRoot\kyctest-token.txt" -Value $token
  Write-Host "TOKEN_SAVED"
} else {
  Write-Host "FAILED"
}
