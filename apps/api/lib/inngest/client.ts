import { EventSchemas, Inngest } from 'inngest';
import { features } from 'process';
import { z } from 'zod';

/**
 * 网站内容开始事件
 */
const zWebsiteContentStartEventSchema = z.object({
  jobId: z.string(), // 抓取的任务id
  appId: z.string(),   //应用id
  userId: z.string(),  //发布人
  website: z.string(), //要抓取的网址
  status: z.string(),
});

/**
 * 网站内容结束事件
 */
const zWebsiteContentEndEventSchema = z.object({
  jobId: z.string(), // 抓取的任务id
  status: z.string(), // 抓取的状态
  message: z.string().optional(), // 抓取的消息
  error: z.string().optional(), // 抓取的错误
  detail: z.object({
    favicon: z.string(),
    title: z.string(),
    description: z.string(),
    keywords: z.array(z.string()),
    banner: z.string(),
    tags: z.array(z.string()),
    duration: z.number().optional(),
  }).optional(),
});

/**
 * 抓取github仓库开始事件
 */
const zGithubRepoStartEventSchema = z.object({
  jobId: z.string(), // 抓取的任务id
  appId: z.string(),   //应用id
  userId: z.string(),  //发布人
  github: z.string(), //要抓取的网址
  status: z.string(),
});

/**
 * 抓取github仓库结束事件
 */
const zGithubRepoEndEventSchema = z.object({
  jobId: z.string(), // 抓取的任务id
  status: z.string(), // 抓取的状态
  message: z.string().optional(), // 抓取的消息
  error: z.string().optional(), // 抓取的错误
  detail: z.object({
    longDescription: z.string().optional(), //长描述
    favicon: z.string(),
    version: z.string(), //当前版本
    features: z.array(z.string()), //特性
    readme: z.string(), //readme.md内容
    license: z.string(), //license
    stars: z.number(), //star数量
    forks: z.number(), //fork数量
    issues: z.number(), //issue数量
    pullRequests: z.number(), //pull request数量
    contributors: z.number(), //贡献者数量
    languages: z.array(z.string()),
    topics: z.array(z.string()),
    lastCommit: z.string(),
    lastCommitMessage: z.string(),
    lastCommitAuthor: z.string(),
    lastCommitDate: z.string(),
  }).optional(),
});

/**
 * github应用排行提交事件
 */
export const zGithubRankEventSchema = z.object({
  submissions: z.array(z.object({
    userId: z.string(), // 发布人
    status: z.string(), // 提交状态
    name: z.string(), // 应用名称
    description: z.string(), // 应用描述
    longDescription: z.string(), // 应用长描述
    type: z.string(), // 应用类型
    website: z.string(), // 应用网站
    github: z.string(), // GitHub 地址
    docs: z.string(), // 文档地址
    favicon: z.string(), // favicon 地址
    logo: z.string(), // logo 地址
  }))
})

// 提交数据}),
// 定义事件模式
export const eventSchemas = new EventSchemas().fromZod({
  'website-content/start': {
    data: zWebsiteContentStartEventSchema,
  },
  'website-content/end': {
    data: zWebsiteContentEndEventSchema,
  },
  'github-repo/start': {
    data: zGithubRepoStartEventSchema,
  },
  'github-repo/end': {
    data: zGithubRepoEndEventSchema,
  },
  'github-repo/failed': {
    data: zGithubRepoEndEventSchema,
  },
  'github-app-submission/daily': {
    data: zGithubRankEventSchema,
  },
  'github-app-submission/weekly': {
    data: zGithubRankEventSchema,
  },
  'github-app-submission/monthly': {
    data: zGithubRankEventSchema,
  },
});

// 创建 inngest 客户端
export const inngest = new Inngest({
  id: 'apps-content-scraper',
  schemas: eventSchemas,
  eventKey: process.env.INNGEST_EVENT_KEY
});

// 导出事件类型
export type WebsiteContentStartEvent = z.infer<typeof zWebsiteContentStartEventSchema>;
export type WebsiteContentEndEvent = z.infer<typeof zWebsiteContentEndEventSchema>;
export type GithubRepoStartEvent = z.infer<typeof zGithubRepoStartEventSchema>;
export type GithubRepoEndEvent = z.infer<typeof zGithubRepoEndEventSchema>;

