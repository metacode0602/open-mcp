import { inngest } from '@repo/trpc';
import { serve } from 'inngest/next';

import {
  handleGithubDailyRank, handleGithubMonthlyRank, handleGithubRepoEndProgress,
  handleGithubRepoFailedProgress, handleGithubWeeklyRank
} from '@/lib/inngest/handler';

export const dynamic = "force-dynamic";

if (!process.env.INNGEST_SIGNING_KEY) {
  console.warn('[Inngest] Warning: INNGEST_SIGNING_KEY is not set');
}

if (!process.env.INNGEST_BASE_URL) {
  console.warn('[Inngest] Warning: INNGEST_BASE_URL is not set');
}

// 创建 Inngest 服务器
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    handleGithubRepoEndProgress,
    handleGithubRepoFailedProgress,
    handleGithubWeeklyRank,
    handleGithubDailyRank,
    handleGithubMonthlyRank
  ],
}); 