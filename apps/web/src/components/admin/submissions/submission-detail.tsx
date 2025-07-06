"use client";

import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/ui/alert";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { AlertCircle, Calendar, Check, ExternalLink, FileText, Loader2, MessageSquare, User, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useEffect, useMemo,useState } from "react";
import { toast } from "sonner";

import { trpc } from "@/lib/trpc/client";
import { formatDate } from "@/lib/utils";

interface SubmissionDetailProps {
  submissionId: string;
}

export function SubmissionDetail({ submissionId }: SubmissionDetailProps) {
  const router = useRouter();
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [approvalData, setApprovalData] = useState({
    slug: "",
    type: "" as "client" | "server" | "application",
    categoryId: "",
  });
  const utils = trpc.useUtils();

  // 使用tRPC获取提交详情
  const { data: submission, isLoading, error } = trpc.appSubmissions.getByIdWithUser.useQuery({ id: submissionId });

  // 获取分类列表
  const { data: categories } = trpc.categories.search.useQuery({ page: 1, limit: 100 });

  // 获取生成的slug
  const { data: generatedSlug, refetch: refetchSlug } = trpc.appSubmissions.generateSlug.useQuery(
    { name: submission?.name || "" },
    {
      enabled: false, // 默认不执行，只在需要时执行
      staleTime: 5 * 60 * 1000, // 5分钟缓存
    }
  );

  // 当弹窗打开时，从服务端获取slug
  useEffect(() => {
    if (showApproveDialog && submission?.name) {
      refetchSlug();
    }
  }, [showApproveDialog, submission?.name, refetchSlug]);

  // 当服务端返回slug时，更新状态
  useEffect(() => {
    if (generatedSlug) {
      setApprovalData(prev => ({
        ...prev,
        slug: generatedSlug
      }));
    }
  }, [generatedSlug]);

  // 重置approvalData状态
  useEffect(() => {
    if (!showApproveDialog) {
      setApprovalData({
        slug: "",
        type: "" as "client" | "server" | "application",
        categoryId: "",
      });
    }
  }, [showApproveDialog]);

  // 按父类ID对分类进行分组
  const groupedCategories = useMemo(() => {
    if (!categories?.data) return {};

    const grouped = categories.data.reduce((acc, category) => {
      const parentId = category.parentId || 'root';
      if (!acc[parentId]) {
        acc[parentId] = [];
      }
      acc[parentId].push(category);
      return acc;
    }, {} as Record<string, typeof categories.data>);

    return grouped;
  }, [categories?.data]);

  // 获取顶级分类
  const rootCategories = useMemo(() => {
    return categories?.data.filter(category => !category.parentId) || [];
  }, [categories?.data]);

  // tRPC mutations
  const { mutate: approveSubmission, isPending: approveSubmissionLoading } = trpc.appSubmissions.approve.useMutation({
    onSuccess: () => {
      toast.success("提交已批准", {
        description: "应用已成功批准并发布。",
      });
      setShowApproveDialog(false);
      utils.appSubmissions.invalidate();
      router.push("/admin/submissions");
      router.refresh();
    },
    onError: (error) => {
      toast.error("批准失败", {
        description: error.message,
      });
    },
  });

  const rejectSubmission = trpc.appSubmissions.reject.useMutation({
    onSuccess: () => {
      toast.success("提交已拒绝", {
        description: "应用提交已被拒绝。",
      });
      setShowRejectDialog(false);
      setRejectReason("");
      utils.appSubmissions.invalidate();
      router.push("/admin/submissions");
      router.refresh();
    },
    onError: (error) => {
      toast.error("拒绝失败", {
        description: error.message,
      });
    },
  });

  // 处理函数
  const handleApprove = () => {
    if (!approvalData.slug || !approvalData.type || !approvalData.categoryId) {
      toast.error("请填写所有必填字段");
      return;
    }

    approveSubmission({
      id: submissionId,
      ...approvalData
    });
  };

  const handleReject = () => {
    rejectSubmission.mutate({
      id: submissionId,
      reason: rejectReason,
    });
  };

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">待审核</Badge>;
      case "approved":
        return <Badge className="bg-green-500 hover:bg-green-600">已批准</Badge>;
      case "rejected":
        return <Badge className="bg-red-500 hover:bg-red-600">已拒绝</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // 处理加载状态
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // 处理错误状态
  if (error || !submission) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>错误</AlertTitle>
        <AlertDescription>{error?.message || "无法加载提交信息，请稍后再试。"}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">{submission?.name}</CardTitle>
            <CardDescription className="text-lg">{submission?.description}</CardDescription>
            <div className="flex items-center gap-2 mt-2">
              {getStatusBadge(submission?.status)}
              <Badge variant="outline" className="capitalize">
                {submission?.type === "client" ? "客户端" : submission?.type === "server" ? "服务器" : "应用程序"}
              </Badge>
              {submission?.approvedAppId && (
                <Button variant="link" className="p-0 h-auto" asChild>
                  <Link href={`/admin/apps/${submission?.approvedAppId}`} className="flex items-center text-blue-500 hover:underline">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    查看应用
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {submission?.status === "pending" && (
            <div className="flex gap-2">
              <Button variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => setShowApproveDialog(true)} disabled={approveSubmissionLoading}>
                {approveSubmissionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                批准提交
              </Button>

              <Button variant="default" className="bg-red-600 hover:bg-red-700" onClick={() => setShowRejectDialog(true)} disabled={rejectSubmission.isPending}>
                {rejectSubmission.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                拒绝提交
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="details">
          <TabsList className="mb-4">
            <TabsTrigger value="details">提交详情</TabsTrigger>
            <TabsTrigger value="app">应用信息</TabsTrigger>
            {submission?.status === "rejected" && <TabsTrigger value="rejection">拒绝原因</TabsTrigger>}
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">提交信息</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <User className="mr-2 h-5 w-5 text-muted-foreground" />
                      <span>提交者: {submission?.user?.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
                      <span>提交时间: {formatDate(submission?.createdAt)}</span>
                    </div>
                    {submission?.status !== "pending" && (
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
                        <span>处理时间: {formatDate(submission?.updatedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">提交说明</h3>
                  <div className="p-4 border rounded-md">
                    <p className="whitespace-pre-wrap">{submission?.description || "未提供说明"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">联系信息</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">邮箱</span>
                      <p>{submission?.user?.email}</p>
                    </div>
                    {submission?.user?.phoneNumber && (
                      <div>
                        <span className="text-sm text-muted-foreground">电话</span>
                        <p>{submission?.user?.phoneNumber}</p>
                      </div>
                    )}
                  </div>
                </div>

                {submission?.longDescription && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">附加信息</h3>
                    <div className="p-4 border rounded-md">
                      <p className="whitespace-pre-wrap">{submission?.longDescription}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="app" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">基本信息</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">名称</span>
                      <p>{submission?.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">描述</span>
                      <p>{submission?.description}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">类型</span>
                      <p className="capitalize">{submission?.type === "client" ? "客户端" : submission?.type === "server" ? "服务器" : "应用程序"}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">详细描述</h3>
                  <div className="p-4 border rounded-md">
                    <p className="whitespace-pre-wrap">{submission?.longDescription || "未提供详细描述"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">链接</h3>
                  <div className="space-y-2">
                    {submission?.website && (
                      <div className="flex items-center">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        <a href={submission.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          官方网站
                        </a>
                      </div>
                    )}
                    {submission?.github && (
                      <div className="flex items-center">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        <a href={submission.github} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          GitHub 仓库
                        </a>
                      </div>
                    )}
                    {submission?.docs && (
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        <a href={submission.docs} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          文档
                        </a>
                      </div>
                    )}
                    {!submission?.website && !submission?.github && !submission?.docs && <p className="text-muted-foreground">未提供链接</p>}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">其他信息</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">版本</span>
                      <p>{submission?.version || "未指定"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">许可证</span>
                      <p>{submission?.license || "未指定"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">应用场景</span>
                      <p>{submission?.scenario || "未指定"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {submission?.status === "rejected" && (
            <TabsContent value="rejection" className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">拒绝原因</h3>
                <div className="p-4 border rounded-md bg-red-50">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-5 w-5 text-red-500 mt-0.5" />
                    <p className="whitespace-pre-wrap">{submission?.rejectionReason || "未提供拒绝原因"}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">拒绝时间</h3>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
                  <span>{formatDate(submission?.updatedAt)}</span>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>批准应用提交</DialogTitle>
            <DialogDescription>请填写以下信息以完成应用批准</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="slug">应用标识 (Slug)</Label>
              <Input
                id="slug"
                placeholder="my-awesome-app"
                value={approvalData.slug}
                onChange={(e) => setApprovalData({ ...approvalData, slug: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                唯一标识符，用于URL。只能包含小写字母、数字和连字符。
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">应用类型</Label>
              <Select
                value={approvalData.type}
                onValueChange={(value: "client" | "server" | "application") =>
                  setApprovalData({ ...approvalData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择应用类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">客户端</SelectItem>
                  <SelectItem value="server">服务器</SelectItem>
                  <SelectItem value="application">应用程序</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">应用分类</Label>
              <Select value={approvalData.categoryId} onValueChange={(value) => setApprovalData({ ...approvalData, categoryId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="选择应用分类" />
                </SelectTrigger>
                <SelectContent>
                  {rootCategories.map((rootCategory) => (
                    <SelectGroup key={rootCategory.id}>
                      <SelectLabel>{rootCategory.name}</SelectLabel>
                      {groupedCategories[rootCategory.id]?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)} disabled={approveSubmissionLoading}>
              取消
            </Button>
            <Button variant="default" onClick={handleApprove} disabled={approveSubmissionLoading}>
              {approveSubmissionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  处理中...
                </>
              ) : (
                "确认批准"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 拒绝原因对话框 */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>拒绝应用提交</DialogTitle>
            <DialogDescription>请提供拒绝此应用提交的原因，该原因将发送给提交者。</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">拒绝原因</Label>
              <Textarea id="reason" placeholder="请详细说明拒绝原因..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="min-h-[100px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={rejectSubmission.isPending}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim() || rejectSubmission.isPending}>
              {rejectSubmission.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  处理中...
                </>
              ) : (
                "确认拒绝"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
