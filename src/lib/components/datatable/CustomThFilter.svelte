<script lang="ts">
  import { debounce } from '$lib/utils'
  import type { Check, Field, TableHandlerInterface } from '@vincjo/datatables'

  type T = $$Generic<Row>
  type Props = {
    table: TableHandlerInterface<T>
    field: Field<T>
    check?: Check
  }
  let { table, field, check = undefined }: Props = $props()

  const filter = table.createFilter(field, check)
  
  const debouncedSet = debounce(filter.set, 500)
</script>

<th>
  <input
    type="text"
    placeholder={table.i18n.filter}
    spellcheck="false"
    bind:value={filter.value}
    oninput={debouncedSet}
  />
</th>

<style>
  th {
    border-bottom: 1px solid var(--grey, #e0e0e0);
  }
  input {
    max-width: 150px;
    height: 24px;
    border: none;
    text-align: left;
    padding: 0 20px;
    background: inherit;
    outline: none;
    border-radius: 0;
    font-size: 14px;
    color: var(--font-grey, #757575);
    font-family: Arial, Helvetica, sans-serif;
  }
  input::placeholder {
    color: var(--grey, #bdbdbd);
    font-size: 13px;
  }
  input:focus {
    outline: none;
    border: none;
  }
</style>
