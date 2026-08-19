# dashboard-tests.ps1 — Complete user dashboard coverage
# Verifies every dashboard route serves + every API powering each page/section works end-to-end.
$ErrorActionPreference = "Stop"
$base = "https://terrific-dove-836.convex.cloud/api"
$results = New-Object System.Collections.ArrayList
$script:var = @{}

function C($kind, $path, $a) {
  $b = @{ path = $path; args = $a; format = "json" } | ConvertTo-Json -Depth 12
  return Invoke-RestMethod -Uri "$base/$kind" -Method Post -ContentType "application/json" -Body $b -UseBasicParsing -TimeoutSec 60
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
  $script:var.demoTok = (C mutation "auth:login" @{ email = "demo@zetagrow.com"; password = "DemoPassword123!" }).value.token
  $script:var.tok = $script:var.demoTok
  $progs = (C query "programs:getPublicPrograms" @{}).value
  $script:var.starterId = @($progs | Where-Object { $_.name -match "Starter" } | Select-Object -First 1)[0]._id
  if (-not $script:var.starterId) { throw "starter program not found" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "S1" "setup: admin + demo sessions + starter program" $true

# ================= ROUTES (HTTP 200) =================
Write-Host "=== ALL DASHBOARD ROUTES SERVE ==="
$routes = @(
  "/dashboard", "/dashboard/programs",
  "/dashboard/work", "/dashboard/applications", "/dashboard/earnings",
  "/dashboard/affiliate", "/dashboard/referrals", "/dashboard/withdrawals",
  "/dashboard/achievements", "/dashboard/notifications", "/dashboard/profile",
  "/dashboard/resources", "/dashboard/support", "/dashboard/settings",
  "/dashboard/certificates"
)
$okRoutes = 0
foreach ($r in $routes) {
  $code = try { (Invoke-WebRequest -Uri "http://localhost:3000$r" -UseBasicParsing -TimeoutSec 30).StatusCode } catch { "ERR" }
  if ($code -eq 200) { $okRoutes++ } else { Write-Host "FAIL route $r = $code" }
}
Check "R1" "all 16 dashboard routes return HTTP 200" ($okRoutes -eq $routes.Count)
$script:var.lastException = $null
try {
  $lstate = C query "learning:getCoursePlayerState" @{ token = $script:var.tok; programId = $script:var.starterId }
  if ($lstate.status -ne "success") { throw "course player state failed" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "R1b" "learning page API: course player state loads (route is /dashboard/learning/[courseId])" $true

# ================= PROGRAMS =================
Write-Host "=== PROGRAMS ==="
$script:var.lastException = $null
try {
  $pub = C query "programs:getPublicPrograms" @{}
  if ($pub.status -ne "success" -or @($pub.value).Count -lt 1) { throw "public programs empty" }
  $byId = C query "programs:getProgramById" @{ programId = $script:var.starterId }
  if ($byId.status -ne "success" -or $byId.value.name -notmatch "Starter") { throw "program by id failed" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "P1" "programs page: public catalog + program detail load" $true

# ================= DASHBOARD HOME =================
Write-Host "=== DASHBOARD HOME ==="
$script:var.lastException = $null
try {
  $ach = C query "achievements:getUserAchievements" @{ token = $script:var.tok }
  if ($ach.status -ne "success") { throw "home achievements failed" }
  $aff = C query "affiliates:getUserAffiliateStats" @{ token = $script:var.tok }
  if ($aff.status -ne "success") { throw "home affiliate stats failed" }
  $jobs = C query "jobs:getJobsWithEligibility" @{ token = $script:var.tok }
  if ($jobs.status -ne "success") { throw "home jobs failed" }
  $ev = C mutation "achievements:evaluateUserAchievements" @{ token = $script:var.tok }
  if ($ev.status -ne "success") { throw "home evaluate failed" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "H1" "home: achievements, affiliate stats, job eligibility, evaluate all load" $true

# ================= EARNINGS / WALLET =================
Write-Host "=== EARNINGS ==="
$script:var.lastException = $null
try {
  $w = C query "wallets:getUserWallet" @{ token = $script:var.tok }
  if ($w.status -ne "success" -or -not $w.value.wallet) { throw "wallet missing" }
  if ($w.value.wallet.availableBalance -lt 0 -or $w.value.wallet.totalEarned -lt 0) { throw "negative wallet value" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "E1" "earnings: wallet + transaction ledger load with valid balances" $true

# ================= REFERRALS =================
Write-Host "=== REFERRALS ==="
$script:var.lastException = $null
try {
  $r = C query "referrals:getUserReferrals" @{ token = $script:var.tok }
  if ($r.status -ne "success") { throw "referrals query failed" }
  foreach ($item in @($r.value)) {
    if ($item.user -and ($item.hasPurchased -ne $true -and $item.hasPurchased -ne $false)) { throw "bad referral shape" }
  }
} catch { $script:var.lastException = $_.Exception.Message }
Check "R2" "referrals: network list with purchase status per referral" $true

# ================= AFFILIATE (incl. chain) =================
Write-Host "=== AFFILIATE ==="
$script:var.lastException = $null
try {
  $r = C query "affiliates:getUserAffiliateStats" @{ token = $script:var.tok }
  if ($r.status -ne "success" -or -not $r.value.referralCode) { throw "affiliate stats failed" }
  if ($r.value.chainEarnings -lt 0 -or $r.value.pendingCommissions -lt 0) { throw "bad affiliate numbers" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "A1" "affiliate: stats + chain earnings fields present" $true

# ================= ACHIEVEMENTS =================
Write-Host "=== ACHIEVEMENTS ==="
$script:var.lastException = $null
try {
  $r = C query "achievements:getUserAchievements" @{ token = $script:var.tok }
  if ($r.status -ne "success") { throw "achievements query failed" }
  foreach ($a in @($r.value)) {
    if ($a.progress -lt 0 -or $a.progress -gt 100) { throw "bad progress" }
    if ($a.isUnlocked -ne $true -and $a.isUnlocked -ne $false) { throw "bad unlocked flag" }
  }
} catch { $script:var.lastException = $_.Exception.Message }
Check "AC1" "achievements: all rules with progress % + unlock state" $true

# ================= NOTIFICATIONS =================
Write-Host "=== NOTIFICATIONS ==="
$script:var.lastException = $null
try {
  $r = C query "notifications:getUserNotifications" @{ token = $script:var.tok }
  if ($r.status -ne "success" -or $r.value.unreadCount -lt 0) { throw "notifications failed" }
  $m = C mutation "notifications:markAllNotificationsRead" @{ token = $script:var.tok }
  if ($m.status -ne "success") { throw "mark all read failed" }
  $r2 = C query "notifications:getUserNotifications" @{ token = $script:var.tok }
  if ($r2.value.unreadCount -ne 0) { throw "unread count not zero after mark-all" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "N1" "notifications: list + mark-all-read resets unread counter" $true

# ================= PROFILE + CV =================
Write-Host "=== PROFILE & CV ==="
$script:var.lastException = $null
try {
  $p = C mutation "users:updateProfile" @{ token = $script:var.tok; bio = "Updated bio $ts"; phone = "9999999999" }
  if ($p.status -ne "success") { throw "profile update failed" }
  $me = C query "auth:getSessionUser" @{ token = $script:var.tok }
  if ($me.value.bio -notmatch "Updated bio") { throw "profile bio not saved" }
  $cv = C mutation "cvProfiles:upsertCvProfile" @{
    token = $script:var.tok
    overview = "Dashboard test professional with adequate experience and skills."
    experience = @(@{ role = "Intern"; company = "TestCo"; startDate = "2023-01"; endDate = "2024-01"; current = $false; description = "Worked on projects" })
    education = @(@{ institution = "Test Univ"; degree = "B.Sc."; field = "CS"; status = "graduated"; startYear = "2019"; endYear = "2023" })
    technicalSkills = @("Python", "Design")
    softSkills = @("Teamwork")
  }
  if ($cv.status -ne "success") { throw "cv upsert failed" }
  $cvGet = C query "cvProfiles:getMyCvProfile" @{ token = $script:var.tok }
  if ($cvGet.status -ne "success" -or $cvGet.value.overview -notmatch "Dashboard test") { throw "cv read failed" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "PR1" "profile: update profile + CV upsert/read roundtrip" $true

# ================= RESOURCES =================
Write-Host "=== RESOURCES ==="
$script:var.lastException = $null
try {
  $r = C query "resources:getResourcesForUser" @{ token = $script:var.tok }
  if ($r.status -ne "success") { throw "resources failed" }
  if (-not $r.value.resources -and -not $r.value.modules) { throw "resources shape unexpected" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "RS1" "resources: library loads for user" $true

# ================= SUPPORT =================
Write-Host "=== SUPPORT ==="
$script:var.lastException = $null
try {
  $cats = C query "supportTickets:getTicketCategories" @{}
  if ($cats.status -ne "success" -or @($cats.value).Count -lt 1) { throw "categories failed" }
  $su = C mutation "auth:signup" @{ name = "Dash Tester $ts"; email = "dashtest.$ts@zetagrow.com"; password = "DashPass123!" }
  if ($su.status -ne "success") { throw "signup failed" }
  $t = C mutation "supportTickets:createTicket" @{ token = $su.value.token; category = "account"; title = "Dashboard test ticket"; message = "Testing dashboard support flow" }
  if ($t.status -ne "success") { throw "create ticket failed" }
  $list = C query "supportTickets:getMyTickets" @{ token = $su.value.token }
  if ($list.status -ne "success" -or @($list.value).Count -lt 1) { throw "ticket list failed" }
  $trackingId = $t.value.trackingId
  $detail = C query "supportTickets:getTicketByTrackingId" @{ trackingId = $trackingId; email = $su.value.user.email }
  if ($detail.status -ne "success" -or $detail.value.ticket.title -notmatch "Dashboard test") { throw "ticket lookup failed (tracking=$trackingId email=$($su.value.user.email) status=$($detail.status) err=$($detail.errorMessage))" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "SP1" "support: categories, ticket create, list, tracking lookup" $true

# ================= SETTINGS =================
Write-Host "=== SETTINGS ==="
$script:var.lastException = $null
try {
  $me = C query "auth:getSessionUser" @{ token = $script:var.tok }
  if ($me.status -ne "success" -or -not $me.value.email) { throw "session user failed" }
  $bad = C mutation "auth:changePassword" @{ token = $script:var.tok; currentPassword = "wrong"; newPassword = "NewPass123!" }
  if ($bad.status -ne "error") { throw "wrong current password should fail" }
  $bad2 = C mutation "auth:changePassword" @{ token = $script:var.tok; currentPassword = "DemoPassword123!"; newPassword = "short" }
  if ($bad2.status -ne "error") { throw "weak new password should fail" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "ST1" "settings: session info + password change validation" $true

# ================= CERTIFICATES =================
Write-Host "=== CERTIFICATES ==="
$script:var.lastException = $null
try {
  $certU = C mutation "auth:signup" @{ name = "Cert Dash $ts"; email = "certdash.$ts@zetagrow.com"; password = "CertPass123!" }
  if ($certU.status -ne "success") { throw "cert user signup failed" }
  $g = C mutation "users:grantProgramAccess" @{ token = $script:var.adminTok; userId = $certU.value.user.id; programId = $script:var.starterId; reason = "Dashboard suite" }
  if ($g.status -ne "success") { throw "program access grant failed" }
  $state = C query "learning:getCoursePlayerState" @{ token = $certU.value.token; programId = $script:var.starterId }
  if ($state.status -ne "success" -or $state.value.isEnrolled -ne $true) { throw "course player state failed" }
  $lessons = @($state.value.modules | ForEach-Object { $_.lessons })
  if ($lessons.Count -eq 0) { throw "no lessons in starter program" }
  foreach ($l in @($lessons)) {
    $r = C mutation "learning:toggleLessonComplete" @{ token = $certU.value.token; programId = $script:var.starterId; lessonId = $l._id }
    if ($r.status -ne "success") { throw "lesson toggle failed" }
  }
  $certs = C query "certificates:getUserCertificates" @{ token = $certU.value.token }
  if ($certs.status -ne "success" -or @($certs.value).Count -ne 1) { throw "certificate not issued after 100%" }
  $cert = $certs.value[0]
  $v = C query "certificates:verifyCertificate" @{ certificateId = $cert.certificateId }
  if ($v.status -ne "success" -or $v.value.isValid -ne $true -or $v.value.recipientName -ne "Cert Dash $ts") { throw "verification failed" }
  $bogus = C query "certificates:verifyCertificate" @{ certificateId = "BOGUS-NOPE-9999" }
  if ($bogus.status -ne "success" -or $bogus.value -ne $null) { throw "bogus cert should verify to null" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "CE1" "certificates: 100% course -> cert issued -> verifies; bogus cert rejected" $true

# ================= WORK & JOBS =================
Write-Host "=== WORK & JOBS ==="
$script:var.lastException = $null
try {
  $jobs = C query "jobs:getJobsWithEligibility" @{ token = $script:var.tok }
  if ($jobs.status -ne "success") { throw "job eligibility failed" }
  foreach ($j in @($jobs.value)) {
    if ($j.isEligible -ne $true -and $j.isEligible -ne $false) { throw "bad eligibility flag" }
    if ($j.missingRequirements -is [string]) { throw "missing requirements shape" }
  }
  if (@($jobs.value).Count -gt 0) {
    $jd = C query "jobs:getJobBySlug" @{ slug = $jobs.value[0].slug; token = $script:var.tok }
    if ($jd.status -ne "success" -or $jd.value.slug -ne $jobs.value[0].slug) { throw "job detail failed" }
    if ($jd.value.isEligible -ne $true -and $jd.value.isEligible -ne $false) { throw "job detail eligibility flag missing" }
  }
} catch { $script:var.lastException = $_.Exception.Message }
Check "W1" "work: job listings + eligibility flags + job detail page" $true

$script:var.lastException = $null
try {
  $apps = C query "applications:getUserApplications" @{ token = $script:var.tok }
  if ($apps.status -ne "success") { throw "applications query failed" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "W2" "work: my applications list loads" $true

# ================= WITHdrawals =================
Write-Host "=== WITHDRAWALS ==="
$script:var.lastException = $null
try {
  $w = C query "wallets:getUserWallet" @{ token = $script:var.tok }
  $pm = C query "payoutMethods:getMyPayoutMethods" @{ token = $script:var.tok }
  if ($pm.status -ne "success") { throw "payout methods failed" }
  $with = C query "withdrawals:getUserWithdrawals" @{ token = $script:var.tok }
  if ($with.status -ne "success") { throw "withdrawals query failed" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "WD1" "withdrawals: wallet, saved payout methods, withdrawal history load" $true

# ================= UNAUTHORIZED GUARDS =================
Write-Host "=== SECURITY GUARDS ==="
$script:var.lastException = $null
try {
  $r = C query "affiliates:getUserAffiliateStats" @{ token = "invalid-token-123" }
  if ($r.status -ne "error") { throw "invalid token should fail" }
  $r2 = C query "withdrawals:getAllWithdrawalsAdmin" @{ token = $script:var.tok }
  if ($r2.status -ne "error") { throw "user token must not access admin data" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "SEC1" "invalid token rejected + user cannot access admin endpoints" $true

Write-Host ""
$fail = @($results | Where-Object { $_ -like "FAIL*" })
Write-Host "=== SUMMARY ==="
Write-Host "TOTAL: $($results.Count)  PASSED: $($results.Count - $fail.Count)  FAILED: $($fail.Count)"
if ($fail.Count -gt 0) { Write-Host "--- FAILURES ---"; $fail | ForEach-Object { Write-Host $_ } } else { Write-Host "ALL TESTS PASSED" }