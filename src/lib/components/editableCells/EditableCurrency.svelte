<script lang="ts" >
  import CurrencyInput from "../input/CurrencyInput.svelte"


    export let value:number
    export let onUpdateValue: (
      newValue: number,
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
      >
      R${(value/100).toFixed(2)}
      </button>
    {:else}
      <form on:submit|preventDefault={handleSubmit}>
        <!-- <input bind:this={inputElement} type="text" bind:value /> -->
        <CurrencyInput bind:value />
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
  