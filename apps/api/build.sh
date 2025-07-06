#!/bin/bash

rm -rf .next
# 定义内存限制大小，单位为MB
NODE_MEMORY_LIMIT=4096

# 执行带有内存限制的pnpm构建命令
NODE_OPTIONS="--max-old-space-size=$NODE_MEMORY_LIMIT" pnpm build

cp ./bin/* .next/standalone/
cp -rf public .next/standalone/apps/api/
# 复制 node_modules 到 standalone 目录
# cp -rf node_modules .next/standalone/
# 检查上一条命令的退出状态
if [ $? -eq 0 ]; then
  echo "构建成功完成。"
else
  echo "构建失败。"
fi


