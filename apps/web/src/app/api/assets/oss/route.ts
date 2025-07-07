import { NextRequest, NextResponse } from "next/server";
import OSS from "ali-oss";
import { z } from "zod";

// 验证请求参数的schema
const uploadRequestSchema = z.object({
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number().positive(),
  assetType: z.string().optional(),
});

// 验证回调参数的schema
const callbackSchema = z.object({
  assetId: z.string(),
  url: z.string().url(),
  size: z.number().positive(),
  mimeType: z.string(),
});

// 阿里云OSS配置
const ossConfig = {
  region: process.env.ALIYUN_OSS_REGION || "oss-cn-hangzhou",
  accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID!,
  accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET!,
  bucket: process.env.ALIYUN_OSS_BUCKET!,
};

// 生成唯一的文件名
function generateFileName(originalName: string, assetType?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  const prefix = assetType ? `${assetType}/` : "uploads/";
  return `${prefix}${timestamp}_${random}.${extension}`;
}

// POST方法：获取OSS临时上传凭证
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, fileType, fileSize, assetType } = uploadRequestSchema.parse(body);

    // 验证文件大小（限制为10MB）
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (fileSize > maxSize) {
      return NextResponse.json(
        { error: "文件大小超过限制" },
        { status: 400 }
      );
    }

    // 验证文件类型
    const allowedTypes = [
      "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
      "application/pdf", "text/plain", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { error: "不支持的文件类型" },
        { status: 400 }
      );
    }

    // 生成OSS文件名
    const ossFileName = generateFileName(fileName, assetType);

    // 创建OSS客户端
    const client = new OSS(ossConfig);

    // 生成临时上传URL（有效期15分钟）
    const url = await client.signatureUrl(ossFileName, {
      method: 'PUT',
      expires: 900, // 15分钟
      'Content-Type': fileType,
    });

    // 生成用于回调的assetId
    const assetId = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    return NextResponse.json({
      success: true,
      uploadUrl: url,
      assetId,
      ossFileName,
      expires: Date.now() + 900 * 1000, // 过期时间戳
    });

  } catch (error) {
    console.error("OSS上传凭证生成失败:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "请求参数无效", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// GET方法：处理上传完成后的回调
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get("assetId");
    const url = searchParams.get("url");
    const size = searchParams.get("size");
    const mimeType = searchParams.get("mimeType");

    // 验证回调参数
    const callbackData = callbackSchema.parse({
      assetId,
      url,
      size: size ? parseInt(size) : 0,
      mimeType,
    });

    // 这里可以添加数据库记录逻辑
    // 例如：将上传的文件信息保存到数据库
    console.log("文件上传完成:", {
      assetId: callbackData.assetId,
      url: callbackData.url,
      size: callbackData.size,
      mimeType: callbackData.mimeType,
    });

    return NextResponse.json({
      success: true,
      message: "文件上传成功",
      assetId: callbackData.assetId,
      url: callbackData.url,
    });

  } catch (error) {
    console.error("上传回调处理失败:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "回调参数无效", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
