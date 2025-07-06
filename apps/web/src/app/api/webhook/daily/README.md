# Webhook回调接口文档

## 概述

`/api/callback/daily` 接口用于接收仓库数据更新的webhook回调，将数据写入 `repos` 和 `snapshots` 表，并同步更新关联的 `apps` 表信息。

## 接口信息

- **URL**: `/api/callback/daily`
- **方法**: `POST`
- **Content-Type**: `application/json`

## 请求头

| 字段 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `x-webhook-signature` | string | 是 | Webhook签名 |
| `x-webhook-timestamp` | string | 是 | 时间戳 |
| `Content-Type` | string | 是 | 必须为 `application/json` |

## 请求体格式

```typescript
interface RepoWebhookRequest {
  event_type: 'repo_updated';
  timestamp: string;
  data: RepoWebhookData;
}

interface RepoWebhookData {
  // 基本信息
  id: string;
  full_name: string;
  name: string;
  owner: string;
  owner_id: number;
  
  // 描述信息
  description?: string | null;
  description_zh?: string | null;
  homepage?: string | null;
  
  // 统计信息
  stars?: number | null;
  forks?: number | null;
  contributor_count?: number | null;
  mentionable_users_count?: number | null;
  watchers_count?: number | null;
  pull_requests_count?: number | null;
  releases_count?: number | null;
  commit_count?: number | null;
  
  // 技术信息
  topics?: string[] | null;
  languages?: any[] | null;
  license_spdx_id?: string | null;
  default_branch?: string | null;
  
  // 时间信息
  created_at: string;
  pushed_at: string;
  last_commit?: string | null;
  added_at: string;
  updated_at: string;
  
  // 状态信息
  archived?: boolean | null;
  
  // 资源信息
  icon_url?: string | null;
  open_graph_image_url?: string | null;
  open_graph_image_oss_url?: string | null;
  uses_custom_open_graph_image?: boolean | null;
  
  // README内容
  readme_content?: string | null;
  readme_content_zh?: string | null;
  
  // Release信息
  latest_release_name?: string | null;
  latest_release_tag_name?: string | null;
  latest_release_published_at?: string | null;
  latest_release_url?: string | null;
  latest_release_description?: string | null;
  latest_release_description_zh?: string | null;
  
  // 处理状态
  processing_status: {
    icon_processed: boolean;
    description_translated: boolean;
    readme_translated: boolean;
    og_image_processed: boolean;
    release_note_translated: boolean;
  };
  
  // 元数据
  meta: {
    task_name: string;
    processed_at: string;
    processing_time_ms: number;
    success: boolean;
    error_message?: string;
  };
}
```

## 响应格式

### 成功响应 (200)

```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "data": {
    "repo_id": "repo_123",
    "snapshot_id": "snapshot_456",
    "updated_apps_count": 2,
    "processed_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 错误响应

#### 400 - 数据验证失败
```json
{
  "error": "Invalid webhook data format",
  "details": [...]
}
```

#### 400 - 处理失败
```json
{
  "error": "Repo processing failed",
  "details": "Error message from meta.error_message"
}
```

#### 401 - 签名验证失败
```json
{
  "error": "Invalid webhook signature"
}
```

#### 500 - 服务器错误
```json
{
  "error": "Internal server error",
  "message": "Error details"
}
```

## 功能说明

### 1. 数据验证
- 验证请求头中的签名和时间戳
- 验证请求体格式是否符合schema
- 验证事件类型是否为 `repo_updated`
- 验证处理状态是否成功

### 2. 数据库操作
- **repos表**: 如果仓库已存在则更新，否则创建新记录
- **snapshots表**: 创建每日快照记录，包含当前统计信息
- **apps表**: 通过repoId关联，同步更新相关应用的统计信息

### 3. Apps表更新内容
当仓库数据更新时，会自动更新关联的apps表中的以下字段：
- `stars`: 星标数量
- `forks`: 分支数量
- `watchers`: 关注者数量
- `contributors`: 贡献者数量
- `pullRequests`: 拉取请求数量
- `releases`: 发布版本数量
- `commits`: 提交数量
- `lastCommit`: 最后提交时间
- `readme`: 英文README内容
- `readmeZh`: 中文README内容
- `banner`: 横幅图片URL
- `lastAnalyzedAt`: 最后分析时间
- `updatedAt`: 更新时间

### 4. 事务处理
所有数据库操作在事务中执行，确保数据一致性。

### 5. 错误处理
- 详细的错误日志记录
- 根据错误类型返回相应的HTTP状态码
- 提供有意义的错误信息

## 环境变量

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| `WEBHOOK_SECRET` | Webhook签名密钥 | 无（可选） |

## 使用示例

### cURL示例

```bash
curl -X POST http://localhost:3000/api/callback/daily \
  -H "Content-Type: application/json" \
  -H "x-webhook-signature: your-signature" \
  -H "x-webhook-timestamp: 2024-01-01T00:00:00Z" \
  -d '{
    "event_type": "repo_updated",
    "timestamp": "2024-01-01T00:00:00Z",
    "data": {
      "id": "123456789",
      "full_name": "owner/repo",
      "name": "repo",
      "owner": "owner",
      "owner_id": 12345,
      "description": "A test repository",
      "stars": 100,
      "forks": 20,
      "created_at": "2023-01-01T00:00:00Z",
      "pushed_at": "2024-01-01T00:00:00Z",
      "added_at": "2023-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "processing_status": {
        "icon_processed": true,
        "description_translated": true,
        "readme_translated": true,
        "og_image_processed": true,
        "release_note_translated": true
      },
      "meta": {
        "task_name": "daily_repo_update",
        "processed_at": "2024-01-01T00:00:00Z",
        "processing_time_ms": 1500,
        "success": true
      }
    }
  }'
```

### JavaScript示例

```javascript
const response = await fetch('/api/callback/daily', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-webhook-signature': 'your-signature',
    'x-webhook-timestamp': new Date().toISOString(),
  },
  body: JSON.stringify(webhookData),
});

const result = await response.json();
console.log(result);
```

## 数据流程

1. **接收webhook请求** → 验证签名和数据格式
2. **更新repos表** → 创建或更新仓库记录
3. **创建snapshots记录** → 记录当前时间点的统计数据
4. **更新关联apps** → 通过repoId查找并更新相关应用
5. **返回结果** → 包含更新的仓库、快照和应用数量

## 注意事项

1. **安全性**: 建议配置 `WEBHOOK_SECRET` 环境变量来验证请求签名
2. **数据完整性**: 所有操作在事务中执行，确保数据一致性
3. **错误处理**: 详细的错误日志和响应信息
4. **性能**: 接口设计为异步处理，支持高并发
5. **监控**: 建议监控接口的响应时间和错误率
6. **关联关系**: apps表通过repoId字段与repos表关联
7. **批量更新**: 支持一个仓库关联多个应用的情况 