#!/usr/bin/env pwsh
# Captura screenshot del emulador o físico, lo redimensiona a la mitad y lo guarda.
# Uso: node no — powershell: .\scripts\screenshot.ps1 -Serial emulator-5554 -Out C:\temp\shot.png [-Scale 0.5]
param(
  [Parameter(Mandatory = $true)][string]$Serial,
  [Parameter(Mandatory = $true)][string]$Out,
  [double]$Scale = 0.5
)

$tmp = [System.IO.Path]::GetTempFileName() + ".png"
# PowerShell mangle binary stdout; use cmd redirection to preserve raw PNG bytes.
cmd /c "adb -s $Serial exec-out screencap -p > `"$tmp`""

Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($tmp)
$newW = [int]($img.Width * $Scale)
$newH = [int]($img.Height * $Scale)
$bmp = New-Object System.Drawing.Bitmap($newW, $newH)
$gfx = [System.Drawing.Graphics]::FromImage($bmp)
$gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gfx.DrawImage($img, 0, 0, $newW, $newH)
$gfx.Dispose()
$img.Dispose()

$outDir = Split-Path -Parent $Out
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }
$bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Remove-Item $tmp -Force -ErrorAction SilentlyContinue
Write-Output "Saved $Out ($newW x $newH)"
