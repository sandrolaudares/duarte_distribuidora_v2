<script lang="ts">
  import Loading from '$lib/components/Loading.svelte'
  import { page } from '$app/state'
  import { Modal, modal } from '$lib/components/modal'
  import type { SelectCashier } from '$lib/server/db/schema'
  import { trpc } from '$trpc/client'
  import { toast } from 'svelte-sonner'
  import { goto } from '$app/navigation'

  let { caixa }: { caixa: SelectCashier } = $props()

  let loadingFechar = $state(false)

  async function handleFecharCaixa() {
    loadingFechar = true
    try {
      const resp = await trpc(page).distribuidora.fecharCaixa.mutate({
        id: caixa.id,
      })
      console.log(resp)
      toast.success('Caixa fechado com sucesso!')
      goto(`/admin/cashier`)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      loadingFechar = false
      modal.close()
    }
  }
</script>

<Modal title="Fechar caixa!">
  <h1>Você está prestes a fechar o caixa! Deseja continuar?</h1>
  <div class=" mt-4 flex justify-center gap-3">
    <button class="btn" onclick={() => modal.close()} disabled={loadingFechar}>
      Cancelar
    </button>
    <button
      class="btn btn-primary"
      onclick={handleFecharCaixa}
      disabled={loadingFechar}
    >
      {#if loadingFechar}
        <Loading />
      {:else}
        Fechar caixa
      {/if}
    </button>
  </div>
</Modal>
