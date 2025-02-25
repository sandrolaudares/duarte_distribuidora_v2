<script lang="ts" >

    export let value:boolean
    export let onUpdateValue: (
      newValue: boolean,
    ) => void
  
    let isEditing = false
  
    let inputElement: HTMLSelectElement | undefined
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
        class={value === null ? 'text-error' : ''}
      >
        <!-- {value != null ? value : 'Não cadastrado'} -->
         {value === true ? 'Pessoa física' : 'Pessoa Juridica'}
      </button>
    {:else}
      <form on:submit|preventDefault={handleSubmit}>
         <select bind:this={inputElement} bind:value>
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
  