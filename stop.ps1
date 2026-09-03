[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$port = 5174
$listeners = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue

if (-not $listeners) {
  Write-Output "OpenReel n'est pas en cours d'execution."
  exit 0
}

$listeners |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object { Stop-Process -Id $_ -Force }

Write-Output "OpenReel est arrete."
