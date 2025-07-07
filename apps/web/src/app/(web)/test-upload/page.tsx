"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { FormFileUpload } from "@/components/file-uploader";
import { useState } from "react";
import { toast } from "sonner";

export default function TestUploadPage() {
  const [uploadedAssetIds, setUploadedAssetIds] = useState<string[]>([]);

  const handleUploadComplete = (assetIds: string[]) => {
    setUploadedAssetIds(assetIds);
    console.log("上传完成的资源ID:", assetIds);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">OSS上传功能测试</h1>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>单文件上传测试</CardTitle>
              <CardDescription>测试单个文件上传到OSS</CardDescription>
            </CardHeader>
            <CardContent>
              <FormFileUpload
                label="上传图片"
                description="测试单文件上传功能"
                assetType="test-images"
                onUploadComplete={handleUploadComplete}
                maxSize={5 * 1024 * 1024}
                accept="image/*"
                required
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>多文件上传测试</CardTitle>
              <CardDescription>测试多个文件上传到OSS</CardDescription>
            </CardHeader>
            <CardContent>
              <FormFileUpload
                label="上传多个文件"
                description="测试多文件上传功能"
                multiple
                assetType="test-multiple"
                onUploadComplete={handleUploadComplete}
                maxFiles={5}
                maxSize={10 * 1024 * 1024}
                accept="image/*,.pdf"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>上传结果</CardTitle>
              <CardDescription>当前已上传的资源ID</CardDescription>
            </CardHeader>
            <CardContent>
              {uploadedAssetIds.length > 0 ? (
                <div className="space-y-2">
                  {uploadedAssetIds.map((assetId, index) => (
                    <div key={index} className="p-2 bg-muted rounded text-sm font-mono">
                      {assetId}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">暂无上传的文件</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>功能说明</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">上传流程：</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>选择文件后自动开始上传</li>
                  <li>显示实时上传进度</li>
                  <li>上传完成后显示成功状态</li>
                  <li>支持重试失败的上传</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-2">支持的文件类型：</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  <li>图片：JPEG, PNG, GIF, WebP, SVG</li>
                  <li>文档：PDF, TXT, DOC, DOCX</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">文件大小限制：</h4>
                <p className="text-sm text-muted-foreground">单文件最大 10MB</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 