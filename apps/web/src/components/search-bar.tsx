"use client"

import { Input } from "@repo/ui/components/ui/input"
import { useDebounce } from "@repo/ui/hooks/use-debounce"
import { AnimatePresence, motion } from "framer-motion"
import { AppWindow, Filter, Laptop, Search, Send, Server } from "lucide-react"
import { useRouter } from "next/navigation"
import type React from "react"
import { useEffect, useState, useTransition } from "react"

interface SearchBarProps {
  defaultValue?: string
  defaultCategory?: string
  className?: string
}

interface Category {
  id: string
  label: string
  value: string
  icon: React.ReactNode
}

export function SearchBar({ defaultValue = "", defaultCategory = "all" }: SearchBarProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState(defaultValue)
  const [category, setCategory] = useState(defaultCategory)
  const [isFocused, setIsFocused] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const debouncedQuery = useDebounce(query, 200)

  useEffect(() => {
    if (debouncedQuery) {
      startTransition(() => {
        const params = new URLSearchParams()
        if (debouncedQuery) params.set("q", debouncedQuery)
        if (category !== "all") params.set("category", category)

        router.push(`/search?${params.toString()}`)
      })
    }
  }, [debouncedQuery, category, router])

  const categories: Category[] = [
    { id: "all", label: "全部", value: "all", icon: <Filter className="h-4 w-4 text-gray-500" /> },
    { id: "client", label: "客户端", value: "client", icon: <Laptop className="h-4 w-4 text-blue-500" /> },
    { id: "server", label: "服务器", value: "server", icon: <Server className="h-4 w-4 text-green-500" /> },
    { id: "application", label: "应用", value: "application", icon: <AppWindow className="h-4 w-4 text-purple-500" /> },
  ]

  const selectedCategoryObj = categories.find((cat) => cat.value === category) || categories[0]

  // Handle dropdown close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isDropdownOpen && !target.closest('[data-dropdown="category"]')) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isDropdownOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(() => {
      const params = new URLSearchParams()
      if (query) params.set("q", query)
      if (category !== "all") params.set("category", category)

      router.push(`/search?${params.toString()}`)
    })
  }

  const handleCategorySelect = (value: string) => {
    setCategory(value)
    setIsDropdownOpen(false)
  }

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDropdownOpen(!isDropdownOpen)
  }

  // Animation variants
  const container = {
    hidden: { opacity: 0, height: 0 },
    show: {
      opacity: 1,
      height: "auto",
      transition: {
        height: { duration: 0.3 },
        staggerChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        height: { duration: 0.2 },
        opacity: { duration: 0.1 },
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: -5, transition: { duration: 0.1 } },
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="relative flex flex-col justify-start items-center">
        <div className="w-full sticky top-0 bg-background z-10 pt-4 pb-1">
          {/* <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block" htmlFor="search">
            搜索应用
          </label> */}
          <form onSubmit={handleSearch} className="relative">
            <div className="flex items-center">
              <div className="relative flex-1">
                <Input
                  id="search"
                  type="text"
                  placeholder="搜索应用、服务器或客户端..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="pl-9 pr-3 py-1.5 h-10 text-sm rounded-lg focus-visible:ring-offset-0"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400">
                  <Search className="h-4 w-4" />
                </div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4">
                  <AnimatePresence mode="popLayout">
                    {query.length > 0 ? (
                      <motion.div
                        key="send"
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 10, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Send className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>
              <div className="relative ml-2" data-dropdown="category">
                <button
                  type="button"
                  onClick={toggleDropdown}
                  className="flex items-center gap-2 px-3 py-2 h-10 text-sm rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                >
                  {selectedCategoryObj?.icon}
                  <span>{selectedCategoryObj?.label}</span>
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      className="absolute right-0 mt-1 w-40 border rounded-md shadow-sm overflow-hidden bg-white dark:bg-black dark:border-gray-800 z-20"
                      variants={container}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                    >
                      <motion.ul>
                        {categories.map((cat) => (
                          <motion.li
                            key={cat.id}
                            className={`px-3 py-2 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${category === cat.value ? "bg-gray-100 dark:bg-gray-800" : ""
                              }`}
                            variants={item}
                            onClick={() => handleCategorySelect(cat.value)}
                          >
                            {cat.icon}
                            <span className="text-sm">{cat.label}</span>
                          </motion.li>
                        ))}
                      </motion.ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="ml-2 px-4 py-2 h-10 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                {isPending ? "搜索中..." : "搜索"}
              </button>
            </div>
          </form>
        </div>

        <AnimatePresence>
          {isFocused && query.length > 0 && (
            <motion.div
              className="w-full border rounded-md shadow-sm overflow-hidden dark:border-gray-800 bg-white dark:bg-black mt-1"
              variants={container}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <div className="px-3 py-2 text-sm text-gray-500">
                按回车键搜索 <span className="text-primary font-medium">"{query}"</span>
              </div>
              <div className="mt-2 px-3 py-2 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>在 {selectedCategoryObj?.label} 分类中搜索</span>
                  <span>ESC 取消</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
