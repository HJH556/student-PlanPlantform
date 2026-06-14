@echo off
echo ========================================
echo 职业规划智能体 - 后端服务启动脚本
echo ========================================
echo.
echo 正在启动后端服务...
echo.
echo 请确保已在 .env 文件中配置正确的 SPARK_API_KEY
echo 获取API密钥地址: https://console.xfyun.cn/services/bmx1
echo.
python main.py
pause
