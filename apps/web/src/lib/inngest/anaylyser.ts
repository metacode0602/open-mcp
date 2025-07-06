import { execFileSync } from "node:child_process"
import path from "node:path"
import { createGithubClient, getRepositoryString } from "@repo/github"
import type { AnalyserJson } from "@specfy/stack-analyser"
import fs from "fs-extra"

if (!process.env.REPO_DIR) {
  throw new Error("REPO_DIR is not set")
}

const getRepoInfo = (url: string) => {
  const repo = getRepositoryString(url)
  console.log("[api] [inngest] [anaylyser.ts] [getRepoInfo] Getting repo info: ", process.env.REPO_DIR)
  const repoDir = path.join(process.env.REPO_DIR!, ".repositories", repo)
  if (!fs.pathExistsSync(repoDir)) {
    fs.ensureDirSync(path.dirname(repoDir))
  }
  const outputFile = path.join(repoDir, "output", `output-${repo.replace("/", "-")}.json`)
  if (!fs.pathExistsSync(outputFile)) {
    fs.ensureDirSync(path.dirname(outputFile))
  }

  return { repo, repoDir, outputFile }
}

const cloneRepository = async (repo: string, repoDir: string) => {
  console.time("Cloning repository")
  console.log("[api] [inngest] [anaylyser.ts] [cloneRepository] Cloning repository: ", repo, repoDir)
  try {
    if (fs.pathExistsSync(repoDir)) {
      await fs.remove(repoDir)
    }
    fs.ensureDirSync(repoDir)
    execFileSync("git", ["clone", `${repo}`, repoDir])
  } catch (error) {
    console.error(`Error cloning ${repo}:`, error)
    throw new Error(`Error cloning ${repo}`)
  } finally {
    console.timeEnd("Cloning repository")
  }
}

const analyzeStack = async (repo: string, repoDir: string, outputFile: string) => {
  console.time("Analyzing stack")

  try {
    execFileSync("bun", ["x", "@specfy/stack-analyser", repoDir, "--flat", "-o", outputFile])
    const output = fs.readFileSync(outputFile, "utf-8")
    return JSON.parse(output) as AnalyserJson
  } catch (error) {
    console.error(`Error analyzing stack for ${repo}:`, error)
    throw error
  } finally {
    console.timeEnd("Analyzing stack")
  }
}

const cleanupDirectories = async (repo: string, repoDir: string, outputFile: string) => {
  console.time("Cleaning up directories")

  try {
    await fs.remove(repoDir)
    await fs.remove(outputFile)
  } catch (error) {
    console.error(`Cleanup error for ${repo}:`, error)
    throw error
  } finally {
    console.timeEnd("Cleaning up directories")
  }
}

const readReadme = async (repoDir: string) => {
  let readmeFile = path.join(repoDir, "README_CN.md")
  if (!fs.pathExistsSync(readmeFile)) {
    readmeFile = path.join(repoDir, "README.md")
  }
  if (!fs.pathExistsSync(readmeFile)) {
    return ""
  }
  const readme = fs.readFileSync(readmeFile, "utf-8")
  if (readmeFile.endsWith("README.md")) {
    // TODO: 这里需要添加翻译逻辑
    // 可以使用翻译API或翻译服务
    return readme
  }
  return readme
}

export const analyzeRepositoryStack = async (url: string) => {
  const { repo, repoDir, outputFile } = getRepoInfo(url)
  const githubClient = createGithubClient(process.env.GITHUB_TOKEN || "")
  const repoUrl = repo.startsWith("https://github.com") ? repo : `https://github.com/${repo}`;

  try {
    await cloneRepository(repoUrl, repoDir)

    const [readme, { childs }, repository] = await Promise.all([
      readReadme(repoDir),
      // Get analysis
      analyzeStack(repo, repoDir, outputFile),

      // Get repository
      githubClient.queryRepository(repoUrl),
    ])

    return { stack: [...new Set(childs.flatMap(({ techs }) => techs))], repository, readme }
  } finally {
    // await cleanupDirectories(repo, repoDir, outputFile).catch(() => { })
  }
}
