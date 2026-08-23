# wallet-flow-tests.ps1 — Full wallet lifecycle: job -> payout -> withdrawal + affiliate commission
$ErrorActionPreference = "Stop"
$base = "https://terrific-dove-836.convex.cloud/api"

$results = New-Object System.Collections.ArrayList
$script:var = @{}

function C($kind, $path, $a) {
  $b = @{ path = $path; args = $a; format = "json" } | ConvertTo-Json -Depth 12
  return Invoke-RestMethod -Uri "$base/$(if ($path -eq 'auth:login') { 'action' } else { $kind })" -Method Post -ContentType "application/json" -Body $b -UseBasicParsing -TimeoutSec 60
}

function Check($name, $cond, $detail) {
  $r = @{ name = $name; pass = [bool]$cond; detail = $detail }
  [void]$results.Add($r)
  if ($r.pass) { Write-Host "PASS | $name" } else { Write-Host "FAIL | $name | $detail" }
}

function Login($email, $pass) {
  return C "mutation" "auth:login" @{ email = $email; password = $pass }
}

function GetWallet($tok) {
  return C "query" "wallets:getUserWallet" @{ token = $tok }
}

function MakeCv($tok) {
  return C "mutation" "cvProfiles:upsertCvProfile" @{
    token = $tok
    overview = "A dedicated professional with proven skills and real work experience for the task."
    experience = @(@{ role = "Freelancer"; company = "TestCo"; startDate = "2022-01"; endDate = "2023-01"; current = $false; description = "Delivered projects" })
    education = @(@{ institution = "Test Univ"; degree = "B.Tech"; field = "CS"; status = "graduated"; startYear = "2017"; endYear = "2021" })
    technicalSkills = @("Design", "Research", "Writing")
    softSkills = @("Communication")
  }
}

$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

Write-Host "=== SETUP ==="
$script:var.adminTok = (Login "admin@zetagrow.com" "AdminPassword123!").value.token
$wdSettings = (C "query" "settings:getSetting" @{ key = "withdrawals" }).value
$script:var.feePct = $wdSettings.feePercentage
$script:var.fixedFee = $wdSettings.fixedFee
$script:var.minW = $wdSettings.minimumWithdrawal
Write-Host "withdrawal settings: fee=$($script:var.feePct)% fixed=$($script:var.fixedFee) min=$($script:var.minW)"

$programs = C "query" "programs:getAllProgramsAdmin" @{ token = $script:var.adminTok }
$script:var.programId = $programs.value[0]._id
$script:var.programPrice = $programs.value[0].price

# ---------- FULL JOB LIFECYCLE ----------
Write-Host "=== JOB LIFECYCLE: APPLY -> ACCEPT -> WORK -> REVIEW -> COMPLETE -> PAYOUT ==="
$job = C "mutation" "jobs:createJob" @{
  token = $script:var.adminTok
  title = "Lifecycle Gig $ts"
  slug = "lifecycle-gig-$ts"
  shortDescription = "End to end wallet lifecycle"
  description = "Complete the deliverable to be paid."
  category = "Design"
  skills = @("design")
  requirements = @("none")
  payment = 5000
  paymentType = "fixed"
  workType = "remote"
  difficulty = "intermediate"
  estimatedDuration = "2 weeks"
  deadline = "2026-12-31"
  openings = 3
  status = "published"
  applicationQuestions = @("Why you?", "Portfolio link?")
}
$script:var.jobId = $job.value
Check "L0 admin posts job opportunity" ($job.status -eq "success") "status=$($job.status) job=$($script:var.jobId)"

# Two workers sign up + complete CV + apply
$w1 = C "mutation" "auth:signup" @{ testMode = $true;  name = "Worker One $ts"; email = "worker1.$ts@zetagrow.com"; password = "WorkerPass123!" }
$w2 = C "mutation" "auth:signup" @{ testMode = $true;  name = "Worker Two $ts"; email = "worker2.$ts@zetagrow.com"; password = "WorkerPass123!" }
$script:var.w1Tok = $w1.value.token
$script:var.w2Tok = $w2.value.token
MakeCv $script:var.w1Tok | Out-Null
MakeCv $script:var.w2Tok | Out-Null
$u1 = C "query" "auth:getSessionUser" @{ token = $script:var.w1Tok }
$u2 = C "query" "auth:getSessionUser" @{ token = $script:var.w2Tok }
$script:var.w1Id = $u1.value._id
$script:var.w2Id = $u2.value._id

