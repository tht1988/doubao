@echo off

echo 正在启动修真炼器录游戏后端服务...
echo ====================================

REM 检查Node.js是否已安装
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 错误: 未安装Node.js，请先安装Node.js 16.0.0或更高版本
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo 已检测到Node.js版本:
node --version
echo.

REM 检查npm是否已安装
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 错误: 未安装npm
    pause
    exit /b 1
)

echo 已检测到npm版本:
npm --version
echo.

REM 检查是否已安装依赖
if not exist "node_modules" (
    echo 正在安装依赖...
    npm install
    if %ERRORLEVEL% NEQ 0 (
        echo 错误: 依赖安装失败
        pause
        exit /b 1
    )
    echo 依赖安装成功
    echo.
)

echo 正在启动开发服务器...
echo 服务器将运行在 http://localhost:5000
echo API文档地址: http://localhost:5000/health
echo 按 Ctrl+C 停止服务器
echo.

npm run dev

pause