"use client";

import {
  ArrowLeft,
  CheckCircle,
  User,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/components/ui/alert-dialog";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";

// 模拟建议数据
const suggestion = {
  id: "1",
  type: "feature",
  status: "pending",
  title: "添加深色模式支持",
  content:
    "建议为应用添加深色模式支持，以提供更好的用户体验。深色模式可以减少眼睛疲劳，并在低光环境下提供更好的可读性。",
  priority: "high",
  submittedBy: {
    id: "1",
    name: "张三",
    email: "zhangsan@example.com",
    role: "user",
  },
  app: {
    id: "1",
    name: "示例应用",
    version: "1.0.0",
  },
  submittedAt: "2025-03-01 10:30:00",
  updatedAt: "2025-03-01 10:35:00",
  comments: [
    {
      id: "1",
      user: {
        id: "2",
        name: "李四",
        role: "admin",
      },
      content: "这是一个很好的建议，我们正在考虑实现这个功能。",
      createdAt: "2025-03-01 10:35:00",
    },
  ],
  history: [
    {
      id: "1",
      action: "submitted",
      status: "pending",
      note: "提交建议",
      createdAt: "2025-03-01 10:30:00",
    },
    {
      id: "2",
      action: "reviewing",
      status: "pending",
      note: "管理员开始审核",
      createdAt: "2025-03-01 10:35:00",
    },
  ],
};

export default function SuggestionDetailPage() {
  const params = useParams();
  const [status, setStatus] = useState(suggestion.status);

  const handleApprove = () => {
    setStatus("approved");
  };

  const handleReject = () => {
    setStatus("rejected");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">待处理</Badge>;
      case "approved":
        return <Badge variant="default">已通过</Badge>;
      case "rejected":
        return <Badge variant="destructive">已拒绝</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "feature":
        return <Badge variant="default">功能建议</Badge>;
      case "bug":
        return <Badge variant="destructive">问题反馈</Badge>;
      case "improvement":
        return <Badge variant="secondary">改进建议</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">高优先级</Badge>;
      case "medium":
        return <Badge variant="default">中优先级</Badge>;
      case "low":
        return <Badge variant="secondary">低优先级</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="建议详情"
        description="查看和管理用户建议"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/suggestions">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回列表
              </Link>
            </Button>
            {status === "pending" && (
              <>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="default">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      通过
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>确认通过建议？</AlertDialogTitle>
                      <AlertDialogDescription>
                        此操作将通过建议 "{suggestion.title}"。
                        通过后，建议将被标记为已采纳。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction onClick={handleApprove}>
                        确认
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <XCircle className="mr-2 h-4 w-4" />
                      拒绝
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>确认拒绝建议？</AlertDialogTitle>
                      <AlertDialogDescription>
                        此操作将拒绝建议 "{suggestion.title}"。
                        拒绝后，建议将被标记为未采纳。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction onClick={handleReject}>
                        确认
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
            <CardDescription>建议的基本信息和状态</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">建议ID</p>
                <p className="text-sm text-muted-foreground">{suggestion.id}</p>
              </div>
              {getStatusBadge(status)}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">标题</p>
              <p className="text-sm text-muted-foreground">
                {suggestion.title}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">类型</p>
              {getTypeBadge(suggestion.type)}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">优先级</p>
              {getPriorityBadge(suggestion.priority)}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">内容</p>
              <p className="text-sm text-muted-foreground">
                {suggestion.content}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">提交时间</p>
              <p className="text-sm text-muted-foreground">
                {suggestion.submittedAt}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">更新时间</p>
              <p className="text-sm text-muted-foreground">
                {suggestion.updatedAt}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>提交者信息</CardTitle>
            <CardDescription>建议提交者的基本信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">提交者ID</p>
              <p className="text-sm text-muted-foreground">
                {suggestion.submittedBy.id}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">提交者姓名</p>
              <p className="text-sm text-muted-foreground">
                {suggestion.submittedBy.name}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">电子邮箱</p>
              <p className="text-sm text-muted-foreground">
                {suggestion.submittedBy.email}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">角色</p>
              <p className="text-sm text-muted-foreground">
                {suggestion.submittedBy.role === "user" ? "普通用户" : "管理员"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>应用信息</CardTitle>
            <CardDescription>相关应用的基本信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">应用ID</p>
              <p className="text-sm text-muted-foreground">
                {suggestion.app.id}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">应用名称</p>
              <p className="text-sm text-muted-foreground">
                {suggestion.app.name}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">应用版本</p>
              <p className="text-sm text-muted-foreground">
                {suggestion.app.version}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>评论</CardTitle>
            <CardDescription>管理员对建议的评论</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestion.comments.map((comment) => (
              <div key={comment.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <p className="text-sm font-medium">{comment.user.name}</p>
                    <Badge variant="outline">
                      {comment.user.role === "admin" ? "管理员" : "用户"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {comment.createdAt}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {comment.content}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>处理历史</CardTitle>
            <CardDescription>建议的处理记录</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {suggestion.history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{item.note}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.createdAt}
                    </p>
                  </div>
                  {getStatusBadge(item.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
