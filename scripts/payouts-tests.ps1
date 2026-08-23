# payouts-tests.ps1 — Wallet / Payouts / Withdrawals / CV-gate / Security suite
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

function GetW($tok) {
  $r = C "query" "wallets:getUserWallet" @{ token = $tok }
  return $r
}

function Login($email, $pass) {
  $r = C "mutation" "auth:login" @{ email = $email; password = $pass }
  return $r.value.token
}

$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

# ---------- SETUP ----------
Write-Host "=== SETUP ==="
$script:var.adminTok = Login "admin@zetagrow.com" "AdminPassword123!"
$script:var.demoTok = Login "demo@zetagrow.com" "DemoPassword123!"
$demoUser = C "query" "auth:getSessionUser" @{ token = $script:var.demoTok }
$script:var.demoId = $demoUser.value._id

$su = C "mutation" "auth:signup" @{
  name = "Payout Tester $ts"
  email = "payout.$ts@zetagrow.com"
  password = "PayoutPass123!"
  referralCode = "DEMO123"
}
$script:var.freshTok = $su.value.token
$freshUser = C "query" "auth:getSessionUser" @{ token = $script:var.freshTok }
$script:var.freshId = $freshUser.value._id

# Complete CV required by the apply gate
$cv = C "mutation" "cvProfiles:upsertCvProfile" @{
  token = $script:var.freshTok
  overview = "Payout suite test professional with relevant skills and experience to apply."
  experience = @(@{ role = "QA Engineer"; company = "TestCo"; startDate = "2022-01"; endDate = "2023-01"; current = $false; description = "Tested things" })
  education = @(@{ institution = "Test Univ"; degree = "B.Tech"; field = "CS"; status = "graduated"; startYear = "2017"; endYear = "2021" })
  technicalSkills = @("QA", "Automation", "Testing")
  softSkills = @("Attention to detail")
}
if ($cv.status -ne "success") { throw "payout cv upsert failed: $($cv.status) $($cv.errorMessage)" }

$programs = C "query" "programs:getAllProgramsAdmin" @{ token = $script:var.adminTok }
$script:var.programId = $programs.value[0]._id

# Create a test job
$job = C "mutation" "jobs:createJob" @{
  token = $script:var.adminTok
  title = "Payout Test Gig $ts"
  slug = "payout-test-gig-$ts"
  shortDescription = "Test gig for payout suite"
  description = "Complete the deliverable to earn."
  category = "Testing"
  skills = @("qa")
  requirements = @("none")
  payment = 5000
  paymentType = "fixed"
  workType = "remote"
  difficulty = "beginner"
  estimatedDuration = "1 week"
  deadline = "2026-12-31"
  openings = 2
  status = "published"
  applicationQuestions = @("Why you?", "Weekly availability?")
}
$script:var.jobId = $job.value
Write-Host "job=$($script:var.jobId)"

$app = C "mutation" "applications:submitApplication" @{
  token = $script:var.freshTok
  jobId = $script:var.jobId
  answers = @(@{ question = "Why you?"; answer = "I test well" })
  coverNote = "Ready to deliver"
  resumeUrl = "https://example.com/resume.pdf"
}
$script:var.appId = $app.value
Write-Host "app=$($script:var.appId)"

# ---------- WALLET BASICS ----------
Write-Host "=== WALLET BASICS ==="
$w = GetW $script:var.freshTok
Check "W1 fresh user wallet created with zero balance" `
  ($w.status -eq "success" -and $w.value.wallet -and $w.value.wallet.availableBalance -eq 0) `
  "status=$($w.status)"

# ---------- AFFILIATE COMMISSION CREDIT ----------
Write-Host "=== AFFILIATE COMMISSION ==="
$buyer = C "mutation" "auth:signup" @{
  name = "Affiliate Buyer $ts"
  email = "buyer.$ts@zetagrow.com"
  password = "BuyerPass123!"
  referralCode = "DEMO123"
}
$proc = C "mutation" "affiliates:processPurchaseWithAffiliate" @{
  token = $buyer.value.token
  programId = $script:var.programId
  paymentMethod = "upi"
}
$sales = C "query" "affiliates:getAllAffiliateSalesAdmin" @{ token = $script:var.adminTok }
$sale = @($sales.value | Where-Object { $_.buyer.email -eq "buyer.$ts@zetagrow.com" } | Select-Object -First 1)[0]
if ($sale -and $sale.status -ne "approved") {
  C "mutation" "affiliates:updateCommissionStatus" @{
    token = $script:var.adminTok
    saleId = $sale._id
    status = "approved"
    adminNote = "Test approve"
  } | Out-Null
}
$demoW = GetW $script:var.demoTok
$affTxn = @($demoW.value.transactions | Where-Object { $_.type -eq "AFFILIATE_COMMISSION" } | Select-Object -First 1)[0]
Check "W2 affiliate commission credited to wallet + ledger" `
  ($affTxn -and $affTxn.amount -gt 0 -and $demoW.value.wallet.affiliateEarnings -ge $affTxn.amount) `
  "txn=$($affTxn.amount) status=$($proc.status)"

