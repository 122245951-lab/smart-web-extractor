@echo off
echo ========================================
echo  Smart Web Extractor - Deployment Script
echo  Copying optimized files to plugin/...
echo ========================================
echo.

echo [1/2] Updating content.css...
copy /Y "%~dp0docs\optimized-content.css" "%~dp0plugin\content\content.css"
echo Done.

echo [2/2] Updating floating-panel.js...
copy /Y "%~dp0docs\optimized-floating-panel.js" "%~dp0plugin\content\floating-panel.js"
echo Done.

echo.
echo ====== All files deployed successfully! ======
echo Please reload the extension in Chrome:
echo   chrome://extensions -> Find "Smart Web Extractor" -> Click reload
echo.
pause
