"use client"

import { Button } from "@repo/ui/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface AdminTablePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems: number
  itemsPerPage: number
  showingFrom: number
  showingTo: number
}

export function AdminTablePagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  showingFrom,
  showingTo,
}: AdminTablePaginationProps) {
  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="text-sm text-muted-foreground">
        显示 {showingFrom} 到 {showingTo}，共 {totalItems} 条
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => onPageChange(1)} disabled={currentPage === 1}>
          <ChevronsLeft className="h-4 w-4" />
          <span className="sr-only">首页</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">上一页</span>
        </Button>

        <span className="text-sm">
          第 {currentPage} 页，共 {totalPages} 页
        </span>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">下一页</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
          <span className="sr-only">末页</span>
        </Button>

        <Select
          value={itemsPerPage?.toString() ?? "10"}
          onValueChange={(value) => {
            // 这里应该有一个处理每页显示数量变化的函数
            // 但由于我们没有实现这个功能，所以这里只是一个示例
            console.log(`每页显示 ${value} 条`)
          }}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="每页显示" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 条/页</SelectItem>
            <SelectItem value="20">20 条/页</SelectItem>
            <SelectItem value="50">50 条/页</SelectItem>
            <SelectItem value="100">100 条/页</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

