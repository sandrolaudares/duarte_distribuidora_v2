<script lang="ts" generics="Item">
  import DateFilter from '$lib/components/DateFilter.svelte'
  import { Th, type TableHandlerInterface } from '@vincjo/datatables'

  interface Props {
    table: TableHandlerInterface<Item>
    field: keyof Item
  }

  let { table, field }: Props = $props()

  const dateChecker = (entry, value): boolean => {
    console.log('Checking date for entry:', entry)
    console.log('Value:', value)
    return true
  }

  const filter = table.createFilter(field,dateChecker)
  function handleChange(dateStart: number, dateEnd: number) {
    filter.value = { dateStart, dateEnd }
    filter.set()
  }
  $inspect(filter.value)
</script>

<Th>
  <DateFilter onChange={(startDate,endDate)=>{
    handleChange(startDate,endDate)
  }} />
</Th>
        