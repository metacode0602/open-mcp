import { createContextFromRequest } from "@/lib/trpc/server";
import { saveAsset } from "@repo/db/database/admin";
import { AssetType, zAssetTypeEnum } from "@repo/db/types";
import type { NextRequest } from "next/server";

const MAX_UPLOAD_SIZE_BYTES = 1024 * 1024 * 10; // 10MB
const SUPPORTED_UPLOAD_ASSET_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp"
]);

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const ctx = await createContextFromRequest(request);
  if (ctx.user === null) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const data = formData.get("file") ?? formData.get("image");
  const assetType = formData.get("assetType") as string || "image";

  let buffer;
  let contentType: string;

  if (data instanceof File) {
    contentType = data.type;
    if (!SUPPORTED_UPLOAD_ASSET_TYPES.has(contentType)) {
      return Response.json({ error: "不支持的文件类型" }, { status: 400 });
    }
    if (data.size > MAX_UPLOAD_SIZE_BYTES) {
      return Response.json({ error: "文件太大" }, { status: 413 });
    }
    buffer = Buffer.from(await data.arrayBuffer());
  } else {
    return Response.json({ error: "无效的请求" }, { status: 400 });
  }

  try {
    // 验证资产类型
    const validAssetType = Object.values(zAssetTypeEnum).includes(assetType as any)
      ? assetType as keyof typeof zAssetTypeEnum
      : "image";

    const asset = await saveAsset({
      userId: ctx.user?.id,
      assetType: validAssetType as AssetType,
      contentType,
      fileName: data.name,
      size: data.size,
      buffer,
    });

    return Response.json({
      assetId: asset?.id,
      contentType: asset?.contentType,
      fileName: asset?.fileName,
      size: asset?.size,
    });
  } catch (error) {
    console.error("上传文件失败:", error);
    return Response.json({ error: "上传文件失败" }, { status: 500 });
  }
} 