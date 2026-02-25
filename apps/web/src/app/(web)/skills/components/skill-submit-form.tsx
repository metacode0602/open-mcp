"use client"

import { useState, useCallback, type DragEvent } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  GitBranch,
  Upload,
  ExternalLink,
  Send,
  CheckCircle,
  AlertCircle,
  Star,
  GitFork,
  FileArchive,
  X,
  Loader2,
} from "lucide-react"
import { cn } from "@repo/ui/lib/utils"

type SubmitMode = "github" | "zip"

interface ParsedRepoInfo {
  owner: string
  repo: string
  fullName: string
  description: string
  stars: number
  forks: number
  language: string
}

export function SkillSubmitForm() {
  const [mode, setMode] = useState<SubmitMode>("github")
  const [githubUrl, setGithubUrl] = useState("")
  const [parsedRepo, setParsedRepo] = useState<ParsedRepoInfo | null>(null)
  const [parseLoading, setParsing] = useState(false)
  const [parseError, setParseError] = useState("")
  const [zipFile, setZipFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const parseGithubUrl = useCallback(async () => {
    setParseError("")
    setParsedRepo(null)

    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/\s#?]+)/)
    if (!match) {
      setParseError("请输入有效的 GitHub 仓库地址，例如 https://github.com/owner/repo")
      return
    }

    setParsing(true)
    const [, owner, repo] = match
    const repoName = repo?.replace(/\.git$/, "")

    // Simulate API parsing with realistic data
    await new Promise((r) => setTimeout(r, 1200))

    setParsedRepo({
      owner,
      repo: repoName!,
      fullName: `${owner}/${repoName}`,
      description: `${repoName} - OpenClaw Skill repository`,
      stars: Math.floor(Math.random() * 500) + 10,
      forks: Math.floor(Math.random() * 100) + 5,
      language: "TypeScript",
    })
    setParsing(false)
  }, [githubUrl])

  const handleDrag = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file && (file.name.endsWith(".zip") || file.type === "application/zip")) {
      setZipFile(file)
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setZipFile(file)
    }
  }, [])

  const handleSubmit = () => {
    // MVP: redirect to GitHub to create PR
    window.open("https://github.com/openclaw/awesome-openclaw-usecases/pulls", "_blank")
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/skills"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        返回 Skills 仓库
      </Link>

      {/* Header */}
      <div className="mb-10">
        <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
          提交 Skill
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          通过 GitHub 仓库地址或 ZIP 包上传方式提交你的 Skill，经社区审核后将收录到 Skills 仓库。
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="mb-8 flex rounded-xl border border-border bg-card p-1.5">
        <button
          onClick={() => setMode("github")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all",
            mode === "github"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <GitBranch className="h-4 w-4" />
          GitHub 仓库
        </button>
        <button
          onClick={() => setMode("zip")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all",
            mode === "zip"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Upload className="h-4 w-4" />
          ZIP 包上传
        </button>
      </div>

      {/* GitHub Mode */}
      {mode === "github" && (
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 text-base font-semibold text-foreground">
              GitHub 仓库地址
            </h3>
            <div className="flex gap-3">
              <input
                type="url"
                placeholder="https://github.com/username/skill-name"
                value={githubUrl}
                onChange={(e) => {
                  setGithubUrl(e.target.value)
                  setParsedRepo(null)
                  setParseError("")
                }}
                className="flex-1 rounded-lg border border-border bg-input px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={parseGithubUrl}
                disabled={!githubUrl.trim() || parseLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {parseLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4" />
                )}
                解析
              </button>
            </div>

            {parseError && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {parseError}
              </div>
            )}

            {parsedRepo && (
              <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">仓库解析成功</span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-semibold text-foreground">
                      {parsedRepo.fullName}
                    </span>
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                      {parsedRepo.language}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{parsedRepo.description}</p>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3.5 w-3.5 text-amber-400" />
                      {parsedRepo.stars}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <GitFork className="h-3.5 w-3.5 text-primary" />
                      {parsedRepo.forks}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ZIP Mode */}
      {mode === "zip" && (
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 text-base font-semibold text-foreground">
              上传 ZIP 包
            </h3>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-16 transition-all",
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50",
                zipFile && "border-primary/30 bg-primary/5"
              )}
            >
              {zipFile ? (
                <div className="flex flex-col items-center gap-3">
                  <FileArchive className="h-10 w-10 text-primary" />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">{zipFile.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {(zipFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => setZipFile(null)}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                    移除
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm text-foreground">
                      拖拽 ZIP 文件到此处，或{" "}
                      <label className="cursor-pointer font-medium text-primary hover:text-primary/80">
                        点击选择
                        <input
                          type="file"
                          accept=".zip"
                          onChange={handleFileSelect}
                          className="sr-only"
                        />
                      </label>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      仅支持 .zip 格式，最大 50MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Requirements */}
      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 text-base font-semibold text-foreground">提交要求</h3>
        <ul className="flex flex-col gap-3">
          {[
            "仓库/包中需包含 skill.yaml 配置文件，定义 Skill 元信息",
            "提供完整的 README 文档，包含用法说明和配置示例",
            "确保代码通过基本测试，无明显 Bug",
            "不包含任何敏感信息（API Key、密码等）",
          ].map((req) => (
            <li key={req} className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="text-sm text-muted-foreground">{req}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Submit CTA */}
      <div className="mt-8 rounded-xl border border-primary/30 bg-primary/5 p-8 text-center">
        <Send className="mx-auto mb-4 h-10 w-10 text-primary" />
        <h2 className="mb-2 text-xl font-semibold text-foreground">
          准备好了吗？
        </h2>
        <p className="mb-6 text-muted-foreground">
          {mode === "github"
            ? "我们将引导你到 GitHub 创建 Pull Request 来提交你的 Skill。"
            : "上传完成后，我们将引导你到 GitHub 完成最终提交。"}
        </p>
        <button
          onClick={handleSubmit}
          disabled={mode === "github" ? !parsedRepo : !zipFile}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          前往 GitHub 提交 PR
        </button>
      </div>
    </div>
  )
}
