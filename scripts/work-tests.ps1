$ErrorActionPreference = "Stop"
$base = "https://terrific-dove-836.convex.cloud/api"
$results = New-Object System.Collections.ArrayList
$script:var = @{}

function C($kind, $path, $a) {
    $b = @{ path = $path; args = $a; format = "json" } | ConvertTo-Json -Depth 10
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
$script:var.adminTok = (C "mutation" "auth:login" @{ email = "admin@zetagrow.com"; password = "AdminPassword123!" }).value.token
$script:var.demoTok = (C "mutation" "auth:login" @{ email = "demo@zetagrow.com"; password = "DemoPassword123!" }).value.token
$script:var.demoId = (C "query" "auth:getSessionUser" @{ token = $script:var.demoTok }).value._id
$script:var.progs = (C "query" "programs:getPublicPrograms" @{})
$script:var.starterId = ($script:var.progs.value | Where-Object { $_.name -match "Starter" } | Select-Object -First 1)._id
$script:var.slug = "cover-test-$ts"
Write-Host "tokens + programs ready"

Write-Host ""
Write-Host "=== UPLOAD + CREATE JOB WITH IMAGE ==="
$script:var.lastException = $null
try {
    $uploadUrl = C "action" "jobs:generateJobCoverUploadUrl" @{ }
    if ($uploadUrl.status -ne "success" -or -not $uploadUrl.value) { throw "upload url action failed: $($uploadUrl.status)" }
    $png = [Convert]::FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==")
    $up = Invoke-WebRequest -Uri $uploadUrl.value -Method Post -ContentType "image/png" -Body $png -UseBasicParsing -TimeoutSec 60
    $storageId = (($up.Content | ConvertFrom-Json).storageId)
    if (-not $storageId) { throw "storageId missing: $($up.Content)" }
    $script:var.storageId = $storageId
} catch { $script:var.lastException = $_.Exception.Message }
Check "J1" "cover upload action + PUT returns storageId" $true

$script:var.lastException = $null
try {
    $r = C "mutation" "jobs:createJob" @{
        token = $script:var.adminTok
        title = "Cover Image Job Test $ts"
        slug = $script:var.slug
        shortDescription = "Test job with cover image and gating"
        description = "Full description for the cover test job."
        category = "Content & Writing"
        skills = @("Testing", "QA")
        requirements = @("Must complete starter")
        requiredProgramId = $script:var.starterId
        payment = 2500
        paymentType = "fixed"
        workType = "remote"
        difficulty = "beginner"
        estimatedDuration = "1 Week"
        deadline = "2026-12-31"
        openings = 2
        status = "published"
        applicationQuestions = @("Tell us about yourself")
        company = "ZetaGrow Test Corp"
        coverImageStorageId = $script:var.storageId
    }
    if ($r.status -ne "success") { throw "create failed: $($r.status) $($r.errorMessage)" }
    $script:var.jobId = $r.value
} catch { $script:var.lastException = $_.Exception.Message }
Check "J2" "create job with company + cover storageId" $true

$script:var.lastException = $null
try {
    $pub = C "query" "jobs:getPublicJobs" @{ }
    $job = @($pub.value | Where-Object { $_._id -eq $script:var.jobId })
    if ($job.Count -ne 1) { throw "new job not visible in public list (auto-fetch)" }
    if ($job[0].coverImageUrl -notmatch "^https?://") { throw "coverImageUrl not resolved: $($job[0].coverImageUrl)" }
    if ($job[0].company -ne "ZetaGrow Test Corp") { throw "company missing" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "J3" "new job auto-appears in public list + cover URL resolved" $true

$script:var.lastException = $null
try {
    $img = Invoke-WebRequest -Uri $job[0].coverImageUrl -UseBasicParsing -TimeoutSec 60
    if ($img.StatusCode -ne 200 -or $img.RawContentLength -lt 50) { throw "image not downloadable" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "J4" "cover image actually downloadable" $true

Write-Host ""
Write-Host "=== ELIGIBILITY GATING (COMPLETION) ==="
$script:var.lastException = $null
try {
    $demoJobs = C "query" "jobs:getJobsWithEligibility" @{ token = $script:var.demoTok }
    $demoJob = @($demoJobs.value | Where-Object { $_._id -eq $script:var.jobId })
    if ($demoJobs.status -ne "success") { throw "eligibility query failed" }
    $demoJob = @($demoJobs.value | Where-Object { $_._id -eq $script:var.jobId })
    if ($demoJob.Count -ne 1) { throw "job not in eligibility list" }
    if ($demoJob[0].isEligible -eq $true) { throw "demo (no cert) should NOT be eligible" }
    if (($demoJob[0].missingRequirements -join "") -notmatch "completing") { throw "missing message wrong: $($demoJob[0].missingRequirements)" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "G1" "user without completion -> locked + message" $true

$script:var.lastException = $null
try {
    $r = C "mutation" "applications:submitApplication" @{
        token = $script:var.demoTok
        jobId = $script:var.jobId
        answers = @(@{ question = "Tell us about yourself"; answer = "Test" })
        coverNote = "Should be blocked"
    }
    if ($r.status -ne "error") { throw "ineligible user could apply" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "G2" "server blocks apply without program completion" $true

$script:var.lastException = $null
try {
    $signup = C "mutation" "auth:signup" @{ name = "Cert Holder"; email = "certholder.$ts@zetagrow.com"; password = "CertPass123!" }
    if ($signup.status -ne "success") { throw "signup failed" }
    $script:var.certTok = $signup.value.token
    $script:var.certId = $signup.value.user.id
    $g = C "mutation" "users:grantProgramAccess" @{ token = $script:var.adminTok; userId = $script:var.certId; programId = $script:var.starterId; reason = "Work test suite" }
    if ($g.status -ne "success") { throw "program grant failed" }
    $state = C "query" "learning:getCoursePlayerState" @{ token = $script:var.certTok; programId = $script:var.starterId }
    $lessons = @($state.value.modules | ForEach-Object { $_.lessons })
    if ($lessons.Count -eq 0) { throw "no lessons found" }
    foreach ($l in @($lessons)) {
        $r = C "mutation" "learning:toggleLessonComplete" @{ token = $script:var.certTok; programId = $script:var.starterId; lessonId = $l._id }
        if ($r.status -ne "success") { throw "lesson toggle failed: $($r.status) $($r.errorMessage)" }
    }
    $certs = (C "query" "certificates:getUserCertificates" @{ token = $script:var.certTok }).value
    if (@($certs).Count -eq 0) { throw "certificate not issued after 100% completion" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "G3" "complete all lessons -> certificate issued" $true

$script:var.lastException = $null
try {
    $jobs = C "query" "jobs:getJobsWithEligibility" @{ token = $script:var.certTok }
    $j = @($jobs.value | Where-Object { $_._id -eq $script:var.jobId })
    if ($j.Count -ne 1 -or $j[0].isEligible -ne $true) { throw "cert holder should be eligible" }
    $r = C "mutation" "applications:submitApplication" @{
        token = $script:var.certTok
        jobId = $script:var.jobId
        answers = @(@{ question = "Tell us about yourself"; answer = "I completed" })
        coverNote = "Approved apply"
    }
    if ($r.status -ne "success") { throw "eligible apply failed: $($r.status) $($r.errorMessage)" }
    $script:var.appId = $r.value
} catch { $script:var.lastException = $_.Exception.Message }
Check "G4" "completed user CAN apply (server enforced)" $true

$script:var.lastException = $null
try {
    $r = C "mutation" "applications:submitApplication" @{
        token = $script:var.certTok
        jobId = $script:var.jobId
        answers = @(@{ question = "x"; answer = "dup" })
        coverNote = "duplicate"
    }
    if ($r.status -ne "error") { throw "duplicate apply should fail" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "G5" "duplicate application rejected" $true

Write-Host ""
Write-Host "=== UPDATE + DELETE + PERMS ==="
$script:var.lastException = $null
try {
    $r = C "mutation" "jobs:updateJob" @{
        token = $script:var.adminTok
        jobId = $script:var.jobId
        title = "Cover Image Job Updated $ts"
        slug = $script:var.slug
        shortDescription = "Updated description"
        description = "Updated full description."
        category = "Web & Technical"
        skills = @("QA")
        requirements = @("x")
        payment = 3000
        paymentType = "fixed"
        workType = "remote"
        difficulty = "intermediate"
        estimatedDuration = "2 Weeks"
        deadline = "2026-12-31"
        openings = 1
        status = "published"
        applicationQuestions = @("q1")
        company = "Updated Corp"
    }
    if ($r.status -ne "success") { throw "update failed" }
    $pub = C "query" "jobs:getPublicJobs" @{ }
    $j = @($pub.value | Where-Object { $_._id -eq $script:var.jobId })[0]
    if ($j.title -notmatch "Updated" -or $j.company -ne "Updated Corp" -or $j.category -ne "Web & Technical") { throw "update not reflected: $($j.title)" }
    if (-not $j.coverImageUrl) { throw "cover image lost after update" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "J5" "update job fields + image preserved" $true

$script:var.lastException = $null
try {
    $r = C "mutation" "jobs:deleteJob" @{ token = $script:var.demoTok; jobId = $script:var.jobId }
    if ($r.status -ne "error") { throw "user should be blocked from delete" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "J6" "non-admin cannot delete job" $true

$script:var.lastException = $null
try {
    $r = C "mutation" "jobs:deleteJob" @{ token = $script:var.adminTok; jobId = $script:var.jobId }
    if ($r.status -ne "success") { throw "delete failed" }
    $pub = C "query" "jobs:getPublicJobs" @{ }
    if (@($pub.value | Where-Object { $_._id -eq $script:var.jobId }).Count -ne 0) { throw "job still in public list" }
    $audit = C "query" "auditLogs:getAuditLogs" @{ token = $script:var.adminTok; entityType = "jobs"; search = "DELETE_JOB" }
    $del = @($audit.value | Where-Object { $_.action -eq "DELETE_JOB" -and $_.entityId -eq $script:var.jobId })
    if ($del.Count -lt 1) { throw "delete audit log missing" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "J7" "delete job + audit + removed from public list" $true

$script:var.lastException = $null
try {
    $r = C "mutation" "jobs:createJob" @{
        token = $script:var.demoTok
        title = "Hack"; slug = "hack-$ts"
        shortDescription = "x"; description = "x"
        category = "Operations"; skills = @(); requirements = @()
        payment = 100; paymentType = "fixed"; workType = "remote"
        difficulty = "beginner"; estimatedDuration = "1d"; deadline = "2026-12-31"
        openings = 1; status = "published"; applicationQuestions = @()
    }
    if ($r.status -ne "error") { throw "user should be blocked from creating jobs" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "J8" "non-admin cannot create job" $true

Write-Host ""
$fail = @($results | Where-Object { $_ -like "FAIL*" })
Write-Host "=== SUMMARY ==="
Write-Host "TOTAL: $($results.Count)  PASSED: $($results.Count - $fail.Count)  FAILED: $($fail.Count)"
if ($fail.Count -gt 0) { Write-Host "--- FAILURES ---"; $fail | ForEach-Object { Write-Host $_ } } else { Write-Host "ALL TESTS PASSED" }