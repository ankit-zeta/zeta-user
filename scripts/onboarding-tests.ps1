# onboarding-tests.ps1 — Onboarding / CV Profile / Apply gate / Account security suite
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

function Login($email, $pass) {
  $r = C "mutation" "auth:login" @{ email = $email; password = $pass }
  return $r
}

$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

Write-Host "=== SETUP ==="
$script:var.adminTok = (Login "admin@zetagrow.com" "AdminPassword123!").value.token
$adminLogin = C "query" "auth:getSessionUser" @{ token = $script:var.adminTok }
$script:var.adminId = $adminLogin.value._id

$programs = C "query" "programs:getAllProgramsAdmin" @{ token = $script:var.adminTok }
$script:var.programId = $programs.value[0]._id

# ---------- SIGNUP RULES ----------
Write-Host "=== SIGNUP RULES ==="
$s1 = C "mutation" "auth:signup" @{
  name = "Short Pw $ts"
  email = "shortpw.$ts@zetagrow.com"
  password = "short"
  referralCode = "DEMO123"
}
Check "S1 password shorter than 8 rejected server-side" ($s1.status -eq "error") "status=$($s1.status)"

$su = C "mutation" "auth:signup" @{
  name = "Onboard Test $ts"
  email = "onboard.$ts@zetagrow.com"
  password = "OnboardPass123!"
  referralCode = "DEMO123"
}
$script:var.tok = $su.value.token
$script:var.uid = $su.value.user.id
Check "S2 valid signup succeeds" ($su.status -eq "success" -and $script:var.tok) "status=$($su.status)"

$s3 = C "mutation" "auth:signup" @{
  name = "Dup $ts"
  email = "onboard.$ts@zetagrow.com"
  password = "OnboardPass123!"
}
Check "S3 duplicate email rejected" ($s3.status -eq "error") "status=$($s3.status)"

$session = C "query" "auth:getSessionUser" @{ token = $script:var.tok }
$script:var.uid = $session.value._id
Check "S4 session resolves user" ([bool]$script:var.uid) "uid=$($script:var.uid)"

# ---------- CV PROFILE (empty + partial only) ----------
Write-Host "=== CV PROFILE ==="
$cv0 = C "query" "cvProfiles:getMyCvProfile" @{ token = $script:var.tok }
Check "CV1 fresh user has empty CV at 0%" `
  ($cv0.status -eq "success" -and $cv0.value.completeness.percent -eq 0 -and -not $cv0.value.completeness.complete) `
  "percent=$($cv0.value.completeness.percent)"

$cv1 = C "mutation" "cvProfiles:upsertCvProfile" @{
  token = $script:var.tok
  overview = "I am a marketing professional with a focus on growth."
  experience = @()
  education = @()
  technicalSkills = @()
  softSkills = @()
}
Check "CV2 partial save -> 25% incomplete" `
  ($cv1.status -eq "success" -and $cv1.value.completeness.percent -eq 25 -and -not $cv1.value.completeness.complete) `
  "percent=$($cv1.value.completeness.percent)"

# ---------- APPLY GATE (before CV is completed) ----------
Write-Host "=== APPLY GATE ==="
$job = C "mutation" "jobs:createJob" @{
  token = $script:var.adminTok
  title = "Onboard Gig $ts"
  slug = "onboard-gig-$ts"
  shortDescription = "Onboarding test gig"
  description = "Complete the task."
  category = "Marketing"
  skills = @("seo")
  requirements = @("none")
  payment = 3000
  paymentType = "fixed"
  workType = "remote"
  difficulty = "beginner"
  estimatedDuration = "1 week"
  deadline = "2026-12-31"
  openings = 2
  status = "published"
  applicationQuestions = @("Tell us about yourself", "Availability?")
}
$script:var.jobId = $job.value

# New user WITHOUT CV profile tries to apply
$nocv = C "mutation" "auth:signup" @{
  name = "No CV $ts"
  email = "nocv.$ts@zetagrow.com"
  password = "NoCvPass123!"
}
$nocvApp = C "mutation" "applications:submitApplication" @{
  token = $nocv.value.token
  jobId = $script:var.jobId
  answers = @(@{ question = "Tell us about yourself"; answer = "I am great" })
  coverNote = "Hire me"
}
Check "A1 apply blocked without any CV profile" ($nocvApp.status -eq "error") "status=$($nocvApp.status)"

# Main user with partial CV (25%) tries to apply
$partialApp = C "mutation" "applications:submitApplication" @{
  token = $script:var.tok
  jobId = $script:var.jobId
  answers = @(@{ question = "Tell us about yourself"; answer = "I am great" })
  coverNote = "Hire me"
}
Check "A2 apply blocked with incomplete CV" ($partialApp.status -eq "error") "status=$($partialApp.status)"