$app1 = C "mutation" "applications:submitApplication" @{
  token = $script:var.w1Tok
  jobId = $script:var.jobId
  answers = @(@{ question = "Why you?"; answer = "I deliver" }, @{ question = "Portfolio link?"; answer = "https://portfolio.example.com" })
  coverNote = "Ready"
}
$app2 = C "mutation" "applications:submitApplication" @{
  token = $script:var.w2Tok
  jobId = $script:var.jobId
  answers = @(@{ question = "Why you?"; answer = "I deliver too" }, @{ question = "Portfolio link?"; answer = "https://portfolio2.example.com" })
  coverNote = "Ready too"
}
$script:var.app1Id = $app1.value
$script:var.app2Id = $app2.value
Check "L1 multiple users apply to the job" ($app1.status -eq "success" -and $app2.status -eq "success") "a1=$($app1.status) a2=$($app2.status)"

# Worker tries to submit work before being accepted
$early = C "mutation" "applications:submitWorkDeliverable" @{
  token = $script:var.w1Tok
  applicationId = $script:var.app1Id
  submissionWorkUrl = "https://drive.google.com/work"
  submissionNotes = "Early submit"
}
Check "L2 work submission blocked before acceptance" ($early.status -eq "error") "status=$($early.status)"

# Admin verifies CVs and accepts BOTH
foreach ($pair in @(@("worker1.$ts@zetagrow.com", $script:var.w1Id), @("worker2.$ts@zetagrow.com", $script:var.w2Id))) {
  C "mutation" "users:updateUserCvStatus" @{ token = $script:var.adminTok; userId = $pair[1]; cvStatus = "verified"; remarks = "OK" } | Out-Null
}
$acc1 = C "mutation" "applications:updateApplicationStatus" @{ token = $script:var.adminTok; applicationId = $script:var.app1Id; status = "accepted"; adminNotes = "Welcome W1" }
$acc2 = C "mutation" "applications:updateApplicationStatus" @{ token = $script:var.adminTok; applicationId = $script:var.app2Id; status = "accepted"; adminNotes = "Welcome W2" }
Check "L3 admin accepts selected applicants" ($acc1.status -eq "success" -and $acc2.status -eq "success") "a1=$($acc1.status) a2=$($acc2.status)"

# Admin gives work instructions (in_progress + adminNotes)
$inst = C "mutation" "applications:updateApplicationStatus" @{
  token = $script:var.adminTok
  applicationId = $script:var.app1Id
  status = "in_progress"
  adminNotes = "Use the brand kit in the shared drive. Submit 3 concepts by Friday."
}
Check "L4 admin provides work instructions" ($inst.status -eq "success") "status=$($inst.status)"

$w1Apps = C "query" "applications:getUserApplications" @{ token = $script:var.w1Tok }
$w1App = @($w1Apps.value | Where-Object { $_._id -eq $script:var.app1Id } | Select-Object -First 1)[0]
$instNotif = C "query" "notifications:getUserNotifications" @{ token = $script:var.w1Tok }
$workNote = @($instNotif.value.notifications | Where-Object { $_.title -like "Work Started*" } | Select-Object -First 1)[0]
Check "L5 instructions delivered via notification" `
  ($w1App.status -eq "in_progress" -and $workNote -and $workNote.message -like "*brand kit*") `
  "appStatus=$($w1App.status) msg=$($workNote.message)"

# Worker 1 submits deliverable
$sub1 = C "mutation" "applications:submitWorkDeliverable" @{
  token = $script:var.w1Tok
  applicationId = $script:var.app1Id
  submissionWorkUrl = "https://drive.google.com/concepts-w1"
  submissionNotes = "3 concepts ready"
}
Check "L6 worker submits deliverable" ($sub1.status -eq "success") "status=$($sub1.status)"

$w1App2 = @((C "query" "applications:getUserApplications" @{ token = $script:var.w1Tok }).value | Where-Object { $_._id -eq $script:var.app1Id } | Select-Object -First 1)[0]
Check "L7 application moved to under_review with submission link" `
  ($w1App2.status -eq "under_review" -and $w1App2.submissionWorkUrl -like "https://drive.google.com/concepts-w1") `
  "status=$($w1App2.status) url=$($w1App2.submissionWorkUrl)"

