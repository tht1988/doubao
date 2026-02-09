@echo off

REM 创建后端项目目录结构
mkdir backend
mkdir backend\src
mkdir backend\src\models
mkdir backend\src\routes
mkdir backend\src\config
mkdir backend\src\middlewares
mkdir backend\src\utils

REM 创建前端目录
mkdir frontend

REM 创建配置文件目录
mkdir config

REM 创建日志目录
mkdir logs

REM 创建临时文件目录
mkdir tmp

echo 目录结构创建完成！
pause