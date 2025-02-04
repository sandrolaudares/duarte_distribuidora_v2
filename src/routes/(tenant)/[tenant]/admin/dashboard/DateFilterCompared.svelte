<script lang="ts">
  import {
    CalendarDate,
    DateFormatter,
    type DateValue,
    getLocalTimeZone,
    today,
    toCalendar,
  } from '@internationalized/date'
  import DateFilter from '$lib/components/DateFilter.svelte'
  import { page } from '$app/state'
  import { SSRFilters } from '$lib/components/datatable/filter.svelte'

  const filters = new SSRFilters()

  function getFilterValue(filterName: string) {
    let startValue = filters.get(filterName)
    if (!startValue) return undefined

    let startDate = new Date(Number(startValue))
    return new CalendarDate(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
    )
  }
</script>

{#if page.url.pathname.startsWith('/admin/dashboard/vendas')}
  <DateFilter
    title="Comparar"
    startValue={getFilterValue('compareStartDate')}
    endValue={getFilterValue('compareEndDate')}
    onChange={(startDate, endDate) => {
      if (!startDate || !endDate) return

      filters.update({
        compareStartDate: String(startDate),
        compareEndDate: String(endDate),
      })
    }}
  />
{/if}
  <DateFilter
    title="Base"
    startValue={getFilterValue('startDate')}
    endValue={getFilterValue('endDate')}
    onChange={(startDate, endDate) => {
      if (!startDate || !endDate) return

      filters.update({
        startDate: String(startDate),
        endDate: String(endDate),
      })
    }}
  />
