import { writeFile } from "node:fs/promises";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { db } from "../../index";
import { assets } from "../../schema";
import { AssetType } from "../../types";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";

export const saveAsset = async ({
  userId,
  assetType = "unknown",
  contentType,
  fileName,
  size,
  buffer,
  bookmarkId = null,
}: {
  userId: string;
  assetType?: AssetType;
  contentType: string;
  fileName: string;
  size: number;
  buffer: Buffer;
  bookmarkId?: string | null;
}) => {
  // 创建上传目录
  const uploadPath = join(UPLOAD_DIR, userId);
  await mkdir(uploadPath, { recursive: true });

  // 生成唯一的文件名
  const uniqueFileName = `${createId()}-${fileName}`;
  const filePath = join(uploadPath, uniqueFileName);

  // 保存文件
  await writeFile(filePath, buffer);

  // 保存到数据库
  const [asset] = await db
    .insert(assets)
    .values({
      id: createId(),
      userId,
      assetType: assetType as AssetType,
      contentType,
      fileName,
      size,
      path: filePath,
      bookmarkId,
    })
    .returning();

  return asset;
};

export const getAssetById = async (id: string) => {
  const asset = await db.query.assets.findFirst({
    where: eq(assets.id, id),
  });
  return asset;
};

export const deleteAsset = async (id: string) => {
  await db.delete(assets).where(eq(assets.id, id));
}; 