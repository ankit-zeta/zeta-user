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
$script:var.demoId = (C "query" "auth:getSessionUser" @{ token = $script:var.demoTok }).value._id
Write-Host "tokens ready"

Write-Host ""
Write-Host "=== ADMIN CREATE + POSITIONS ==="
$script:var.lastException = $null
try {
    $pos = (C "query" "positions:getAllPositions" @{ token = $script:var.adminTok }).value
    if (@($pos).Count -eq 0) { throw "no positions returned" }
    $script:var.posId = $pos[0]._id
    $r = C "mutation" "achievements:createAchievement" @{
        token = $script:var.adminTok
        name = "Referral Star $ts"
        slug = "referral-star-$ts"
        description = "Drive 2 direct registrations to the platform."
        icon = "users"
        status = "active"
        sortOrder = 1
        conditionMode = "ALL"
        conditions = @(@{ metric = "valid_referrals"; operator = ">="; value = 2 })
        unlockPositionId = $script:var.posId
        unlockBadgeName = "Referral Star Badge"
        notificationText = "You unlocked the Referral Star achievement!"
    }
    if ($r.status -ne "success") { throw "create failed: $($r.errorMessage)" }
    $script:var.achId = $r.value
} catch { $script:var.lastException = $_.Exception.Message }
Check "A1" "admin creates achievement rule with position unlock" $true

