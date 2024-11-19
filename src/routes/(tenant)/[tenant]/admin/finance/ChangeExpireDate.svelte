<script lang="ts" generics="Item">
  import Datepicker from '$lib/components/input/date/datepicker.svelte'
  import { format } from 'date-fns'

  // type Item = $$Generic;

  // export let row
  // export let column
  export let value: Date
  export let onUpdateValue: (newValue: Date) => void

  let isEditing = false

  let inputElement: HTMLInputElement | undefined
  $: if (isEditing) {
    inputElement?.focus()
  }

  const handleCancel = () => {
    isEditing = false
  }
  const handleSubmit = () => {
    isEditing = false
    // if (row.isData()) {
    onUpdateValue(value)
    // }
  }
</script>

{#if isEditing === true}
  <form on:submit|preventDefault={handleSubmit}>
    <div class="date-filter flex gap-2">
      <input
        type="date"
        bind:this={inputElement}
        on:change={e => {
          const v = (e.target as HTMLInputElement).value
          console.log(v)
          const dateV = new Date(v + 'T00:00:00')
          value = dateV
        }}
        value={format(value, 'yyyy-MM-dd')}
        min={format(new Date(), 'yyyy-MM-dd')}
      />
      <button type="submit">✅</button>
      <button on:click={handleCancel}>❌</button>
    </div>
  </form>
{:else}
  <button
    on:click={() => (isEditing = true)}
    class={!value ? 'text-error' : ''}
  >
    {value ? format(value, 'dd/MM/yyyy') : 'Não cadastrado'}
  </button>
{/if}
