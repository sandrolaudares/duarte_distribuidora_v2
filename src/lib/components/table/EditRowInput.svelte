<script lang="ts" generics="T extends {id: any}">
  import { type EditableTypes, getRowChanges } from '.'
  import CurrencyInput from '$components/input/CurrencyInput.svelte'
  import type { Snippet } from 'svelte'
  const rowChanges = getRowChanges<T>()

  export let id: any
  export let colID: keyof T
  export let editT: EditableTypes
  export let value: any
  export let options: { label: string; value: T[typeof colID] }[] | undefined =
    undefined
 
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
      {value}
    </span>

{:else if editT === 'text'}
  <input class={className} type="text" bind:value={changedRow[colID]} />
{:else if editT === 'number'}
  <input class={className} type="number" bind:value={changedRow[colID]} />
{:else if editT === 'select' && options}
  <select class="select" bind:value={changedRow[colID]}>
    {#each options as { label, value: v }}
      <option value={v}>{label}</option>
    {/each}
  </select>
  <!-- {:else if  editT === 'currency' && typeof changedRow[colID] ==='number'}
     <CurrencyInput bind:value={changedRow[colID]}/> -->
{:else}
  <span>
    {value}
  </span>
{/if}