$script:var.lastException = $null
try {
    $r = C "mutation" "achievements:createAchievement" @{
        token = $script:var.adminTok
        name = "Duplicate Slug"
        slug = "referral-star-$ts"
        description = "x"
        icon = "zap"
        status = "active"
        sortOrder = 2
        conditionMode = "ALL"
        conditions = @(@{ metric = "valid_referrals"; operator = ">="; value = 1 })
        notificationText = "x"
    }
    if ($r.status -ne "error") { throw "duplicate slug should be rejected" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "A2" "duplicate slug rejected" $true

$script:var.lastException = $null
try {
    $r = C "mutation" "achievements:createAchievement" @{
        token = $script:var.demoTok
        name = "Hacker"
        slug = "hacker-$ts"
        description = "x"
        icon = "zap"
        status = "active"
        sortOrder = 3
        conditionMode = "ALL"
        conditions = @(@{ metric = "valid_referrals"; operator = ">="; value = 1 })
        notificationText = "x"
    }
    if ($r.status -ne "error") { throw "non-admin create should be blocked" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "A3" "non-admin cannot create achievement" $true

Write-Host ""
Write-Host "=== USER PROGRESS (live metrics) ==="
$script:var.lastException = $null
try {
    $ach = C "query" "achievements:getUserAchievements" @{ token = $script:var.demoTok }
    $my = @($ach.value | Where-Object { $_._id -eq $script:var.achId })
    if ($my.Count -ne 1) { throw "achievement not visible to user" }
    if ($my[0].isUnlocked -eq $true) { throw "should not be unlocked yet" }
    if ($my[0].progress -lt 0 -or $my[0].progress -gt 100) { throw "bad progress value: $($my[0].progress)" }
    if ($my[0].conditionProgress.Count -ne 1) { throw "missing condition progress" }
    if ($my[0].conditionProgress[0].metric -ne "valid_referrals") { throw "wrong metric" }
    if ($my[0].positionName -eq $null) { throw "position name missing" }
    Write-Host "   demo progress: $($my[0].progress)% current=$($my[0].conditionProgress[0].current) target=$($my[0].conditionProgress[0].target)"
} catch { $script:var.lastException = $_.Exception.Message }
Check "B1" "user sees achievement with live condition progress" $true

$script:var.lastException = $null
try {
    $all = C "query" "achievements:getAllAchievementsAdmin" @{ token = $script:var.adminTok }
    $my = @($all.value | Where-Object { $_._id -eq $script:var.achId })
    if ($my.Count -ne 1 -or $my[0].status -ne "active") { throw "admin list missing rule" }
    if ($my[0].positionName -eq $null) { throw "admin list missing position name" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "B2" "admin list shows rule with status + position" $true

Write-Host ""
Write-Host "=== EVALUATION (server-side unlock) ==="
$script:var.lastException = $null
try {
    $su = C "mutation" "auth:signup" @{ testMode = $true;  name = "Ach Chaser"; email = "achchaser.$ts@zetagrow.com"; password = "AchPass123!" }
    if ($su.status -ne "success") { throw "signup failed" }
    $script:var.freshTok = $su.value.token
    $script:var.freshId = $su.value.user.id
    $code = $su.value.user.referralCode

    $r1 = C "mutation" "auth:signup" @{ testMode = $true;  name = "Ref One"; email = "refone.$ts@zetagrow.com"; password = "RefPass123!"; referralCode = $code }
    $r2 = C "mutation" "auth:signup" @{ testMode = $true;  name = "Ref Two"; email = "reftwo.$ts@zetagrow.com"; password = "RefPass123!"; referralCode = $code }
    if ($r1.status -ne "success" -or $r2.status -ne "success") { throw "referral signups failed" }

    $ev = C "mutation" "achievements:evaluateUserAchievements" @{ token = $script:var.freshTok }
    if ($ev.status -ne "success") { throw "evaluate failed" }
    $new = @($ev.value.newlyUnlocked | Where-Object { $_._id -eq $script:var.achId })
    if ($new.Count -ne 1) { throw "achievement not unlocked after conditions met" }
    Write-Host "   unlocked via: $($ev.value.metrics.valid_referrals) referrals"
} catch { $script:var.lastException = $_.Exception.Message }
Check "C1" "conditions met -> server-side unlock + position + notification" $true

$script:var.lastException = $null
try {
    $ach = C "query" "achievements:getUserAchievements" @{ token = $script:var.freshTok }
    $my = @($ach.value | Where-Object { $_._id -eq $script:var.achId })
    if ($my.Count -ne 1 -or $my[0].isUnlocked -ne $true -or $my[0].progress -ne 100) { throw "user view not updated" }
    $user = (C "query" "auth:getSessionUser" @{ token = $script:var.freshTok }).value
    if ($user.position._id -ne $script:var.posId) { throw "position not assigned" }
    $notifs = (C "query" "notifications:getUserNotifications" @{ token = $script:var.freshTok }).value.notifications
    if (@($notifs | Where-Object { $_.type -eq "achievement" -and $_.title -like "Achievement Unlocked*" }).Count -lt 1) { throw "unlock notification missing" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "C2" "user view + position + notification all updated" $true

$script:var.lastException = $null
try {
    $ev = C "mutation" "achievements:evaluateUserAchievements" @{ token = $script:var.freshTok }
    if (@($ev.value.newlyUnlocked).Count -ne 0) { throw "duplicate unlock detected" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "C3" "no duplicate unlocks on re-evaluation" $true

Write-Host ""
Write-Host "=== ADMIN CONTROL (grant/revoke/toggle/delete) ==="
$script:var.lastException = $null
try {
    $g = C "mutation" "achievements:adminGrantAchievement" @{ token = $script:var.adminTok; userId = $script:var.freshId; achievementId = $script:var.achId; reason = "Test grant" }
    if ($g.status -ne "error") { throw "duplicate grant should fail" }
    $g2 = C "mutation" "achievements:adminGrantAchievement" @{ token = $script:var.adminTok; userId = $script:var.demoId; achievementId = $script:var.achId; reason = "Test grant demo" }
    if ($g2.status -ne "success") { throw "grant failed" }
    $b = C "query" "achievements:getUserAchievements" @{ token = $script:var.demoTok }
    if (@($b.value | Where-Object { $_._id -eq $script:var.achId -and $_.isUnlocked }).Count -ne 1) { throw "granted achievement not visible" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "D1" "admin grant works / duplicate grant blocked" $true

$script:var.lastException = $null
try {
    $g = C "mutation" "achievements:adminGrantAchievement" @{ token = $script:var.demoTok; userId = $script:var.freshId; achievementId = $script:var.achId }
    if ($g.status -ne "error") { throw "non-admin grant should be blocked" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "D2" "non-admin cannot grant achievements" $true

$script:var.lastException = $null
try {
    $rv = C "mutation" "achievements:adminRevokeAchievement" @{ token = $script:var.adminTok; userId = $script:var.demoId; achievementId = $script:var.achId; reason = "Test revoke" }
    if ($rv.status -ne "success") { throw "revoke failed" }
    $b = C "query" "achievements:getUserAchievements" @{ token = $script:var.demoTok }
    if (@($b.value | Where-Object { $_._id -eq $script:var.achId -and $_.isUnlocked }).Count -ne 0) { throw "revoked achievement still visible as unlocked" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "D3" "admin revoke removes from user view" $true

$script:var.lastException = $null
try {
    $rv = C "mutation" "achievements:adminRevokeAchievement" @{ token = $script:var.adminTok; userId = $script:var.demoId; achievementId = $script:var.achId }
    if ($rv.status -ne "error") { throw "double revoke should fail" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "D4" "revoke without existing unlock rejected" $true

$script:var.lastException = $null
try {
    $t = C "mutation" "achievements:toggleAchievementStatus" @{ token = $script:var.adminTok; achievementId = $script:var.achId; status = "draft" }
    if ($t.status -ne "success") { throw "toggle failed" }
    $b = C "query" "achievements:getUserAchievements" @{ token = $script:var.freshTok }
    if (@($b.value | Where-Object { $_._id -eq $script:var.achId }).Count -ne 0) { throw "draft rule still visible to users" }
    $t2 = C "mutation" "achievements:toggleAchievementStatus" @{ token = $script:var.adminTok; achievementId = $script:var.achId; status = "active" }
    if ($t2.status -ne "success") { throw "re-activate failed" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "D5" "toggle draft hides from users / active restores" $true

$script:var.lastException = $null
try {
    $d = C "mutation" "achievements:deleteAchievement" @{ token = $script:var.adminTok; achievementId = $script:var.achId }
    if ($d.status -ne "success") { throw "delete failed" }
    $all = C "query" "achievements:getAllAchievementsAdmin" @{ token = $script:var.adminTok }
    if (@($all.value | Where-Object { $_._id -eq $script:var.achId }).Count -ne 0) { throw "rule still listed" }
    $b = C "query" "achievements:getUserAchievements" @{ token = $script:var.freshTok }
    if (@($b.value | Where-Object { $_._id -eq $script:var.achId }).Count -ne 0) { throw "deleted rule still visible to users" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "D6" "delete removes rule + user unlocks" $true

$script:var.lastException = $null
try {
    $aud = C "query" "auditLogs:getAuditLogs" @{ token = $script:var.adminTok; entityType = "achievements" }
    $actions = @($aud.value | Where-Object { $_.action -in @("CREATE_ACHIEVEMENT", "TOGGLE_ACHIEVEMENT_STATUS", "DELETE_ACHIEVEMENT") })
    if ($actions.Count -lt 3) { throw "audit trail incomplete: $($actions.Count)" }
    $aud2 = C "query" "auditLogs:getAuditLogs" @{ token = $script:var.adminTok; entityType = "userAchievements" }
    $acts = @($aud2.value | Where-Object { $_.action -in @("GRANT_ACHIEVEMENT", "REVOKE_ACHIEVEMENT") })
    if ($acts.Count -lt 2) { throw "grant/revoke audit missing" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "D7" "all admin actions written to audit log" $true

Write-Host ""
$fail = @($results | Where-Object { $_ -like "FAIL*" })
Write-Host "=== SUMMARY ==="
Write-Host "TOTAL: $($results.Count)  PASSED: $($results.Count - $fail.Count)  FAILED: $($fail.Count)"
if ($fail.Count -gt 0) { Write-Host "--- FAILURES ---"; $fail | ForEach-Object { Write-Host $_ } } else { Write-Host "ALL TESTS PASSED" }