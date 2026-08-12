Write-Host "Deploying optimized design to plugin/..." -ForegroundColor Cyan
Copy-Item "$PSScriptRoot\optimized-content.css" "$PSScriptRoot\..\plugin\content\content.css" -Force
Write-Host "  ✅ content.css updated" -ForegroundColor Green
Copy-Item "$PSScriptRoot\optimized-floating-panel.js" "$PSScriptRoot\..\plugin\content\floating-panel.js" -Force
Write-Host "  ✅ floating-panel.js updated" -ForegroundColor Green
Write-Host ""
Write-Host "Done! Reload the extension in Chrome:" -ForegroundColor Yellow
Write-Host "  chrome://extensions -> Find 'Smart Web Extractor' -> Click reload" -ForegroundColor Yellow