# Purchase works WITHOUT any CV (program purchase unblocked)
$buy = C "mutation" "affiliates:processPurchaseWithAffiliate" @{
  token = $nocv.value.token
  programId = $script:var.programId
  paymentMethod = "upi"
}
Check "A3 program purchase works without CV" ($buy.status -eq "success") "status=$($buy.status)"

# ---------- CV PROFILE (validation + completion) ----------
$bad = C "mutation" "cvProfiles:upsertCvProfile" @{
  token = $script:var.tok
  overview = "I am a marketing professional with a focus on growth and digital strategy for startups."
  experience = @(@{ role = "Growth Marketer"; company = "StartupX"; startDate = "Jan 2022"; endDate = "Dec 2023"; current = $false; description = "Ran campaigns" })
  education = @(@{ institution = "Delhi University"; degree = "B.Com"; field = "Commerce"; status = "graduated"; startYear = "2018"; endYear = "2021" })
  technicalSkills = @("SEO", "Copywriting", "Analytics")
  softSkills = @("Communication", "Teamwork")
  portfolioUrl = "ftp://not-valid"
}
Check "CV3 invalid portfolio URL rejected" ($bad.status -eq "error") "status=$($bad.status)"

$cv2 = C "mutation" "cvProfiles:upsertCvProfile" @{
  token = $script:var.tok
  overview = "I am a marketing professional with a focus on growth and digital strategy for startups across India."
  experience = @(@{ role = "Growth Marketer"; company = "StartupX"; startDate = "Jan 2022"; endDate = "Dec 2023"; current = $false; description = "Ran campaigns" })
  education = @(@{ institution = "Delhi University"; degree = "B.Com"; field = "Commerce"; status = "graduated"; startYear = "2018"; endYear = "2021" })
  technicalSkills = @("SEO", "Copywriting", "Analytics")
  softSkills = @("Communication", "Teamwork")
  portfolioUrl = "https://drive.google.com/drive/u/0/my-drive"
}
Check "CV4 complete CV -> 100% complete" `
  ($cv2.status -eq "success" -and $cv2.value.completeness.percent -eq 100 -and $cv2.value.completeness.complete) `
  "percent=$($cv2.value.completeness.percent)"

$cv3 = C "mutation" "cvProfiles:upsertCvProfile" @{
  token = $script:var.tok
  overview = "I am a marketing professional with a focus on growth and digital strategy for startups across India."
  experience = @(@{ role = "Growth Marketer"; company = "StartupX"; startDate = "Jan 2022"; endDate = "Dec 2023"; current = $false; description = "Ran campaigns" })
  education = @(@{ institution = "Delhi University"; degree = "B.Com"; field = "Commerce"; status = "graduated"; startYear = "2018"; endYear = "2021" })
  technicalSkills = @("SEO", "Copywriting", "Analytics")
  softSkills = @("Communication", "Teamwork")
  portfolioUrl = "https://drive.google.com/drive/u/0/my-drive"
}
Check "CV5 re-save (update) keeps 100%" `
  ($cv3.status -eq "success" -and $cv3.value.completeness.percent -eq 100 -and $cv3.value.portfolioUrl -like "https://drive.google.com*") `
  "percent=$($cv3.value.completeness.percent)"

$userB = C "mutation" "auth:signup" @{
  name = "Other User $ts"
  email = "other.$ts@zetagrow.com"
  password = "OtherPass123!"
}
$noAdm = C "query" "cvProfiles:getUserCvProfileAdmin" @{ token = $userB.value.token; userId = $script:var.uid }
Check "CV6 non-admin cannot read another user's CV" ($noAdm.status -eq "error") "status=$($noAdm.status)"

# ---------- APPLY GATE (after CV completed) ----------
$fullApp = C "mutation" "applications:submitApplication" @{
  token = $script:var.tok
  jobId = $script:var.jobId
  answers = @(@{ question = "Tell us about yourself"; answer = "I am great" })
  coverNote = "Hire me"
}
$script:var.appId = $fullApp.value
Check "A4 apply succeeds with complete CV" ($fullApp.status -eq "success") "status=$($fullApp.status) app=$($fullApp.value)"

$myApps = C "query" "applications:getUserApplications" @{ token = $script:var.tok }
$myApp = @($myApps.value | Where-Object { $_._id -eq $script:var.appId } | Select-Object -First 1)[0]
Check "A5 portfolio auto-attached from CV" ($myApp -and $myApp.portfolioUrl -like "https://drive.google.com*") "portfolio=$($myApp.portfolioUrl)"

# ---------- ADMIN SEES CV ----------
Write-Host "=== ADMIN CV VIEW ==="
$adminApps = C "query" "applications:getAllApplicationsAdmin" @{ token = $script:var.adminTok }
$row = @($adminApps.value | Where-Object { $_._id -eq $script:var.appId } | Select-Object -First 1)[0]
Check "V1 admin application shows full structured CV" `
  ($row -and $row.cvProfile -and $row.cvProfile.completenessPercent -eq 100 -and $row.cvProfile.experience.Count -eq 1 -and $row.cvProfile.education.Count -eq 1 -and $row.cvProfile.technicalSkills.Count -ge 3 -and $row.cvProfile.portfolioUrl -like "https://drive.google.com*") `
  "complete=$($row.cvProfile.completenessPercent)"

