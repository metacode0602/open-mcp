# @repo/track

这个包提供了网站分析跟踪功能，支持 Umami 和百度统计。

## 功能特点

- 支持 Umami 分析跟踪
- 支持百度统计分析
- 适用于 Next.js 应用
- 简单易用的 API

## 安装

```bash
# 如果你使用 npm
npm install @repo/track

# 如果你使用 yarn
yarn add @repo/track

# 如果你使用 pnpm
pnpm add @repo/track
```

## 使用方法

### Umami 分析集成

#### 引入 Umami 分析脚本

要在你的 Next.js 应用中启用 Umami 分析，你需要在应用中引入 `UmamiProvider`。

如果你使用的是 [app router](https://nextjs.org/docs/getting-started/project-structure#app-routing-conventions)，请在根布局中引入 `UmamiProvider`：

```jsx
// app/layout.js
import { UmamiProvider } from '@repo/track'

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <UmamiProvider websiteId="你的网站ID" />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

#### 环境变量配置

你也可以通过环境变量来配置 Umami：

```env
# .env.local
NEXT_PUBLIC_UMAMI_SRC=https://cloud.umami.is/script.js
NEXT_PUBLIC_UMAMI_WEBSITE_ID=你的网站ID
NEXT_PUBLIC_UMAMI_HOST_URL=可选的数据发送地址
```

#### `UmamiProvider` 属性

| 名称         | 类型                | 描述                                                                                                                       |
| ------------ | ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `websiteId`  | `string`            | 在 Umami 仪表板中找到的网站 ID。默认使用 `NEXT_PUBLIC_UMAMI_WEBSITE_ID` 环境变量                                            |
| `src`        | `string`            | Umami 脚本地址。默认使用 `NEXT_PUBLIC_UMAMI_SRC` 环境变量，没有设置时使用 Umami 官方地址                                   |
| `hostUrl`    | `string`            | 数据发送地址。默认情况下，Umami 会将数据发送到脚本所在的位置。默认使用 `NEXT_PUBLIC_UMAMI_HOST_URL` 环境变量                |
| `autoTrack`  | `boolean`           | 是否自动跟踪所有页面访问和事件。默认为 `true`                                                                              |
| `domains`    | `string[]`          | 如果你希望跟踪器仅在特定域名上运行，可以设置这个属性。这是一个域名数组                                                       |

此外，`UmamiProvider` 还支持 Next.js 的 `Script` 组件的所有属性。

### 发送自定义事件

`useUmami` hook 允许你在组件中访问 Umami 的跟踪功能。

```jsx
import { useUmami } from '@repo/track'

export default function MyComponent() {
  const umami = useUmami()

  const handleClick = () => {
    // 跟踪事件
    umami.onEnevt('按钮点击', { buttonId: 'submit-button' })
    
    // 识别访问者
    umami.onVisitorProfile({ userId: '123', tier: 'premium' })
  }

  return <button onClick={handleClick}>提交</button>
}
```

#### `useUmami` 返回的方法

| 名称                | 参数                                         | 描述                     |
| ------------------- | -------------------------------------------- | ------------------------ |
| `onEnevt`           | `(eventName: string, data?: Record<string, unknown>)` | 跟踪自定义事件            |
| `onVisitorProfile`  | `(data?: Record<string, unknown>)`          | 识别访问者并添加自定义数据 |

### 百度统计集成

#### 引入百度统计脚本

要在你的 Next.js 应用中启用百度统计，你需要在应用中引入 `BaiduProvider`。

```jsx
// app/layout.js
import { BaiduProvider } from '@repo/track'

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <BaiduProvider baiduId="你的百度统计ID" />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

#### 环境变量配置

你也可以通过环境变量来配置百度统计：

```env
# .env.local
NEXT_PUBLIC_BAIDU_ID=你的百度统计ID
```

#### `BaiduProvider` 属性

| 名称      | 类型     | 描述                                                           |
| --------- | -------- | -------------------------------------------------------------- |
| `baiduId` | `string` | 百度统计 ID。默认使用 `NEXT_PUBLIC_BAIDU_ID` 环境变量          |

此外，`BaiduProvider` 还支持 Next.js 的 `Script` 组件的所有属性。

## 注意事项

1. 确保在生产环境中配置正确的跟踪 ID
2. 如果你同时使用 Umami 和百度统计，需要分别引入 `UmamiProvider` 和 `BaiduProvider`
3. 在开发环境中，你可能想要禁用跟踪或限制跟踪域名，可以通过 `domains` 属性或环境变量配置来实现

## 开发

```bash
# 检查类型
npm run check-types

# 运行 lint
npm run lint
```

## 许可证

MIT
