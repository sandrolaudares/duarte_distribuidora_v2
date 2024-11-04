<script lang="ts" >

    export let value:unknown
    export let onUpdateValue: (
      newValue: unknown,
    ) => void
  
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
  
  <div>
    {#if !isEditing}
      <button
        on:click={() => (isEditing = true)}
        class={!value ? 'text-error' : ''}
      >
        {value ? value : 'Não cadastrado'}
      </button>
    {:else}
      <form on:submit|preventDefault={handleSubmit}>
        <select class="select select-bordered w-full max-w-xs" bind:value={value}>
            <option value={true}>Pessoa física</option>
            <option value={false}>Pessoa juridica</option>
          </select>
        <button type="submit">✅</button>
        <button on:click={handleCancel}>❌</button>
      </form>
    {/if}
  </div>
  
  <style>
    form {
      display: flex;
      gap: 0.5rem;
    }
  
    button {
      padding: 0;
      border: none;
      background: transparent;
    }
  </style>
  