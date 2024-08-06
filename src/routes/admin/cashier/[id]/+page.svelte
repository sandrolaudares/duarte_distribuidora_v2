<script lang="ts">
  import type { PageData } from './$types'
  import Cardapio from '$lib/components/Cardapio.svelte'

  export let data: PageData

  let isOpenModal: HTMLDialogElement | null = null
</script>

<pre>
  {JSON.stringify(data, null, 2)}
</pre>

<button class="btn" on:click={() => isOpenModal?.showModal()}>
  open modal
</button>

<dialog class="modal" bind:this={isOpenModal}>
  <div class="modal-box">
    <Cardapio data={data.products}>
      {#snippet card(product)}
        <div>
          <pre>
            {JSON.stringify(product)}
          </pre>
          <!--TODO:CARD-->
        </div>
      {/snippet}
    </Cardapio>
    <h3 class="text-lg font-bold">Hello!</h3>
    <p class="py-4">Press ESC key or click outside to close</p>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
