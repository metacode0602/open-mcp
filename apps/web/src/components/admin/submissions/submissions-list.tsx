"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@repo/ui/components/ui/alert-dialog";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@repo/ui/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@repo/ui/components/ui/dialog";
import { DropdownMenuItem } from "@repo/ui/components/ui/dropdown-menu";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@repo/ui/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { trpc } from "@/lib/trpc/client";
import { formatDate } from "@/lib/utils";
import { AlertCircle, ArrowUpDown, Calendar, Check, Eye, Loader2, Search, User, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppSubmission } from "@repo/db/types";
import { toast } from "sonner";

// Helper function to truncate text
const truncateText = (text: string, maxLength: number) => {
  if (!text) return "";
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export function SubmissionsList() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedSubmission, setSelectedSubmission] = useState<AppSubmission | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  // 使用tRPC获取提交列表
  const {
    data: submissions,
    isLoading,
    refetch,
  } = trpc.appSubmissions.search.useQuery({
    status: activeTab !== "all" ? activeTab as "pending" | "approved" | "rejected" | "archived" : undefined,
    query: searchTerm,
    field: sortBy,
    order: sortOrder as "desc" | "asc",
  });

  // tRPC mutations
  const approveSubmission = trpc.appSubmissions.approve.useMutation({
    onSuccess: () => {
      toast.success("提交已批准", {
        description: "应用已成功批准并发布。",
      });
      refetch();
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
      refetch();
    },
    onError: (error) => {
      toast.error("拒绝失败", {
        description: error.message,
      });
    },
  });

  // 处理函数
  const handleApprove = (submissionId: string) => {
    router.push(`/admin/submissions/${submissionId}`);
  };

  const handleReject = () => {
    if (selectedSubmission) {
      rejectSubmission.mutate({
        id: selectedSubmission.id,
        reason: rejectReason,
      });
    }
  };

  const openRejectDialog = (submission: AppSubmission) => {
    setSelectedSubmission(submission);
    setShowRejectDialog(true);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      toggleSortOrder();
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
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

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="搜索应用名称、提交者..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="pending">待审核</SelectItem>
                <SelectItem value="approved">已批准</SelectItem>
                <SelectItem value="rejected">已拒绝</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={toggleSortOrder}>
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="pending">待审核</TabsTrigger>
            <TabsTrigger value="approved">已批准</TabsTrigger>
            <TabsTrigger value="rejected">已拒绝</TabsTrigger>
            <TabsTrigger value="all">全部</TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">ID</TableHead>
                  <TableHead className="w-[250px]">
                    <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("appName")}>
                      应用名称
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("submitterName")}>
                      提交者
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("createdAt")}>
                      提交日期
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions && submissions.data.length > 0 ? (
                  submissions.data.map((submission) => (
                    <TableRow key={submission.submission.id}>
                      <TableCell className="font-mono text-xs">{submission.submission.id.substring(0, 8)}</TableCell>
                      <TableCell>
                        <div className="font-medium">{submission.submission.name}</div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <div className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                              {truncateText(submission.submission.description, 20)}
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] text-sm" side="right">
                            {submission.submission.description}
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{submission.user?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(submission.submission.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(submission.submission.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => router.push(`/admin/submissions/${submission.submission.id}`)}>
                            <Eye className="h-4 w-4" />
                            查看
                          </Button>
                          {submission.submission.status === "pending" && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleApprove(submission.submission.id)}
                                disabled={approveSubmission.isPending}
                              >
                                {approveSubmission.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                批准
                              </Button>

                              <Button variant="default" size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => openRejectDialog(submission.submission)} disabled={rejectSubmission.isPending}>
                                {rejectSubmission.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                                拒绝
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <AlertCircle className="h-8 w-8 mb-2" />
                        <p>没有找到符合条件的提交</p>
                        <p className="text-sm">尝试更改筛选条件或搜索词</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">{submissions ? `显示 ${submissions.data.length} 个提交` : "加载中..."}</div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            上一页
          </Button>
          <Button variant="outline" size="sm" disabled>
            下一页
          </Button>
        </div>
      </CardFooter>

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
