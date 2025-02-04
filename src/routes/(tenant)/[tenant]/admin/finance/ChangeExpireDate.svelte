<script lang="ts" generics="Item">
  import { DateFormatter } from '@internationalized/date'

  // import Datepicker from '$lib/components/input/date/datepicker.svelte'

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

  const df = new DateFormatter('pt-BR', {
    dateStyle: 'medium',
  })
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
        value={df.format(value)}
        min={df.format(new Date())}
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
    {value ? df.format(value) : 'Não cadastrado'}
  </button>
{/if}
