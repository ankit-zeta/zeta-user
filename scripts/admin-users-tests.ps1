$ErrorActionPreference = "Stop"
$base = "https://terrific-dove-836.convex.cloud/api"
$results = New-Object System.Collections.ArrayList
$script:var = @{}

function C($kind, $path, $a) {
    $b = @{ path = $path; args = $a; format = "json" } | ConvertTo-Json -Depth 10
    return Invoke-RestMethod -Uri "$base/$kind" -Method Post -ContentType "application/json" -Body $b -UseBasicParsing -TimeoutSec 30
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
$demoLogin = C "mutation" "auth:login" @{ email = "demo@zetagrow.com"; password = "DemoPassword123!" }
$script:var.demoTok = $demoLogin.value.token
$script:var.demoId = $demoLogin.value.user.id
Write-Host "tokens ready"

Write-Host ""
Write-Host "=== getAllUsers (LIST) ==="
$script:var.lastException = $null
try {
    $r = C "query" "users:getAllUsers" @{ token = $script:var.adminTok }
    if ($r.status -ne "success" -or @($r.value).Count -lt 5) { throw "expected user list, got: $($r.status) count=$(@($r.value).Count)" }
    $script:var.userCount = @($r.value).Count
} catch { $script:var.lastException = $_.Exception.Message }
Check "U1" "admin can list all users" $true

$script:var.lastException = $null
try {
    $r = C "query" "users:getAllUsers" @{ token = $script:var.demoTok }
    if ($r.status -ne "error") { throw "user token should be blocked" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "U2" "non-admin blocked from list" $true

$script:var.lastException = $null
try {
    $r = C "query" "users:getAllUsers" @{ token = $script:var.adminTok; search = "rahul" }
    if ($r.status -ne "success" -or @($r.value).Count -ne 1) { throw "search by name failed: $($r.status)" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "U3" "search by name works" $true

$script:var.lastException = $null
try {
    $r = C "query" "users:getAllUsers" @{ token = $script:var.adminTok; search = "demo@zetagrow.com" }
    if (@($r.value).Count -ne 1 -or $r.value[0].email -ne "demo@zetagrow.com") { throw "search by email failed" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "U4" "search by email works" $true

$script:var.lastException = $null
try {
    $r = C "query" "users:getAllUsers" @{ token = $script:var.adminTok; search = "DEMO123" }
    if (@($r.value).Count -ne 1 -or $r.value[0].referralCode -ne "DEMO123") { throw "search by referral code failed" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "U5" "search by referral code works" $true

$script:var.lastException = $null
try {
    $r = C "query" "users:getAllUsers" @{ token = $script:var.adminTok; role = "user" }
    if (@($r.value).Count -lt 5) { throw "role filter failed" }
    $bad = @($r.value | Where-Object { $_.role -ne "user" }).Count
    if ($bad -gt 0) { throw "role filter leaked non-user rows" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "U6" "role filter user only" $true

$script:var.lastException = $null
try {
    $r = C "query" "users:getAllUsers" @{ token = $script:var.adminTok; status = "suspended" }
    foreach ($u in @($r.value)) { if ($u.status -ne "suspended") { throw "status filter leaked active rows" } }
} catch { $script:var.lastException = $_.Exception.Message }
Check "U7" "status filter suspended only" $true

$script:var.lastException = $null
try {
    $r = C "query" "users:getAllUsers" @{ token = $script:var.adminTok; search = "zzz_no_match_$ts" }
    if (@($r.value).Count -ne 0) { throw "expected empty result" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "U8" "no-match search returns empty list" $true

$script:var.lastException = $null
try {
    $r = C "query" "users:getAllUsers" @{ token = "garbage-token" }
    if ($r.status -ne "error") { throw "garbage token should be rejected" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "U9" "invalid token rejected" $true

Write-Host ""
Write-Host "=== getUserDetails (FULL REPORT) ==="
$script:var.lastException = $null
try {
    $r = C "query" "users:getUserDetails" @{ token = $script:var.demoTok; userId = $script:var.demoId }
    if ($r.status -ne "error") { throw "user token should be blocked" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "D1" "non-admin blocked from report" $true

$script:var.lastException = $null
try {
    $r = C "query" "users:getUserDetails" @{ token = $script:var.adminTok; userId = "99999999999999999999999999" }
    if ($r.status -ne "error") { throw "expected not found error" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "D2" "nonexistent user -> error" $true

$script:var.lastException = $null
try {
    $r = C "query" "users:getUserDetails" @{ token = $script:var.adminTok; userId = $script:var.demoId }
    $v = $r.value
    if ($r.status -ne "success") { throw "report failed: $($r.status)" }
    if (-not $v.wallet) { throw "wallet missing" }
    if ($v.enrolledPrograms.Count -lt 4) { throw "expected >=4 enrollments, got $($v.enrolledPrograms.Count)" }
    if ($v.referralsCount -lt 1) { throw "expected >=1 referral" }
    if (-not $v.affiliateStats -or $null -eq $v.affiliateStats.conversionRate) { throw "affiliateStats missing" }
    if ($null -eq $v.walletTransactions -or $null -eq $v.withdrawals) { throw "earnings lists missing" }
    if ($null -eq $v.applications -or $null -eq $v.certificates -or $null -eq $v.achievements) { throw "activity lists missing" }
    if ($v.supportTickets.Count -lt 1) { throw "expected support tickets" }
    if ($null -eq $v.auditLogs -or $null -eq $v.notificationsCount) { throw "audit/notifications missing" }
    if ($v.user.email -ne "demo@zetagrow.com") { throw "wrong user" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "D3" "full report has all sections (wallet/programs/affiliate/earnings/activity/audit)" $true

$script:var.lastException = $null
try {
    $r = C "query" "users:getUserDetails" @{ token = $script:var.adminTok; userId = $script:var.demoId }
    $saleCheck = $true
    foreach ($s in @($r.value.affiliateSales)) {
        if ($null -eq $s.commissionAmount -or $null -eq $s.buyerName -or $null -eq $s.programName) { $saleCheck = $false }
    }
    if (-not $saleCheck) { throw "affiliate sales detail incomplete" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "D4" "affiliate sales have buyer/program/commission detail" $true

$script:var.lastException = $null
try {
    $r = C "query" "users:getUserDetails" @{ token = $script:var.adminTok; userId = $script:var.demoId }
    foreach ($t in @($r.value.supportTickets)) {
        if (-not $t.ticketId -or $t.ticketId -notmatch "^ZT-") { throw "ticketId bad: $($t.ticketId)" }
    }
    foreach ($cert in @($r.value.certificates)) {
        if (-not $cert.certificateId) { throw "certificate detail missing" }
    }
} catch { $script:var.lastException = $_.Exception.Message }
Check "D5" "tickets carry trackingId + certificates carry certId" $true

Write-Host ""
Write-Host "=== STATUS + AUDIT TRAIL ==="
$script:var.lastException = $null
try {
    $signup = C "mutation" "auth:signup" @{ name = "Audit Probe"; email = "auditprobe.$ts@zetagrow.com"; password = "ProbePass123!" }
    if ($signup.status -ne "success") { throw "signup failed" }
    $uid = $signup.value.user.id
    $script:var.probeId = $uid
    $r = C "mutation" "users:updateUserStatus" @{ token = $script:var.adminTok; userId = $uid; status = "suspended"; reason = "Test suite suspend" }
    if ($r.status -ne "success") { throw "suspend failed" }
    $det = C "query" "users:getUserDetails" @{ token = $script:var.adminTok; userId = $uid }
    $suspendLog = @($det.value.auditLogs | Where-Object { $_.action -eq "UPDATE_USER_STATUS" -and $_.reason -eq "Test suite suspend" })
    if ($suspendLog.Count -ne 1) { throw "suspend audit log missing" }
    if ($suspendLog[0].previousValue -ne "active" -or $suspendLog[0].newValue -ne "suspended") { throw "audit before/after values wrong" }
    C "mutation" "users:updateUserStatus" @{ token = $script:var.adminTok; userId = $uid; status = "active"; reason = "Test suite restore" } | Out-Null
    $det2 = C "query" "users:getUserDetails" @{ token = $script:var.adminTok; userId = $uid }
    if ($det2.value.auditLogs.Count -lt 2) { throw "restore audit log missing" }
    if ($det2.value.user.status -ne "active") { throw "user not restored" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "S1" "suspend/restore writes full audit trail with before/after values" $true

$script:var.lastException = $null
try {
    $r = C "mutation" "users:updateUserStatus" @{ token = $script:var.demoTok; userId = $script:var.probeId; status = "suspended"; reason = "hack" }
    if ($r.status -ne "error") { throw "user token should be blocked from status change" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "S2" "non-admin cannot change status" $true

Write-Host ""
Write-Host "=== GRANT PROGRAM ==="
$script:var.lastException = $null
try {
    $progs = C "query" "programs:getPublicPrograms" @{}
    $target = $progs.value | Where-Object { $_.name -match "Starter" } | Select-Object -First 1
    if (-not $target) { throw "no program found" }
    $script:var.grantProgId = $target._id
    $r = C "mutation" "users:grantProgramAccess" @{ token = $script:var.adminTok; userId = $script:var.probeId; programId = $target._id; reason = "Test suite grant" }
    if ($r.status -ne "success") { throw "grant failed: $($r.status)" }
    $det = C "query" "users:getUserDetails" @{ token = $script:var.adminTok; userId = $script:var.probeId }
    $found = @($det.value.enrolledPrograms | Where-Object { $_.program._id -eq $target._id -and $_.purchase.paymentMethod -eq "manual_grant" })
    if ($found.Count -ne 1) { throw "granted program not in enrollments" }
    $grantLog = @($det.value.auditLogs | Where-Object { $_.action -match "GRANT" })
    if ($grantLog.Count -lt 1) { throw "grant audit log missing" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "G1" "admin grant adds enrollment + audit log" $true

$script:var.lastException = $null
try {
    $r = C "mutation" "users:grantProgramAccess" @{ token = $script:var.adminTok; userId = $script:var.probeId; programId = $script:var.grantProgId; reason = "duplicate test" }
    if ($r.status -ne "error") { throw "duplicate grant should be rejected" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "G2" "duplicate grant rejected" $true

$script:var.lastException = $null
try {
    $r = C "mutation" "users:grantProgramAccess" @{ token = $script:var.demoTok; userId = $script:var.probeId; programId = $script:var.grantProgId; reason = "hack" }
    if ($r.status -ne "error") { throw "user token should be blocked from grant" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "G3" "non-admin cannot grant" $true

Write-Host ""
$fail = @($results | Where-Object { $_ -like "FAIL*" })
Write-Host "=== SUMMARY ==="
Write-Host "TOTAL: $($results.Count)  PASSED: $($results.Count - $fail.Count)  FAILED: $($fail.Count)"
if ($fail.Count -gt 0) { Write-Host "--- FAILURES ---"; $fail | ForEach-Object { Write-Host $_ } } else { Write-Host "ALL TESTS PASSED" }