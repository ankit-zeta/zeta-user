# payout-methods-tests.ps1 — Saved payout methods (bank / UPI / UPI-QR) + fast withdrawals
$ErrorActionPreference = "Stop"
$base = "https://terrific-dove-836.convex.cloud/api"

$results = New-Object System.Collections.ArrayList
$script:var = @{}

function C($kind, $path, $a) {
  $b = @{ path = $path; args = $a; format = "json" } | ConvertTo-Json -Depth 12
  return Invoke-RestMethod -Uri "$base/$kind" -Method Post -ContentType "application/json" -Body $b -UseBasicParsing -TimeoutSec 60
}

function Check($name, $cond, $detail) {
  $r = @{ name = $name; pass = [bool]$cond; detail = $detail }
  [void]$results.Add($r)
  if ($r.pass) { Write-Host "PASS | $name" } else { Write-Host "FAIL | $name | $detail" }
}

$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

Write-Host "=== SETUP ==="
$script:var.adminTok = (C "mutation" "auth:login" @{ email = "admin@zetagrow.com"; password = "AdminPassword123!" }).value.token
$su = C "mutation" "auth:signup" @{ name = "Method Tester $ts"; email = "method.$ts@zetagrow.com"; password = "MethodPass123!" }
$script:var.tok = $su.value.token
$script:var.uName = $su.value.user.name
$other = C "mutation" "auth:signup" @{ name = "Other User $ts"; email = "other.$ts@zetagrow.com"; password = "OtherPass123!" }
$script:var.otherTok = $other.value.token

# ---------- SAVED METHODS ----------
Write-Host "=== SAVED PAYOUT METHODS ==="
$m0 = C "query" "payoutMethods:getMyPayoutMethods" @{ token = $script:var.tok }
Check "P1 no saved methods initially" ($m0.status -eq "success" -and $m0.value.Count -eq 0) "count=$($m0.value.Count)"

$u1 = C "mutation" "payoutMethods:upsertPayoutMethod" @{
  token = $script:var.tok
  type = "upi"
  name = "Personal UPI"
  details = @{ upiId = "method.tester@okhdfcbank"; accountHolderName = $script:var.uName }
}
Check "P2 UPI method saved + auto default" ($u1.status -eq "success") "status=$($u1.status) id=$($u1.value.methodId)"

$badName = C "mutation" "payoutMethods:upsertPayoutMethod" @{
  token = $script:var.tok
  type = "bank_transfer"
  name = "Bank"
  details = @{ accountNumber = "123456789012"; ifscCode = "HDFC0001234"; bankName = "HDFC"; accountHolderName = "Someone Else" }
}
Check "P3 bank name mismatch rejected" ($badName.status -eq "error") "status=$($badName.status)"

$u2 = C "mutation" "payoutMethods:upsertPayoutMethod" @{
  token = $script:var.tok
  type = "bank_transfer"
  name = "HDFC Salary"
  details = @{ accountNumber = "123456789012"; ifscCode = "HDFC0001234"; bankName = "HDFC"; accountHolderName = $script:var.uName }
}
$script:var.bankId = $u2.value.methodId
Check "P4 bank method saved with matching name" ($u2.status -eq "success") "status=$($u2.status)"

$u3 = C "mutation" "payoutMethods:upsertPayoutMethod" @{
  token = $script:var.tok
  type = "upi_qr"
  name = "QR"
  details = @{ accountHolderName = $script:var.uName; qrImageUrl = "fake-storage-id" }
}
Check "P5 QR with invalid storage id rejected" ($u3.status -eq "error") "status=$($u3.status)"

# Upload a real QR via action
$up = C "action" "payoutMethods:generatePayoutMethodQrUploadUrl" @{}
$qrBytes = [byte[]](1..512 | ForEach-Object { 137 })  # fake PNG-ish payload
$upRes = Invoke-WebRequest -Uri $up.value -Method Post -ContentType "image/jpeg" -Body $qrBytes -UseBasicParsing -TimeoutSec 60
$storageId = ($upRes.Content | ConvertFrom-Json).storageId
Check "P6 QR uploaded to storage" ([bool]$storageId) "id=$storageId"

$u4 = C "mutation" "payoutMethods:upsertPayoutMethod" @{
  token = $script:var.tok
  type = "upi_qr"
  name = "PhonePe QR"
  details = @{ accountHolderName = $script:var.uName; qrImageUrl = $storageId }
}
$script:var.qrId = $u4.value.methodId
Check "P7 QR method saved with valid upload" ($u4.status -eq "success") "status=$($u4.status)"

$list = C "query" "payoutMethods:getMyPayoutMethods" @{ token = $script:var.tok }
$qrRow = @($list.value | Where-Object { $_._id -eq $script:var.qrId } | Select-Object -First 1)[0]
Check "P8 list shows all 3 methods + resolved QR URL" `
  ($list.value.Count -eq 3 -and $qrRow.qrImageUrl -and $qrRow.qrImageUrl -like "*/api/storage/*") `
  "count=$($list.value.Count) qr=$($qrRow.qrImageUrl)"

$defaults = @($list.value | Where-Object { $_.isDefault })
Check "P9 exactly one default method" ($defaults.Count -eq 1 -and $defaults[0].type -eq "upi") "defaults=$($defaults.Count)"

$setDef = C "mutation" "payoutMethods:setDefaultPayoutMethod" @{ token = $script:var.tok; id = $script:var.bankId }
$list2 = C "query" "payoutMethods:getMyPayoutMethods" @{ token = $script:var.tok }
$newDef = @($list2.value | Where-Object { $_.isDefault })[0]
Check "P10 set default switches default to bank" ($setDef.status -eq "success" -and $newDef._id -eq $script:var.bankId) "id=$($newDef._id)"

