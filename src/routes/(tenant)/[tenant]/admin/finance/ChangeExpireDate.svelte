<script lang="ts" generics="Item">
  import { DateFormatter } from '@internationalized/date'

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
        id="expire_at"
        class="input input-bordered h-3/4 w-full"
        bind:this={inputElement}
        value={value}
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