# Worker 1 cannot resubmit while under review
$dupSub = C "mutation" "applications:submitWorkDeliverable" @{
  token = $script:var.w1Tok
  applicationId = $script:var.app1Id
  submissionWorkUrl = "https://drive.google.com/concepts-w1-v2"
  submissionNotes = "Resubmit attempt"
}
Check "L8 resubmit blocked while under review" ($dupSub.status -eq "error") "status=$($dupSub.status)"

# Admin requests revision
$rev = C "mutation" "applications:updateApplicationStatus" @{
  token = $script:var.adminTok
  applicationId = $script:var.app1Id
  status = "revision_required"
  adminNotes = "Concept 2 needs more polish, increase contrast."
}
Check "L9 admin requests revision with feedback" ($rev.status -eq "success") "status=$($rev.status)"

# Worker 1 resubmits
$resub = C "mutation" "applications:submitWorkDeliverable" @{
  token = $script:var.w1Tok
  applicationId = $script:var.app1Id
  submissionWorkUrl = "https://drive.google.com/concepts-w1-final"
  submissionNotes = "Polished per feedback"
}
Check "L10 worker resubmits after revision" ($resub.status -eq "success") "status=$($resub.status)"

# Admin completes with payout (partial 4000 < 5000)
$comp1 = C "mutation" "applications:updateApplicationStatus" @{
  token = $script:var.adminTok
  applicationId = $script:var.app1Id
  status = "completed"
  adminNotes = "Approved"
  payoutAmount = 4000
}
Check "L11 admin approves work + releases payout" ($comp1.status -eq "success") "status=$($comp1.status)"

$w1Wallet = GetWallet $script:var.w1Tok
$payoutTxn = @($w1Wallet.value.transactions | Where-Object { $_.type -eq "WORK_PAYOUT" } | Select-Object -First 1)[0]
Check "L12 wallet credited +4000 with WORK_PAYOUT ledger" `
  ($w1Wallet.value.wallet.availableBalance -eq 4000 -and $w1Wallet.value.wallet.workEarnings -eq 4000 -and $payoutTxn.amount -eq 4000 -and $payoutTxn.status -eq "completed") `
  "bal=$($w1Wallet.value.wallet.availableBalance) work=$($w1Wallet.value.wallet.workEarnings)"

# Payout above job payment rejected for worker 2
$over = C "mutation" "applications:updateApplicationStatus" @{
  token = $script:var.adminTok
  applicationId = $script:var.app2Id
  status = "completed"
  payoutAmount = 6000
}
Check "L13 payout above job payment rejected" ($over.status -eq "error") "status=$($over.status)"

$comp2 = C "mutation" "applications:updateApplicationStatus" @{
  token = $script:var.adminTok
  applicationId = $script:var.app2Id
  status = "completed"
  payoutAmount = 5000
}
Check "L14 full job payment payout for worker 2" ($comp2.status -eq "success") "status=$($comp2.status)"

$w2Wallet = GetWallet $script:var.w2Tok
Check "L15 worker 2 wallet +5000" ($w2Wallet.value.wallet.availableBalance -eq 5000 -and $w2Wallet.value.wallet.workEarnings -eq 5000) "bal=$($w2Wallet.value.wallet.availableBalance)"

$dbl = C "mutation" "applications:updateApplicationStatus" @{
  token = $script:var.adminTok
  applicationId = $script:var.app1Id
  status = "completed"
  payoutAmount = 1000
}
Check "L16 double payout blocked on completed application" ($dbl.status -eq "error") "status=$($dbl.status)"

$nonAdmin = C "mutation" "applications:updateApplicationStatus" @{
  token = $script:var.w1Tok
  applicationId = $script:var.app2Id
  status = "completed"
}
Check "L17 worker cannot change application status" ($nonAdmin.status -eq "error") "status=$($nonAdmin.status)"

# ---------- AFFILIATE COMMISSION FULL CYCLE ----------
Write-Host "=== AFFILIATE COMMISSION: PURCHASE -> PENDING -> APPROVED -> AVAILABLE ==="
$ref = C "mutation" "auth:signup" @{ testMode = $true;  name = "Referrer $ts"; email = "referrer.$ts@zetagrow.com"; password = "RefPass123!" }
$script:var.refTok = $ref.value.token
$refLogin = C "query" "auth:getSessionUser" @{ token = $script:var.refTok }
$script:var.refId = $refLogin.value._id
$refCode = $ref.value.user.referralCode
Write-Host "referral code: $refCode"

