"use client";

import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { Loader2, Upload, X } from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { getAssetUrl, uploadToOSSWithProgress } from "@/lib/utils";

export type FileUploadItem = {
  file: File;
  preview: string;
  progress: number;
  status: "idle" | "uploading" | "success" | "error";
  assetId?: string;
  url?: string;
  error?: string;
};

export type FormFileUploadProps = {
  label: string;
  description?: string;
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
  recommendedSize?: string;
  assetType: string;
  onUploadComplete: (assetIds: string[]) => void;
  initialPreviews?: { url?: string; assetId: string }[];
  maxFiles?: number;
  required?: boolean;
};

export const FormFileUpload = ({
  label,
  description,
  multiple = false,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB
  recommendedSize,
  assetType,
  onUploadComplete,
  initialPreviews = [],
  maxFiles = 10,
  required = false,
}: FormFileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileUploadItem[]>(() =>
    initialPreviews.map((item) => ({
      file: new File([], "placeholder"),
      preview: item.url || getAssetUrl(item.assetId),
      progress: 100,
      status: "success",
      assetId: item.assetId,
      url: item.url,
    }))
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    // Check if adding these files would exceed the maximum
    if (files.length + selectedFiles.length > maxFiles) {
      toast.warning("文件数量超出限制", {
        description: `最多只能上传 ${maxFiles} 个文件`,
      });
      return;
    }

    // Process each file
    const validFiles = selectedFiles.filter((file) => {
      if (file.size > maxSize) {
        toast.warning("文件过大", {
          description: `${file.name} 大小不能超过 ${Math.round(maxSize / 1024 / 1024)}MB`,
        });
        return false;
      }
      return true;
    });

    // Create preview and prepare upload for each valid file
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newFileItem: FileUploadItem = {
          file,
          preview: reader.result as string,
          progress: 0,
          status: "idle",
        };

        setFiles((prev) => [...prev, newFileItem]);

        // Start upload immediately
        uploadFile(file, (prev) => [...prev, newFileItem].length - 1);
      };
      reader.readAsDataURL(file);
    });

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadFile = async (file: File, fileIndex: number | ((prev: FileUploadItem[]) => number)) => {
    const actualIndex = typeof fileIndex === "function" ? fileIndex(files) : fileIndex;

    // Update status to uploading
    setFiles((prev) => {
      const updated = [...prev];
      const currentFile = updated[actualIndex];
      if (!currentFile) return updated;

      updated[actualIndex] = {
        ...currentFile,
        status: "uploading",
        progress: 0,
      };
      return updated;
    });

    try {
      // 使用带进度跟踪的OSS上传
      const result = await uploadToOSSWithProgress(
        file,
        assetType,
        (progress) => {
          // 更新上传进度
          setFiles((prev) => {
            const updated = [...prev];
            const currentFile = updated[actualIndex];
            if (!currentFile) return updated;

            updated[actualIndex] = {
              ...currentFile,
              progress,
            };
            return updated;
          });
        }
      );

      if (!result.success) {
        throw new Error(result.error || "上传失败");
      }

      // Update file status to success
      setFiles((prev) => {
        const updated = [...prev];
        const currentFile = updated[actualIndex];
        if (!currentFile) return updated;

        updated[actualIndex] = {
          ...currentFile,
          progress: 100,
          status: "success",
          assetId: result.assetId,
          url: result.url,
        };
        return updated;
      });

      // Get all successful asset IDs
      const allAssetIds = files
        .filter((f) => f.status === "success" && f.assetId)
        .map((f) => f.assetId as string);

      // Add the new asset ID if it's not already included
      if (result.assetId && !allAssetIds.includes(result.assetId)) {
        allAssetIds.push(result.assetId);
      }

      // Notify parent component
      onUploadComplete(allAssetIds);

      toast.success("上传成功", {
        description: `${file.name} 已成功上传`,
      });
    } catch (error) {
      // Update file status to error
      setFiles((prev) => {
        const updated = [...prev];
        const currentFile = updated[actualIndex];
        if (!currentFile) return updated;

        updated[actualIndex] = {
          ...currentFile,
          status: "error",
          error: error instanceof Error ? error.message : "上传文件时出现错误",
        };
        return updated;
      });

      toast.error("上传失败", {
        description: error instanceof Error ? error.message : "上传文件时出现错误",
      });
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);

      // Get all successful asset IDs after removal
      const remainingAssetIds = updated
        .filter((f) => f.status === "success" && f.assetId)
        .map((f) => f.assetId as string);

      // Notify parent component of the updated list
      onUploadComplete(remainingAssetIds);

      return updated;
    });
  };

  const retryUpload = (index: number) => {
    const fileItem = files[index];
    if (fileItem && fileItem.status === "error") {
      uploadFile(fileItem.file, index);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-1">
        <div className="text-sm font-medium">{label}</div>
        {required && <span className="text-destructive">*</span>}
      </div>

      <div className="mt-2">
        <div className="flex flex-wrap gap-4">
          {/* File previews */}
          {files.map((fileItem, index) => (
            <div key={index} className="relative w-40 h-40 border rounded-md overflow-hidden group">
              <img
                src={fileItem.preview || "/placeholder.svg"}
                alt={`预览 ${index + 1}`}
                className={cn("w-full h-full object-cover transition-opacity", fileItem.status === "uploading" && "opacity-70")}
              />

              {/* Status overlay */}
              {fileItem.status === "uploading" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 text-white">
                  <Loader2 className="h-8 w-8 animate-spin mb-2" />
                  <span className="text-sm font-medium">{fileItem.progress}%</span>
                </div>
              )}

              {fileItem.status === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/30 text-white">
                  <p className="text-sm font-medium mb-2">上传失败</p>
                  <Button variant="secondary" size="sm" onClick={() => retryUpload(index)} className="text-xs">
                    重试
                  </Button>
                </div>
              )}

              {/* Remove button */}
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}

          {/* Upload button - only show if under max files or not multiple */}
          {(multiple ? files.length < maxFiles : files.length === 0) && (
            <label className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed rounded-md cursor-pointer bg-muted/40 hover:bg-muted/60">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                <p className="mb-2 text-xs text-muted-foreground">
                  <span className="font-semibold">点击上传</span>
                </p>
                <p className="text-xs text-muted-foreground">SVG, PNG 或 JPG</p>
              </div>
              <input
                ref={fileInputRef}
                id={`${label}-file-input`}
                type="file"
                className="hidden"
                accept={accept}
                onChange={handleFileChange}
                multiple={multiple}
              />
            </label>
          )}
        </div>
      </div>

      {description && <div className="text-sm text-muted-foreground">{description}</div>}
      {recommendedSize && <div className="text-sm text-muted-foreground">建议尺寸: {recommendedSize}</div>}
      {multiple && <div className="text-sm text-muted-foreground">最多可上传 {maxFiles} 个文件</div>}
    </div>
  );
};
