@echo off
REM 删除旧的构建目录
if exist .next rmdir /s /q .next

REM 定义内存限制大小，单位为MB
set NODE_MEMORY_LIMIT=4096

REM 执行带有内存限制的pnpm构建命令
set NODE_OPTIONS=--max-old-space-size=%NODE_MEMORY_LIMIT%
call pnpm build

REM 复制必要的文件
xcopy .\bin\* .next\standalone\ /Y
xcopy .\public .next\standalone\apps\web\ /E /I /Y

REM 检查最后一条命令的退出状态
if %ERRORLEVEL% == 0 (
    echo 构建成功完成。
) else (
    echo 构建失败。
)