# chain-commission-tests.ps1 — Chain / Upline commission engine
# Story: A (achievement → position level) refers B. B refers C. C buys ₹2000.
#        B earns ₹1000 direct. A earns 20% of B's commission = ₹200 (chain level 1).
$ErrorActionPreference = "Stop"
$base = "https://terrific-dove-836.convex.cloud/api"

$results = New-Object System.Collections.ArrayList

function C($kind, $path, $a) {
  $b = @{ path = $path; args = $a; format = "json" } | ConvertTo-Json -Depth 12
  return Invoke-RestMethod -Uri "$base/$(if ($path -eq 'auth:login') { 'action' } else { $kind })" -Method Post -ContentType "application/json" -Body $b -UseBasicParsing -TimeoutSec 60
}

function Check($name, $cond, $detail) {
  $r = @{ name = $name; pass = [bool]$cond; detail = $detail }
  [void]$results.Add($r)
  if ($r.pass) { Write-Host "PASS | $name" } else { Write-Host "FAIL | $name | $detail" }
}

function Wallet($tok) {
  return (C query "wallets:getUserWallet" @{ token = $tok }).value.wallet
}

$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

Write-Host "=== SETUP ==="
$script:var = @{}
$script:var.adminTok = (C mutation "auth:login" @{ email = "admin@zetagrow.com"; password = "AdminPassword123!" }).value.token

# Program: Starter Digital Skills ₹2000
$progs = (C query "programs:getAllProgramsAdmin" @{ token = $script:var.adminTok }).value
$script:var.progId = @($progs | Where-Object { $_.price -eq 2000 } | Select-Object -First 1)[0]._id
if (-not $script:var.progId) { throw "₹2000 program not found" }

# Position: Growth Lead
$positions = (C query "positions:getAllPositions" @{ token = $script:var.adminTok }).value
$script:var.posId = @($positions | Where-Object { $_.name -eq "Growth Lead" } | Select-Object -First 1)[0]._id
if (-not $script:var.posId) { throw "Growth Lead position not found" }

# Achievement that unlocks the position (the "chain level unlock")
$achId = (C mutation "achievements:createAchievement" @{
  token = $script:var.adminTok
  name = "Chain Unlock $ts"
  slug = "chain-unlock-$ts"
  description = "Unlocks chain commission level"
  icon = "network"
  status = "active"
  sortOrder = 99
  conditionMode = "ALL"
  conditions = @(@{ metric = "total_earnings"; operator = ">="; value = 1 })
  unlockPositionId = $script:var.posId
  notificationText = "You unlocked the Chain Commission level!"
}).value

# Signups: A (no ref), B (ref A), C (ref B), D (ref B), E (ref B), F (ref B),
#          H (no ref, no position), I (ref H), J (ref I), K (no ref), L (ref K), M (ref L)
$suA = C mutation "auth:signup" @{ name = "Chain A $ts"; email = "chaina.$ts@zetagrow.com"; password = "ChainPass123!" }
$script:var.tokA = $suA.value.token
$suB = C mutation "auth:signup" @{ name = "Chain B $ts"; email = "chainb.$ts@zetagrow.com"; password = "ChainPass123!"; referralCode = $suA.value.user.referralCode }
$script:var.tokB = $suB.value.token
$script:var.bId = $suB.value.user.id
$suC = C mutation "auth:signup" @{ name = "Chain C $ts"; email = "chainc.$ts@zetagrow.com"; password = "ChainPass123!"; referralCode = $suB.value.user.referralCode }
$script:var.tokC = $suC.value.token
$suD = C mutation "auth:signup" @{ name = "Chain D $ts"; email = "chaind.$ts@zetagrow.com"; password = "ChainPass123!"; referralCode = $suB.value.user.referralCode }
$script:var.tokD = $suD.value.token
$suE = C mutation "auth:signup" @{ name = "Chain E $ts"; email = "chaine.$ts@zetagrow.com"; password = "ChainPass123!"; referralCode = $suB.value.user.referralCode }
$script:var.tokE = $suE.value.token
$suF = C mutation "auth:signup" @{ name = "Chain F $ts"; email = "chainf.$ts@zetagrow.com"; password = "ChainPass123!"; referralCode = $suB.value.user.referralCode }
$script:var.tokF = $suF.value.token
$suH = C mutation "auth:signup" @{ name = "Chain H $ts"; email = "chainh.$ts@zetagrow.com"; password = "ChainPass123!" }
$script:var.tokH = $suH.value.token
$suI = C mutation "auth:signup" @{ name = "Chain I $ts"; email = "chaini.$ts@zetagrow.com"; password = "ChainPass123!"; referralCode = $suH.value.user.referralCode }
$script:var.tokI = $suI.value.token
$suJ = C mutation "auth:signup" @{ name = "Chain J $ts"; email = "chainj.$ts@zetagrow.com"; password = "ChainPass123!"; referralCode = $suI.value.user.referralCode }
$script:var.tokJ = $suJ.value.token
$suK = C mutation "auth:signup" @{ name = "Chain K $ts"; email = "chaink.$ts@zetagrow.com"; password = "ChainPass123!" }
$script:var.tokK = $suK.value.token
$suL = C mutation "auth:signup" @{ name = "Chain L $ts"; email = "chainl.$ts@zetagrow.com"; password = "ChainPass123!"; referralCode = $suK.value.user.referralCode }
$script:var.tokL = $suL.value.token
$suM = C mutation "auth:signup" @{ name = "Chain M $ts"; email = "chainm.$ts@zetagrow.com"; password = "ChainPass123!"; referralCode = $suL.value.user.referralCode }
$script:var.tokM = $suM.value.token

