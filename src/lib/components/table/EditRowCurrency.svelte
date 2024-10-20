<!-- <script lang="ts" generics="T extends {id: any}">
  import { type EditableTypes, getRowChanges } from '.'
  import CurrencyInput from '../input/CurrencyInput.svelte'
  const rowChanges = getRowChanges<T>()

  export let id: any
  export let colID: keyof T
  export let editT: EditableTypes
  export let value: any

  let rInEdit = false

  let changedRow = <T>{}

  $: {
    if ($rowChanges[id]) {
      rInEdit = true
      changedRow = $rowChanges[id]
    } else {
      rInEdit = false
      changedRow = <T>{}
    }
  }

  const className = 'input input-sm input-bordered w-full '
</script>

{#if rInEdit !== true}
  <span>
    R${(value / 100).toFixed(2)}
  </span>
{:else}
  <CurrencyInput bind:value={changedRow[colID]} />
{/if} -->
