$git = "C:\Program Files\Git\cmd\git.exe"

# 1. Create and switch to branch
Write-Host "Creating and switching to branch premium-v2..."
& $git checkout -b premium-v2 2>&1

# 2. Add changes
Write-Host "Adding changes..."
& $git add . 2>&1

# 3. Commit
Write-Host "Committing changes..."
& $git commit -m "Upgrade Premium Voice and new features (AI Dialogue & Story Room)" 2>&1

# 4. Push to GitHub
Write-Host "Pushing branch premium-v2 to GitHub..."
& $git push origin premium-v2 2>&1

Write-Host "FINISHED!"
