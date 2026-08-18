$ErrorActionPreference = "Stop"
$base = "https://terrific-dove-836.convex.cloud/api"
$results = New-Object System.Collections.ArrayList
$script:var = @{}

function C($kind, $path, $a) {
    $b = @{ path = $path; args = $a; format = "json" } | ConvertTo-Json -Depth 10
    return Invoke-RestMethod -Uri "$base/$kind" -Method Post -ContentType "application/json" -Body $b -UseBasicParsing -TimeoutSec 30
}

function Check($id, $name, $expectOk) {
    # $script:var.lastException holds error message if any
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

Write-Host "=== SETUP ==="
$script:var.demoTok = (C "mutation" "auth:login" @{ email = "demo@zetagrow.com"; password = "DemoPassword123!" }).value.token
$script:var.adminTok = (C "mutation" "auth:login" @{ email = "admin@zetagrow.com"; password = "AdminPassword123!" }).value.token
try { C "mutation" "auth:signup" @{ name = "Priya Test"; email = "priya.test@zetagrow.com"; password = "TestPassword123!" } | Out-Null } catch {}
$script:var.priyaTok = (C "mutation" "auth:login" @{ email = "priya.test@zetagrow.com"; password = "TestPassword123!" }).value.token
Write-Host "tokens ready"

Write-Host ""
Write-Host "=== USER FLOW: RAISE TICKET ==="
$script:var.lastException = $null
try {
    $r = C "mutation" "supportTickets:createTicket" @{ token = $script:var.demoTok; category = "courses"; title = "Course content not loading"; message = "Module 3 lessons are showing a blank page when I open them in the player." }
    if ($r.status -ne "success" -or $r.value.trackingId -notmatch "^ZT-[A-Z0-9]{6}$") { throw "bad response: $($r | ConvertTo-Json -Compress)" }
    $script:var.t1Id = $r.value.ticketId; $script:var.t1Track = $r.value.trackingId
} catch { $script:var.lastException = $_.Exception.Message }
Check "T1" "createTicket valid -> tracking ID" $true
Write-Host "   created: $($script:var.t1Track)"

foreach ($tc in @(
    @{ n = "T2 invalid category rejected"; args = @{ token = ""; category = "hacking"; title = "Invalid category test"; message = "This should fail because category is invalid." } },
    @{ n = "T3 title <5 chars rejected"; args = @{ token = ""; category = "courses"; title = "Hi"; message = "This should fail because the title is far too short." } },
    @{ n = "T4 message <10 chars rejected"; args = @{ token = ""; category = "courses"; title = "Valid title here"; message = "short" } }
)) {
    $script:var.lastException = $null
    try {
        $r = C "mutation" "supportTickets:createTicket" @{ token = $script:var.demoTok; category = $tc.args.category; title = $tc.args.title; message = $tc.args.message }
        if ($r.status -ne "error") { throw "expected rejection but got: $($r.status)" }
    } catch { $script:var.lastException = $_.Exception.Message }
    Check "X" $tc.n $true
}
$script:var.lastException = $null
try {
    $r = C "mutation" "supportTickets:createTicket" @{ token = "badtoken123"; category = "courses"; title = "Bad token test"; message = "This should fail because token is invalid." }
    if ($r.status -ne "error") { throw "expected rejection but got: $($r.status)" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "T5" "createTicket invalid token rejected" $true

Write-Host ""
Write-Host "=== USER FLOW: LIST & DETAIL ==="
$script:var.lastException = $null
try {
    $r = C "query" "supportTickets:getMyTickets" @{ token = $script:var.demoTok }
    if ($r.status -ne "success" -or $r.value.Count -lt 3) { throw "expected >=3 tickets, got $($r.value.Count)" }
    $script:var.myCount = $r.value.Count
} catch { $script:var.lastException = $_.Exception.Message }
Check "T6" "getMyTickets returns all my tickets" $true

$script:var.lastException = $null
try {
    $r = C "query" "supportTickets:getTicketDetail" @{ token = $script:var.demoTok; ticketId = $script:var.t1Id }
    if ($r.status -ne "success" -or $r.value.ticket.trackingId -ne $script:var.t1Track) { throw "mismatch" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "T7" "getTicketDetail own ticket" $true

$script:var.lastException = $null
try {
    $r = C "query" "supportTickets:getTicketDetail" @{ token = $script:var.priyaTok; ticketId = $script:var.t1Id }
    if ($r.status -ne "error") { throw "expected rejection but got: $($r.status)" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "T8" "getTicketDetail other user forbidden" $true

$script:var.lastException = $null
try {
    $r = C "query" "supportTickets:getTicketDetail" @{ token = $script:var.demoTok; ticketId = "junkid123" }
    if ($r.status -ne "error") { throw "expected rejection but got: $($r.status)" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "T9" "getTicketDetail invalid ticket id rejected" $true

Write-Host ""
Write-Host "=== USER FLOW: REPLIES ==="
$script:var.lastException = $null
try {
    $r = C "mutation" "supportTickets:sendTicketReply" @{ token = $script:var.demoTok; ticketId = $script:var.t1Id; message = "Update: it works now, but I still want a refund for week 1." }
    if ($r.status -ne "success" -or $r.value.success -ne $true) { throw "not success: $($r.status)" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "T10" "sendTicketReply own ticket" $true

$script:var.lastException = $null
try {
    $r = C "mutation" "supportTickets:sendTicketReply" @{ token = $script:var.demoTok; ticketId = $script:var.t1Id; message = "   " }
    if ($r.status -ne "error") { throw "expected rejection but got: $($r.status)" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "T11" "sendTicketReply empty message rejected" $true

$script:var.lastException = $null
try {
    $r = C "mutation" "supportTickets:sendTicketReply" @{ token = $script:var.priyaTok; ticketId = $script:var.t1Id; message = "Hijack attempt" }
    if ($r.status -ne "error") { throw "expected rejection but got: $($r.status)" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "T12" "sendTicketReply other user forbidden" $true

Write-Host ""
Write-Host "=== ATTACHMENTS: IMAGE UPLOAD + LINKS ==="
$script:var.lastException = $null
try {
    $uploadUrl = (C "action" "supportTickets:generateTicketUploadUrl" @{}).value
    if (-not $uploadUrl) { throw "no upload url" }
    $pngB64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
    $pngPath = "C:\Users\herea\AppData\Local\Temp\opencode\test-proof.png"
    [System.IO.File]::WriteAllBytes($pngPath, [Convert]::FromBase64String($pngB64))
    $storageId = (Invoke-RestMethod -Uri $uploadUrl -Method Post -Headers @{ "Content-Type" = "image/png" } -InFile $pngPath -UseBasicParsing -TimeoutSec 30).storageId
    if (-not $storageId) { throw "upload returned no storage id" }
    $r = C "mutation" "supportTickets:createTicket" @{ token = $script:var.demoTok; category = "withdrawals"; title = "Withdrawal proof attached"; message = "Attaching my payment receipt screenshot as proof of the withdrawal issue."; attachments = @(@{ type = "image"; url = $storageId; name = "receipt.png" }, @{ type = "link"; url = "https://example.com/transaction/xyz123"; name = "payment reference" }) }
    if ($r.status -ne "success") { throw "create failed: $($r.status)" }
    $d = C "query" "supportTickets:getTicketDetail" @{ token = $script:var.demoTok; ticketId = $r.value.ticketId }
    $imgAtt = $d.value.ticket.attachments | Where-Object { $_.type -eq "image" }
    $linkAtt = $d.value.ticket.attachments | Where-Object { $_.type -eq "link" }
    if ($imgAtt.url -notmatch "^https?://") { throw "image url not resolved: $($imgAtt.url)" }
    if ($linkAtt.url -ne "https://example.com/transaction/xyz123") { throw "link attachment mismatch: $($linkAtt.url)" }
    $script:var.imgTicket = $r.value.ticketId
} catch { $script:var.lastException = $_.Exception.Message }
Check "T13" "image upload + link attachment stored + resolved" $true

Write-Host ""
Write-Host "=== PUBLIC TRACKING ==="
$script:var.lastException = $null
try {
    $r = C "query" "supportTickets:getTicketByTrackingId" @{ trackingId = $script:var.t1Track.ToLower(); email = "demo@zetagrow.com" }
    if ($r.status -ne "success" -or $r.value.ticket.trackingId -ne $script:var.t1Track) { throw "mismatch: $($r.status)" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "T14" "tracking lookup (case-insensitive ID)" $true

$script:var.lastException = $null
try {
    $r = C "query" "supportTickets:getTicketByTrackingId" @{ trackingId = $script:var.t1Track; email = "hacker@evil.com" }
    if ($r.status -ne "error") { throw "expected rejection but got: $($r.status)" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "T15" "tracking lookup wrong email rejected" $true

$script:var.lastException = $null
try {
    $r = C "query" "supportTickets:getTicketByTrackingId" @{ trackingId = "ZT-NOPE99"; email = "demo@zetagrow.com" }
    if ($r.status -ne "error") { throw "expected rejection but got: $($r.status)" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "T16" "tracking lookup nonexistent rejected" $true

Write-Host ""
Write-Host "=== SECURITY: USER CANNOT USE ADMIN FUNCTIONS ==="
foreach ($tc in @(
    @{ n = "T17 user -> getSupportTickets"; kind = "query"; p = "supportTickets:getSupportTickets"; a = @{} },
    @{ n = "T18 user -> adminReplyTicket"; kind = "mutation"; p = "supportTickets:adminReplyTicket"; a = @{ ticketId = "x"; message = "x" } },
    @{ n = "T19 user -> updateTicketStatus"; kind = "mutation"; p = "supportTickets:updateTicketStatus"; a = @{ ticketId = "x"; status = "resolved" } }
)) {
    $script:var.lastException = $null
    try {
        $args2 = $tc.a.Clone(); $args2["token"] = $script:var.demoTok
        $r = C $tc.kind $tc.p $args2
        if ($r.status -ne "error") { throw "expected rejection but got: $($r.status)" }
    } catch { $script:var.lastException = $_.Exception.Message }
    Check "X" $tc.n $true
}

Write-Host ""
Write-Host "=== ADMIN FLOW ==="
$script:var.lastException = $null
try {
    $r = C "query" "supportTickets:getSupportTickets" @{ token = $script:var.adminTok; status = "all" }
    if ($r.status -ne "success" -or $r.value.Count -lt 3) { throw "expected >=3, got $($r.value.Count)" }
    $script:var.allCount = $r.value.Count
} catch { $script:var.lastException = $_.Exception.Message }
Check "T20" "getSupportTickets returns all" $true

$script:var.lastException = $null
try {
    $r = C "query" "supportTickets:getSupportTickets" @{ token = $script:var.adminTok; status = "open" }
    foreach ($t in $r.value) { if ($t.status -ne "open") { throw "filter leak: $($t.status)" } }
} catch { $script:var.lastException = $_.Exception.Message }
Check "T21" "filter status=open" $true

$script:var.lastException = $null
try {
    $r = C "query" "supportTickets:getSupportTickets" @{ token = $script:var.adminTok; category = "withdrawals" }
    foreach ($t in $r.value) { if ($t.category -ne "withdrawals") { throw "filter leak: $($t.category)" } }
} catch { $script:var.lastException = $_.Exception.Message }
Check "T22" "filter category=withdrawals" $true

$script:var.lastException = $null
try {
    $r = C "query" "supportTickets:getSupportTickets" @{ token = $script:var.adminTok; search = $script:var.t1Track }
    if ($r.value.Count -ne 1 -or $r.value[0].trackingId -ne $script:var.t1Track) { throw "search mismatch: count=$($r.value.Count)" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "T23" "search by tracking ID" $true

$script:var.lastException = $null
try {
    $r = C "query" "supportTickets:getSupportTickets" @{ token = $script:var.adminTok; search = "rahul" }
    if ($r.value.Count -lt 1) { throw "expected rahul tickets" }
    foreach ($t in $r.value) { if ($t.userName -notmatch "Rahul") { throw "search leak" } }
} catch { $script:var.lastException = $_.Exception.Message }
Check "T24" "search by user" $true

$script:var.lastException = $null
try {
    $r = C "query" "supportTickets:getSupportTicketDetail" @{ token = $script:var.adminTok; ticketId = $script:var.t1Id }
    if ($r.status -ne "success" -or $r.value.messages.Count -lt 2) { throw "expected >=2 messages, got $($r.value.messages.Count)" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "T25" "getSupportTicketDetail full thread" $true

Write-Host ""
Write-Host "=== ADMIN REPLY + NOTIFICATION + STATUS + AUDIT ==="
$script:var.lastException = $null
try {
    $r = C "mutation" "supportTickets:adminReplyTicket" @{ token = $script:var.adminTok; ticketId = $script:var.t1Id; message = "Hi Rahul, module 3 had a temporary player issue - it is fixed now. Free month of access credited as compensation. Anything else, we are here." }
    if ($r.status -ne "success" -or $r.value.success -ne $true) { throw "reply failed: $($r.status)" }
    $d = C "query" "supportTickets:getSupportTicketDetail" @{ token = $script:var.adminTok; ticketId = $script:var.t1Id }
    if ($d.value.ticket.status -ne "in_progress") { throw "status not in_progress: $($d.value.ticket.status)" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "T26" "admin reply + auto in_progress" $true

$script:var.lastException = $null
try {
    $r = C "mutation" "supportTickets:adminReplyTicket" @{ token = $script:var.adminTok; ticketId = $script:var.t1Id; message = "" }
    if ($r.status -ne "error") { throw "expected rejection but got: $($r.status)" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "T27" "admin reply empty rejected" $true

$script:var.lastException = $null
try {
    $r = C "query" "notifications:getUserNotifications" @{ token = $script:var.demoTok }
    $n = $r.value.notifications | Where-Object { $_.type -eq "support" } | Select-Object -First 1
    if (-not $n) { throw "no support notification found" }
    if ($n.actionUrl -notmatch "/dashboard/support/") { throw "bad actionUrl: $($n.actionUrl)" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "T28" "user got notification with ticket link" $true

$script:var.lastException = $null
try {
    $r = C "mutation" "supportTickets:updateTicketStatus" @{ token = $script:var.adminTok; ticketId = $script:var.t1Id; status = "resolved" }
    if ($r.status -ne "success" -or $r.value.success -ne $true) { throw "update failed: $($r.status)" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "T29" "updateTicketStatus resolved" $true

$script:var.lastException = $null
try {
    $r = C "mutation" "supportTickets:updateTicketStatus" @{ token = $script:var.adminTok; ticketId = $script:var.t1Id; status = "deleted" }
    if ($r.status -ne "error") { throw "expected rejection but got: $($r.status)" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "T30" "updateTicketStatus invalid value rejected" $true

$script:var.lastException = $null
try {
    $r = C "query" "auditLogs:getAuditLogs" @{ token = $script:var.adminTok }
    $logs = @($r.value | Where-Object { $_.entityType -eq "supportTickets" })
    if ($logs.Count -lt 4) { throw "expected >=4 audit entries, got $($logs.Count)" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "T31" "admin actions written to audit log" $true

Write-Host ""
Write-Host "=== DATA INTEGRITY ==="
$script:var.lastException = $null
try {
    $r = C "query" "supportTickets:getSupportTickets" @{ token = $script:var.adminTok; status = "all" }
    $ids = @($r.value | ForEach-Object { $_.trackingId })
    if (($ids | Select-Object -Unique).Count -ne $ids.Count) { throw "duplicate tracking ids" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "T32" "tracking IDs unique across all tickets" $true

$script:var.lastException = $null
try {
    $r = C "query" "supportTickets:getSupportTickets" @{ token = $script:var.adminTok; status = "all" }
    foreach ($t in $r.value) {
        if (-not $t.userId -or -not $t.userName -or -not $t.userEmail -or -not $t.category -or -not $t.status -or -not $t.trackingId -or -not $t.createdAt -or -not $t.updatedAt) { throw "missing field on $($t.trackingId)" }
        if ($t.updatedAt -lt $t.createdAt) { throw "updatedAt < createdAt on $($t.trackingId)" }
    }
} catch { $script:var.lastException = $_.Exception.Message }
Check "T33" "every ticket complete + timestamps valid" $true

$script:var.lastException = $null
try {
    $r = C "query" "supportTickets:getTicketCategories" @{}
    if ($r.status -ne "success" -or $r.value.Count -ne 8) { throw "expected 8 categories, got $($r.value.Count)" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "T34" "getTicketCategories returns 8" $true

$script:var.lastException = $null
try {
    $r = C "query" "contact:getContactInquiries" @{ token = $script:var.adminTok }
    if ($r.status -ne "success") { throw "contact inquiry endpoint broken" }
} catch { $script:var.lastException = $_.Exception.Message }
Check "T35" "legacy contactInquiries unaffected" $true

$script:var.lastException = $null
try {
    $r = C "query" "supportTickets:getSupportTickets" @{ token = $script:var.adminTok; status = "all" }
    foreach ($t in $r.value) {
        $td = C "query" "supportTickets:getSupportTicketDetail" @{ token = $script:var.adminTok; ticketId = $t._id }
        if ($td.status -ne "success") { throw "detail failed for $($t.trackingId)" }
        foreach ($m in $td.value.messages) {
            if ($m.sender -notin @("user", "admin") -or -not $m.message) { throw "invalid message on $($t.trackingId)" }
        }
    }
} catch { $script:var.lastException = $_.Exception.Message }
Check "T36" "every ticket thread valid (sender + content)" $true

Write-Host ""
$fail = @($results | Where-Object { $_ -like "FAIL*" })
Write-Host "=== SUMMARY ==="
Write-Host "TOTAL: $($results.Count)  PASSED: $($results.Count - $fail.Count)  FAILED: $($fail.Count)"
if ($fail.Count -gt 0) { Write-Host "--- FAILURES ---"; $fail | ForEach-Object { Write-Host $_ } } else { Write-Host "ALL TESTS PASSED" }