<script lang="ts" generics="T,TABLE">
  import SelectSearch from '../selectSearch.svelte'
  import type { Field, TableHandlerInterface } from '@vincjo/datatables'

  interface Props {
    delegateQuery: () => Promise<T[]>
    filterKey: Field<TABLE>
    table: TableHandlerInterface<TABLE>
    placeholder?: string
    config: { value: (item: T) => string | number, label: (item: T) => string}
  }

  let {
    delegateQuery,
    filterKey,
    placeholder,
    config,
    table
  }: Props = $props()

  const filter = table.createFilter(filterKey)

  function handleValueChange(value: string) {
    filter.value = value
    filter.set()
  }
</script>

<th>
  <SelectSearch
    variant="ghost"
    bind:value={filter.value as string}
    delegateQuery={delegateQuery}
    {config}
    onValueChange={value => {
      handleValueChange(value)
    }}
    {placeholder}
  />
</th>

<style>
   th {
    border-bottom: 1px solid var(--grey, #e0e0e0);
  }
</style>
