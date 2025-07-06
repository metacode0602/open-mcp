import { App, AppStatus, AppType } from "@repo/db/types";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { TRPCClientErrorLike } from '@trpc/client';
import { ArrowUpDown, Eye, MoreHorizontal, Pencil } from "lucide-react";
import { Archive,BrainCircuit, CheckCircle2, Clock, Laptop, Package, Server, XCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { trpc } from "@/lib/trpc/client";
import { getAssetUrl } from "@/lib/utils";

export const columns: ColumnDef<App>[] = [
  {
    accessorKey: "icon",
    header: "图标",
    cell: ({ row }) => {
      const app = row.original;
      return app.icon ? (
        <div className="relative w-10 h-10">
          <img src={`${getAssetUrl(app.icon)}`} alt={app.name} className="rounded-md object-cover" width={40} height={40} />
        </div>
      ) : (
        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
          <Package className="h-5 w-5 text-muted-foreground" />
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          应用名称
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const app = row.original;
      return (
        <Link href={`/admin/apps/${app.id}`} className="hover:underline">
          {app.name}
        </Link>
      );
    },
  },
  {
    accessorKey: "slug",
    header: "Slug",
  },
  {
    accessorKey: "type",
    header: "类型",
    cell: ({ row }) => {
      const type = row.getValue("type") as AppType;
      const getAppTypeIcon = (type: AppType) => {
        switch (type) {
          case "client":
            return <Laptop className="h-4 w-4" />;
          case "server":
            return <Server className="h-4 w-4" />;
          case "application":
            return <BrainCircuit className="h-4 w-4" />;
          default:
            return <Package className="h-4 w-4" />;
        }
      };
      return (
        <div className="flex items-center gap-2">
          {getAppTypeIcon(type)}
          <span>{type === "client" ? "客户端应用" : type === "server" ? "服务端应用" : "应用"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "状态",
    cell: ({ row }) => {
      const status = row.getValue("status") as AppStatus;
      const getStatusIcon = (status: AppStatus) => {
        switch (status) {
          case "approved":
            return <CheckCircle2 className="h-4 w-4" />;
          case "rejected":
            return <XCircle className="h-4 w-4" />;
          case "pending":
            return <Clock className="h-4 w-4" />;
          case "archived":
            return <Archive className="h-4 w-4" />;
          default:
            return <Clock className="h-4 w-4" />;
        }
      };
      return (
        <div className="flex items-center gap-2">
          {getStatusIcon(status)}
          <Badge variant={status === "approved" ? "default" : status === "rejected" ? "destructive" : status === "archived" ? "secondary" : "outline"}>
            {status === "approved" ? "已通过" : status === "rejected" ? "已拒绝" : status === "archived" ? "已归档" : "待审核"}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "source",
    header: "来源",
    cell: ({ row }) => {
      const source = row.getValue("source") as string;
      return (
        <Badge variant="outline">
          {source === "automatic" ? "自动" : source === "submitted" ? "提交" : "管理员"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "创建时间",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: "updatedAt",
    header: "更新时间",
    cell: ({ row }) => {
      const date = new Date(row.getValue("updatedAt"));
      return date.toLocaleDateString();
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const app = row.original;
      const utils = trpc.useUtils();

      const { mutate: updateApp } = trpc.apps.update.useMutation({
        onSuccess: () => {
          toast.success("应用状态已更新", {
            description: "应用状态已成功更改",
          });
          utils.apps.search.invalidate();
        },
        onError: (error: TRPCClientErrorLike<any>) => {
          toast.error("更新失败", {
            description: error.message,
          });
        },
      });

      const { mutate: updateAppPublishStatus } = trpc.apps.updatePublishStatus.useMutation({
        onSuccess: () => {
          toast.success("应用发布状态已更新", {
            description: "应用发布状态已成功更改",
          });
          utils.apps.search.invalidate();
        },
        onError: (error: TRPCClientErrorLike<any>) => {
          toast.error("更新失败", {
            description: error.message,
          });
        },
      });

      const { mutate: deleteApp } = trpc.apps.delete.useMutation({
        onSuccess: () => {
          toast.success("应用已删除", {
            description: "应用已成功删除",
          });
          utils.apps.search.invalidate();
        },
        onError: (error: TRPCClientErrorLike<any>) => {
          toast.error("删除失败", {
            description: error.message,
          });
        },
      });

      const { mutateAsync: startAnalysis } = trpc.appAnalysisHistory.startAnalysis.useMutation({
        onSuccess: () => {
          toast.success("内容刷新请求已发送", {
            description: "系统将自动分析Github仓库。",
          });
        },
        onError: (error: TRPCClientErrorLike<any>) => {
          toast.error("启动分析失败", {
            description: error.message,
          });
        },
      });

      const handleRefreshContent = async () => {
        await startAnalysis({ appId: app.id });
        // if (app.website) {
        //   await startWebsiteAnalysis({ appId: app.id });
        // }
        // if (app.github) {
        //   await startGithubAnalysis({ id: app.id, github: app.github });
        // }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">打开菜单</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>操作</DropdownMenuLabel>
            <DropdownMenuItem>
              <Link href={`/admin/apps/${app.id}`} className="flex flex-row gap-2">
                <Eye className="size-4" />
                查看
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={`/admin/apps/${app.id}/edit`} className="flex flex-row gap-2">
                <Pencil className="size-4" />
                编辑
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleRefreshContent}>
              刷新内容
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {app.publishStatus && (
              <DropdownMenuItem onClick={() => updateAppPublishStatus({
                id: app.id,
                status: app.publishStatus === "online" ? "offline" : "online",
              })}>
                {app.publishStatus === "online" ? "下线应用" : "上线应用"}
              </DropdownMenuItem>
            )}
            {app.status !== "archived" && (
              <DropdownMenuItem onClick={() => updateApp({
                id: app.id,
                status: "archived",
              })}>
                归档应用
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => deleteApp({ id: app.id })}
              className="text-destructive focus:text-destructive"
            >
              删除应用
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];