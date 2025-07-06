import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@repo/ui/components/ui/button"
import { ArrowUpDown, Eye, MoreHorizontal, Pencil } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu"
import { Badge } from "@repo/ui/components/ui/badge"
import Link from "next/link"
import { Recommendation } from "@repo/db/types"

export const columns: ColumnDef<Recommendation>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          标题
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "type",
    header: "类型",
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      return (
        <Badge variant="outline">
          {type === "rank" ? "排行" :
            type === "popular" ? "热门" :
              type === "new" ? "最新" :
                type === "related" ? "相关" :
                  type === "category" ? "分类" :
                    type === "app" ? "应用" : type}
        </Badge>
      )
    },
  },
  {
    accessorKey: "status",
    header: "状态",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={status === "active" ? "default" : "secondary"}>
          {status === "active" ? "启用" : "待定"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "appCount",
    header: "应用数量",
  },
  {
    accessorKey: "createdAt",
    header: "创建时间",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      return date.toLocaleDateString()
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const recommendation = row.original

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
              <Link href={`/admin/recommendations/${recommendation.id}/view`} className="flex flex-row gap-2">
                <Eye className="size-4" />
                查看
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={`/admin/recommendations/${recommendation.id}`} className="flex flex-row gap-2">
                <Pencil className="size-4" />
                编辑
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              删除</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
] 