# ---------- CV GATE ----------
Write-Host "=== CV GATE ==="
$acc1 = C "mutation" "applications:updateApplicationStatus" @{
  token = $script:var.adminTok
  applicationId = $script:var.appId
  status = "accepted"
  adminNotes = "Select for work"
}
Check "C1 accept blocked until CV verified" ($acc1.status -eq "error") "status=$($acc1.status)"

$queue = C "query" "users:getCvReviewQueue" @{ token = $script:var.adminTok }
$inQueue = @($queue.value | Where-Object { $_.email -eq "payout.$ts@zetagrow.com" }).Count -gt 0
Check "C2 CV review queue lists pending applicant with resume" `
  ($inQueue -and @($queue.value | Where-Object { $_.email -eq "payout.$ts@zetagrow.com" -and $_.applicationResumes.Count -gt 0 }).Count -gt 0) `
  "queue=$($queue.status) resumes=$(@($queue.value | Where-Object { $_.email -eq "payout.$ts@zetagrow.com" }).applicationResumes.Count)"

$noadminCv = C "mutation" "users:updateUserCvStatus" @{
  token = $script:var.freshTok
  userId = $script:var.freshId
  cvStatus = "verified"
}
Check "C3 non-admin cannot verify CVs" ($noadminCv.status -eq "error") "status=$($noadminCv.status)"

$cv = C "mutation" "users:updateUserCvStatus" @{
  token = $script:var.adminTok
  userId = $script:var.freshId
  cvStatus = "verified"
  remarks = "Resume looks good"
}
Check "C4 admin verifies CV" ($cv.status -eq "success") "status=$($cv.status)"

$freshUser2 = C "query" "auth:getSessionUser" @{ token = $script:var.freshTok }
Check "C5 user session reflects cvStatus verified" ($freshUser2.value.cvStatus -eq "verified") "cv=$($freshUser2.value.cvStatus)"

$acc2 = C "mutation" "applications:updateApplicationStatus" @{
  token = $script:var.adminTok
  applicationId = $script:var.appId
  status = "in_progress"
  adminNotes = "Accepted after CV verification"
}
Check "C6 accept allowed after CV verified" ($acc2.status -eq "success") "status=$($acc2.status)"

# ---------- WORK PAYOUT ----------
Write-Host "=== WORK PAYOUT ==="
$cap = C "mutation" "applications:updateApplicationStatus" @{
  token = $script:var.adminTok
  applicationId = $script:var.appId
  status = "completed"
  payoutAmount = 99999
}
Check "P1 payout above job payment rejected" ($cap.status -eq "error") "status=$($cap.status)"

$comp = C "mutation" "applications:updateApplicationStatus" @{
  token = $script:var.adminTok
  applicationId = $script:var.appId
  status = "completed"
  payoutAmount = 5000
  adminNotes = "Deliverable approved"
}
Check "P2 completion credits wallet WORK_PAYOUT" ($comp.status -eq "success") "status=$($comp.status)"

$freshW = GetW $script:var.freshTok
$workTxn = @($freshW.value.transactions | Where-Object { $_.type -eq "WORK_PAYOUT" } | Select-Object -First 1)[0]
Check "P3 wallet balance + workEarnings + ledger updated" `
  ($workTxn -and $workTxn.amount -eq 5000 -and $freshW.value.wallet.availableBalance -eq 5000 -and $freshW.value.wallet.workEarnings -eq 5000) `
  "bal=$($freshW.value.wallet.availableBalance) txn=$($workTxn.amount)"

$dup = C "mutation" "applications:updateApplicationStatus" @{
  token = $script:var.adminTok
  applicationId = $script:var.appId
  status = "completed"
  payoutAmount = 5000
}
Check "P4 double payout blocked on completed application" ($dup.status -eq "error") "status=$($dup.status)"

