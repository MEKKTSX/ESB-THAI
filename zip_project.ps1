$destDir = "B:\programming"
if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Force -Path $destDir
}
$tempDir = Join-Path $env:TEMP "esb_thai_zip_temp"
if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}
New-Item -ItemType Directory -Force -Path $tempDir

# Copy all files except .git and the zip script itself
Get-ChildItem -Path "C:\Users\kitti\.gemini\antigravity\scratch\esb-thai" -Exclude ".git", "zip_project.ps1" | Copy-Item -Destination $tempDir -Recurse -Force

# Compress to B:\programming\esb-thai.zip
Compress-Archive -Path "$tempDir\*" -DestinationPath "$destDir\esb-thai.zip" -Force

# Clean up temp
Remove-Item -Recurse -Force $tempDir
Write-Host "SUCCESS: Zipped files to B:\programming\esb-thai.zip"