$otherList = C "query" "payoutMethods:getMyPayoutMethods" @{ token = $script:var.otherTok }
Check "P11 users only see their own methods" ($otherList.value.Count -eq 0) "count=$($otherList.value.Count)"

# ---------- FAST WITHDRAWALS VIA SAVED METHODS ----------
Write-Host "=== WITHDRAWALS VIA SAVED METHODS ==="
# Give the user some balance to withdraw
C "mutation" "wallets:adminAdjustWallet" @{ token = $script:var.adminTok; userId = $su.value.user.id; amount = 5000; type = "CREDIT"; reason = "Method test" } | Out-Null

$wd1 = C "mutation" "withdrawals:requestWithdrawal" @{
  token = $script:var.tok
  amount = 1000
  payoutMethod = "upi"
  payoutDetails = @{}
  payoutMethodId = $script:var.bankId
}
$script:var.wdId = $wd1.value.withdrawalId
Check "W1 withdrawal via saved bank method" ($wd1.status -eq "success") "status=$($wd1.status)"

$wds = C "query" "withdrawals:getUserWithdrawals" @{ token = $script:var.tok }
$wdRow = @($wds.value | Where-Object { $_._id -eq $script:var.wdId } | Select-Object -First 1)[0]
Check "W2 withdrawal record carries saved bank details" `
  ($wdRow.payoutMethod -eq "bank_transfer" -and $wdRow.payoutDetails.accountNumber -eq "123456789012" -and $wdRow.payoutDetails.ifscCode -eq "HDFC0001234") `
  "method=$($wdRow.payoutMethod) acc=$($wdRow.payoutDetails.accountNumber)"

# Other user cannot use this user's saved method
$steal = C "mutation" "withdrawals:requestWithdrawal" @{
  token = $script:var.otherTok
  amount = 1000
  payoutMethod = "upi"
  payoutDetails = @{}
  payoutMethodId = $script:var.bankId
}
Check "W3 another user cannot use someone else's saved method" ($steal.status -eq "error") "status=$($steal.status)"

# QR withdrawal via saved QR method (needs a new withdrawal after pending clears — reject current first)
C "mutation" "withdrawals:updateWithdrawalStatus" @{ token = $script:var.adminTok; withdrawalId = $script:var.wdId; status = "rejected"; adminNote = "Test" } | Out-Null
$wd2 = C "mutation" "withdrawals:requestWithdrawal" @{
  token = $script:var.tok
  amount = 1000
  payoutMethod = "upi_qr"
  payoutDetails = @{}
  payoutMethodId = $script:var.qrId
}
$script:var.wd2Id = $wd2.value.withdrawalId
Check "W4 QR withdrawal via saved QR method" ($wd2.status -eq "success") "status=$($wd2.status)"

$wds2 = C "query" "withdrawals:getUserWithdrawals" @{ token = $script:var.tok }
$wd2Row = @($wds2.value | Where-Object { $_._id -eq $script:var.wd2Id } | Select-Object -First 1)[0]
Check "W5 admin sees resolved QR for withdrawal" `
  ($wd2Row.payoutMethod -eq "upi_qr" -and $wd2Row.qrImageUrl -and $wd2Row.qrImageUrl -like "*/api/storage/*") `
  "qr=$($wd2Row.qrImageUrl)"

# UPI withdrawal via saved UPI method
C "mutation" "withdrawals:updateWithdrawalStatus" @{ token = $script:var.adminTok; withdrawalId = $script:var.wd2Id; status = "rejected"; adminNote = "Test" } | Out-Null
$script:var.upiId = (@(C "query" "payoutMethods:getMyPayoutMethods" @{ token = $script:var.tok }).value | Where-Object { $_.type -eq "upi" } | Select-Object -First 1)[0]._id
$wd3 = C "mutation" "withdrawals:requestWithdrawal" @{
  token = $script:var.tok
  amount = 1000
  payoutMethod = "upi"
  payoutDetails = @{}
  payoutMethodId = $script:var.upiId
}
Check "W6 UPI withdrawal via saved UPI method" ($wd3.status -eq "success") "status=$($wd3.status)"

# ---------- DELETE / DEFAULT PROMOTION ----------
Write-Host "=== DELETE & DEFAULT PROMOTION ==="
$del = C "mutation" "payoutMethods:deletePayoutMethod" @{ token = $script:var.tok; id = $script:var.bankId }
Check "D1 delete bank method (was default)" ($del.status -eq "success") "status=$($del.status)"

$list3 = C "query" "payoutMethods:getMyPayoutMethods" @{ token = $script:var.tok }
$newDef2 = @($list3.value | Where-Object { $_.isDefault })[0]
Check "D2 default auto-promoted after deletion" ($newDef2 -and $newDef2.type -eq "upi") "type=$($newDef2.type)"

$delSteal = C "mutation" "payoutMethods:deletePayoutMethod" @{ token = $script:var.otherTok; id = $script:var.qrId }
Check "D3 cannot delete another user's method" ($delSteal.status -eq "error") "status=$($delSteal.status)"

$used = C "mutation" "withdrawals:requestWithdrawal" @{
  token = $script:var.tok
  amount = 1000
  payoutMethod = "bank_transfer"
  payoutDetails = @{}
  payoutMethodId = $script:var.bankId
}
Check "D4 deleted method cannot be used for withdrawal" ($used.status -eq "error") "status=$($used.status)"

# Admin view of saved methods
$admView = C "query" "payoutMethods:getPayoutMethodsAdmin" @{ token = $script:var.adminTok; userId = $su.value.user.id }
Check "D5 admin can view user's saved methods" ($admView.status -eq "success" -and $admView.value.Count -eq 2) "count=$($admView.value.Count)"

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