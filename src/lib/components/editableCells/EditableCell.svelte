<script lang="ts" generics="T">

  export let value:T
  export let onUpdateValue: (
    newValue: T,
  ) => void

  let isEditing = false

  let inputElement: HTMLInputElement | undefined
  $: if (isEditing) {
    inputElement?.focus()
  }

  const oldV = value

  const getInputWidth = () => {
    if (typeof value === 'string') {
      return `${value.length + 1}ch`;
    }
    return 'auto';
  };


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
      class={!value ? 'text-error' : ''}
    >
      {value ? value : 'Não cadastrado'}
    </button>
  {:else}
    <form on:submit|preventDefault={handleSubmit}>
      <input bind:this={inputElement} type="text" style="width: {getInputWidth()};" bind:value/>
      <button type="submit">✅</button>
      <button on:click={handleCancel} class="mr-2">❌</button>
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
  input {
    min-width: 30px;
    max-width: 250px;
    border: 1px solid #ccc;
    font-family: inherit;
  }
</style>