# A unlocks the achievement → gets Growth Lead position
C mutation "achievements:adminGrantAchievement" @{ token = $script:var.adminTok; userId = $suA.value.user.id; achievementId = $achId; reason = "Test" } | Out-Null
$script:var.tokK = $suK.value.token

# Enable chain: Growth Lead earns 20% of downline's commission
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
  reason = "Test chain enable"
}

$cfg = (C query "settings:getSetting" @{ key = "affiliate" }).value
Check "C1 chain settings persisted (enabled + 20% on Growth Lead)" `
  ($set.status -eq "success" -and $cfg.chainEnabled -and $cfg.chainLevels.($script:var.posId) -eq 20) `
  "chainEnabled=$($cfg.chainEnabled) pct=$($cfg.chainLevels.($script:var.posId))"

$meA = (C query "auth:getSessionUser" @{ token = $script:var.tokA }).value
Check "C2 achievement unlocked position for A" ($meA.position.name -eq "Growth Lead") "position=$($meA.position.name)"

# ---------- THE USER STORY ----------
Write-Host "=== THE STORY: A invests ₹2000, unlocks chain, B sells to C ==="
$buyA = C mutation "affiliates:processPurchaseWithAffiliate" @{ token = $script:var.tokA; programId = $script:var.progId; paymentMethod = "upi" }
Check "C3 A buys ₹2000 program" ($buyA.status -eq "success") "status=$($buyA.status)"
Check "C3b A has no commission from own purchase" ((Wallet $script:var.tokA).pendingBalance -eq 0) "pending=$((Wallet $script:var.tokA).pendingBalance)"

$buyB = C mutation "affiliates:processPurchaseWithAffiliate" @{ token = $script:var.tokB; programId = $script:var.progId; paymentMethod = "upi" }
Check "C4 B buys ₹2000 (referred by A) → A gets ₹1000 direct" ($buyB.status -eq "success" -and (Wallet $script:var.tokA).pendingBalance -eq 1000) "pending=$((Wallet $script:var.tokA).pendingBalance)"

$buyC = C mutation "affiliates:processPurchaseWithAffiliate" @{ token = $script:var.tokC; programId = $script:var.progId; paymentMethod = "upi" }
$wA = Wallet $script:var.tokA
$wB = Wallet $script:var.tokB
Check "C5 C buys ₹2000 (referred by B) → B gets ₹1000, A gets ₹200 chain" `
  ($buyC.status -eq "success" -and $wB.pendingBalance -eq 1000 -and $wA.pendingBalance -eq 1200) `
  "B pending=$($wB.pendingBalance) A pending=$($wA.pendingBalance)"

$statsA = (C query "affiliates:getUserAffiliateStats" @{ token = $script:var.tokA }).value
Check "C6 A stats: 1 direct sale + ₹200 chain" `
  ($statsA.totalSalesCount -eq 1 -and $statsA.chainEarnings -eq 200 -and $statsA.chainSales.Count -eq 1) `
  "direct=$($statsA.totalSalesCount) chainEarn=$($statsA.chainEarnings) chainSales=$($statsA.chainSales.Count)"

