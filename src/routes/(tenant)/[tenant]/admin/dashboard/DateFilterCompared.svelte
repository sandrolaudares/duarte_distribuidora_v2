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

  interface Props {
    filters?: SSRFilters
  }
  let { filters = $bindable(new SSRFilters()) }: Props = $props()
</script>

<div class="flex gap-2">
  {#if page.url.pathname.startsWith('/admin/dashboard/vendas')}
    <DateFilter
    variant="outlinePrimary"
      title="Comparar"
      startValue={filters.getFilterValue('compareStartDate')}
      endValue={filters.getFilterValue('compareEndDate')}
      onClear={()=>{
        filters?.clear('compareStartDate', 'compareEndDate')
      }}
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
  variant="outlinePrimary"
    title="Base"
    startValue={filters.getFilterValue('startDate')}
    endValue={filters.getFilterValue('endDate')}
    onClear={()=>{
      filters?.clear('startDate', 'endDate')
    }}
    onChange={(startDate, endDate) => {
      if (!startDate || !endDate) return
  
      filters.update({
        startDate: String(startDate),
        endDate: String(endDate),
      })
    }}
  />
</div>
