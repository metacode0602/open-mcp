"use client"
import { Badge } from "@repo/ui/components/ui/badge"
import { Button } from "@repo/ui/components/ui/button"
import { Checkbox } from "@repo/ui/components/ui/checkbox"
import { Input } from "@repo/ui/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/ui/table"
import { format } from "date-fns"
import { ArrowLeft, Download, Edit, Plus,Search, Trash2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { trpc } from "@/lib/trpc/client"

import { AddRecordsDialog } from "./components/add-records-dialog"
import { DeleteRecordDialog } from "./components/delete-record-dialog"
import { EditRecordDialog } from "./components/edit-record-dialog"

interface RankingRecord {
  id: string
  rankingId: string
  entityId: string
  entityType: "apps"
  entityName?: string
  score: number
  rank: number
  createdAt: Date
  updatedAt: Date
}

interface UpdatedRecord {
  id: string
  rank: number
  score: number
}

interface NewRecord {
  rank: number
  rankingId: string
  entityId: string
  entityType: "apps"
  score: number
}

interface Ranking {
  id: string
  name: string
  description: string | null
  type: "daily" | "weekly" | "monthly" | "yearly"
  status: boolean | null
  source: "github" | "openmcp" | "producthunt"
  recordsCount: number | null
  periodKey: string
  createdAt: Date
  updatedAt: Date | null
}

interface RankingRecordsProps {
  id: string
}

export function RankingRecords({ id }: RankingRecordsProps) {
  const [ranking, setRanking] = useState<Ranking | null>(null)
  const [records, setRecords] = useState<RankingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRecords, setSelectedRecords] = useState<string[]>([])
  const [editingRecord, setEditingRecord] = useState<RankingRecord | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [deletingRecord, setDeletingRecord] = useState<RankingRecord | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)

  const utils = trpc.useUtils()
  const rankingQuery = trpc.rankings.getById.useQuery({ id })
  const recordsQuery = trpc.rankingRecords.getByRankingId.useQuery({ rankingId: id })
  const updateMutation = trpc.rankingRecords.update.useMutation({
    onSuccess: () => utils.rankingRecords.getByRankingId.invalidate({ rankingId: id })
  })
  const deleteMutation = trpc.rankingRecords.delete.useMutation({
    onSuccess: () => utils.rankingRecords.getByRankingId.invalidate({ rankingId: id })
  })
  const batchDeleteMutation = trpc.rankingRecords.batchDelete.useMutation({
    onSuccess: () => utils.rankingRecords.getByRankingId.invalidate({ rankingId: id })
  })

  useEffect(() => {
    if (rankingQuery.data) {
      setRanking(rankingQuery.data as Ranking)
    }
    if (recordsQuery.data) {
      setRecords(recordsQuery.data as RankingRecord[])
    }
    if (!rankingQuery.isLoading && !recordsQuery.isLoading) {
      setLoading(false)
    }
  }, [rankingQuery.data, recordsQuery.data, rankingQuery.isLoading, recordsQuery.isLoading])

  const handleSelectRecord = (recordId: string) => {
    setSelectedRecords((prev) => {
      if (prev.includes(recordId)) {
        return prev.filter((id) => id !== recordId)
      } else {
        return [...prev, recordId]
      }
    })
  }

  const handleSelectAll = () => {
    if (selectedRecords.length === records.length) {
      setSelectedRecords([])
    } else {
      setSelectedRecords(records.map((record) => record.id))
    }
  }

  const handleEdit = (record: RankingRecord) => {
    setEditingRecord(record)
    setIsEditOpen(true)
  }

  const handleDelete = (record: RankingRecord) => {
    setDeletingRecord(record)
    setIsDeleteOpen(true)
  }

  const handleDeleteSelected = async () => {
    try {
      await batchDeleteMutation.mutateAsync({ ids: selectedRecords })
      setSelectedRecords([])
      toast.success("批量删除成功")
    } catch (error) {
      console.error("Failed to delete records:", error)
      toast.error("删除失败")
    }
  }

  const handleAddRecords = () => {
    setIsAddOpen(true)
  }

  if (loading) {
    return <div>加载中...</div>
  }

  if (!ranking) {
    return <div>未找到排行榜</div>
  }

  const handleExport = () => {
    toast.info("导出功能开发中...")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/rankings">
                <ArrowLeft className="h-4 w-4 mr-1" />
                返回
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{ranking.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            导出
          </Button>
          <Button onClick={handleAddRecords}>
            <Plus className="h-4 w-4 mr-1" />
            添加记录
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedRecords.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
            >
              删除已选 ({selectedRecords.length})
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="搜索记录..."
            className="h-8 w-[150px] lg:w-[250px]"
          />
          <Button size="sm" variant="ghost">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedRecords.length === records.length}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="w-[80px]">排名</TableHead>
              <TableHead>实体ID</TableHead>
              <TableHead>实体名称</TableHead>
              <TableHead>实体类型</TableHead>
              <TableHead className="text-right">分数</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>更新时间</TableHead>
              <TableHead className="w-[100px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedRecords.includes(record.id)}
                    onCheckedChange={() => handleSelectRecord(record.id)}
                    aria-label={`Select record ${record.id}`}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {record.rank != null && record.rank <= 3 ? (
                    <Badge
                      variant={
                        record.rank === 1
                          ? "default"
                          : record.rank === 2
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {record.rank}
                    </Badge>
                  ) : (
                    record.rank
                  )}
                </TableCell>
                <TableCell>{record.entityId}</TableCell>
                <TableCell>{record.entityName}</TableCell>
                <TableCell>
                  <Badge variant="outline">{record.entityType}</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {record.score.toLocaleString()}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(record.createdAt), "yyyy-MM-dd HH:mm")}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(record.updatedAt || record.createdAt), "yyyy-MM-dd HH:mm")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(record)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">编辑</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(record)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">删除</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EditRecordDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        record={editingRecord}
        onEditRecord={async (updatedRecord: UpdatedRecord) => {
          try {
            await updateMutation.mutateAsync(updatedRecord)
            toast.success("更新成功")
            setIsEditOpen(false)
          } catch (error) {
            console.error("Failed to update record:", error)
            toast.error("更新失败")
          }
        }}
      />

      <DeleteRecordDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        record={deletingRecord}
      />

      <AddRecordsDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        rankingId={id}
      />
    </div>
  )
}
