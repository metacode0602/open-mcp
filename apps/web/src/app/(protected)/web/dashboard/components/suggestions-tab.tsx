"use client";

import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { ArrowRight, Lightbulb } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { DetailDialog } from "@/components/detail-dialog";
import { trpc } from "@/lib/trpc/client";
import { getAssetUrl } from "@/lib/utils";

export function SuggestionsTab() {
  const { data: suggestions, isLoading } = trpc.mcpDashboard.getSuggestions.useQuery();
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(null);
  const { data: selectedSuggestion } = trpc.mcpSuggestions.getById.useQuery(
    { id: selectedSuggestionId! },
    { enabled: !!selectedSuggestionId }
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32 mt-1" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-24 ml-auto" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <h3 className="text-lg font-medium">您还没有提交任何建议</h3>
        <p className="text-muted-foreground mt-2 mb-4">
          为应用提交功能建议、Bug报告或改进意见
        </p>
        <Button variant="outline" asChild>
          <Link href="/category">
            <Lightbulb className="mr-2 h-4 w-4" />
            浏览应用
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {suggestions && suggestions.map((suggestion) => (
        <Card key={suggestion.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant={
                      suggestion.type === "feature"
                        ? "default"
                        : suggestion.type === "bug"
                          ? "destructive"
                          : suggestion.type === "improvement"
                            ? "secondary"
                            : "outline"
                    }
                  >
                    {suggestion.type === "feature"
                      ? "新功能"
                      : suggestion.type === "bug"
                        ? "Bug"
                        : suggestion.type === "improvement"
                          ? "改进"
                          : "其他"}
                  </Badge>
                  <Badge variant="outline">
                    {suggestion.appType === "client"
                      ? "客户端"
                      : suggestion.appType === "server"
                        ? "服务器"
                        : "应用"}
                  </Badge>
                </div>
                <CardTitle>{suggestion.title}</CardTitle>
                <CardDescription>
                  提交于 {suggestion.updatedAt.toLocaleDateString()} • {suggestion.upvotes} 个赞同
                </CardDescription>
              </div>
              <Badge
                variant={
                  suggestion.status === "pending"
                    ? "secondary"
                    : suggestion.status === "reviewing"
                      ? "default"
                      : suggestion.status === "accepted"
                        ? "default"
                        : suggestion.status === "implemented"
                          ? "default"
                          : "outline"
                }
              >
                {suggestion.status === "pending"
                  ? "待处理"
                  : suggestion.status === "reviewing"
                    ? "审核中"
                    : suggestion.status === "accepted"
                      ? "已接受"
                      : suggestion.status === "implemented"
                        ? "已实现"
                        : suggestion.status === "rejected"
                          ? "已拒绝"
                          : "重复"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                针对{" "}
                <Link
                  href={`/apps/${suggestion.appSlug}`}
                  className="hover:underline"
                >
                  {suggestion.appName}
                </Link>{" "}
                的建议
              </span>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedSuggestionId(suggestion.id)}
            >
              查看详情
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/apps/${suggestion.appSlug}`}>
                查看应用
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}

      <DetailDialog
        title="建议详情"
        isOpen={!!selectedSuggestionId}
        onOpenChange={(open) => !open && setSelectedSuggestionId(null)}
      >
        {selectedSuggestion && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant={
                    selectedSuggestion.type === "feature"
                      ? "default"
                      : selectedSuggestion.type === "bug"
                        ? "destructive"
                        : selectedSuggestion.type === "improvement"
                          ? "secondary"
                          : "outline"
                  }
                >
                  {selectedSuggestion.type === "feature"
                    ? "新功能"
                    : selectedSuggestion.type === "bug"
                      ? "Bug"
                      : selectedSuggestion.type === "improvement"
                        ? "改进"
                        : "其他"}
                </Badge>
                <Badge variant="outline">
                  {selectedSuggestion.appType === "client"
                    ? "客户端"
                    : selectedSuggestion.appType === "server"
                      ? "服务器"
                      : "应用"}
                </Badge>
              </div>
              <h3 className="text-lg font-semibold">{selectedSuggestion.title}</h3>
              <p className="text-sm text-muted-foreground">
                提交于 {selectedSuggestion.createdAt.toLocaleDateString()} • {selectedSuggestion.upvotes} 个赞同
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">处理状态</h4>
              <Badge
                variant={
                  selectedSuggestion.status === "pending"
                    ? "secondary"
                    : selectedSuggestion.status === "reviewing"
                      ? "default"
                      : selectedSuggestion.status === "accepted"
                        ? "default"
                        : selectedSuggestion.status === "implemented"
                          ? "default"
                          : "outline"
                }
              >
                {selectedSuggestion.status === "pending"
                  ? "待处理"
                  : selectedSuggestion.status === "reviewing"
                    ? "审核中"
                    : selectedSuggestion.status === "accepted"
                      ? "已接受"
                      : selectedSuggestion.status === "implemented"
                        ? "已实现"
                        : selectedSuggestion.status === "rejected"
                          ? "已拒绝"
                          : "重复"}
              </Badge>
              {selectedSuggestion.status === "implemented" && selectedSuggestion.implementedAt && (
                <p className="text-sm text-muted-foreground">
                  实现于 {selectedSuggestion.implementedAt.toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">建议内容</h4>
              <p className="text-sm whitespace-pre-wrap">{selectedSuggestion.title}</p>
              <p className="text-sm whitespace-pre-wrap">{selectedSuggestion.description}</p>
              <div>
                {selectedSuggestion.imageUrl && <Image src={getAssetUrl(selectedSuggestion.imageUrl)} alt="建议图片" width={500} height={300} className="rounded-md" />}
              </div>
            </div>

            {selectedSuggestion.adminRemarks && (
              <div className="space-y-2">
                <h4 className="font-medium">处理备注</h4>
                <p className="text-sm whitespace-pre-wrap">{selectedSuggestion.adminRemarks}</p>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm pt-2">
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                针对{" "}
                <Link
                  href={`/apps/${selectedSuggestion.appSlug}`}
                  className="hover:underline"
                >
                  {selectedSuggestion.appName}
                </Link>{" "}
                的建议
              </span>
            </div>
          </div>
        )}
      </DetailDialog>
    </div>
  );
}