$chainRow = $statsA.chainSales[0]
$adminSales = (C query "affiliates:getAllAffiliateSalesAdmin" @{ token = $script:var.adminTok }).value
$bDirect = @($adminSales | Where-Object { $_.referrerUserId -eq $script:var.bId -and $_.buyerUserId -eq $suC.value.user.id } | Select-Object -First 1)[0]
Check "C7 chain row well-formed (kind/parent/amount/base)" `
  ($chainRow.kind -eq "chain" -and $chainRow.chainLevel -eq 1 -and $chainRow.commissionAmount -eq 200 -and $chainRow.baseCommissionAmount -eq 1000 -and $chainRow.parentSaleId -eq $bDirect._id) `
  "kind=$($chainRow.kind) amt=$($chainRow.commissionAmount) base=$($chainRow.baseCommissionAmount) parent=$($chainRow.parentSaleId)"

# ---------- APPROVAL CASCADE ----------
Write-Host "=== APPROVAL & REJECTION CASCADE ==="
$aDirectSale = @($adminSales | Where-Object { $_.referrerUserId -eq $suA.value.user.id -and $_.kind -ne "chain" } | Select-Object -First 1)[0]
C mutation "affiliates:updateCommissionStatus" @{ token = $script:var.adminTok; saleId = $aDirectSale._id; status = "available"; reason = "Test approve A direct" } | Out-Null
$wA2 = Wallet $script:var.tokA
Check "C8 A direct approved → available 1000, pending 200 (chain)" ($wA2.availableBalance -eq 1000 -and $wA2.pendingBalance -eq 200) "avail=$($wA2.availableBalance) pending=$($wA2.pendingBalance)"

C mutation "affiliates:updateCommissionStatus" @{ token = $script:var.adminTok; saleId = $bDirect._id; status = "available"; reason = "Test approve B direct" } | Out-Null
$wA3 = Wallet $script:var.tokA
$wB2 = Wallet $script:var.tokB
$chainAfter = @((C query "affiliates:getAllAffiliateSalesAdmin" @{ token = $script:var.adminTok }).value | Where-Object { $_._id -eq $chainRow._id })[0]
Check "C9 B approved → cascade credits A chain ₹200" `
  ($wA3.availableBalance -eq 1200 -and $wA3.pendingBalance -eq 0 -and $wB2.availableBalance -eq 1000 -and $chainAfter.status -eq "available") `
  "A avail=$($wA3.availableBalance) A pending=$($wA3.pendingBalance) chainStatus=$($chainAfter.status)"

$txnsA = (C query "wallets:getUserWallet" @{ token = $script:var.tokA }).value.transactions
$chainTxn = @($txnsA | Where-Object { $_.type -eq "CHAIN_COMMISSION" } | Select-Object -First 1)[0]
Check "C10 A got CHAIN_COMMISSION ledger entry of ₹200" ($chainTxn -and $chainTxn.amount -eq 200) "type=$($chainTxn.type) amt=$($chainTxn.amount)"

# Reject cascade
$buyD = C mutation "affiliates:processPurchaseWithAffiliate" @{ token = $script:var.tokD; programId = $script:var.progId; paymentMethod = "upi" }
$wA4 = Wallet $script:var.tokA
$wB4 = Wallet $script:var.tokB
Check "C11 D buys (ref B) → B +1000, A +200 chain" ($buyD.status -eq "success" -and $wB4.pendingBalance -eq 1000 -and $wA4.pendingBalance -eq 200) "B pending=$($wB4.pendingBalance) A pending=$($wA4.pendingBalance)"

$adminSales2 = (C query "affiliates:getAllAffiliateSalesAdmin" @{ token = $script:var.adminTok }).value
$bDirectD = @($adminSales2 | Where-Object { $_.referrerUserId -eq $script:var.bId -and $_.buyerUserId -eq $suD.value.user.id } | Select-Object -First 1)[0]
C mutation "affiliates:updateCommissionStatus" @{ token = $script:var.adminTok; saleId = $bDirectD._id; status = "rejected"; reason = "Test reject B's sale to D" } | Out-Null
$wA5 = Wallet $script:var.tokA
$wB3 = Wallet $script:var.tokB
$chainD = @((C query "affiliates:getAllAffiliateSalesAdmin" @{ token = $script:var.adminTok }).value | Where-Object { $_.kind -eq "chain" -and $_.parentSaleId -eq $bDirectD._id })[0]
Check "C12 rejecting B's sale auto-rejects A's chain (pending back to 0)" `
  ($wA5.pendingBalance -eq 0 -and $wB3.pendingBalance -eq 0 -and $chainD.status -eq "rejected") `
  "A pending=$($wA5.pendingBalance) B pending=$($wB3.pendingBalance) chainStatus=$($chainD.status)"