$buyer = C "mutation" "auth:signup" @{ testMode = $true;  name = "Buyer $ts"; email = "buyer.$ts@zetagrow.com"; password = "BuyerPass123!"; referralCode = $refCode }
$buyerTok = $buyer.value.token

$refWallet0 = GetWallet $script:var.refTok
Check "C1 referrer starts with empty wallet" ($refWallet0.value.wallet.availableBalance -eq 0 -and $refWallet0.value.wallet.pendingBalance -eq 0) "bal=$($refWallet0.value.wallet.availableBalance)"

$buy = C "mutation" "affiliates:processPurchaseWithAffiliate" @{
  token = $buyerTok
  programId = $script:var.programId
  paymentMethod = "upi"
}
Check "C2 purchase with referral code succeeds" ($buy.status -eq "success") "status=$($buy.status)"

$sales = C "query" "affiliates:getAllAffiliateSalesAdmin" @{ token = $script:var.adminTok }
$sale = @($sales.value | Where-Object { $_.buyer.email -eq "buyer.$ts@zetagrow.com" } | Select-Object -First 1)[0]
$script:var.saleId = $sale._id
$script:var.commission = $sale.commissionAmount
Check "C3 commission sale created for referrer" ($sale -and $sale.referrer.email -eq "referrer.$ts@zetagrow.com" -and $sale.status -eq "pending" -and $sale.commissionAmount -gt 0) "comm=$($sale.commissionAmount) status=$($sale.status)"

$refWallet1 = GetWallet $script:var.refTok
Check "C4 commission held in pendingBalance (not available)" `
  ($refWallet1.value.wallet.pendingBalance -eq $script:var.commission -and $refWallet1.value.wallet.availableBalance -eq 0) `
  "pending=$($refWallet1.value.wallet.pendingBalance) avail=$($refWallet1.value.wallet.availableBalance)"

$approve = C "mutation" "affiliates:updateCommissionStatus" @{
  token = $script:var.adminTok
  saleId = $script:var.saleId
  status = "approved"
  reason = "Verified purchase"
}
Check "C5 admin approves commission" ($approve.status -eq "success") "status=$($approve.status)"

$refWallet2 = GetWallet $script:var.refTok
$affTxn = @($refWallet2.value.transactions | Where-Object { $_.type -eq "AFFILIATE_COMMISSION" -and $_.status -eq "completed" } | Select-Object -First 1)[0]
Check "C6 commission moved to available + affiliateEarnings + ledger" `
  ($refWallet2.value.wallet.availableBalance -eq $script:var.commission -and $refWallet2.value.wallet.affiliateEarnings -eq $script:var.commission -and $refWallet2.value.wallet.pendingBalance -eq 0 -and $affTxn.amount -eq $script:var.commission) `
  "avail=$($refWallet2.value.wallet.availableBalance) aff=$($refWallet2.value.wallet.affiliateEarnings)"

$dblApprove = C "mutation" "affiliates:updateCommissionStatus" @{ token = $script:var.adminTok; saleId = $script:var.saleId; status = "approved"; reason = "again" }
Check "C7 double-approve commission blocked" ($dblApprove.status -eq "error") "status=$($dblApprove.status)"

# ---------- WITHDRAWAL MATH + FULL CYCLE ----------
Write-Host "=== WITHDRAWAL: REQUEST -> APPROVE -> COMPLETE + REJECT REFUND + MATH ==="
$script:var.minW = $wdSettings.minimumWithdrawal
$script:var.feePct = $wdSettings.feePercentage
$script:var.fixedFee = $wdSettings.fixedFee

# Worker 1: available 4000 -> withdraw 1000 (fee 2% = 20, net 980)
$wAmt = $script:var.minW
$expFee = [Math]::Round($wAmt * $script:var.feePct / 100) + $script:var.fixedFee
$expNet = $wAmt - $expFee
$wd = C "mutation" "withdrawals:requestWithdrawal" @{
  token = $script:var.w1Tok
  amount = $wAmt
  payoutMethod = "upi"
  payoutDetails = @{ upiId = "worker1@okhdfcbank" }
}
$script:var.wdId = $wd.value.withdrawalId
Check "W1 withdrawal requested at exact minimum" ($wd.status -eq "success") "status=$($wd.status)"

