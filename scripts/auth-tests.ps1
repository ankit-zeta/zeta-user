$ErrorActionPreference = "Stop"
$base = "https://terrific-dove-836.convex.cloud/api"
$results = New-Object System.Collections.ArrayList
$script:var = @{}

function C($kind, $path, $a) {
    $b = @{ path = $path; args = $a; format = "json" } | ConvertTo-Json -Depth 10
    return Invoke-RestMethod -Uri "$base/$(if ($path -eq 'auth:login') { 'action' } else { $kind })" -Method Post -ContentType "application/json" -Body $b -UseBasicParsing -TimeoutSec 30
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
$script:var.adminTok = (C "mutation" "auth:login" @{ email = "admin@zetagrow.com"; password = "AdminPassword123!" }).value.token
$script:var.demoTok = (C "mutation" "auth:login" @{ email = "demo@zetagrow.com"; password = "DemoPassword123!" }).value.token
Write-Host "admin + demo tokens ready"

Write-Host ""
Write-Host "=== USER SIGNUP ==="
$script:var.lastException = $null
try {
    $r = C "mutation" "auth:signup" @{ testMode = $true;  name = "Alice New"; email = "alice.$ts@zetagrow.com"; password = "AlicePass123!"; website = ""; formStartedAt = [DateTimeOffset]::UtcNow.AddSeconds(-5).ToUnixTimeMilliseconds() }
    if ($r.status -ne "success" -or -not $r.value.token -or $r.value.user.role -ne "user") { throw "bad signup response: $($r.status)" }
    if ($r.value.user.referralCode -notmatch "^[A-Z0-9]{4,12}$") { throw "bad referral code: $($r.value.user.referralCode)" }
    $script:var.aliceTok = $r.value.token
    $script:var.aliceEmail = $r.value.user.email
    $script:var.aliceId = $r.value.user.id
    $script:var.aliceRef = $r.value.user.referralCode
} catch { $script:var.lastException = $_.Exception.Message }
Check "A1" "signup valid -> token + user + referral code" $true

$script:var.lastException = $null
try {
    $r = C "mutation" "auth:signup" @{ testMode = $true;  name = "Alice Dup"; email = "alice.$ts@zetagrow.com"; password = "OtherPass123!" }
    if ($r.status -ne "error") { throw "expected rejection but got: $($r.status)" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "A2" "signup duplicate email rejected" $true

$script:var.lastException = $null
try {
    $r = C "mutation" "auth:signup" @{ testMode = $true;  name = "Bob Referred"; email = "bob.$ts@zetagrow.com"; password = "BobPass123!"; referralCode = "DEMO123" }
    if ($r.status -ne "success") { throw "signup failed: $($r.status)" }
    $me = C "query" "auth:getSessionUser" @{ token = $r.value.token }
    if (-not $me.value.referredBy) { throw "referredBy not set" }
    $script:var.bobTok = $r.value.token
} catch { $script:var.lastException = $_.Exception.Message }
Check "A3" "signup with valid referral -> referredBy set" $true

$script:var.lastException = $null
try {
    $r = C "mutation" "auth:signup" @{ testMode = $true;  name = "Carol Solo"; email = "carol.$ts@zetagrow.com"; password = "CarolPass123!"; referralCode = "NOPE99" }
    if ($r.status -ne "success") { throw "signup failed: $($r.status)" }
    $me = C "query" "auth:getSessionUser" @{ token = $r.value.token }
    if ($me.value.referredBy) { throw "referredBy should be null for unknown code" }
    $script:var.carolTok = $r.value.token
} catch { $script:var.lastException = $_.Exception.Message }
Check "A4" "signup with unknown referral code still works" $true

$script:var.lastException = $null
try {
    $r = C "mutation" "auth:signup" @{ testMode = $true;  name = "Dave Case"; email = "DAVE.$ts@ZETAGROW.COM"; password = "DavePass123!" }
    if ($r.status -ne "success") { throw "signup failed: $($r.status)" }
    if ($r.value.user.email -ne "dave.$ts@zetagrow.com") { throw "email not normalized: $($r.value.user.email)" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "A5" "signup email normalized to lowercase" $true

$script:var.lastException = $null
try {
    $r = C "mutation" "auth:signup" @{ testMode = $true;  name = "Eve Phone"; email = "eve.$ts@zetagrow.com"; password = "EvePass123!"; phone = "+91 9876543210" }
    if ($r.status -ne "success") { throw "signup failed: $($r.status)" }
    $me = C "query" "auth:getSessionUser" @{ token = $r.value.token }
    if ($me.value.phone -ne "+91 9876543210") { throw "phone not stored: $($me.value.phone)" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "A6" "signup with phone stored" $true

$script:var.lastException = $null
try {
    $r = C "mutation" "auth:signup" @{ testMode = $true;  name = "Frank Wallet"; email = "frank.$ts@zetagrow.com"; password = "FrankPass123!" }
    if ($r.status -ne "success") { throw "signup failed: $($r.status)" }
    $me = C "query" "auth:getSessionUser" @{ token = $r.value.token }
    if (-not $me.value.wallet -or $me.value.wallet.availableBalance -ne 0) { throw "wallet not initialized" }
    if ($me.value.enrolledProgramIds.Count -ne 0) { throw "new user should have no enrollments" }
    $script:var.frankTok = $r.value.token
} catch { $script:var.lastException = $_.Exception.Message }
Check "A7" "signup initializes wallet + zero enrollments" $true

$script:var.lastException = $null
try {
    $r = C "query" "notifications:getUserNotifications" @{ token = $script:var.aliceTok }
    $welcome = @($r.value.notifications | Where-Object { $_.title -match "Welcome" })
    if ($welcome.Count -lt 1) { throw "no welcome notification" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "A8" "welcome notification created" $true

$script:var.lastException = $null
try {
    $r = C "query" "notifications:getUserNotifications" @{ token = $script:var.demoTok }
    $refNotif = @($r.value.notifications | Where-Object { $_.type -eq "affiliate" -and $_.title -match "Referral" })
    if ($refNotif.Count -lt 1) { throw "referrer not notified" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "A9" "referrer notified when user joins with code" $true

$script:var.lastException = $null
try {
    $r = C "mutation" "auth:signup" @{ testMode = $true;  name = "No Password"; email = "nopass.$ts@zetagrow.com" }
    if ($r.status -ne "error") { throw "expected rejection but got: $($r.status)" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "A10" "signup missing password rejected" $true

Write-Host ""
Write-Host "=== USER LOGIN ==="
$script:var.lastException = $null
try {
    $r = C "mutation" "auth:login" @{ email = $script:var.aliceEmail; password = "AlicePass123!" }
    if ($r.status -ne "success" -or -not $r.value.token) { throw "login failed: $($r.status)" }
    if ($r.value.user.role -ne "user") { throw "wrong role: $($r.value.user.role)" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "B1" "login valid credentials" $true

$script:var.lastException = $null
try {
    $r = C "mutation" "auth:login" @{ email = $script:var.aliceEmail; password = "WrongPass999!" }
    if ($r.status -ne "error") { throw "expected rejection but got: $($r.status)" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "B2" "login wrong password rejected" $true

$script:var.lastException = $null
try {
    $r = C "mutation" "auth:login" @{ email = "ghost.$ts@zetagrow.com"; password = "Whatever123!" }
    if ($r.status -ne "error") { throw "expected rejection but got: $($r.status)" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "B3" "login unknown email rejected" $true

$script:var.lastException = $null
try {
    $r = C "mutation" "auth:login" @{ email = $script:var.aliceEmail.ToUpper(); password = "AlicePass123!" }
    if ($r.status -ne "success") { throw "case-insensitive login failed: $($r.status)" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "B4" "login email case-insensitive" $true

$script:var.lastException = $null
try {
    $r = C "mutation" "auth:login" @{ email = "  $($script:var.aliceEmail)  "; password = "AlicePass123!" }
    if ($r.status -ne "success") { throw "trimmed email login failed: $($r.status)" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "B5" "login email whitespace trimmed" $true

$script:var.lastException = $null
try {
    $r = C "query" "auth:getSessionUser" @{ token = $script:var.aliceTok }
    if ($r.status -ne "success" -or $r.value.email -ne $script:var.aliceEmail) { throw "session invalid" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "B6" "session token works with getSessionUser" $true

$script:var.lastException = $null
try {
    $r = C "mutation" "auth:logout" @{ token = $script:var.aliceTok }
    if ($r.status -ne "success") { throw "logout failed" }
    $me = C "query" "auth:getSessionUser" @{ token = $script:var.aliceTok }
    if ($me.value -ne $null) { throw "token still valid after logout" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "B7" "logout invalidates token" $true

Write-Host ""
Write-Host "=== SUSPENDED ACCOUNT ==="
$script:var.lastException = $null
try {
    $login1 = C "mutation" "auth:login" @{ email = "frank.$ts@zetagrow.com"; password = "FrankPass123!" }
    $frankId = $login1.value.user.id
    $r = C "mutation" "users:updateUserStatus" @{ token = $script:var.adminTok; userId = $frankId; status = "suspended"; reason = "Auth test suite" }
    if ($r.status -ne "success") { throw "suspend failed: $($r.status)" }
    $login2 = C "mutation" "auth:login" @{ email = "frank.$ts@zetagrow.com"; password = "FrankPass123!" }
    if ($login2.status -ne "error") { throw "suspended user could log in" }
    $me = C "query" "auth:getSessionUser" @{ token = $script:var.frankTok }
    if ($me.value -ne $null) { throw "suspended user session still active" }
    C "mutation" "users:updateUserStatus" @{ token = $script:var.adminTok; userId = $frankId; status = "active"; reason = "Auth test suite restore" } | Out-Null
} catch { $script:var.lastException = $_.Exception.Message }
Check "C1" "suspended user blocked from login + session" $true

Write-Host ""
Write-Host "=== ADMIN LOGIN ==="
$script:var.lastException = $null
try {
    $r = C "mutation" "auth:login" @{ email = "admin@zetagrow.com"; password = "AdminPassword123!" }
    if ($r.status -ne "success" -or -not $r.value.token) { throw "admin login failed: $($r.status)" }
    if ($r.value.user.role -ne "super_admin") { throw "wrong role: $($r.value.user.role)" }
    $script:var.adminTok2 = $r.value.token
} catch { $script:var.lastException = $_.Exception.Message }
Check "D1" "admin login -> super_admin role" $true

$script:var.lastException = $null
try {
    $r = C "mutation" "auth:login" @{ email = "admin@zetagrow.com"; password = "WrongAdmin99!" }
    if ($r.status -ne "error") { throw "expected rejection but got: $($r.status)" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "D2" "admin wrong password rejected" $true

$script:var.lastException = $null
try {
    $r = C "query" "supportTickets:getSupportTickets" @{ token = $script:var.adminTok2; status = "all" }
    if ($r.status -ne "success") { throw "admin token unusable" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "D3" "admin token works on admin functions" $true

$script:var.lastException = $null
try {
    $r = C "query" "auth:getSessionUser" @{ token = $script:var.adminTok2 }
    if ($r.status -ne "success" -or $r.value.role -ne "super_admin") { throw "admin session invalid" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "D4" "admin getSessionUser -> super_admin" $true

$script:var.lastException = $null
try {
    $r = C "mutation" "auth:logout" @{ token = $script:var.adminTok2 }
    if ($r.status -ne "success") { throw "admin logout failed" }
    $me = C "query" "auth:getSessionUser" @{ token = $script:var.adminTok2 }
    if ($me.value -ne $null) { throw "admin token still valid after logout" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "D5" "admin logout invalidates token" $true

$script:var.lastException = $null
try {
    $r = C "query" "auth:getSessionUser" @{ token = $script:var.demoTok }
    if ($r.status -ne "success" -or $r.value.role -ne "user") { throw "demo session invalid" }
    $blocked = C "query" "supportTickets:getSupportTickets" @{ token = $script:var.demoTok }
    if ($blocked.status -ne "error") { throw "user token leaked into admin" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "D6" "user token cannot access admin area" $true

Write-Host ""
Write-Host "=== SESSION EDGE CASES ==="
$script:var.lastException = $null
try {
    $r = C "query" "auth:getSessionUser" @{ }
    if ($r.status -ne "success" -or $r.value -ne $null) { throw "expected null for no token" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "E1" "getSessionUser without token -> null" $true

$script:var.lastException = $null
try {
    $r = C "query" "auth:getSessionUser" @{ token = "garbage-token-123" }
    if ($r.status -ne "success" -or $r.value -ne $null) { throw "expected null for garbage token" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "E2" "getSessionUser garbage token -> null" $true

$script:var.lastException = $null
try {
    $r = C "mutation" "auth:login" @{ email = "demo@zetagrow.com"; password = "DemoPassword123!" }
    $me = C "query" "auth:getSessionUser" @{ token = $r.value.token }
    if ($me.value.enrolledProgramIds.Count -lt 2) { throw "demo enrollments missing" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "E3" "demo login shows real enrollments" $true

$script:var.lastException = $null
try {
    $r = C "query" "auth:getSessionUser" @{ token = $null }
    if ($r.status -ne "success" -or $r.value -ne $null) { throw "explicit null token should return success+null, got $($r.status)" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "E4" "getSessionUser explicit null token -> success + null (regression)" $true

$script:var.lastException = $null
try {
    $login = C "mutation" "auth:login" @{ email = "admin@zetagrow.com"; password = "AdminPassword123!" }
    if ($login.status -ne "success") { throw "admin login failed" }
    $me = C "query" "auth:getSessionUser" @{ token = $login.value.token }
    if ($me.status -ne "success" -or $me.value.role -ne "super_admin") { throw "fresh session did not resolve admin user" }
    if ($me.value.email -ne "admin@zetagrow.com") { throw "wrong user resolved" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "E5" "fresh admin login resolves session user (login flow path)" $true

$script:var.lastException = $null
try {
    $me = C "query" "auth:getSessionUser" @{ token = "expired-token-zzz" }
    if ($me.status -ne "success" -or $me.value -ne $null) { throw "stale token must resolve to null (redirect to login)" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "E6" "stale token resolves null -> clean login redirect" $true

Write-Host ""
$fail = @($results | Where-Object { $_ -like "FAIL*" })
Write-Host "=== SUMMARY ==="
Write-Host "TOTAL: $($results.Count)  PASSED: $($results.Count - $fail.Count)  FAILED: $($fail.Count)"
if ($fail.Count -gt 0) { Write-Host "--- FAILURES ---"; $fail | ForEach-Object { Write-Host $_ } } else { Write-Host "ALL TESTS PASSED" }