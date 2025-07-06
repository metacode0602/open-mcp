"use client"

import { Ranking } from "@repo/db/types"
import { Badge } from "@repo/ui/components/ui/badge"
import { ColumnDef } from "@tanstack/react-table"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"

import { DataTableColumnHeader } from "@/components/admin/data-table-column-header"

import { DataTableRowActions } from "./data-table-row-actions"

export const columns: ColumnDef<Ranking>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="名称" />
    ),
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("name")}</div>
    },
  },
  {
    accessorKey: "source",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="来源" />
    ),
    cell: ({ row }) => {
      const source = row.getValue("source") as string
      const getSourceBadgeColor = (source: string) => {
        switch (source) {
          case "github":
            return "bg-black text-white hover:bg-black/80"
          case "openmcp":
            return "bg-blue-600 hover:bg-blue-700"
          case "producthunt":
            return "bg-orange-600 hover:bg-orange-700"
          default:
            return ""
        }
      }

      return (
        <Badge className={getSourceBadgeColor(source)}>
          {source === "github" && "GitHub"}
          {source === "openmcp" && "OpenMCP"}
          {source === "producthunt" && "ProductHunt"}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="类型" />
    ),
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      const getTypeBadgeVariant = (type: string) => {
        switch (type) {
          case "daily":
            return "default"
          case "weekly":
            return "secondary"
          case "monthly":
            return "outline"
          case "yearly":
            return "destructive"
          default:
            return "default"
        }
      }

      return (
        <Badge variant={getTypeBadgeVariant(type)}>
          {type === "daily" && "每日"}
          {type === "weekly" && "每周"}
          {type === "monthly" && "每月"}
          {type === "yearly" && "每年"}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "periodKey",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="周期标识" />
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="状态" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as boolean
      return (
        <Badge variant={status ? "default" : "destructive"}>
          {status ? "启用" : "禁用"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "recordsCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="记录数" />
    ),
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="更新时间" />
    ),
    cell: ({ row }) => {
      return formatDistanceToNow(new Date(row.getValue("updatedAt")), {
        addSuffix: true,
        locale: zhCN,
      })
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]