$wds = C "query" "withdrawals:getUserWithdrawals" @{ token = $script:var.w1Tok }
$wdRow = @($wds.value | Where-Object { $_._id -eq $script:var.wdId } | Select-Object -First 1)[0]
Check "W2 fee + net math correct on record" `
  ($wdRow.fee -eq $expFee -and $wdRow.netAmount -eq $expNet -and $wdRow.amount -eq $wAmt) `
  "fee=$($wdRow.fee) exp=$expFee net=$($wdRow.netAmount) exp=$expNet"

$w1Wallet2 = GetWallet $script:var.w1Tok
Check "W3 available balance deducted at request" ($w1Wallet2.value.wallet.availableBalance -eq (4000 - $wAmt)) "bal=$($w1Wallet2.value.wallet.availableBalance)"

$second = C "mutation" "withdrawals:requestWithdrawal" @{
  token = $script:var.w1Tok
  amount = 1000
  payoutMethod = "upi"
  payoutDetails = @{ upiId = "worker1@okhdfcbank" }
}
Check "W4 second pending withdrawal blocked" ($second.status -eq "error") "status=$($second.status)"

# Daily limit test: fresh worker with enough balance, try to exceed daily limit
$big = C "mutation" "withdrawals:requestWithdrawal" @{
  token = $script:var.w2Tok
  amount = ($wdSettings.dailyLimit + 1000)
  payoutMethod = "upi"
  payoutDetails = @{ upiId = "worker2@okhdfcbank" }
}
Check "W5 daily withdrawal limit enforced" ($big.status -eq "error") "status=$($big.status)"

# Admin approves then completes worker 1's withdrawal
$appr = C "mutation" "withdrawals:updateWithdrawalStatus" @{ token = $script:var.adminTok; withdrawalId = $script:var.wdId; status = "approved"; adminNote = "ok" }
Check "W6 admin approves withdrawal" ($appr.status -eq "success") "status=$($appr.status)"
$done = C "mutation" "withdrawals:updateWithdrawalStatus" @{ token = $script:var.adminTok; withdrawalId = $script:var.wdId; status = "completed" }
Check "W7 admin completes withdrawal" ($done.status -eq "success") "status=$($done.status)"

$w1Wallet3 = GetWallet $script:var.w1Tok
$wdTxn = @($w1Wallet3.value.transactions | Where-Object { $_.type -eq "WITHDRAWAL" -and $_.status -eq "completed" } | Select-Object -First 1)[0]
Check "W8 totalWithdrawn incremented by gross amount + ledger completed" `
  ($w1Wallet3.value.wallet.totalWithdrawn -eq $wAmt -and $wdTxn.amount -eq (-1 * $wAmt) -and $wdTxn.status -eq "completed") `
  "withdrawn=$($w1Wallet3.value.wallet.totalWithdrawn)"

# Reconciliation: available == work + affiliate - withdrawn - pending
$recon = $w1Wallet3.value.wallet.availableBalance
$expected = $w1Wallet3.value.wallet.workEarnings + $w1Wallet3.value.wallet.affiliateEarnings - $w1Wallet3.value.wallet.totalWithdrawn
Check "W9 ledger reconciliation exact (work+affiliate-withdrawn)" ($recon -eq $expected) "bal=$recon expected=$expected"

# Reject + refund cycle on referrer (commission 100% available)
$refWd = C "mutation" "withdrawals:requestWithdrawal" @{
  token = $script:var.refTok
  amount = $script:var.commission
  payoutMethod = "bank_transfer"
  payoutDetails = @{ accountNumber = "123456789"; ifscCode = "HDFC0001234"; accountHolderName = "Referrer"; bankName = "HDFC" }
}
$refWdId = $refWd.value.withdrawalId
Check "W10 referrer withdraws full commission (bank)" ($refWd.status -eq "success") "status=$($refWd.status)"

$rej = C "mutation" "withdrawals:updateWithdrawalStatus" @{ token = $script:var.adminTok; withdrawalId = $refWdId; status = "rejected"; adminNote = "Bank details mismatch" }
Check "W11 admin rejects withdrawal" ($rej.status -eq "success") "status=$($rej.status)"

