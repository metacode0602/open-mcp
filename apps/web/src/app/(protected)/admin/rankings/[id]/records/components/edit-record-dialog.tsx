"use client"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { trpc } from "@/lib/trpc/client"
import { RankingRecord } from "@repo/db/types"
import { Loader2 } from "lucide-react"

interface EditRecordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: RankingRecord | null
  onEditRecord: (record: { id: string; rank: number; score: number }) => Promise<void>
}

export function EditRecordDialog({ open, onOpenChange, record, onEditRecord }: EditRecordDialogProps) {
  const [formData, setFormData] = useState({
    score: record?.score || 0,
    rank: record?.rank || 0,
  })
  const utils = trpc.useUtils()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const updateMutation = trpc.rankingRecords.update.useMutation({
    onSuccess: () => utils.rankingRecords.getByRankingId.invalidate({ rankingId: record?.rankingId as string })
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!record) return

    setIsSubmitting(true)
    try {
      updateMutation.mutate({
        id: record.id,
        score: Number(formData.score),
        rank: Number(formData.rank),
      })
      onEditRecord && onEditRecord({
        id: record.id,
        score: Number(formData.score),
        rank: Number(formData.rank),
      })
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑记录</DialogTitle>
          <DialogDescription>修改排行记录的分数和排名。</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rank">排名</Label>
              <Input
                id="rank"
                type="number"
                value={formData.rank}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    rank: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="score">分数</Label>
              <Input
                id="score"
                type="number"
                value={formData.score}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    score: Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ?
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  更新中...
                </span> : "更新记录"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
