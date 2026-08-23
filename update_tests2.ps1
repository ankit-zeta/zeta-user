$files = @("scripts\wallet-flow-tests.ps1", "scripts\work-tests.ps1")
foreach ($f in $files) {
  $c = Get-Content $f -Raw
  $c2 = $c.Replace('C "mutation" "auth:signup" @{', 'C "mutation" "auth:signup" @{ testMode = $true; ')
  if ($c2 -ne $c) {
    Set-Content -Path $f -Value $c2 -NoNewline
    "UPDATED: " + $f
  } else {
    "SKIPPED: " + $f
  }
}