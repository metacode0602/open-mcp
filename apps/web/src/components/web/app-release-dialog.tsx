"use client";

import { useState } from "react";
import { fromNow } from "@/lib/utils";
import { MarkdownReadonly } from "@repo/ui/components/markdown/markdown-readonly";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { Separator } from "@repo/ui/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@repo/ui/components/ui/dialog";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { TagIcon, Loader2, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc/client";

type ReleaseInfo = {
  releaseName: string,
  releaseTagName: string,
  releasePublishedAt: Date,
  releaseUrl: string,
  releaseDescription: string,
  releaseDescriptionZh: string, // 翻译后的Release Note内容
  fullName: string,
}

// Release对话框组件
export const AppVersionReleaseDialog = ({ release, fullName }: { release: ReleaseInfo; fullName: string }) => {

  return (
    <ScrollArea className="max-h-[60vh]">
      <div className="space-y-6 pr-4">
        {/* Release 头部信息 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="default" className="flex items-center gap-1">
                <TagIcon className="h-3 w-3" />
                {release.releaseTagName}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">{fromNow(release.releasePublishedAt.toISOString())}</div>
          </div>
        </div>

        <Separator />

        {/* Release Notes */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">发布说明</h4>
          <div className="rounded-lg border bg-muted/30 p-4">
            <MarkdownReadonly>{release.releaseDescriptionZh || release.releaseDescription}</MarkdownReadonly>
          </div>
        </div>

        {/* 快速链接 */}
        <div className="flex gap-2 pt-4">
          <Button variant="outline" size="sm" asChild>
            <a
              href={`https://github.com/${fullName}/releases/tag/${release.releaseTagName}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              在 GitHub 上查看
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={`https://github.com/${fullName}/releases`} target="_blank" rel="noopener noreferrer">
              所有版本
            </a>
          </Button>
        </div>
      </div>
    </ScrollArea>
  )
}

// 版本点击对话框包装组件
export const AppVersionDialog = ({ repoId, appName, children }: {
  repoId: string;
  appName: string;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  const { data: release, isLoading, error } = trpc.mcpApps.getLatestRelease.useQuery(
    { repoId },
    {
      enabled: open && !!repoId,
      staleTime: 5 * 60 * 1000, // 5分钟缓存
    }
  );

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {children}
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{appName} - 最新版本</DialogTitle>
            <DialogDescription>
              查看应用的最新发布信息和更新内容
            </DialogDescription>
          </DialogHeader>

          {isLoading && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Separator />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>加载失败: {error.message}</span>
            </div>
          )}

          {!isLoading && !error && !release && (
            <div className="text-center py-8 text-muted-foreground">
              <TagIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无发布信息</p>
            </div>
          )}

          {!isLoading && !error && release && (
            <AppVersionReleaseDialog release={release} fullName={release.fullName} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};