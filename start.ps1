[CmdletBinding()]
param(
  [switch]$HiddenWorker,
  [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSCommandPath
$port = 5174
$url = "http://localhost:$port"

function Test-OpenReelRunning {
  return [bool](Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)
}

# When started with "Run with PowerShell", relaunch the actual work invisibly
# and exit immediately. The companion OpenReel.vbs does the same with a double-click.
if (-not $HiddenWorker) {
  $scriptArgument = '"' + $PSCommandPath + '"'
  $arguments = "-NoProfile -ExecutionPolicy Bypass -File $scriptArgument -HiddenWorker"
  if ($NoBrowser) {
    $arguments += " -NoBrowser"
  }
  Start-Process -FilePath "powershell.exe" -ArgumentList $arguments -WindowStyle Hidden
  exit 0
}

Set-Location -LiteralPath $repoRoot

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  throw "pnpm est introuvable. Installe Node.js puis active pnpm avec: corepack enable"
}

if (-not (Test-Path -LiteralPath (Join-Path $repoRoot "node_modules"))) {
  & pnpm install --frozen-lockfile
}

if (-not (Test-Path -LiteralPath (Join-Path $repoRoot "packages\core\src\wasm\build"))) {
  & pnpm build:wasm
}

if (-not (Test-OpenReelRunning)) {
  $logDirectory = Join-Path $repoRoot "logs"
  New-Item -ItemType Directory -Force -Path $logDirectory | Out-Null
  Start-Process `
    -FilePath "pnpm.cmd" `
    -ArgumentList @("dev", "--", "--port", "$port") `
    -WorkingDirectory $repoRoot `
    -WindowStyle Hidden `
    -RedirectStandardOutput (Join-Path $logDirectory "openreel-dev.log") `
    -RedirectStandardError (Join-Path $logDirectory "openreel-dev.error.log") | Out-Null
}

if ($NoBrowser) {
  exit 0
}

for ($attempt = 0; $attempt -lt 30; $attempt += 1) {
  if (Test-OpenReelRunning) {
    Start-Process $url
    exit 0
  }
  Start-Sleep -Seconds 1
}

throw "OpenReel n'a pas démarré. Consulte logs\openreel-dev.error.log"
