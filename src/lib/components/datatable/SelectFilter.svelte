<script lang="ts" generics="T">
  import SelectSearch from '../selectSearch.svelte'
  import { SSRFilters } from './filter.svelte'

  interface Props {
    filterKey: string
    options: T[]
    config: { value: (item: T) => string | number; label: (item: T) => string }
    placeholder?: string
    selectedValue: string
  }

  let {
    filterKey,
    options,
    config,
    placeholder,
    selectedValue = $bindable(''),
  }: Props = $props()

  const filters = new SSRFilters()

  function handleValueChange(value: string) {
    selectedValue = value
    filters.update({ [filterKey]: value })
  }
</script>

<SelectSearch
  {config}
  bind:value={selectedValue}
  {options}
  onValueChange={value => {
    handleValueChange(selectedValue)
  }}
  {placeholder}
/>
