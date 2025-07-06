import { useState } from "react"

export interface TableState<T extends string = string> {
  query: string
  filters: Record<string, T | "all">
  page: number
  limit: number
  sort?: {
    field: string
    order: "asc" | "desc"
  }
}

export function useTableState<T extends string = string>(initialState: Partial<TableState<T>> = {}) {
  const [state, setState] = useState<TableState<T>>({
    query: "",
    filters: {},
    page: 1,
    limit: 10,
    ...initialState,
  })

  const setQuery = (query: string) => {
    setState((prev) => ({ ...prev, query, page: 1 }))
  }

  const setFilter = (key: string, value: T | "all") => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, [key]: value },
      page: 1,
    }))
  }

  const setPage = (page: number) => {
    setState((prev) => ({ ...prev, page }))
  }

  const setLimit = (limit: number) => {
    setState((prev) => ({ ...prev, limit, page: 1 }))
  }

  const setSort = (field: string, order: "asc" | "desc") => {
    setState((prev) => ({ ...prev, sort: { field, order } }))
  }

  const reset = () => {
    setState({
      query: "",
      filters: {},
      page: 1,
      limit: 10,
    })
  }

  return {
    state,
    setQuery,
    setFilter,
    setPage,
    setLimit,
    setSort,
    reset,
  }
} 