$report = C "query" "wallets:getPayoutReport" @{ token = $script:var.adminTok }
$gig = @($report.value.report | Where-Object { $_.jobId -eq $script:var.jobId } | Select-Object -First 1)[0]
Check "P5 payout report totals for job correct" `
  ($gig -and $gig.totalPaid -eq 5000 -and $gig.completedCount -eq 1 -and $gig.paidUsers -eq 1 -and $gig.applicationCount -eq 1) `
  "paid=$($gig.totalPaid) completed=$($gig.completedCount)"

$overview = C "query" "wallets:getAllWalletsAdmin" @{ token = $script:var.adminTok }
$freshRow = @($overview.value | Where-Object { $_.user.email -eq "payout.$ts@zetagrow.com" } | Select-Object -First 1)[0]
Check "P6 wallet overview shows user + source split" `
  ($freshRow -and $freshRow.workEarnings -eq 5000 -and $freshRow.availableBalance -eq 5000 -and $freshRow.user.cvStatus -eq "verified") `
  "work=$($freshRow.workEarnings)"

$noadminW = C "query" "wallets:getAllWalletsAdmin" @{ token = $script:var.freshTok }
$noadminR = C "query" "wallets:getPayoutReport" @{ token = $script:var.freshTok }
Check "P7 non-admin blocked from wallet overview + report" `
  ($noadminW.status -eq "error" -and $noadminR.status -eq "error") `
  "w=$($noadminW.status) r=$($noadminR.status)"

# ---------- WITHDRAWALS ----------
Write-Host "=== WITHDRAWALS ==="
$d1 = C "mutation" "withdrawals:requestWithdrawal" @{
  token = $script:var.freshTok
  amount = 100
  payoutMethod = "upi"
  payoutDetails = @{ upiId = "me@upi" }
}
Check "D1 below minimum rejected" ($d1.status -eq "error") "status=$($d1.status)"

$d2 = C "mutation" "withdrawals:requestWithdrawal" @{
  token = $script:var.freshTok
  amount = 90000
  payoutMethod = "upi"
  payoutDetails = @{ upiId = "me@upi" }
}
Check "D2 above balance rejected" ($d2.status -eq "error") "status=$($d2.status)"

$d3 = C "mutation" "withdrawals:requestWithdrawal" @{
  token = $script:var.freshTok
  amount = 1000
  payoutMethod = "upi"
  payoutDetails = @{}
}
Check "D3 UPI missing UPI ID rejected" ($d3.status -eq "error") "status=$($d3.status)"

$d4 = C "mutation" "withdrawals:requestWithdrawal" @{
  token = $script:var.freshTok
  amount = 1000
  payoutMethod = "upi_qr"
  payoutDetails = @{}
}
Check "D4 QR method missing image rejected" ($d4.status -eq "error") "status=$($d4.status)"

$d5 = C "mutation" "withdrawals:requestWithdrawal" @{
  token = $script:var.freshTok
  amount = 1000
  payoutMethod = "upi_qr"
  payoutDetails = @{ qrImageUrl = "https://evil.example/x.png" }
}
Check "D5 external URL for QR rejected" ($d5.status -eq "error") "status=$($d5.status)"

$d6 = C "mutation" "withdrawals:requestWithdrawal" @{
  token = $script:var.freshTok
  amount = 1000
  payoutMethod = "upi"
  payoutDetails = @{ upiId = "payout.tester@okhdfcbank" }
}
Check "D6 valid UPI withdrawal submitted" ($d6.status -eq "success") "status=$($d6.status)"
$script:var.wid = $d6.value.withdrawalId

$freshW2 = GetW $script:var.freshTok
$wdTxn = @($freshW2.value.transactions | Where-Object { $_.type -eq "WITHDRAWAL" -and $_.status -eq "pending" } | Select-Object -First 1)[0]
Check "D7 balance deducted + pending ledger entry" `
  ($wdTxn -and $freshW2.value.wallet.availableBalance -eq 4000) `
  "bal=$($freshW2.value.wallet.availableBalance)"

$d7 = C "mutation" "withdrawals:requestWithdrawal" @{
  token = $script:var.freshTok
  amount = 1000
  payoutMethod = "upi"
  payoutDetails = @{ upiId = "payout.tester@okhdfcbank" }
}
Check "D8 second pending withdrawal blocked" ($d7.status -eq "error") "status=$($d7.status)"

$d8 = C "mutation" "withdrawals:requestWithdrawal" @{
  token = $script:var.freshTok
  amount = 1000
  payoutMethod = "bank_transfer"
  payoutDetails = @{ accountNumber = "123" }
}
Check "D9 incomplete bank details rejected" ($d8.status -eq "error") "status=$($d8.status)"