$refWallet3 = GetWallet $script:var.refTok
$refundTxn = @($refWallet3.value.transactions | Where-Object { $_.type -eq "REFUND" } | Select-Object -First 1)[0]
Check "W12 rejection refunds full amount + REFUND ledger" `
  ($refWallet3.value.wallet.availableBalance -eq $script:var.commission -and $refundTxn.amount -eq $script:var.commission) `
  "bal=$($refWallet3.value.wallet.availableBalance) refund=$($refundTxn.amount)"

$refRecon = $refWallet3.value.wallet.availableBalance
$refExpected = $refWallet3.value.wallet.workEarnings + $refWallet3.value.wallet.affiliateEarnings - $refWallet3.value.wallet.totalWithdrawn
Check "W13 referrer ledger reconciliation exact" ($refRecon -eq $refExpected) "bal=$refRecon expected=$refExpected"

# ---------- LIMITS & LEVEL CONTROLS (admin settings) ----------
Write-Host "=== ADMIN CONTROLS: WORK / AFFILIATE / WITHDRAWAL LIMITS ==="
$allSett = (C "query" "settings:getAllSettings" @{ token = $script:var.adminTok }).value
$origWork = $allSett.workLimits
$origAff = $allSett.affiliate
$origWd = $allSett.withdrawals

# Work daily payout cap
$w3 = C "mutation" "auth:signup" @{ testMode = $true;  name = "Worker Three $ts"; email = "worker3.$ts@zetagrow.com"; password = "WorkerPass123!" }
$script:var.w3Tok = $w3.value.token
MakeCv $script:var.w3Tok | Out-Null
$u3 = C "query" "auth:getSessionUser" @{ token = $script:var.w3Tok }
C "mutation" "users:updateUserCvStatus" @{ token = $script:var.adminTok; userId = $u3.value._id; cvStatus = "verified"; remarks = "OK" } | Out-Null
$app3 = C "mutation" "applications:submitApplication" @{ token = $script:var.w3Tok; jobId = $script:var.jobId; answers = @(@{ question = "Why you?"; answer = "me" }); coverNote = "ready" }
$script:var.app3Id = $app3.value
C "mutation" "applications:updateApplicationStatus" @{ token = $script:var.adminTok; applicationId = $script:var.app3Id; status = "accepted" } | Out-Null

try {
  C "mutation" "settings:updateSetting" @{
    token = $script:var.adminTok
    key = "workLimits"
    value = @{ dailyPayoutCap = 3000; monthlyPayoutCap = 0; maxPayoutPerJob = 0; positionMultipliers = @{} }
    reason = "wallet-flow test"
  } | Out-Null
  $capBlock = C "mutation" "applications:updateApplicationStatus" @{
    token = $script:var.adminTok
    applicationId = $script:var.app3Id
    status = "completed"
    payoutAmount = 4000
  }
  Check "M1 work daily payout cap blocks excess payout" ($capBlock.status -eq "error") "status=$($capBlock.status)"

  $capOk = C "mutation" "applications:updateApplicationStatus" @{
    token = $script:var.adminTok
    applicationId = $script:var.app3Id
    status = "completed"
    payoutAmount = 2000
  }
  $w3W = GetWallet $script:var.w3Tok
  Check "M2 payout within cap released to wallet" `
    ($capOk.status -eq "success" -and $w3W.value.wallet.availableBalance -eq 2000) `
    "status=$($capOk.status) bal=$($w3W.value.wallet.availableBalance)"
} finally {
  C "mutation" "settings:updateSetting" @{ token = $script:var.adminTok; key = "workLimits"; value = $origWork; reason = "restore after test" } | Out-Null
}

