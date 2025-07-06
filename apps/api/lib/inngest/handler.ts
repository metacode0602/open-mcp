import { analyzeRepositoryStack } from './anaylyser';
import { inngest } from './client';
import type { WebsiteContentStartEvent, GithubRepoStartEvent } from './client';
import { appAnalysisHistoryDataAccess } from '@repo/db/database/admin';

// 内容抓取开始事件 - 
export const handleWebsiteContentStarted = inngest.createFunction(
  { id: 'handle-website-content-started' },
  { event: 'website-content/start' },
  async ({ event, step }: { event: { data: WebsiteContentStartEvent }, step: any }) => {
    const { jobId, appId, userId, website, status } = event.data;
    const startTime = Date.now();

    try {
      // 更新任务状态为进行中
      await step.run('website-content-status', async () => {
        return await appAnalysisHistoryDataAccess.updateStatus(jobId, {
          status: 'in_progress',
          startTime: new Date(),
          id: jobId
        });
      });

      // 这里需要真实的抓取并分析网站内容
      const result = await appAnalysisHistoryDataAccess.updateStatus(jobId, {
        status: 'completed',
        endTime: new Date(),
        id: jobId
      });

      const duration = Date.now() - startTime;
      // 发送推送完成事件
      await step.run('website-content-completed', async () => {
        await inngest.send({
          name: 'website-content/end',
          data: {
            jobId,
            status: 'completed',
            message: '网站内容抓取完成',
            // detail: {
            //   ...result
            // },
          },
        });
      });

    } catch (error) {
      const duration = Date.now() - startTime;

      // 发送错误事件
      await step.run('send-error-event', async () => {
        await inngest.send({
          name: 'website-content/end',
          data: {
            jobId,
            status: 'failed',
            error: error instanceof Error ? error.message : '未知错误'
          },
        });
      });

      // 更新任务状态为失败
      await step.run('update-job-status-failed', async () => {
        return await appAnalysisHistoryDataAccess.updateStatus(jobId, {
          status: 'failed',
          endTime: new Date(),
          error: error instanceof Error ? error.message : '未知错误',
          id: jobId
        });
      });
    }
  }
);

// 处理github仓库开始事件
export const handleGithubRepoStartProgress = inngest.createFunction(
  { id: 'handle-github-repo-start' },
  { event: 'github-repo/start' },
  async ({ event, step }: { event: { data: GithubRepoStartEvent }, step: any }) => {
    const { jobId, appId, github } = event.data;
    console.info("[api] [inngest] [handlers.ts] [handleGithubRepoStartProgress] event", event)
    try {
      // 更新任务状态为进行中
      await step.run('github-repo-status', async () => {
        return await appAnalysisHistoryDataAccess.updateAPIStatus(jobId, {
          status: 'in_progress',
          startTime: new Date(),
          appId: appId,
          type: 'github',
          github: github
        });
      });

      // 获取github仓库信息
      const { stack, repository, readme, summary, features } = await analyzeRepositoryStack(github);

      // 更新任务状态为完成
      await step.run('github-repo-completed', async () => {
        /**
         *     name: repository.name.toLowerCase(),
    nameWithOwner: repository.nameWithOwner.toLowerCase(),
    description: repository.description,
    url: repository.url,
    homepageUrl: repository.homepageUrl,
    stars: metrics.stars,
    forks: metrics.forks,
    contributors: metrics.contributors,
    watchers: metrics.watchers,
    pushedAt: metrics.pushedAt,
    createdAt: metrics.createdAt,
    score,
    license,
    topics,
         */
        await inngest.send({
          name: 'github-repo/end',
          data: {
            jobId,
            status: 'completed',
            message: 'github仓库分析完成',
            detail: {
              readme,
              longDescription: summary,
              features: features as string[],
              issues: repository?.issues ?? 0,
              favicon: '',
              version: repository?.latestRelease?.name ?? '',
              openGraphImageUrl: repository?.openGraphImageUrl ?? '',
              watchers: repository?.watchers ?? 0,
              description: repository?.description ?? '',
              pullRequests: repository?.pullRequests ?? 0,
              primaryLanguage: repository?.primaryLanguage ?? '',
              languages: repository?.languages ?? [],
              lastCommit: repository?.lastCommitDate ? repository?.lastCommitDate.toLocaleString() : '',
              lastCommitMessage: '',
              lastCommitAuthor: '',
              lastCommitDate: repository?.lastCommitDate ? repository?.lastCommitDate.toLocaleString() : '',
              commits: repository?.commits ?? 0,
              license: repository?.license ?? '',
              stars: repository?.stars ?? 0,
              forks: repository?.forks ?? 0,
              releases: repository?.releases ?? 0,
              contributors: repository?.contributors ?? 0,
              topics: repository?.topics ?? [],
            },
          },
        });
        // 更新数据库中的分析结果
        return await appAnalysisHistoryDataAccess.updateAPIResult(jobId, {
          status: 'completed',
          endTime: new Date(),
          analysisResult: {
            stack,
            repository
          },
          features: [],
          tools: [],
          tags: [],
          categories: [],
          readme,
          message: 'github仓库分析完成',
          error: ''
        });
      });

    } catch (error) {
      console.error("[api] [inngest] [handlers.ts] [handleGithubRepoStartProgress] error", error)
      await step.run('github-repo-failed', async () => {
        await inngest.send({
          name: 'github-repo/failed',
          data: {
            jobId,
            status: 'failed',
            error: error instanceof Error ? error.message : '未知错误'
          },
        });
        return await appAnalysisHistoryDataAccess.updateAPIStatus(jobId, {
          status: 'failed',
          endTime: new Date(),
          error: error instanceof Error ? error.message : '未知错误',
          appId: event.data.appId,
          type: 'github',
          github: event.data.github
        });
      });
    }
  }
);