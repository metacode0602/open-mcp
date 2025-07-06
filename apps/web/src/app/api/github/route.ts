import { appAnalysisHistoryDataAccess, appsDataAccess } from "@repo/db/database/admin";
import { inngest } from "@repo/trpc";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

let isRunning = false;

// 添加 sleep 工具函数
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(request: NextRequest) {
  if (isRunning) {
    return new Response("Analysis is already running", { status: 200 });
  }

  isRunning = true;

  try {
    // Initial run
    await runAnalysis();

    // Set up interval for every 5 minutes
    // const intervalId = setInterval(runAnalysis, 5 * 60 * 1000);

    // Keep the connection alive
    return new Response(null, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    isRunning = false;
    console.error('Error in GET handler:', error);
    return new Response("Error occurred during analysis", { status: 500 });
  }
}

async function runAnalysis() {
  try {
    const allApps = await appsDataAccess.search({ page: 1, limit: 500 });
    console.log(`Starting analysis for ${allApps.data.length} apps at ${new Date().toISOString()}`);

    // 为每个应用创建分析请求
    for (const appData of allApps.data) {
      if (appData.github) {
        // 等待1分钟
        console.log('Waiting for 3 minute before starting analysis...', appData.github);
        const job = await appAnalysisHistoryDataAccess.startAnalysis(appData.id, appData.github, "github");
        if (job) {
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
          console.log('Analysis started for GitHub repo:', appData.github);
          await sleep(3 * 60 * 1000); // 60秒 = 1分钟
        }
      }
    }

    console.log('Analysis completed at:', new Date().toISOString());
  } catch (error) {
    console.error('Error during analysis:', error);
  }
}