$noadminS = C "mutation" "withdrawals:updateWithdrawalStatus" @{
  token = $script:var.freshTok
  withdrawalId = $script:var.wid
  status = "completed"
}
Check "D10 non-admin cannot update withdrawal status" ($noadminS.status -eq "error") "status=$($noadminS.status)"

$approve = C "mutation" "withdrawals:updateWithdrawalStatus" @{
  token = $script:var.adminTok
  withdrawalId = $script:var.wid
  status = "processing"
  adminNote = "UTR PENDING"
}
Check "D11 admin approves withdrawal (processing)" ($approve.status -eq "success") "status=$($approve.status)"

$jump = C "mutation" "withdrawals:updateWithdrawalStatus" @{
  token = $script:var.adminTok
  withdrawalId = $script:var.wid
  status = "completed"
  adminNote = "UTR 1234567890"
}
Check "D12 processing -> completed" ($jump.status -eq "success") "status=$($jump.status)"

$freshW3 = GetW $script:var.freshTok
Check "D13 totalWithdrawn incremented once + ledger completed" `
  ($freshW3.value.wallet.totalWithdrawn -eq 1000 -and $freshW3.value.wallet.availableBalance -eq 4000) `
  "withdrawn=$($freshW3.value.wallet.totalWithdrawn)"

$dbl = C "mutation" "withdrawals:updateWithdrawalStatus" @{
  token = $script:var.adminTok
  withdrawalId = $script:var.wid
  status = "completed"
}
Check "D14 double-complete blocked" ($dbl.status -eq "error") "status=$($dbl.status)"

# Reject + refund cycle
$d9 = C "mutation" "withdrawals:requestWithdrawal" @{
  token = $script:var.freshTok
  amount = 2000
  payoutMethod = "paypal"
  payoutDetails = @{ paypalEmail = "payout.tester@gmail.com" }
}
$script:var.wid2 = $d9.value.withdrawalId
$rej = C "mutation" "withdrawals:updateWithdrawalStatus" @{
  token = $script:var.adminTok
  withdrawalId = $script:var.wid2
  status = "rejected"
  adminNote = "PayPal not supported for this account"
}
Check "D15 reject after request works" ($rej.status -eq "success") "status=$($rej.status)"

$freshW4 = GetW $script:var.freshTok
$refund = @($freshW4.value.transactions | Where-Object { $_.type -eq "REFUND" } | Select-Object -First 1)[0]
Check "D16 reject refunds balance + REFUND ledger" `
  ($refund -and $freshW4.value.wallet.availableBalance -eq 4000 -and $refund.amount -eq 2000) `
  "bal=$($freshW4.value.wallet.availableBalance)"

# ---------- QR UPLOAD FLOW ----------
Write-Host "=== QR UPLOAD ==="
$qrUrl = C "action" "withdrawals:generateWithdrawalQrUploadUrl" @{}
$pngB64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
$pngBytes = [Convert]::FromBase64String($pngB64)
try {
  $up = Invoke-RestMethod -Uri $qrUrl.value -Method Post -ContentType "image/png" -Body $pngBytes -UseBasicParsing -TimeoutSec 60
  $storageId = $up.storageId
  Check "Q1 QR uploaded to storage" ([bool]$storageId) "id=$storageId"
  if ($storageId) {
    $qrw = C "mutation" "withdrawals:requestWithdrawal" @{
      token = $script:var.freshTok
      amount = 1000
      payoutMethod = "upi_qr"
      payoutDetails = @{ qrImageUrl = $storageId }
    }
    Check "Q2 QR withdrawal request succeeds" ($qrw.status -eq "success") "status=$($qrw.status)"
    if ($qrw.status -eq "success") {
      $adminW = C "query" "withdrawals:getAllWithdrawalsAdmin" @{ token = $script:var.adminTok }
      $qrRow = @($adminW.value | Where-Object { $_._id -eq $qrw.value.withdrawalId } | Select-Object -First 1)[0]
      Check "Q3 admin sees resolved QR image URL" ($qrRow -and $qrRow.qrImageUrl -and $qrRow.qrImageUrl -like "*/api/storage/*") "url=$($qrRow.qrImageUrl)"
      C "mutation" "withdrawals:updateWithdrawalStatus" @{
        token = $script:var.adminTok
        withdrawalId = $qrw.value.withdrawalId
        status = "rejected"
        adminNote = "Suite cleanup"
      } | Out-Null
    }
  }
} catch {
  Check "Q1 QR uploaded to storage" $false "upload failed: $($_.Exception.Message)"
}

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