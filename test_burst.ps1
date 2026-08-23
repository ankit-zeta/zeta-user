param($ts, $past)
for ($i = 1; $i -le 35; $i++) {
  $email = "burstglobal.$i.$ts@zetagrow.com"
  $b = @{ path = "auth:signup"; args = @{ name = "Burst Global $i"; email = $email; password = "RateTest123!"; formStartedAt = $past; website = "" }; format = "json" } | ConvertTo-Json -Depth 12
  $r = Invoke-RestMethod -Uri "https://terrific-dove-836.convex.cloud/api/mutation" -Method Post -ContentType "application/json" -Body $b -UseBasicParsing
  if ($r.status -ne "success") {
    "FAIL at $i: $($r.errorMessage)"
    exit
  }
}
"All succeeded"
