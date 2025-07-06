import { createRankClient, GithubRepository } from "@repo/github";
import { NextResponse } from "next/server";
import { appSubmissionData } from "@repo/db/database/admin";
import { AppSubmissionStatus, AppType } from "@repo/db/types";
import { inngest } from "@/lib/inngest/client";
import { translateContent } from "@/lib/inngest/openai-utils";

const rankClient = createRankClient(process.env.GITHUB_TOKEN!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'daily'; // daily, weekly, monthly
    let result: GithubRepository[] = [];

    if (period === 'daily') {
      result = await rankClient.getDailyRank();
    } else if (period === 'weekly') {
      result = await rankClient.getWeeklyRank();
    } else if (period === 'monthly') {
      result = await rankClient.getMonthlyRank();
    }

    if (result.length > 0) {
      const submissions = result.map(repo => ({
        userId: 'system', // 系统自动创建
        status: 'pending' as AppSubmissionStatus,
        name: repo.name,
        description: repo.description || '',
        longDescription: repo.description || '',
        type: 'application' as AppType,
        website: repo.homepageUrl || '',
        github: repo.url,
        docs: '',
        favicon: '',
        logo: repo.owner?.avatarUrl || '',
      }));
      // 将所有的description

      const submitted = await appSubmissionData.createGithubAppSubmission(submissions);
      console.info("[api/github] [route.ts] submitted: ", submitted);
      // 只翻译 新创建的提交
      const submittedMap = new Map<string, string>();
      for (const submission of submitted) {
        if (submission.description) {
          const translatedDescription = await translateContent(submission.description);
          if (submission.github) {
            submittedMap.set(submission.github, translatedDescription);
          }
          await appSubmissionData.updateAppSubmission(submission.id, {
            description: translatedDescription,
            longDescription: translatedDescription,
          });
        }
      }
      // 发送inngest之前，需要更新description为翻译后的数据
      for (const submission of submissions) {
        if (submittedMap.has(submission.github)) {
          submission.description = submittedMap.get(submission.github)!;
          submission.longDescription = submittedMap.get(submission.github)!;
        }
      }

      // 发送到 inngest 处理
      await inngest.send({
        name: `github-app-submission/${period as "daily" | "weekly" | "monthly"}`,
        data: {
          submissions,
        },
      });

    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('GitHub API 错误:', error);
    return NextResponse.json(
      { error: '获取仓库信息时发生错误' },
      { status: 500 }
    );
  }
}