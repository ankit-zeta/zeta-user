# security-tests.ps1 — Security audit regression suite
# Verifies every security fix from SECURITY-AUDIT.md:
# S1-S2 lesson enrollment gate (certificate fraud), S3-S5 suspension enforcement + privilege guards,
# S6 email change requires password, S7 login brute-force lockout, S8 credentials not on login pages, S9 security headers.
$ErrorActionPreference = "Stop"
$base = "https://terrific-dove-836.convex.cloud/api"
$results = New-Object System.Collections.ArrayList
$script:var = @{}

function C($kind, $path, $a) {
  $b = @{ path = $path; args = $a; format = "json" } | ConvertTo-Json -Depth 12
  return Invoke-RestMethod -Uri "$base/$(if ($path -eq 'auth:login') { 'action' } else { $kind })" -Method Post -ContentType "application/json" -Body $b -UseBasicParsing -TimeoutSec 60
}

function Check($id, $name, $expectOk) {
  if ($script:var.lastException) {
    $pass = -not $expectOk
    $msg = "ERROR: $($script:var.lastException)"
  } else {
    $pass = $expectOk
    $msg = "ok"
  }
  $tag = if ($pass) { "PASS" } else { "FAIL" }
  [void]$results.Add("$tag | $id $name | $msg")
  Write-Host "$tag | $id $name"
  $script:var.lastException = $null
  return $pass
}

$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

