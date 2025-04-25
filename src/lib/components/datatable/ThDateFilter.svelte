<script lang="ts" generics="T">
  import {
    Th,
    type Field,
    type TableHandlerInterface,
  } from '@vincjo/datatables'

  import type { DateValue } from '@internationalized/date'
  import DateFilter from '../DateFilter.svelte'

  type Props = {
    startValue?: DateValue
    endValue?: DateValue
    table: TableHandlerInterface<T>
    keyStart?: string
    keyEnd?: string
    enableFuture?: boolean
  }

  let { startValue, endValue, table,keyStart='startDate',keyEnd='endDate',enableFuture=false }: Props = $props()

  const filterStart = table.createFilter(keyStart as Field<T>)
  const filterEnd = table.createFilter(keyEnd as Field<T>)

  function handleValueChange(startDate?: number, endDate?: number) {
    filterStart.value = startDate
    filterEnd.value = endDate
    filterStart.set()
    filterEnd.set()
  }
</script>

<Th>
  <DateFilter
    {startValue}
    {endValue}
    futureDates={enableFuture}
    onClear={() => {
      startValue = undefined
      endValue = undefined
      handleValueChange()
    }}
    onChange={(startDate, endDate) => {
      if (!startDate || !endDate) return
      handleValueChange(startDate, endDate)
    }}
  />
</Th>
