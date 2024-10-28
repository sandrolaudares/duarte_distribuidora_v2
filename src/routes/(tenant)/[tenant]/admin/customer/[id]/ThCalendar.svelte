<script lang="ts" generics="Item">
  import DateFilter from '$lib/components/DateFilter.svelte'
  import type { TableHandlerInterface } from '@vincjo/datatables'
  import { Th } from '@vincjo/datatables'

  interface Props {
    table: TableHandlerInterface<Item>
    field: keyof Item
  }

  let { table, field }: Props = $props()
  import { check } from '@vincjo/datatables'

  const dateChecker = (entry, value): boolean => {
    console.log('deuuuuuuuuuuuuuu')
    console.log(entry, value)

    return true
  }
  const filter = table.createFilter(field, dateChecker)
  function handleChange(dateStart: number | null, dateEnd: number | null) {
    filter.value = {
      dateStart,
      dateEnd,
    }

    console.log(filter.value)
    filter.set()
  }
</script>

<Th>
  <DateFilter onchange={handleChange} />
</Th>
