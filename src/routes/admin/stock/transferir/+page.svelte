<script lang="ts">
  import { icons } from '$lib/utils/icons'
  import ModalDistribuidora from './../ModalDistribuidora.svelte'
  import { modal } from '$lib/components/modal'
  import type { SelectDistribuidora } from '$db/schema'

  let selectedDistribuidoraUm: SelectDistribuidora | null = null

  let selectedDistribuidoraDois: SelectDistribuidora | null = null

  function openModalDistribuidoraUm() {
    modal.open(ModalDistribuidora, {
      select: distribuidora => {
        selectedDistribuidoraUm = distribuidora
        modal.close()
      },
    })
  }

  function openModalDistribuidoraDois() {
    modal.open(ModalDistribuidora, {
      select: distribuidora => {
        selectedDistribuidoraDois = distribuidora
        modal.close()
      },
    })
  }
</script>

<main>
  <h1 class="my-4 text-center text-2xl font-semibold">Transfeirir estoque</h1>

  <div class="flex justify-center gap-10">
    <div>
      <p class="text-center">Saindo de:</p>
      <div class="flex items-center gap-2">
        <button
          class="btn btn-primary"
          on:click={openModalDistribuidoraUm}
          disabled={selectedDistribuidoraUm != null}
        >
          {#if selectedDistribuidoraUm}
            {selectedDistribuidoraUm.name}
          {:else}
            Selecionar distribuidora
          {/if}
        </button>
        {#if selectedDistribuidoraUm}
          <button
            class="btn btn-circle"
            on:click={() => (selectedDistribuidoraUm = null)}
          >
            {@html icons.x({ stroke: 'red' })}
          </button>
        {/if}
      </div>
    </div>

    <div>
      <p class="text-center">Indo para:</p>
      <div class="flex items-center gap-2">
        <button
          class="btn btn-primary"
          on:click={openModalDistribuidoraDois}
          disabled={selectedDistribuidoraDois != null}
        >
          {#if selectedDistribuidoraDois}
            {selectedDistribuidoraDois.name}
          {:else}
            Selecionar distribuidora
          {/if}
        </button>

        {#if selectedDistribuidoraDois}
          <button
            class="btn btn-circle"
            on:click={() => (selectedDistribuidoraDois = null)}
          >
            {@html icons.x({ stroke: 'red' })}
          </button>
        {/if}
      </div>
    </div>
  </div>
</main>