# Double-process guard on chain row
$dup = C mutation "affiliates:updateCommissionStatus" @{ token = $script:var.adminTok; saleId = $chainRow._id; status = "rejected"; reason = "Should fail" }
Check "C13 chain row cannot be processed twice" ($dup.status -eq "error") "status=$($dup.status)"

# ---------- GATING ----------
Write-Host "=== GATING: disabled chain & no position ==="
$buyE = C mutation "affiliates:processPurchaseWithAffiliate" @{ token = $script:var.tokE; programId = $script:var.progId; paymentMethod = "upi" }
$wA6 = Wallet $script:var.tokA
Check "C14 E buys (ref B) → chain still active: A +200" ($buyE.status -eq "success" -and $wA6.pendingBalance -eq 200) "A pending=$($wA6.pendingBalance)"

C mutation "settings:updateSetting" @{ token = $script:var.adminTok; key = "affiliate"; value = @{ enabled = $true; commissionMethod = "lower_program_rule"; defaultPercentage = 50; holdingPeriodDays = 7; minimumPurchaseAmount = 2000; perSaleCap = 0; dailyCommissionCap = 0; monthlyCommissionCap = 0; positionMultipliers = @{}; chainEnabled = $false; chainLevels = @{ $script:var.posId = 20 } }; reason = "Test chain disable" } | Out-Null
$buyF = C mutation "affiliates:processPurchaseWithAffiliate" @{ token = $script:var.tokF; programId = $script:var.progId; paymentMethod = "upi" }
$wA7 = Wallet $script:var.tokA
$statsA2 = (C query "affiliates:getUserAffiliateStats" @{ token = $script:var.tokA }).value
Check "C15 chain disabled → F buys, A gets NO new chain (pending stays 200)" `
  ($buyF.status -eq "success" -and $wA7.pendingBalance -eq 200 -and $statsA2.chainSales.Count -eq 3) `
  "A pending=$($wA7.pendingBalance) chainRows=$($statsA2.chainSales.Count)"

C mutation "settings:updateSetting" @{ token = $script:var.adminTok; key = "affiliate"; value = @{ enabled = $true; commissionMethod = "lower_program_rule"; defaultPercentage = 50; holdingPeriodDays = 7; minimumPurchaseAmount = 2000; perSaleCap = 0; dailyCommissionCap = 0; monthlyCommissionCap = 0; positionMultipliers = @{}; chainEnabled = $true; chainLevels = @{ $script:var.posId = 20 } }; reason = "Test chain re-enable" } | Out-Null

$buyJ = C mutation "affiliates:processPurchaseWithAffiliate" @{ token = $script:var.tokJ; programId = $script:var.progId; paymentMethod = "upi" }
$statsH = (C query "affiliates:getUserAffiliateStats" @{ token = $script:var.tokH }).value
$statsI = (C query "affiliates:getUserAffiliateStats" @{ token = $script:var.tokI }).value
Check "C16 upline without position gets no chain (I gets ₹1000, H ₹0)" `
  ($buyJ.status -eq "success" -and $statsI.pendingCommissions -eq 1000 -and $statsH.chainEarnings -eq 0 -and $statsH.chainSales.Count -eq 0) `
  "I pending=$($statsI.pendingCommissions) H chain=$($statsH.chainEarnings)"

# ---------- NOTIFICATION ----------
Write-Host "=== NOTIFICATIONS ==="
$notifs = (C query "notifications:getUserNotifications" @{ token = $script:var.tokA }).value.notifications
$chainNotif = @($notifs | Where-Object { $_.type -eq "affiliate" -and $_.title -eq "Chain Commission Earned!" } | Select-Object -First 1)[0]
Check "C17 A received Chain Commission notification" ($chainNotif -and $chainNotif.message -like "*200*" -and $chainNotif.message -like "*from*") "title=$($chainNotif.title)"

# ---------- SUMMARY ----------
Write-Host ""
Write-Host "=== SUMMARY ==="
$passed = @($results | Where-Object { $_.pass }).Count
$failed = @($results | Where-Object { -not $_.pass }).Count
Write-Host "TOTAL: $($results.Count)  PASSED: $passed  FAILED: $failed"
if ($failed -gt 0) {
  @($results | Where-Object { -not $_.pass }) | ForEach-Object { Write-Host "FAIL | $($_.name) | $($_.detail)" }
  exit 1
} else {
  Write-Host "ALL TESTS PASSED"
  exit 0
}