Write-Host "=== SETUP ==="
$script:var.lastException = $null
try {
  $script:var.adminTok = (C mutation "auth:login" @{ email = "admin@zetagrow.com"; password = "AdminPassword123!" }).value.token
  $progs = (C query "programs:getAllProgramsAdmin" @{ token = $script:var.adminTok }).value
  $script:var.starterId = @($progs | Where-Object { $_.name -match "Starter" } | Select-Object -First 1)[0]._id
  if (-not $script:var.starterId) { throw "starter program missing" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "S0" "setup: admin session + starter program" $true

# ---- S1/S2: LESSON ENROLLMENT GATE ----
Write-Host "=== LESSON ENROLLMENT GATE (certificate fraud) ==="
$script:var.lastException = $null
try {
  $su = C mutation "auth:signup" @{ name = "Fraud Probe $ts"; email = "fraudprobe.$ts@zetagrow.com"; password = "FraudPass123!" }
  if ($su.status -ne "success") { throw "signup failed" }
  $script:var.fraudTok = $su.value.token
  $script:var.fraudId = $su.value.user.id
  $state = C query "learning:getCoursePlayerState" @{ token = $su.value.token; programId = $script:var.starterId }
  if ($state.value.isEnrolled -ne $false) { throw "probe should not be enrolled" }
  $lessons = @($state.value.modules | ForEach-Object { $_.lessons })
  if ($lessons.Count -eq 0) { throw "no lessons" }
  $r = C mutation "learning:toggleLessonComplete" @{ token = $su.value.token; programId = $script:var.starterId; lessonId = $lessons[0]._id }
  if ($r.status -ne "error") { throw "unenrolled user must NOT complete lessons" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "S1" "unenrolled user cannot complete lessons (no certificate farming)" $true

$script:var.lastException = $null
try {
  $g = C mutation "users:grantProgramAccess" @{ token = $script:var.adminTok; userId = $script:var.fraudId; programId = $script:var.starterId; reason = "Security suite" }
  if ($g.status -ne "success") { throw "grant failed" }
  $state = C query "learning:getCoursePlayerState" @{ token = $script:var.fraudTok; programId = $script:var.starterId }
  $lessons = @($state.value.modules | ForEach-Object { $_.lessons })
  foreach ($l in @($lessons)) {
    $r = C mutation "learning:toggleLessonComplete" @{ token = $script:var.fraudTok; programId = $script:var.starterId; lessonId = $l._id }
    if ($r.status -ne "success") { throw "enrolled user lesson toggle failed: $($r.errorMessage)" }
  }
  $certs = C query "certificates:getUserCertificates" @{ token = $script:var.fraudTok }
  if (@($certs.value).Count -ne 1) { throw "certificate should be issued to enrolled user" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "S2" "enrolled user (granted) CAN complete lessons -> certificate issued (regression)" $true

# ---- S3/S4/S5: SUSPENSION ENFORCEMENT + PRIVILEGE GUARDS ----
Write-Host "=== SUSPENSION ENFORCEMENT ==="
$script:var.lastException = $null
try {
  $su2 = C mutation "auth:signup" @{ name = "Suspend Probe $ts"; email = "susprobe.$ts@zetagrow.com"; password = "SuspendPass123!" }
  $uid2 = $su2.value.user.id
  $r = C query "wallets:getUserWallet" @{ token = $su2.value.token }
  if ($r.status -ne "success") { throw "pre-suspend wallet should work" }
  $s = C mutation "users:updateUserStatus" @{ token = $script:var.adminTok; userId = $uid2; status = "suspended"; reason = "Security suite" }
  if ($s.status -ne "success") { throw "suspend failed" }
  $w = C query "wallets:getUserWallet" @{ token = $su2.value.token }
  if ($w.status -ne "error") { throw "suspended user's OLD session must be dead (wallet access)" }
  $l = C mutation "auth:login" @{ email = "susprobe.$ts@zetagrow.com"; password = "SuspendPass123!" }
  if ($l.status -ne "error") { throw "suspended user must not log in" }
  $r2 = C mutation "users:updateUserStatus" @{ token = $script:var.adminTok; userId = $uid2; status = "active"; reason = "Security suite restore" }
  if ($r2.status -ne "success") { throw "restore failed" }
  $l2 = C mutation "auth:login" @{ email = "susprobe.$ts@zetagrow.com"; password = "SuspendPass123!" }
  if ($l2.status -ne "success") { throw "restored user must log in" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "S3" "suspension kills existing sessions + blocks login; restore re-enables login" $true

$script:var.lastException = $null
try {
  $su3 = C mutation "auth:signup" @{ name = "Self Sus $ts"; email = "selfsus.$ts@zetagrow.com"; password = "SelfSusPass123!" }
  $r = C mutation "users:updateUserRole" @{ token = $script:var.adminTok; userId = $su3.value.user.id; role = "finance_admin"; reason = "Security suite" }
  if ($r.status -ne "success") { throw "promote failed" }
  $tok3 = (C mutation "auth:login" @{ email = "selfsus.$ts@zetagrow.com"; password = "SelfSusPass123!" }).value.token
  $self = C mutation "users:updateUserStatus" @{ token = $tok3; userId = $su3.value.user.id; status = "suspended"; reason = "self suspend attempt" }
  if ($self.status -ne "error") { throw "user must not suspend themselves" }
  $me = (C query "auth:getSessionUser" @{ token = $script:var.adminTok }).value
  $susAdmin = C mutation "users:updateUserStatus" @{ token = $tok3; userId = $me._id; status = "suspended"; reason = "attack" }
  if ($susAdmin.status -ne "error") { throw "finance_admin must not suspend super_admin (2)" }
  $roleBoss = C mutation "users:updateUserRole" @{ token = $tok3; userId = $me._id; role = "user"; reason = "attack" }
  if ($roleBoss.status -ne "error") { throw "finance_admin must not change super_admin role" }
  $badStatus = C mutation "users:updateUserStatus" @{ token = $script:var.adminTok; userId = $su3.value.user.id; status = "banned"; reason = "invalid value" }
  if ($badStatus.status -ne "error") { throw "invalid status value must be rejected" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "S4" "self-suspend blocked; finance_admin cannot suspend/role-change super_admin; invalid status rejected" $true

# ---- S6: EMAIL CHANGE REQUIRES PASSWORD ----
Write-Host "=== EMAIL CHANGE GUARD ==="
$script:var.lastException = $null
try {
  $su4 = C mutation "auth:signup" @{ name = "Email Guard $ts"; email = "emailguard.$ts@zetagrow.com"; password = "EmailGuardPass123!" }
  $tok4 = $su4.value.token
  $noPw = C mutation "auth:changeEmail" @{ token = $tok4; newEmail = "emailguard2.$ts@zetagrow.com" }
  if ($noPw.status -ne "error") { throw "email change without password must fail" }
  $wrongPw = C mutation "auth:changeEmail" @{ token = $tok4; currentPassword = "wrongpass"; newEmail = "emailguard2.$ts@zetagrow.com" }
  if ($wrongPw.status -ne "error") { throw "email change with wrong password must fail" }
  $ok = C mutation "auth:changeEmail" @{ token = $tok4; currentPassword = "EmailGuardPass123!"; newEmail = "emailguard2.$ts@zetagrow.com" }
  if ($ok.status -ne "success") { throw "email change with correct password must succeed" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "S5" "email change requires (correct) current password" $true

# ---- S7: LOGIN BRUTE-FORCE LOCKOUT ----
Write-Host "=== LOGIN LOCKOUT ==="
$script:var.lastException = $null
try {
  $su5 = C mutation "auth:signup" @{ name = "Lockout Probe $ts"; email = "lockprobe.$ts@zetagrow.com"; password = "LockProbePass123!" }
  $blocked = $false
  for ($i = 0; $i -lt 8; $i++) {
    $r = C mutation "auth:login" @{ email = "lockprobe.$ts@zetagrow.com"; password = "wrong-$i" }
    if ($r.status -ne "error") { throw "wrong password attempt $i must fail" }
  }
  $locked = C mutation "auth:login" @{ email = "lockprobe.$ts@zetagrow.com"; password = "LockProbePass123!" }
  if ($locked.status -ne "error") { throw "correct password must be blocked while locked" }
  $r2 = C mutation "auth:login" @{ email = "lockprobe.$ts@zetagrow.com"; password = "LockProbePass123!" }
  if ($r2.status -ne "error") { throw "lock must persist across attempts" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "S6" "8 failed attempts lock the account (correct password rejected during lock window)" $true

# ---- S8: CREDENTIALS NOT ON LOGIN PAGES ----
Write-Host "=== CREDENTIAL LEAK CHECK ==="
$script:var.lastException = $null
try {
  $html = (Invoke-WebRequest -Uri "http://localhost:3000/login" -UseBasicParsing -TimeoutSec 30).Content
  if ($html -match "DemoPassword123!|demo@zetagrow.com") { throw "website login page leaks demo credentials" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "S7" "website login page no longer exposes demo credentials" $true

# ---- S9: SECURITY HEADERS ----
Write-Host "=== SECURITY HEADERS ==="
$script:var.lastException = $null
try {
  $resp = Invoke-WebRequest -Uri "http://localhost:3000/login" -UseBasicParsing -TimeoutSec 30
  $h = $resp.Headers
  if ($h["X-Frame-Options"] -ne "DENY") { throw "X-Frame-Options missing" }
  if ($h["X-Content-Type-Options"] -ne "nosniff") { throw "X-Content-Type-Options missing" }
  if (-not $h["Content-Security-Policy"]) { throw "CSP missing" }
  if ($h["Referrer-Policy"] -ne "strict-origin-when-cross-origin") { throw "Referrer-Policy missing" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "S8" "security headers (XFO/XCTO/CSP/Referrer-Policy) present" $true

Write-Host ""
$fail = @($results | Where-Object { $_ -like "FAIL*" })
Write-Host "=== SUMMARY ==="
Write-Host "TOTAL: $($results.Count)  PASSED: $($results.Count - $fail.Count)  FAILED: $($fail.Count)"
if ($fail.Count -gt 0) { Write-Host "--- FAILURES ---"; $fail | ForEach-Object { Write-Host $_ } } else { Write-Host "ALL TESTS PASSED" }