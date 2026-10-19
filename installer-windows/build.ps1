<#
  Builds the Windows GUI installer, webOS-SDK-Redux-<version>-Setup.exe, with Inno Setup 6.3+.

    powershell -ExecutionPolicy Bypass -File installer-windows\build.ps1

  The SDK version is the one Current points at. novacomd is the committed, stripped
  windows\novacomd.exe unless -NovacomdExe names another (say, a local build). Install Inno
  Setup with: winget install JRSoftware.InnoSetup
#>
param(
	[string]$NovacomdExe,
	[string]$OutputDir,
	[string]$RepoUrl = 'https://github.com/webOSArchive/webos-sdk-redux'
)
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot

# Current is a symlink in git; on a checkout without symlinks it is a file holding "./0.4.1",
# and on a folder shared from a Mac or Linux host it can show up as the directory it points at,
# which no longer says which one: then take the highest-numbered SDK folder, as install.sh does
$current = Join-Path $repo 'Current'
$item = Get-Item $current
if ($item.LinkType) {
	$target = $item.Target | Select-Object -First 1
} elseif (-not $item.PSIsContainer) {
	$target = (Get-Content $current -Raw).Trim()
} else {
	$target = Get-ChildItem $repo -Directory | Where-Object { $_.Name -match '^[0-9][0-9.]*$' } |
		Sort-Object { [version]($_.Name + ('.0' * (3 - ($_.Name.Split('.').Count - 1)))) } |
		Select-Object -Last 1 -ExpandProperty Name
	if (-not $target) { throw "Current is a directory and there is no numbered SDK folder beside it" }
}
$version = Split-Path -Leaf $target
if (-not (Test-Path (Join-Path $repo "$version\share\jars\webos-tools.jar"))) { throw "Current points at '$target', which is not an SDK tree" }

if (-not $NovacomdExe) { $NovacomdExe = Join-Path $repo 'windows\novacomd.exe' }
$NovacomdExe = (Resolve-Path $NovacomdExe).ProviderPath
if (-not $OutputDir) { $OutputDir = Join-Path $PSScriptRoot 'Output' }

$iscc = @(
	(Get-Command ISCC.exe -ErrorAction SilentlyContinue).Source,
	"$env:LOCALAPPDATA\Programs\Inno Setup 6\ISCC.exe",
	"${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe",
	"$env:ProgramFiles\Inno Setup 6\ISCC.exe"
) | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
if (-not $iscc) { throw 'Inno Setup 6 not found: winget install JRSoftware.InnoSetup' }

Write-Host "SDK $version, novacomd from $NovacomdExe"
& $iscc "/DAppVersion=$version" "/DRepoRoot=$repo" "/DNovacomdExe=$NovacomdExe" "/DRepoUrl=$RepoUrl" "/O$OutputDir" (Join-Path $PSScriptRoot 'webos-sdk-redux.iss')
if ($LASTEXITCODE -ne 0) { throw "ISCC failed ($LASTEXITCODE)" }

$exe = Join-Path $OutputDir "webOS-SDK-Redux-$version-Setup.exe"
$hash = (Get-FileHash $exe -Algorithm SHA256).Hash.ToLower()
Write-Host ("{0}  {1:N1} MB  SHA-256 {2}" -f $exe, ((Get-Item $exe).Length / 1MB), $hash)
