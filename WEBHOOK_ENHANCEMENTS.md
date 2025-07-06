# Webhook 功能增强

## 概述

本次更新对 `/api/webhook/daily` 端点进行了两个重要增强：

1. **Webhook数据持久化存储**
2. **Apps记录的自动创建和更新**

## 功能详情

### 1. Webhook数据持久化存储

#### 功能描述
- 所有接收到的webhook数据都会以JSON格式保存到本地文件系统
- 文件按日期自动分类存储，便于管理和查找

#### 存储结构
```
webhook-data/
├── 2024-01-15/
│   ├── 1705123456789_repo123.json
│   └── 1705123456790_repo456.json
├── 2024-01-16/
│   └── 1705209876543_repo789.json
└── ...
```

#### 文件命名规则
- 格式：`{时间戳}_{repoId}.json`
- 时间戳：毫秒级时间戳，确保唯一性
- repoId：仓库ID，便于识别

#### 实现细节
- 自动创建目录结构
- 使用 `fs.writeFileSync` 同步写入
- 包含错误处理和日志记录

### 2. Apps记录自动管理

#### 功能描述
- 根据repoId自动查找关联的apps记录
- 如果apps存在，则更新现有记录
- 如果apps不存在，则创建新的app记录

#### 更新逻辑
当apps记录存在时，会更新以下字段：
- `stars`, `forks`, `watchers`, `contributors` - 统计信息
- `description`, `descriptionZh` - 描述信息
- `website`, `icon`, `banner` - 资源链接
- `languages`, `topics`, `license` - 技术信息
- `version`, `lastCommit` - 版本和提交信息
- `readme`, `readmeZh` - README内容
- `lastAnalyzedAt`, `updatedAt` - 时间戳

#### 创建逻辑
当apps记录不存在时，会创建新的app记录，包含：
- 所有从repo数据映射的字段
- 默认值设置：
  - `type`: 'application'
  - `source`: 'automatic'
  - `status`: 'pending'
  - `publishStatus`: 'offline'
  - `analysed`: false
  - `featured`: false
  - `verified`: false
  - `deleted`: false
- 自动生成的slug
- GitHub链接

#### 事务处理
- 所有数据库操作都在事务中执行
- 确保数据一致性
- 错误时自动回滚

## API响应格式

### 成功响应
```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "data": {
    "repo_id": "repo123",
    "daily_snapshot_id": "snapshot456",
    "monthly_snapshot_id": "monthly789",
    "weekly_snapshot_id": "weekly012",
    "apps_count": 1,
    "saved_file_path": "/path/to/webhook-data/2024-01-15/1705123456789_repo123.json",
    "processed_at": "2024-01-15T10:30:45.123Z"
  }
}
```

### 错误响应
```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

## 配置要求

### 环境变量
- `WEBHOOK_SECRET`: Webhook签名验证密钥（可选）

### 文件系统权限
- 应用需要有写入权限来创建 `webhook-data` 目录
- 确保有足够的磁盘空间存储webhook数据

## 注意事项

1. **文件存储**：webhook数据会持续累积，建议定期清理旧文件
2. **数据库性能**：大量apps记录可能影响查询性能，建议添加适当的索引
3. **错误处理**：文件写入失败不会影响数据库操作，但会记录错误日志
4. **并发处理**：多个webhook同时到达时，文件写入是同步的，可能存在性能瓶颈

## 未来改进建议

1. **异步文件写入**：使用异步IO提高性能
2. **文件压缩**：对旧文件进行压缩存储
3. **自动清理**：实现自动清理过期文件的机制
4. **监控告警**：添加文件存储空间监控
5. **数据备份**：实现webhook数据的备份策略 