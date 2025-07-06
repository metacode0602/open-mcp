import { analyzeRepositoryStack } from "@/lib/inngest/anaylyser";
import { appsDataAccess } from "@repo/db/database/admin";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest,) {
  const { searchParams } = new URL(request.url);
  const appId = searchParams.get("appId") || searchParams.get("id");
  console.info("appId", appId);
  if (appId) {
    const apps = await appsDataAccess.getById(appId);
    console.info("apps", apps);
    if (!apps || !apps.github) {
      return Response.json({ error: "应用不存在" }, { status: 404 });
    }
    apps.github = "https://github.com/modelcontextprotocol/servers/tree/main/src/github";

    const { stack, repository, readme } = await analyzeRepositoryStack(apps.github);
    return Response.json({ repository, readme, stack }, { status: 200 });
  }
  return Response.json({ error: "缺少应用 ID 或名称" }, { status: 400 });

}