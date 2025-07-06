# shadcn/ui monorepo template

This template is for creating a monorepo with shadcn/ui.

## Usage

```bash
pnpm dlx shadcn@latest init
```

## Adding components

To add components to your app, run the following command at the root of your `web` app:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

This will place the ui components in the `packages/ui/src/components` directory.

## Tailwind

Your `tailwind.config.ts` and `globals.css` are already set up to use the components from the `ui` package.

## Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@repo/ui/components/button";
```

# Open MCP

一个开源的MCP（Model Context Protocol）应用管理平台。

## 功能特性

### GitHub应用创建功能

通过GitHub URL自动创建应用，支持以下特性：

1. **智能URL解析**: 自动从GitHub URL提取仓库信息
2. **GitHub API集成**: 获取完整的仓库信息（stars、forks、描述等）
3. **自动Slug生成**: 基于仓库名自动生成URL友好的标识符
4. **重复检查**: 防止重复创建相同的应用
5. **数据库关联**: 分别保存repos和apps表，通过repoId关联
6. **异常处理**: 完善的错误处理和状态管理
7. **Vercel集成**: 可选的Vercel项目创建（需要配置环境变量）

#### 使用方法

1. 在管理后台点击"添加GitHub应用"按钮
2. 输入GitHub仓库URL（格式：https://github.com/owner/repo）
3. 选择应用类型（客户端/服务端/完整应用）
4. 系统会自动：
   - 验证URL格式
   - 检查是否已存在
   - 获取GitHub仓库信息
   - 创建仓库记录
   - 创建应用记录
   - 跳转到应用详情页

#### 环境变量配置

```bash
# GitHub API Token（必需）
GITHUB_TOKEN=your_github_token

# Vercel API配置（可选）
VERCEL_API_PROD_URL=https://api.vercel.com/v1/projects
VERCEL_PROD_TOKEN=your_vercel_token
```

#### 技术实现

- **前端**: React + TypeScript + tRPC + React Hook Form
- **后端**: tRPC + Drizzle ORM + PostgreSQL
- **GitHub集成**: GitHub GraphQL API
- **状态管理**: 完善的加载状态和错误处理
- **数据验证**: Zod schema验证

## 开发

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

### 数据库迁移

```bash
pnpm db:migrate
```

## 许可证

MIT
