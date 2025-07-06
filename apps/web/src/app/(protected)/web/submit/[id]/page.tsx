"use client";

import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { trpc } from "@/lib/trpc/client";
import { Loader2, ArrowLeft, Globe, Github } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { AppSubmissionStatus, AppType } from "@repo/db/types";
import { use } from "react";


type StatusMapType = {
  [K in AppSubmissionStatus]: { label: string; color: string };
};

type TypeMapType = {
  [K in AppType]: string;
};

export default function SubmitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const router = useRouter();
  const { data: submission, isLoading } = trpc.mcpSubmit.getById.useQuery({
    id
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="container py-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-2">未找到提交</h1>
          <p className="text-muted-foreground">该提交可能已被删除或不存在</p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
        </div>
      </div>
    );
  }

  const statusMap: StatusMapType = {
    pending: { label: "待审核", color: "bg-yellow-500" },
    approved: { label: "已通过", color: "bg-green-500" },
    rejected: { label: "已拒绝", color: "bg-red-500" },
    archived: { label: "已归档", color: "bg-blue-500" },
  };

  const typeMap: TypeMapType = {
    client: "客户端",
    server: "服务器",
    application: "应用程序",
  };

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <Button variant="outline" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{submission.name}</CardTitle>
                <CardDescription className="mt-2">
                  提交于 {formatDate(new Date(submission.createdAt))}
                </CardDescription>
              </div>
              <Badge className={statusMap[submission.status as AppSubmissionStatus]?.color}>
                {statusMap[submission.status as AppSubmissionStatus]?.label}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div>
                <h3 className="font-medium mb-2">应用类型</h3>
                <Badge variant="outline">
                  {typeMap[submission.type as AppType]}
                </Badge>
              </div>

              <div>
                <h3 className="font-medium mb-2">应用描述</h3>
                <p className="text-muted-foreground">{submission.description}</p>
              </div>

              {submission.tags && submission.tags.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">标签</h3>
                  <div className="flex flex-wrap gap-2">
                    {submission.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {submission.website && (
                  <div>
                    <h3 className="font-medium mb-2">官方网站</h3>
                    <Button variant="outline" size="sm" asChild>
                      <a href={submission.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="mr-2 h-4 w-4" />
                        访问网站
                      </a>
                    </Button>
                  </div>
                )}

                {submission.github && (
                  <div>
                    <h3 className="font-medium mb-2">GitHub 仓库</h3>
                    <Button variant="outline" size="sm" asChild>
                      <a href={submission.github} target="_blank" rel="noopener noreferrer">
                        <Github className="mr-2 h-4 w-4" />
                        查看源码
                      </a>
                    </Button>
                  </div>
                )}
              </div>

              {submission.status === "rejected" && submission.rejectionReason && (
                <div>
                  <h3 className="font-medium mb-2 text-red-500">拒绝原因</h3>
                  <p className="text-muted-foreground">{submission.rejectionReason}</p>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              返回
            </Button>
            {submission.status === "rejected" && (
              <Button onClick={() => router.push(`/submit?edit=${submission.id}`)}>
                修改并重新提交
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}