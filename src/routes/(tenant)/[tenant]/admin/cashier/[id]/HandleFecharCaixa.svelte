<script lang="ts">
  import Loading from '$lib/components/Loading.svelte'
  import { page } from '$app/state'
  import { Modal, modal } from '$lib/components/modal'
  import type { SelectCashier } from '$lib/server/db/schema'
  import { trpc } from '$trpc/client'
  import { toast } from 'svelte-sonner'
  import { goto } from '$app/navigation'
  import type { RouterOutputs } from '$trpc/router'
  import { formatCurrency } from '$lib/utils'
  import { paymentMethodLabel } from '$lib/utils/permissions'
  import { cssPrintTable, printTable } from '../transactionsUtils'
  import TableTransactions from '$lib/components/cashierComponents/TableTransactions.svelte'
  import TransactionsModal from './TransactionsModal.svelte'

  let {
    caixa,
    transactions,
  }: {
    caixa: SelectCashier
    transactions: RouterOutputs['stock']['getRecentTransaoEstoque'] | undefined
  } = $props()

  let loadingFechar = $state(false)

  async function handleFecharCaixa() {
    loadingFechar = true
    printTable(componentRef)
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

  let componentRef: HTMLTableElement | undefined = $state(undefined)
</script>

<Modal title="Fechar caixa!">
  {#if transactions}
    <div class="hidden">
      <TableTransactions {transactions} bind:tableRef={componentRef} />
    </div>
  {/if}
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
