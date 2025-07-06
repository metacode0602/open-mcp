"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { Switch } from "@repo/ui/components/ui/switch"
import { toast } from "sonner"
import { trpc } from "@/lib/trpc/client"
import { Loader2 } from "lucide-react"

interface EditRankingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  ranking: any
}

export function EditRankingDialog({ open, onOpenChange, ranking, onSuccess }: EditRankingDialogProps) {
  const [formData, setFormData] = useState({
    name: ranking?.name || "",
    source: ranking?.source || "",
    description: ranking?.description || "",
    type: ranking?.type || "",
    status: ranking?.status || false,
    periodKey: ranking?.periodKey || "",
  })

  const utils = trpc.useUtils()
  const { mutate: updateRanking, isPending: isLoading } = trpc.rankings.update.useMutation({
    onSuccess: () => {
      utils.rankings.search.invalidate()
      utils.rankings.list.invalidate()
      toast.success("排行榜更新成功", {
        description: `已成功更新排行榜 "${formData.name}"`,
      })
      onSuccess?.()
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error("更新失败", {
        description: error.message || "更新排行榜时发生错误，请重试",
      })
    }
  })

  useEffect(() => {
    if (ranking) {
      setFormData({
        name: ranking.name || "",
        source: ranking.source || "",
        description: ranking.description || "",
        type: ranking.type || "",
        status: ranking.status || false,
        periodKey: ranking.periodKey || "",
      })
    }
  }, [ranking])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, status: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    updateRanking({
      id: ranking.id,
      ...formData,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>编辑排行榜</DialogTitle>
            <DialogDescription>修改排行榜的配置信息。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                名称
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="source" className="text-right">
                来源
              </Label>
              <Select value={formData.source} onValueChange={(value) => handleSelectChange("source", value)} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="选择来源" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="github">GitHub</SelectItem>
                  <SelectItem value="openmcp">OpenMCP</SelectItem>
                  <SelectItem value="producthunt">ProductHunt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                描述
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="col-span-3"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                类型
              </Label>
              <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">每日</SelectItem>
                  <SelectItem value="weekly">每周</SelectItem>
                  <SelectItem value="monthly">每月</SelectItem>
                  <SelectItem value="yearly">每年</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="periodKey" className="text-right">
                周期标识
              </Label>
              <Input
                id="periodKey"
                name="periodKey"
                value={formData.periodKey}
                onChange={handleChange}
                className="col-span-3"
                placeholder="例如: 20240503, 2024W18, 202404"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                状态
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch id="status" checked={formData.status} onCheckedChange={handleSwitchChange} />
                <Label htmlFor="status">{formData.status ? "启用" : "禁用"}</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ?
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  "更新中..."
                </>
                : "更新排行榜"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
