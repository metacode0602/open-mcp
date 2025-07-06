# 版本点击对话框功能实现

## 功能概述

实现了应用详情页面中版本信息的点击交互功能。当用户点击版本信息时，会弹出一个对话框显示该应用对应的 GitHub 仓库的最新发布信息。

## 实现组件

### 1. AppVersionReleaseDialog 组件
- **位置**: `apps/web/src/components/web/app-release-dialog.tsx`
- **功能**: 显示发布信息的详细内容
- **特性**:
  - 显示发布标签名称
  - 显示发布时间（相对时间）
  - 显示发布说明（支持 Markdown 格式）
  - 提供 GitHub 链接按钮

### 2. AppVersionDialog 组件
- **位置**: `apps/web/src/components/web/app-release-dialog.tsx`
- **功能**: 对话框包装组件，处理状态管理和数据加载
- **特性**:
  - 状态管理（打开/关闭）
  - 数据加载状态（加载中、错误、空数据）
  - 缓存机制（5分钟缓存）
  - 错误处理

## 数据流程

### 1. tRPC 路由
- **位置**: `packages/trpc/routers/web/mcp-apps.ts`
- **方法**: `getLatestRelease`
- **输入**: `repoId` (仓库ID)
- **输出**: 发布信息对象

### 2. 数据库访问
- **位置**: `packages/db/database/admin/apps.ts`
- **方法**: `reposDataAccess.getById`
- **功能**: 根据 repoId 获取仓库信息

### 3. 数据源
- **表**: `repos` 表
- **字段**: 
  - `latest_release_name`: 发布名称
  - `latest_release_tag_name`: 发布标签
  - `latest_release_published_at`: 发布时间
  - `latest_release_url`: 发布链接
  - `latest_release_description`: 发布说明（英文）
  - `latest_release_description_zh`: 发布说明（中文）

## 使用方式

在应用详情页面中，版本信息现在支持点击交互：

```tsx
{app.repoId ? (
  <AppVersionDialog repoId={app.repoId} appName={app.name}>
    <span className="flex items-center hover:text-primary transition-colors">
      {app.version || "N/A"}
      <Info className="h-4 w-4 ml-2" />
    </span>
  </AppVersionDialog>
) : (
  <span className="flex items-center">
    {app.version || "N/A"}
    <Info className="h-4 w-4 ml-2" />
  </span>
)}
```

## 状态管理

### 加载状态
- 显示骨架屏加载动画
- 包含版本标签、时间、内容的占位符

### 错误状态
- 显示错误图标和错误信息
- 用户友好的错误提示

### 空数据状态
- 显示图标和"暂无发布信息"提示
- 优雅的空状态处理

## 缓存策略

- 使用 tRPC 的 `staleTime` 配置
- 5分钟缓存时间，减少重复请求
- 仅在对话框打开时触发数据加载

## 用户体验

### 交互设计
- 鼠标悬停时版本信息变为主题色
- 点击时打开对话框
- 支持 ESC 键关闭对话框

### 视觉设计
- 响应式对话框布局
- 最大高度限制，支持滚动
- 一致的视觉风格

## 技术栈

- **前端**: React, TypeScript, tRPC
- **UI 组件**: Radix UI Dialog, Lucide React 图标
- **样式**: Tailwind CSS
- **数据**: Drizzle ORM, PostgreSQL
- **状态管理**: React Query (通过 tRPC)

## 文件结构

```
apps/web/src/
├── components/web/
│   └── app-release-dialog.tsx    # 版本对话框组件
└── app/(web)/apps/[slug]/
    └── page.tsx                  # 应用详情页面

packages/
├── trpc/routers/web/
│   └── mcp-apps.ts              # tRPC 路由
└── db/
    ├── database/admin/
    │   └── apps.ts              # 数据库访问层
    └── mcp-schema.ts            # 数据库模式
```

## 扩展性

该实现具有良好的扩展性：

1. **多语言支持**: 已支持中英文发布说明
2. **缓存优化**: 可调整缓存策略
3. **错误处理**: 可扩展错误处理逻辑
4. **UI 定制**: 组件化设计便于样式调整
5. **数据源扩展**: 可轻松添加其他数据源 