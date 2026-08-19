# chain-unlock-tests.ps1 — Complete chain/upline commission lifecycle
# Story: A unlocks an achievement level -> position -> starts earning % of B's (their referral's) commissions.
# Before unlock: no chain. After unlock: 20% of B's commission. Depth: upline only. Caps + multipliers enforced.
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

function Wallet($tok) { return (C query "wallets:getUserWallet" @{ token = $tok }).value.wallet }

$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

Write-Host "=== SETUP ==="
$script:var.lastException = $null
try {
  $script:var.adminTok = (C mutation "auth:login" @{ email = "admin@zetagrow.com"; password = "AdminPassword123!" }).value.token
  $progs = (C query "programs:getAllProgramsAdmin" @{ token = $script:var.adminTok }).value
  $script:var.progId = @($progs | Where-Object { $_.price -eq 2000 } | Select-Object -First 1)[0]._id
  $positions = (C query "positions:getAllPositions" @{ token = $script:var.adminTok }).value
  $script:var.posId = @($positions | Where-Object { $_.name -eq "Growth Lead" } | Select-Object -First 1)[0]._id
  if (-not $script:var.progId -or -not $script:var.posId) { throw "program/position missing" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "U0" "setup: admin login, ₹2000 program, Growth Lead position" $true

# Achievement that unlocks the chain level via LIVE METRICS (2 valid referrals)
$achId = (C mutation "achievements:createAchievement" @{
  token = $script:var.adminTok
  name = "Chain Tier Unlock $ts"
  slug = "chain-tier-unlock-$ts"
  description = "Refer 2 people to unlock the chain commission level."
  icon = "network"
  status = "active"
  sortOrder = 90
  conditionMode = "ALL"
  conditions = @(@{ metric = "valid_referrals"; operator = ">="; value = 2 })
  unlockPositionId = $script:var.posId
  notificationText = "You unlocked the Chain Commission level!"
}).value

# Signups
$suA = C mutation "auth:signup" @{ name = "Chain A $ts"; email = "cua.$ts@zetagrow.com"; password = "ChainPass123!" }
$script:var.tokA = $suA.value.token
$script:var.aId = $suA.value.user.id
$suB = C mutation "auth:signup" @{ name = "Chain B $ts"; email = "cub.$ts@zetagrow.com"; password = "ChainPass123!"; referralCode = $suA.value.user.referralCode }
$script:var.tokB = $suB.value.token
$script:var.bId = $suB.value.user.id
$suB2 = C mutation "auth:signup" @{ name = "Chain B2 $ts"; email = "cub2.$ts@zetagrow.com"; password = "ChainPass123!"; referralCode = $suA.value.user.referralCode }
$suC = C mutation "auth:signup" @{ name = "Chain C $ts"; email = "cuc.$ts@zetagrow.com"; password = "ChainPass123!"; referralCode = $suB.value.user.referralCode }
$script:var.tokC = $suC.value.token
$suC2 = C mutation "auth:signup" @{ name = "Chain C2 $ts"; email = "cuc2.$ts@zetagrow.com"; password = "ChainPass123!"; referralCode = $suB.value.user.referralCode }
$script:var.tokC2 = $suC2.value.token
$suC3 = C mutation "auth:signup" @{ name = "Chain C3 $ts"; email = "cuc3.$ts@zetagrow.com"; password = "ChainPass123!"; referralCode = $suC.value.user.referralCode }
$script:var.tokC3 = $suC3.value.token
$suC4 = C mutation "auth:signup" @{ name = "Chain C4 $ts"; email = "cuc4.$ts@zetagrow.com"; password = "ChainPass123!"; referralCode = $suB.value.user.referralCode }
$script:var.tokC4 = $suC4.value.token
$suC5 = C mutation "auth:signup" @{ name = "Chain C5 $ts"; email = "cuc5.$ts@zetagrow.com"; password = "ChainPass123!"; referralCode = $suB.value.user.referralCode }
$script:var.tokC5 = $suC5.value.token

# Chain settings ON (20% for Growth Lead)
$script:var.lastException = $null
try {
  $set = C mutation "settings:updateSetting" @{
    token = $script:var.adminTok
    key = "affiliate"
    value = @{
      enabled = $true
      commissionMethod = "lower_program_rule"
      defaultPercentage = 50
      holdingPeriodDays = 7
      minimumPurchaseAmount = 2000
      perSaleCap = 0
      dailyCommissionCap = 0
      monthlyCommissionCap = 0
      positionMultipliers = @{}
      chainEnabled = $true
      chainLevels = @{ $script:var.posId = 20 }
    }
    reason = "Test chain lifecycle"
  }
  if ($set.status -ne "success") { throw "settings update failed" }
  $cfg = (C query "settings:getSetting" @{ key = "affiliate" }).value
  if (-not $cfg.chainEnabled -or $cfg.chainLevels.($script:var.posId) -ne 20) { throw "settings not persisted" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "U1" "chain enabled with 20% on Growth Lead" $true

# ---- BEFORE UNLOCK ----
Write-Host "=== BEFORE UNLOCK (no position, no chain) ==="
$script:var.lastException = $null
try {
  $r = C mutation "affiliates:processPurchaseWithAffiliate" @{ token = $script:var.tokC; programId = $script:var.progId; paymentMethod = "upi" }
  if ($r.status -ne "success") { throw "C purchase failed" }
  $wB = Wallet $script:var.tokB
  $wA = Wallet $script:var.tokA
  $statsA = (C query "affiliates:getUserAffiliateStats" @{ token = $script:var.tokA }).value
  if ($wB.pendingBalance -ne 1000) { throw "B should have 1000 direct commission" }
  if ($wA.pendingBalance -ne 0) { throw "A must NOT earn before unlock" }
  if (@($statsA.chainSales).Count -ne 0) { throw "A must have no chain rows before unlock" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "U2" "B's sale before unlock: B gets ₹1000, A gets ₹0 (no position yet)" $true

# ---- AUTO UNLOCK VIA ACHIEVEMENT METRICS ----
Write-Host "=== ACHIEVEMENT UNLOCK (live metrics) ==="
$script:var.lastException = $null
try {
  $ev = C mutation "achievements:evaluateUserAchievements" @{ token = $script:var.tokA }
  if ($ev.status -ne "success") { throw "evaluate failed" }
  $new = @($ev.value.newlyUnlocked | Where-Object { $_._id -eq $achId })
  if ($new.Count -ne 1) { throw "achievement not auto-unlocked (A has 2 referrals: B + B2)" }
  $me = (C query "auth:getSessionUser" @{ token = $script:var.tokA }).value
  if ($me.position._id -ne $script:var.posId) { throw "position not assigned on unlock" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "U3" "A meets 2-referral metric -> achievement auto-unlocks -> position assigned" $true

# ---- AFTER UNLOCK ----
Write-Host "=== AFTER UNLOCK (chain active) ==="
$script:var.lastException = $null
try {
  $r = C mutation "affiliates:processPurchaseWithAffiliate" @{ token = $script:var.tokC2; programId = $script:var.progId; paymentMethod = "upi" }
  if ($r.status -ne "success") { throw "C2 purchase failed" }
  $wB = Wallet $script:var.tokB
  $wA = Wallet $script:var.tokA
  $statsA = (C query "affiliates:getUserAffiliateStats" @{ token = $script:var.tokA }).value
  if ($wB.pendingBalance -ne 2000) { throw "B pending should be 2000 (C + C2)" }
  if ($wA.pendingBalance -ne 200) { throw "A should have 200 chain (20% of B's 1000)" }
  if ($statsA.chainEarnings -ne 200 -or @($statsA.chainSales).Count -ne 1) { throw "A stats wrong" }
  $chainRow = $statsA.chainSales[0]
  if ($chainRow.kind -ne "chain" -or $chainRow.chainLevel -ne 1 -or $chainRow.commissionAmount -ne 200 -or $chainRow.baseCommissionAmount -ne 1000) { throw "chain row malformed" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "U4" "AFTER unlock: B gets ₹1000, A gets ₹200 chain (20% of B's commission)" $true

# ---- APPROVAL CASCADE ----
$script:var.lastException = $null
try {
  $adminSales = (C query "affiliates:getAllAffiliateSalesAdmin" @{ token = $script:var.adminTok }).value
  $bDirectC2 = @($adminSales | Where-Object { $_.referrerUserId -eq $script:var.bId -and $_.buyerUserId -eq $suC2.value.user.id } | Select-Object -First 1)[0]
  $r = C mutation "affiliates:updateCommissionStatus" @{ token = $script:var.adminTok; saleId = $bDirectC2._id; status = "available"; reason = "Test approve" }
  if ($r.status -ne "success") { throw "approve failed" }
  $wA = Wallet $script:var.tokA
  $chainRow = @((C query "affiliates:getAllAffiliateSalesAdmin" @{ token = $script:var.adminTok }).value | Where-Object { $_.parentSaleId -eq $bDirectC2._id })[0]
  if ($wA.availableBalance -ne 200 -or $wA.pendingBalance -ne 0) { throw "A wallet wrong after cascade" }
  if ($chainRow.status -ne "available") { throw "chain not cascaded to available" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "U5" "approving B's direct sale cascades A's chain to available (₹200)" $true

# ---- DEPTH: upline only (2-level max) ----
Write-Host "=== DEPTH CHECK (upline only) ==="
$script:var.lastException = $null
try {
  # Grant B the position too, then C3 (referred by C) buys.
  C mutation "achievements:adminGrantAchievement" @{ token = $script:var.adminTok; userId = $script:var.bId; achievementId = $achId; reason = "Test depth" } | Out-Null
  $r = C mutation "affiliates:processPurchaseWithAffiliate" @{ token = $script:var.tokC3; programId = $script:var.progId; paymentMethod = "upi" }
  if ($r.status -ne "success") { throw "C3 purchase failed" }
  $wC = Wallet $script:var.tokC
  $wB = Wallet $script:var.tokB
  $wA = Wallet $script:var.tokA
  $statsA = (C query "affiliates:getUserAffiliateStats" @{ token = $script:var.tokA }).value
  if ($wC.pendingBalance -ne 1000) { throw "C should have 1000 direct (actual=$($wC.pendingBalance))" }
  if ($wB.pendingBalance -ne 1200) { throw "B should have 1200 pending (1000 C + 200 chain, actual=$($wB.pendingBalance))" }
  if ($wA.pendingBalance -ne 0) { throw "A must NOT earn from C's sale (2 levels up)" }
  if (@($statsA.chainSales).Count -ne 1) { throw "A chain rows must stay 1" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "U6" "depth limit: A earns only from B's sales, NOT from C's (chain level 1 only)" $true

# ---- PER-SALE CAP + MULTIPLIER ----
Write-Host "=== CAPS & MULTIPLIERS ==="
$script:var.lastException = $null
try {
  C mutation "settings:updateSetting" @{ token = $script:var.adminTok; key = "affiliate"; value = @{ enabled = $true; commissionMethod = "lower_program_rule"; defaultPercentage = 50; holdingPeriodDays = 7; minimumPurchaseAmount = 2000; perSaleCap = 150; dailyCommissionCap = 0; monthlyCommissionCap = 0; positionMultipliers = @{}; chainEnabled = $true; chainLevels = @{ $script:var.posId = 20 } }; reason = "Test per-sale cap" } | Out-Null
  $cfg = (C query "settings:getSetting" @{ key = "affiliate" }).value
  if ($cfg.perSaleCap -ne 150) { throw "perSaleCap not persisted: $($cfg.perSaleCap)" }
  $r = C mutation "affiliates:processPurchaseWithAffiliate" @{ token = $script:var.tokC4; programId = $script:var.progId; paymentMethod = "upi" }
  if ($r.status -ne "success") { throw "C4 purchase failed" }
  $wA = Wallet $script:var.tokA
  $wB = Wallet $script:var.tokB
  if ($wA.pendingBalance -ne 30) { throw "chain should be 20% of B's capped 150 = 30 (actual=$($wA.pendingBalance))" }
  if ($wB.pendingBalance -ne 1350) { throw "B direct capped to 150 (actual=$($wB.pendingBalance))" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "U7" "per-sale cap: B's direct capped ₹150 -> A chain = 20% of that = ₹30" $true

$script:var.lastException = $null
try {
  C mutation "settings:updateSetting" @{ token = $script:var.adminTok; key = "affiliate"; value = @{ enabled = $true; commissionMethod = "lower_program_rule"; defaultPercentage = 50; holdingPeriodDays = 7; minimumPurchaseAmount = 2000; perSaleCap = 150; dailyCommissionCap = 0; monthlyCommissionCap = 0; positionMultipliers = @{ $script:var.posId = 2 }; chainEnabled = $true; chainLevels = @{ $script:var.posId = 20 } }; reason = "Test multiplier" } | Out-Null
  $r = C mutation "affiliates:processPurchaseWithAffiliate" @{ token = $script:var.tokC5; programId = $script:var.progId; paymentMethod = "upi" }
  if ($r.status -ne "success") { throw "C5 purchase failed: $($r.errorMessage)" }
  $wA = Wallet $script:var.tokA
  $wB = Wallet $script:var.tokB
  if ($wA.pendingBalance -ne 90) { throw "chain should be 20% of B's 300 = 60 (actual=$($wA.pendingBalance))" }
  if ($wB.pendingBalance -ne 1650) { throw "B direct should be 300 with 2x multiplier (actual=$($wB.pendingBalance))" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "U8" "position multiplier 2x: B's cap 300 -> A chain ₹60 (pending 90)" $true

# ---- DAILY CAP BLOCKS MANUAL CHAIN APPROVAL ----
$script:var.lastException = $null
try {
  C mutation "settings:updateSetting" @{ token = $script:var.adminTok; key = "affiliate"; value = @{ enabled = $true; commissionMethod = "lower_program_rule"; defaultPercentage = 50; holdingPeriodDays = 7; minimumPurchaseAmount = 2000; perSaleCap = 150; dailyCommissionCap = 180; monthlyCommissionCap = 0; positionMultipliers = @{}; chainEnabled = $true; chainLevels = @{ $script:var.posId = 20 } }; reason = "Test daily cap" } | Out-Null
  $cfg = (C query "settings:getSetting" @{ key = "affiliate" }).value
  if ($cfg.dailyCommissionCap -ne 180) { throw "dailyCommissionCap not persisted: $($cfg.dailyCommissionCap)" }
  $adminSales = (C query "affiliates:getAllAffiliateSalesAdmin" @{ token = $script:var.adminTok }).value
  $aChainC4 = @($adminSales | Where-Object { $_.kind -eq "chain" -and $_.referrerUserId -eq $script:var.aId -and $_.buyerUserId -eq $suC4.value.user.id } | Select-Object -First 1)[0]
  $r = C mutation "affiliates:updateCommissionStatus" @{ token = $script:var.adminTok; saleId = $aChainC4._id; status = "available"; reason = "Should hit cap" }
  if ($r.status -ne "error") { throw "daily cap should block chain approval (status=$($r.status) err=$($r.errorMessage))" }
  $still = @((C query "affiliates:getAllAffiliateSalesAdmin" @{ token = $script:var.adminTok }).value | Where-Object { $_._id -eq $aChainC4._id })[0]
  if ($still.status -ne "pending") { throw "chain status must stay pending after blocked approval" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "U9" "daily cap blocks manual chain approval; row stays pending" $true

# ---- REJECT CASCADE ----
$script:var.lastException = $null
try {
  C mutation "settings:updateSetting" @{ token = $script:var.adminTok; key = "affiliate"; value = @{ enabled = $true; commissionMethod = "lower_program_rule"; defaultPercentage = 50; holdingPeriodDays = 7; minimumPurchaseAmount = 2000; perSaleCap = 0; dailyCommissionCap = 0; monthlyCommissionCap = 0; positionMultipliers = @{}; chainEnabled = $true; chainLevels = @{ $script:var.posId = 20 } }; reason = "Restore for reject test" } | Out-Null
  $adminSales = (C query "affiliates:getAllAffiliateSalesAdmin" @{ token = $script:var.adminTok }).value
  $bDirectC5 = @($adminSales | Where-Object { $_.referrerUserId -eq $script:var.bId -and $_.buyerUserId -eq $suC5.value.user.id } | Select-Object -First 1)[0]
  $r = C mutation "affiliates:updateCommissionStatus" @{ token = $script:var.adminTok; saleId = $bDirectC5._id; status = "rejected"; reason = "Reject parent" }
  if ($r.status -ne "success") { throw "reject parent failed" }
  $wA = Wallet $script:var.tokA
  if ($wA.pendingBalance -ne 30) { throw "A pending should drop to 30 (C4 chain only, actual=$($wA.pendingBalance))" }
  $chainC5 = @((C query "affiliates:getAllAffiliateSalesAdmin" @{ token = $script:var.adminTok }).value | Where-Object { $_.kind -eq "chain" -and $_.parentSaleId -eq $bDirectC5._id })[0]
  if ($chainC5.status -ne "rejected") { throw "chain not rejected with parent" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "U10" "rejecting B's direct sale auto-rejects A's chain (pending ₹30 left for C4 chain)" $true

# Approve C4's direct (cascade bypasses cap) -> A chain 150 available
$script:var.lastException = $null
try {
  $adminSales = (C query "affiliates:getAllAffiliateSalesAdmin" @{ token = $script:var.adminTok }).value
  $bDirectC4 = @($adminSales | Where-Object { $_.referrerUserId -eq $script:var.bId -and $_.buyerUserId -eq $suC4.value.user.id } | Select-Object -First 1)[0]
  $r = C mutation "affiliates:updateCommissionStatus" @{ token = $script:var.adminTok; saleId = $bDirectC4._id; status = "available"; reason = "Approve C4 parent" }
  if ($r.status -ne "success") { throw "approve C4 parent failed" }
  $wA = Wallet $script:var.tokA
  if ($wA.availableBalance -ne 230 -or $wA.pendingBalance -ne 0) { throw "A wallet wrong (avail=$($wA.availableBalance) pending=$($wA.pendingBalance))" }
  $txns = (C query "wallets:getUserWallet" @{ token = $script:var.tokA }).value.transactions
  $chainTxns = @($txns | Where-Object { $_.type -eq "CHAIN_COMMISSION" })
  if ($chainTxns.Count -lt 2) { throw "expected 2 chain ledger entries" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "U11" "approving C4 parent cascades A's chain ₹30 to available + ledger entries" $true

# ---- NOTIFICATIONS ----
$script:var.lastException = $null
try {
  $notifs = (C query "notifications:getUserNotifications" @{ token = $script:var.tokA }).value.notifications
  $chainNotifs = @($notifs | Where-Object { $_.type -eq "affiliate" -and $_.title -eq "Chain Commission Earned!" })
  if ($chainNotifs.Count -lt 3) { throw "expected chain notification for each chain earning" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "U12" "A received Chain Commission notification for every chain earning" $true

# ---- AUDIT ----
$script:var.lastException = $null
try {
  $aud = (C query "auditLogs:getAuditLogs" @{ token = $script:var.adminTok; entityType = "affiliateSales" }).value
  if (@($aud | Where-Object { $_.action -eq "UPDATE_COMMISSION_STATUS" }).Count -lt 5) { throw "audit trail incomplete" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "U13" "all commission status changes recorded in audit log" $true

Write-Host ""
$fail = @($results | Where-Object { $_ -like "FAIL*" })
Write-Host "=== SUMMARY ==="
Write-Host "TOTAL: $($results.Count)  PASSED: $($results.Count - $fail.Count)  FAILED: $($fail.Count)"
if ($fail.Count -gt 0) { Write-Host "--- FAILURES ---"; $fail | ForEach-Object { Write-Host $_ } } else { Write-Host "ALL TESTS PASSED" }