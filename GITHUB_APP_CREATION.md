# GitHub应用创建功能

## 概述

通过GitHub URL自动创建应用的功能，支持从GitHub仓库自动获取信息并创建应用记录。

## 功能特性

### 1. 智能URL解析

- 自动从GitHub URL提取仓库信息（owner/repo）
- 支持多种GitHub URL格式
- URL格式验证

### 2. GitHub API集成

- 使用GitHub GraphQL API获取完整仓库信息
- 获取stars、forks、描述、语言等详细信息
- 获取最新发布信息
- 获取贡献者统计

### 3. 自动Slug生成

- 基于仓库名自动生成URL友好的标识符
- 格式：`owner-repo-name`
- 自动处理特殊字符

### 4. 重复检查

- 检查GitHub URL是否已存在对应应用
- 防止重复创建相同应用
- 基于应用名称和类型的唯一性检查

### 5. 数据库关联

- 分别保存repos和apps表
- 通过repoId关联两个表
- 支持仓库信息的独立管理

### 6. 异常处理

- 完善的错误处理和状态管理
- 用户友好的错误提示
- 详细的错误日志

### 7. Vercel集成（可选）

- 可选的Vercel项目创建
- 需要配置Vercel API环境变量
- 失败时不影响主要功能

## 使用方法

### 前端使用

```tsx
import { AddGitHubAppButton } from "@/components/admin/apps/add-github-app";

// 在管理页面中使用
<AddGitHubAppButton />;
```

### API调用

```typescript
// 使用tRPC调用
const createFromGitHub = trpc.apps.createFromGitHub.useMutation();

const result = await createFromGitHub.mutateAsync({
  gitHubURL: "https://github.com/owner/repo",
  type: "client", // "client" | "server" | "application"
});
```

## 环境变量配置

### 必需配置

```bash
# GitHub API Token
GITHUB_TOKEN=your_github_token
```

### 可选配置

```bash
# Vercel API配置
PROD_CREATE_API_URL=https://api.vercel.com/v1/projects
VERCEL_PROD_TOKEN=your_vercel_token
```

## 数据库结构

### repos表

存储GitHub仓库的详细信息：

```sql
CREATE TABLE repos (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  owner TEXT NOT NULL,
  description TEXT,
  stars INTEGER,
  forks INTEGER,
  topics JSONB,
  -- ... 其他字段
);
```

### apps表

存储应用信息，通过repoId关联repos表：

```sql
CREATE TABLE apps (
  id TEXT PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(20) NOT NULL,
  github TEXT,
  repo_id TEXT REFERENCES repos(id),
  -- ... 其他字段
);
```

## 错误处理

### 常见错误

1. **无效的GitHub URL**

   - 错误：`无效的GitHub URL`
   - 解决：检查URL格式是否正确

2. **仓库不存在或无访问权限**

   - 错误：`无法获取GitHub仓库信息，请检查仓库是否存在或访问权限`
   - 解决：检查仓库是否存在，GitHub Token是否有足够权限

3. **应用已存在**

   - 错误：`该GitHub仓库已存在对应的应用`
   - 解决：检查是否已经创建过该应用

4. **Vercel API失败**
   - 警告：`Vercel API请求失败，使用默认项目ID`
   - 解决：检查Vercel配置，或忽略此警告

## 开发说明

### 技术栈

- **前端**: React + TypeScript + tRPC + React Hook Form
- **后端**: tRPC + Drizzle ORM + PostgreSQL
- **GitHub集成**: GitHub GraphQL API
- **状态管理**: 完善的加载状态和错误处理
- **数据验证**: Zod schema验证

### 文件结构

```
packages/
├── trpc/routers/admin/apps.ts          # tRPC路由
├── db/database/admin/apps.ts           # 数据库访问层
└── github/                             # GitHub API集成
    ├── src/client.ts
    ├── src/queries.ts
    └── src/utils.ts

apps/web/src/components/admin/apps/
└── add-github-app.tsx                  # 前端组件
```

### 扩展功能

1. **批量导入**: 支持批量导入多个GitHub仓库
2. **自动更新**: 定期更新仓库信息
3. **仓库分析**: 集成代码分析功能
4. **多平台支持**: 支持GitLab、Bitbucket等平台

## 注意事项

1. **GitHub API限制**: 注意GitHub API的速率限制
2. **权限要求**: GitHub Token需要足够的权限访问仓库信息
3. **数据一致性**: 确保repos和apps表的数据一致性
4. **错误恢复**: 实现错误恢复机制，避免数据不一致
