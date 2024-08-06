<script lang="ts">
  import type { PageData } from './$types'

  export let data: PageData

  let isOpenModal: HTMLDialogElement
</script>

<pre>
  {JSON.stringify(data, null, 2)}
</pre>

<button class="btn" on:click={isOpenModal.showModal}>open modal</button>
<dialog id="my_modal_2" class="modal" bind:this={isOpenModal}>
  <div class="modal-box">
    <h3 class="text-lg font-bold">Hello!</h3>
    <p class="py-4">Press ESC key or click outside to close</p>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
