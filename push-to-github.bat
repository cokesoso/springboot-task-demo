@echo off
cd /d "%~dp0"
echo 推送到 GitHub...
echo 若尚未创建仓库，请先在 https://github.com/new 创建同名空仓库
echo.
git push -u origin main
if errorlevel 1 (
    echo.
    echo 推送失败。请检查：
    echo   1. 网络能否访问 github.com
    echo   2. 是否已登录 GitHub（git credential 或 SSH 密钥）
    echo   3. 远程地址是否正确：git remote -v
    pause
    exit /b 1
)
echo.
echo 推送成功！
pause
