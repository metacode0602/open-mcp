"use client"

import { useState } from "react"
import { Button } from "@repo/ui/components/ui/button"
import { Calendar } from "@repo/ui/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/ui/popover"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, subDays, addDays } from "date-fns"
import { zhCN } from "date-fns/locale"
import { CalendarIcon } from "@/components/icons"

interface DateSelectorProps {
  date: Date
  onDateChange: (date: Date) => void
}

export function DateSelector({ date, onDateChange }: DateSelectorProps) {
  const [open, setOpen] = useState(false)

  const handlePreviousDay = () => {
    onDateChange(subDays(date, 1))
  }

  const handleNextDay = () => {
    const nextDay = addDays(date, 1)
    // 不允许选择未来日期
    if (nextDay <= new Date()) {
      onDateChange(nextDay)
    }
  }

  const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
  const isMaxDate = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")

  return (
    <div className="flex items-center justify-center space-x-4">
      <Button variant="outline" size="icon" onClick={handlePreviousDay}>
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">前一天</span>
      </Button>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="min-w-[240px]">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {isToday ? "今天" : format(date, "yyyy年MM月dd日", { locale: zhCN })}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              if (selectedDate) {
                onDateChange(selectedDate)
                setOpen(false)
              }
            }}
            disabled={(date) => date > new Date() || date < new Date(2020, 0, 1)}
            initialFocus
            locale={zhCN}
          />
        </PopoverContent>
      </Popover>

      <Button variant="outline" size="icon" onClick={handleNextDay} disabled={isMaxDate}>
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">后一天</span>
      </Button>
    </div>
  )
}
