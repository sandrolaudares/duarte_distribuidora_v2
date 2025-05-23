import { page } from '$app/state'
import { goto } from '$app/navigation'
import type { State } from '@vincjo/datatables/server'
import { toast } from 'svelte-sonner'
import { CalendarDate } from '@internationalized/date'

export class SSRFilters {
  Filters = $derived(page.url)

  get(name: string) {
    return this.Filters.searchParams.get(name)
  }

  getDate(name: string) {
    const value = this.Filters.searchParams.get(name)
    if (!value) return undefined
    return Number(value)
  }

 async  update(filters: Record<string, string | undefined>) {
    const url = new URL(this.Filters)
    Object.entries(filters).forEach(([name, value]) => {
      if (!value) {
        url.searchParams.delete(name)
      }

      if (value === undefined || value === "" || value === "null" || value === "undefined") {
        url.searchParams.delete(name)
      }else {
        url.searchParams.set(name, value)
      }
    })

    if (typeof window !== 'undefined') {
      console.log('update', url)
     await goto(url, { keepFocus: true })
    }
  }

  async fromState(s: State, keysToKeep: string[] = []) {
    const filters = s.filters ?? []
    const sort = s.sort
    const page = s.currentPage
    const rowsPerPage = s.rowsPerPage
    try {
      const url = new URL(this.Filters.origin + this.Filters.pathname)

      for (const key of keysToKeep) {
        const value = this.Filters.searchParams.get(key)
        if (value) {
          url.searchParams.set(key, value)
        }
      }
      
      for (const { field, value } of filters) {
        url.searchParams.set(String(field), String(value))
      }
      if (sort?.field && sort?.direction) {
        // console.log('sort', sort)
        url.searchParams.set('sort_id', sort.field?.toString())
        url.searchParams.set('sort_direction', sort.direction)
      }
      if (page) {
        url.searchParams.set('page', page.toString())
      }
      if (rowsPerPage) {
        url.searchParams.set('pageSize', rowsPerPage.toString())
      }

      if (typeof window !== 'undefined') {
        await goto(url, { keepFocus: true })
      }
    } catch (error) {
      console.error('error', error)
      toast.error('Erro ao atualizar filtros')
    }
  }

  async clear(...params: string[]) {
    const url = new URL(this.Filters)
    params.forEach(p => url.searchParams.delete(p))
    console.log('clear', url)
    if (typeof window !== 'undefined') {
      const newURL = url.origin + url.pathname

      await goto(newURL, { keepFocus: true })
    }
  }

  isFiltered(...params: string[]) {
    return (
      params.length > 0 && params.some(p => this.Filters.searchParams.has(p))
    )
  }

  getFilterValue(filterName: string) {
    const startValue = this.Filters.searchParams.get(filterName)
    if (!startValue) return undefined

    const startDate = new Date(Number(startValue))
    return new CalendarDate(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
    )
  }
}
