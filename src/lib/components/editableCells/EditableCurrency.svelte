<script lang="ts" >
  import { formatCurrency } from "$lib/utils"
  import CurrencyInput from "../input/CurrencyInput.svelte"


    export let value:number
    export let onUpdateValue: (
      newValue: number,
    ) => void
  
    let isEditing = false

    const oldV = value
  
    let inputElement: HTMLInputElement | undefined
    $: if (isEditing) {
      inputElement?.focus()
    }
  
    const handleCancel = () => {
      value = oldV
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
      {formatCurrency(value)}
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
  