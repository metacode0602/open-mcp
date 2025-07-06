
import { appAnalysisHistoryDataAccess, rankingsDataAccess, appSubmissionData } from '@repo/db/database/admin';
import { CreateAppSubmission } from '@repo/db/types';
import { GithubRepoEndEvent, inngest } from '@repo/trpc';
import { slugifyText } from '@repo/db';

// 添加 sleep 工具函数
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 处理github仓库结束事件
 * @param event
 * @param step
 * @returns
 */
export const handleGithubRepoEndProgress = inngest.createFunction(
  { id: 'handle-github-repo-end' },
  { event: 'github-repo/end' },
  async ({ event, step }: { event: { data: GithubRepoEndEvent }, step: any }) => {
    const { jobId, status, detail } = event.data;
    console.info("[api] [inngest] [handlers.ts] [handleGithubRepoEndProgress] event", event)
    try {
      // 更新任务状态为完成
      await step.run('update-job-status-completed', async () => {
        return await appAnalysisHistoryDataAccess.updateResult(jobId, {
          status: 'completed',
          endTime: new Date(),
          analysisResult: {
            ...detail
          },
          features: [],
          tools: [],
          tags: [],
          categories: [],
          readme: detail?.readme ?? "",
          message: 'github仓库分析完成',
          error: ''
        });
      });

    } catch (error) {
      console.error("[api] [inngest] [handlers.ts] [handleGithubRepoEndProgress] error", error)
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
//

export const handleGithubRepoFailedProgress = inngest.createFunction(
  { id: 'handle-github-repo-failed' },
  { event: 'github-repo/failed' },
  async ({ event, step }: { event: { data: GithubRepoEndEvent }, step: any }) => {
    const { jobId, status, error } = event.data;
    console.info("[api] [inngest] [handlers.ts] [handleGithubRepoFailedProgress] event", event)
    try {
      // 更新任务状态为失败
      await step.run('update-job-status-failed', async () => {
        return await appAnalysisHistoryDataAccess.updateStatus(jobId, {
          status: 'failed',
          endTime: new Date(),
          error: error ? error : '未知错误',
          id: jobId
        });
      });

    } catch (error) {
      console.error("[api] [inngest] [handlers.ts] [handleGithubRepoFailedProgress] error", error)
    }
  }
);



async function processAppRankings(submissions: CreateAppSubmission[], rankingType: "daily" | "weekly" | "monthly") {
  const appIds = await rankingsDataAccess.createGithubAppSubmissionRank(submissions, rankingType);

  for (const appData of appIds) {
    console.log('Waiting for 3 minute before starting analysis...', appData.github);
    if (appData.github && appData.github.trim().length > 0) {
      const job = await appAnalysisHistoryDataAccess.startAnalysis(appData.id, appData.github, "github");
      if (job) { // 发送异步消息，重新抓取信息
        await inngest.send({
          name: "github-repo/start",
          data: {
            appId: appData.id,
            github: appData.github,
            jobId: job.id,
            userId: "system",
            status: "in_progress",
          },
        });
        await sleep(1 * 60 * 1000); // 60秒 = 1分钟
        console.log('Analysis started for GitHub repo:', appData.github);
      }
    }
  }
}

/**
 * 处理github仓库日排行
 */
export const handleGithubDailyRank = inngest.createFunction(
  { id: 'handle-github-daily-rank' },
  { event: 'github-app-submission/daily' },
  async ({ event, step }) => {
    const { submissions } = event.data;
    console.info("[api] [inngest] [handlers.ts] [handleGithubDailyRank] event", event)
    try {
      // 处理提交的应用
      await step.run('process-github-app-submission', async () => {
        // @ts-expect-error
        const processed = await appSubmissionData.createGithubAppSubmission(submissions);
        //这里处理起来有点麻烦，因为我们需要在这里处理提交的应用，本来准备手动处理，但是增加了排行之后，需要自动入库并显示排行数据
        await processAppRankings(submissions.map(s => ({
          ...s,
          slug: slugifyText(s.name), //根据名称生成slug
          status: s.status as "pending" | "approved" | "rejected" | "archived",
          type: s.type as "client" | "server" | "application"
        })), "daily");
        return processed

      });
    } catch (error) {
      console.error("[api] [inngest] [handlers.ts] [handleGithubDailyRank] error", error)
    }
  }
);

/**
 * 处理github仓库周排行

 */
export const handleGithubWeeklyRank = inngest.createFunction(
  { id: 'handle-github-weekly-rank' },
  { event: 'github-app-submission/weekly' },
  async ({ event, step }) => {
    const { submissions } = event.data;
    console.info("[api] [inngest] [handlers.ts] [handleGithubweeklyRank] event", event)
    try {
      // 处理提交的应用
      await step.run('process-github-app-submission-weekly', async () => {
        // @ts-expect-error
        const processed = await appSubmissionData.createGithubAppSubmission(submissions);
        //这里处理起来有点麻烦，因为我们需要在这里处理提交的应用，本来准备手动处理，但是增加了排行之后，需要自动入库并显示排行数据
        await processAppRankings(submissions.map(s => ({
          ...s,
          slug: slugifyText(s.name), //根据名称生成slug
          status: s.status as "pending" | "approved" | "rejected" | "archived",
          type: s.type as "client" | "server" | "application"
        })), "weekly");
        return processed
      });
    } catch (error) {
      console.error("[api] [inngest] [handlers.ts] [handleGithubweeklyRank] error", error)
    }
  }
);

/**
 * 处理github仓库月排行
 */
export const handleGithubMonthlyRank = inngest.createFunction(
  { id: 'handle-github-monthly-rank' },
  { event: 'github-app-submission/monthly' },
  async ({ event, step }) => {
    const { submissions } = event.data;
    console.info("[api] [inngest] [handlers.ts] [handleGithubmonthlyRank] event", event)
    try {
      // 处理提交的应用
      await step.run('process-github-app-submission-monthly', async () => {
        // @ts-expect-error
        const processed = await appSubmissionData.createGithubAppSubmission(submissions);
        //这里处理起来有点麻烦，因为我们需要在这里处理提交的应用，本来准备手动处理，但是增加了排行之后，需要自动入库并显示排行数据
        await processAppRankings(submissions.map(s => ({
          ...s,
          slug: slugifyText(s.name), //根据名称生成slug
          status: s.status as "pending" | "approved" | "rejected" | "archived",
          type: s.type as "client" | "server" | "application"
        })), "monthly");
        return processed
      });
    } catch (error) {
      console.error("[api] [inngest] [handlers.ts] [handleGithubMonthlyRank] error", error)
    }
  }
);