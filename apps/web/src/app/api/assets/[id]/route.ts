import { readFile } from "node:fs/promises";

import { getAssetById } from "@repo/db/database/admin";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const asset = await getAssetById(id);
    if (!asset) {
      return Response.json({ error: "资产不存在" }, { status: 404 });
    }

    // 读取文件
    const buffer = await readFile(asset.path);

    // 返回文件
    return new Response(buffer, {
      headers: {
        "Content-Type": asset.contentType,
        "Content-Disposition": `inline; filename="${asset.fileName}"`,
      },
    });
  } catch (error) {
    console.error("获取资产失败:", error);
    return Response.json({ error: "获取资产失败" }, { status: 500 });
  }
} 