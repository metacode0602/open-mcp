"use client"

import { formatPeriodKey } from "@repo/db/types"
import { Button } from "@repo/ui/components/ui/button"
import { Calendar } from "@repo/ui/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select"
import { Switch } from "@repo/ui/components/ui/switch"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { cn } from "@repo/ui/lib/utils"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import type React from "react"
import { useState } from "react"
import { toast } from "sonner"

import { trpc } from "@/lib/trpc/client"

interface CreateRankingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateRankingDialog({ open, onOpenChange }: CreateRankingDialogProps) {
  const utils = trpc.useUtils()
  const createMutation = trpc.rankings.create.useMutation({
    onSuccess: () => {
      // 刷新排行榜列表
      utils.rankings.search.invalidate()
      utils.rankings.list.invalidate()
    },
  })

  const [formData, setFormData] = useState({
    name: "",
    source: "",
    description: "",
    type: "",
    status: true,
    periodKey: "",
    date: new Date(),
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [name]: value }
      // 如果type改变了，同时更新periodKey
      if (name === "type") {
        newData.periodKey = formatPeriodKey(value, newData.date)
      }
      return newData
    })
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({
        ...prev,
        date,
        periodKey: formatPeriodKey(prev.type, date)
      }))
    }
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, status: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await createMutation.mutateAsync({
        name: formData.name,
        source: formData.source as "github" | "openmcp" | "producthunt",
        description: formData.description,
        type: formData.type as "daily" | "weekly" | "monthly" | "yearly",
        periodKey: formData.periodKey,
      })

      toast.success("排行榜创建成功", {
        description: `已成功创建排行榜 "${formData.name}"`,
      })

      onOpenChange(false)
      // 重置表单
      setFormData({
        name: "",
        source: "",
        description: "",
        type: "",
        status: true,
        periodKey: "",
        date: new Date(),
      })
    } catch (error) {
      toast.error("创建失败", {
        description: error instanceof Error ? error.message : "创建排行榜时发生错误，请重试",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>创建新排行榜</DialogTitle>
            <DialogDescription>创建一个新的排行榜配置，填写所有必要信息。</DialogDescription>
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
              <Label className="text-right">日期</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "col-span-3 justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "PPP", { locale: zhCN }) : <span>选择日期</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "创建中..." : "创建排行榜"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
