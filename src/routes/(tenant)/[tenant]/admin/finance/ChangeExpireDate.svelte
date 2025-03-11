<script lang="ts" generics="Item">
  import { preventDefault } from 'svelte/legacy';

  import { DateFormatter } from '@internationalized/date'

  interface Props {
    value: Date;
    onUpdateValue: (newValue: Date) => void;
    df: DateFormatter;
  }

  let { value, onUpdateValue,df }: Props = $props();

  let isEditing = $state(false)

  let inputElement: HTMLInputElement | undefined = $state()

  $effect.pre(()=>{
    if (isEditing) {
      inputElement?.focus()
    }
  })

  const handleCancel = () => {
    isEditing = false
  }
  const handleSubmit = () => {
    isEditing = false
    // if (row.isData()) {
    onUpdateValue(value)
    // }
  }

  const today = new Date().toISOString().split('T')[0]
  
</script>

{#if isEditing === true}
  <form onsubmit={preventDefault(handleSubmit)}>
    <div class="date-filter flex gap-2">
      <input
        type="date"
        id="expire_at"
        class="input input-bordered h-3/4 w-full"
        bind:this={inputElement}
        bind:value={value}
        min={today}
      />
      <button type="submit">✅</button>
      <button onclick={handleCancel}>❌</button>
    </div>
  </form>
{:else}
  <button
    onclick={() => (isEditing = true)}
    class={!value ? 'text-error' : ''}
  >
    {value ? df.format(value) : 'Não cadastrado'}
  </button>
{/if}
