import { execFileSync } from "node:child_process"
import path from "node:path"
import { createGithubClient, getRepositoryString } from "@repo/github"
import fs from "fs-extra"
import { analyser, FSProvider } from "@specfy/stack-analyser"
// /!\ Load default rules
// without this no rules will be enabled by default
import '@specfy/stack-analyser/dist/autoload';
import { extractFeatures, translateContent } from "./openai-utils"


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

const getRepoUrl = (repo: string) => {
  return repo.startsWith("https://github.com") ? repo : `https://github.com/${repo}`;
}

const cloneRepository = async (repo: string, repoDir: string) => {
  console.time("Cloning/Updating repository")
  console.log("[api] [inngest] [anaylyser.ts] [cloneRepository] Cloning/Updating repository: ", repo, repoDir)

  const isValidGitRepo = (dir: string): boolean => {
    try {
      process.chdir(dir)
      execFileSync("git", ["rev-parse", "--git-dir"], { stdio: 'ignore' })
      return true
    } catch (error) {
      return false
    }
  }

  const removeDirectoryWithRetry = async (dir: string, maxAttempts = 3): Promise<void> => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // First try to remove all file attributes that might be causing issues
        if (fs.pathExistsSync(dir)) {
          execFileSync("attrib", ["-R", "-H", "-S", "/S", "/D", dir], { stdio: 'ignore' })
        }

        // Try to remove the directory
        await fs.remove(dir)
        return
      } catch (error) {
        if (attempt === maxAttempts) {
          throw error
        }
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, attempt * 1000))
      }
    }
  }

  const currentDir = process.cwd()
  try {

    if (fs.pathExistsSync(repoDir)) {
      if (isValidGitRepo(repoDir)) {
        try {
          process.chdir(repoDir)
          // Reset any local changes
          execFileSync("git", ["reset", "--hard"])
          // Clean untracked files
          execFileSync("git", ["clean", "-fd"])
          // Fetch and pull latest changes
          execFileSync("git", ["fetch", "origin"])
          execFileSync("git", ["pull", "origin"])
        } catch (error) {
          // If git commands fail, treat as invalid repo
          console.log("[api] [inngest] [anaylyser.ts] [cloneRepository] Git commands failed, treating as invalid repository")
          process.chdir(currentDir)
          await removeDirectoryWithRetry(repoDir)
          await fs.ensureDir(repoDir)
          execFileSync("git", ["clone", getRepoUrl(repo), repoDir])
        }
      } else {
        // Repository exists but is invalid
        console.log("[api] [inngest] [anaylyser.ts] [cloneRepository] Invalid git repository, removing and cloning again")
        process.chdir(currentDir)
        await removeDirectoryWithRetry(repoDir)
        await fs.ensureDir(repoDir)
        execFileSync("git", ["clone", getRepoUrl(repo), repoDir])
      }
    } else {
      // Repository doesn't exist, clone it
      await fs.ensureDir(repoDir)
      execFileSync("git", ["clone", getRepoUrl(repo), repoDir])
    }
  } catch (error) {
    console.error(`Error managing repository ${repo}:`, error)
    throw new Error(`Error managing repository ${repo}: ${error}`)
  } finally {
    // Always try to return to the original directory
    try {
      process.chdir(currentDir)
    } catch (error) {
      console.warn("Failed to change back to original directory:", error)
    }
    console.timeEnd("Cloning/Updating repository")
  }
}

const analyzeStack = async (repo: string, repoDir: string, outputFile: string) => {
  console.time("Analyzing stack")
  console.log("[api] [inngest] [anaylyser.ts] [analyzeStack] Analyzing stack: ", repo, repoDir, outputFile)
  try {
    // Analyze a folder
    const result = await analyser({
      provider: new FSProvider({
        path: repoDir,
      }),
    });

    // Output to JSON
    const json = result.toJson();

    // De-nest the output and deduplicate childs
    // const flat = flatten(result, { merge: true });
    // console.info("[api] [inngest] [anaylyser.ts] [analyzeStack] Analyzing stack json: ", JSON.stringify(json))
    return json
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
  // 优先读取中文README
  let readmeFile = path.join(repoDir, "README_CN.md")
  if (!fs.pathExistsSync(readmeFile)) {
    readmeFile = path.join(repoDir, "README.md")
  }
  if (!fs.pathExistsSync(readmeFile)) {
    return { readme: "", features: "", summary: "" }
  }

  const readme = fs.readFileSync(readmeFile, "utf-8")
  let translatedReadme = readme

  // 如果是英文README，则翻译成中文
  if (readmeFile.endsWith("README.md")) {
    try {
      translatedReadme = await translateContent(readme)
      console.info("[api] [inngest] [anaylyser.ts] [readReadme] Translated README: ", translatedReadme)
    } catch (error) {
      console.error("Translation error:", error)
    }
  }

  // 使用OpenAI生成应用核心功能特性和概要
  try {
    const json = await extractFeatures(translatedReadme);
    return { readme: translatedReadme, features: json?.features, summary: json?.summary };
  } catch (error) {
    console.error("Features/Summary generation error:", error);
    return { readme: translatedReadme, features: [], summary: "" };
  }
}

export const analyzeRepositoryStack = async (url: string) => {
  const { repo, repoDir, outputFile } = getRepoInfo(url)
  const githubClient = createGithubClient(process.env.GITHUB_TOKEN || "")
  const repoUrl = getRepoUrl(repo);
  try {
    await cloneRepository(repoUrl, repoDir)

    const [{ readme, features, summary }, { childs }, repository] = await Promise.all([
      readReadme(repoDir),
      // Get analysis
      analyzeStack(repo, repoDir, outputFile),

      // Get repository
      githubClient.queryRepository(repoUrl),
    ])

    return { stack: childs, repository, readme, features, summary }
  } finally {
    await cleanupDirectories(repo, repoDir, outputFile).catch(() => { })
  }
}