# ---------- NOTIFICATIONS (job acceptance) ----------
Write-Host "=== JOB ACCEPTANCE NOTIFICATION ==="
$cvVerify = C "mutation" "users:updateUserCvStatus" @{
  token = $script:var.adminTok
  userId = $script:var.uid
  cvStatus = "verified"
  remarks = "Docs match profile"
}
Check "N0 admin verifies applicant CV" ($cvVerify.status -eq "success") "status=$($cvVerify.status)"

$acc = C "mutation" "applications:updateApplicationStatus" @{
  token = $script:var.adminTok
  applicationId = $script:var.appId
  status = "accepted"
  adminNotes = "Welcome aboard"
}
Check "N1 admin accepts applicant" ($acc.status -eq "success") "status=$($acc.status)"

$notifs = C "query" "notifications:getUserNotifications" @{ token = $script:var.tok }
$accNotif = @($notifs.value.notifications | Where-Object { $_.type -eq "application" -and $_.title -like "Congratulations*" } | Select-Object -First 1)[0]
Check "N2 acceptance notification delivered with congrats title" `
  ($accNotif -and $accNotif.title -like "*Congratulations*" -and $accNotif.message -like "*Onboard Gig*") `
  "title=$($accNotif.title)"

# ---------- ACCOUNT SECURITY ----------
Write-Host "=== ACCOUNT SECURITY ==="
$pw1 = C "mutation" "auth:changePassword" @{
  token = $script:var.tok
  currentPassword = "WrongPass!"
  newPassword = "NewPass123!"
}
Check "P1 wrong current password rejected" ($pw1.status -eq "error") "status=$($pw1.status)"

$pw2 = C "mutation" "auth:changePassword" @{
  token = $script:var.tok
  currentPassword = "OnboardPass123!"
  newPassword = "NewPass123!"
}
Check "P2 password change succeeds" ($pw2.status -eq "success") "status=$($pw2.status)"

$oldLogin = Login "onboard.$ts@zetagrow.com" "OnboardPass123!"
$newLogin = Login "onboard.$ts@zetagrow.com" "NewPass123!"
Check "P3 old password dead + new password works" `
  ($oldLogin.status -eq "error" -and $newLogin.status -eq "success") `
  "old=$($oldLogin.status) new=$($newLogin.status)"
$script:var.tok = $newLogin.value.token

$em1 = C "mutation" "auth:changeEmail" @{ token = $script:var.tok; newEmail = "not-an-email" }
Check "P4 invalid email format rejected" ($em1.status -eq "error") "status=$($em1.status)"

$em2 = C "mutation" "auth:changeEmail" @{ token = $script:var.tok; newEmail = "admin@zetagrow.com" }
Check "P5 email taken by another account rejected" ($em2.status -eq "error") "status=$($em2.status)"

$em3 = C "mutation" "auth:changeEmail" @{ token = $script:var.tok; newEmail = "onboard.new.$ts@zetagrow.com" }
Check "P6 email change succeeds" ($em3.status -eq "success") "status=$($em3.status)"

$newEmailLogin = Login "onboard.new.$ts@zetagrow.com" "NewPass123!"
Check "P7 login works with new email" ($newEmailLogin.status -eq "success") "status=$($newEmailLogin.status)"
$script:var.tok = $newEmailLogin.value.token

# Delete account: wrong password, then with balance, then success
$d1 = C "mutation" "auth:deleteAccount" @{ token = $script:var.tok; password = "WrongPassword!" }
Check "E1 delete with wrong password rejected" ($d1.status -eq "error") "status=$($d1.status)"

C "mutation" "wallets:adminAdjustWallet" @{
  token = $script:var.adminTok
  userId = $script:var.uid
  amount = 500
  type = "CREDIT"
  reason = "Test delete guard"
} | Out-Null
$d2 = C "mutation" "auth:deleteAccount" @{ token = $script:var.tok; password = "NewPass123!" }
Check "E2 delete blocked with wallet balance" ($d2.status -eq "error") "status=$($d2.status)"

C "mutation" "wallets:adminAdjustWallet" @{
  token = $script:var.adminTok
  userId = $script:var.uid
  amount = 500
  type = "DEBIT"
  reason = "Test delete guard cleanup"
} | Out-Null
$d3 = C "mutation" "auth:deleteAccount" @{ token = $script:var.tok; password = "NewPass123!" }
Check "E3 delete succeeds once balance zero" ($d3.status -eq "success") "status=$($d3.status)"

$gone = Login "onboard.new.$ts@zetagrow.com" "NewPass123!"
Check "E4 deleted account can no longer log in" ($gone.status -eq "error") "status=$($gone.status)"

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