# Affiliate per-sale cap
$ref2 = C "mutation" "auth:signup" @{ testMode = $true;  name = "Referrer Two $ts"; email = "referrer2.$ts@zetagrow.com"; password = "RefPass123!" }
$ref2Code = $ref2.value.user.referralCode
$buyer2 = C "mutation" "auth:signup" @{ testMode = $true;  name = "Buyer Two $ts"; email = "buyer2.$ts@zetagrow.com"; password = "BuyerPass123!"; referralCode = $ref2Code }
try {
  $affSettings = @{
    enabled = $origAff.enabled
    commissionMethod = $origAff.commissionMethod
    defaultPercentage = $origAff.defaultPercentage
    holdingPeriodDays = $origAff.holdingPeriodDays
    minimumPurchaseAmount = $origAff.minimumPurchaseAmount
    perSaleCap = 500
    dailyCommissionCap = 0
    monthlyCommissionCap = 0
    positionMultipliers = @{}
  }
  C "mutation" "settings:updateSetting" @{ token = $script:var.adminTok; key = "affiliate"; value = $affSettings; reason = "wallet-flow test" } | Out-Null
  C "mutation" "affiliates:processPurchaseWithAffiliate" @{ token = $buyer2.value.token; programId = $script:var.programId; paymentMethod = "upi" } | Out-Null
  $sales2 = C "query" "affiliates:getAllAffiliateSalesAdmin" @{ token = $script:var.adminTok }
  $sale2 = @($sales2.value | Where-Object { $_.buyer.email -eq "buyer2.$ts@zetagrow.com" } | Select-Object -First 1)[0]
  Check "M3 affiliate per-sale cap applied at creation" ($sale2 -and $sale2.commissionAmount -eq 500) "comm=$($sale2.commissionAmount)"

  $affSettings.dailyCommissionCap = 400
  C "mutation" "settings:updateSetting" @{ token = $script:var.adminTok; key = "affiliate"; value = $affSettings; reason = "wallet-flow test" } | Out-Null
  $capAppr = C "mutation" "affiliates:updateCommissionStatus" @{ token = $script:var.adminTok; saleId = $sale2._id; status = "approved"; reason = "test" }
  Check "M4 affiliate daily commission cap blocks approval" ($capAppr.status -eq "error") "status=$($capAppr.status)"
} finally {
  C "mutation" "settings:updateSetting" @{ token = $script:var.adminTok; key = "affiliate"; value = $origAff; reason = "restore after test" } | Out-Null
}

# Monthly withdrawal limit (worker3 has 2000 available)
try {
  $wdTest = @{
    minimumWithdrawal = $origWd.minimumWithdrawal
    maximumWithdrawal = $origWd.maximumWithdrawal
    dailyLimit = $origWd.dailyLimit
    monthlyLimit = 1000
    feePercentage = $origWd.feePercentage
    fixedFee = $origWd.fixedFee
    allowedMethods = $origWd.allowedMethods
  }
  C "mutation" "settings:updateSetting" @{ token = $script:var.adminTok; key = "withdrawals"; value = $wdTest; reason = "wallet-flow test" } | Out-Null
  $mw1 = C "mutation" "withdrawals:requestWithdrawal" @{
    token = $script:var.w3Tok
    amount = 1000
    payoutMethod = "upi"
    payoutDetails = @{ upiId = "worker3@okhdfcbank" }
  }
  $mw2 = C "mutation" "withdrawals:requestWithdrawal" @{
    token = $script:var.w3Tok
    amount = 1000
    payoutMethod = "upi"
    payoutDetails = @{ upiId = "worker3@okhdfcbank" }
  }
  Check "M5 monthly withdrawal limit enforced" `
    ($mw1.status -eq "success" -and $mw2.status -eq "error") `
    "first=$($mw1.status) second=$($mw2.status)"
} finally {
  C "mutation" "settings:updateSetting" @{ token = $script:var.adminTok; key = "withdrawals"; value = $origWd; reason = "restore after test" } | Out-Null
}

# Settings persisted + audit logged
$check = (C "query" "settings:getAllSettings" @{ token = $script:var.adminTok }).value
Check "M6 limits restored to original values after tests" `
  ($check.workLimits.dailyPayoutCap -eq $origWork.dailyPayoutCap -and $check.withdrawals.monthlyLimit -eq $origWd.monthlyLimit) `
  "work=$($check.workLimits.dailyPayoutCap) wd=$($check.withdrawals.monthlyLimit)"

# ---------- SUMMARY ----------
Write-Host ""
Write-Host "=== SUMMARY ==="
$passed = @($results | Where-Object { $_.pass }).Count
$failed = @($results | Where-Object { -not $_.pass }).Count
Write-Host "TOTAL: $($results.Count)  PASSED: $passed  FAILED: $failed"
if ($failed -gt 0) {
  Write-Host "--- FAILURES ---"
  @($results | Where-Object { -not $_.pass }) | ForEach-Object {
    Write-Host "FAIL | $($_.name) | $($_.detail)"
  }
  exit 1
} else {
  Write-Host "ALL TESTS PASSED"
  exit 0
}