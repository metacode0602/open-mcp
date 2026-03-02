import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowLeft,
  FileText,
  GitPullRequest,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Send,
} from "lucide-react"
import { CopyButton } from "@/components/copy-button"

export const metadata: Metadata = {
  title: "贡献指南 - OpenClaw Usecases",
  description: "了解如何向 Awesome OpenClaw Usecases 提交你的自动化案例。",
}

const templateYaml = `# 案例名称
title: "你的案例名称"
category: social | creative | efficiency | knowledge
difficulty: beginner | intermediate | advanced
tags: ["标签1", "标签2"]

# 场景描述
scenario: |
  描述你遇到的问题和痛点...

# 实现步骤
steps:
  - "步骤 1：..."
  - "步骤 2：..."
  - "步骤 3：..."

# 配置文件
config: |
  trigger:
    ...
  pipeline:
    ...

# 效果展示
effect: "量化的效果描述..."

# 作者信息
author: "你的名字"
`

const guidelines = [
  {
    icon: <CheckCircle className="h-5 w-5" />,
    title: "真实验证",
    description:
      "所有提交的案例必须是你在实际工作中使用过的，而不是理论上的构想。请确保方案经过测试并有实际效果数据。",
  },
  {
    icon: <FileText className="h-5 w-5" />,
    title: "结构完整",
    description:
      "每个案例需包含完整的四个部分：场景描述、实现步骤、配置文件/代码、效果展示。缺少任何部分都会导致审核不通过。",
  },
  {
    icon: <Lightbulb className="h-5 w-5" />,
    title: "价值导向",
    description:
      "案例应聚焦于解决真实问题，而非炫技。清晰说明痛点和解决方案，让读者能够快速理解并复用。",
  },
  {
    icon: <AlertCircle className="h-5 w-5" />,
    title: "数据脱敏",
    description:
      "请确保配置文件中不包含任何敏感信息（API Key、密码等），使用环境变量占位符替代。",
  },
]

const steps = [
  {
    step: "01",
    title: "Fork 仓库",
    description:
      "Fork 我们的 GitHub 仓库到你的账号，并在本地克隆开发。",
  },
  {
    step: "02",
    title: "编写案例",
    description:
      "按照模板格式填写案例信息，确保内容真实且经过验证。",
  },
  {
    step: "03",
    title: "提交 PR",
    description:
      "将你的案例通过 Pull Request 提交到主仓库，并在描述中说明案例的核心价值。",
  },
  {
    step: "04",
    title: "审核发布",
    description:
      "社区维护者会在 3 个工作日内审核你的提交，通过后案例将出现在案例库中。",
  },
]

export default function ContributePage() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          返回案例库
        </Link>

        {/* Header */}
        <div className="mb-12">
          <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            贡献指南
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            我们欢迎所有人分享真实的 OpenClaw 自动化案例。无论你的案例多么简单，只要它解决了真实问题，就值得被记录和分享。
          </p>
        </div>

        {/* Guidelines */}
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-semibold text-foreground">
            投稿要求
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {guidelines.map((g) => (
              <div
                key={g.title}
                className="rounded-xl border border-border bg-card p-6"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="text-primary">{g.icon}</div>
                  <h3 className="font-semibold text-foreground">{g.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {g.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Process */}
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-semibold text-foreground">
            投稿流程
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {steps.map((s) => (
              <div
                key={s.step}
                className="flex gap-4 rounded-xl border border-border bg-card p-6"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono text-sm font-bold text-primary">
                  {s.step}
                </span>
                <div>
                  <h3 className="mb-1 font-semibold text-foreground">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {s.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Template */}
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-semibold text-foreground">
            案例模板
          </h2>
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="font-mono text-xs text-muted-foreground">
                usecase-template.yaml
              </span>
              <CopyButton text={templateYaml} />
            </div>
            <pre className="overflow-x-auto p-6">
              <code className="font-mono text-sm leading-relaxed text-muted-foreground">
                {templateYaml}
              </code>
            </pre>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-xl border border-primary/30 bg-primary/5 p-8 text-center">
          <GitPullRequest className="mx-auto mb-4 h-10 w-10 text-primary" />
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            准备好提交了吗？
          </h2>
          <p className="mb-6 text-muted-foreground">
            将你的真实自动化经验分享给社区，帮助更多人提升生产力。
          </p>
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
            前往 GitHub 提交 PR
          </Link>
        </section>
      </div>
    </main>
  )
}
