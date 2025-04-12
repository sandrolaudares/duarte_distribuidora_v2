<script lang="ts">
  import { Modal } from '$lib/components/modal'
  import { trpc } from '$trpc/client'

  import { page } from '$app/stores'
  import { onMount } from 'svelte'

  import type { RouterOutputs } from '$trpc/router'
  import { toast } from 'svelte-sonner'
  import Loading from '$lib/components/Loading.svelte'
  import { formatCurrency } from '$lib/utils'

  let { caixa_id } = $props()

  let isLoading = $state(true)

  let transactions:
    | RouterOutputs['stock']['getRecentTransaoEstoque']
    | undefined = $state()
  let caixa: RouterOutputs['distribuidora']['getCashierById'] | undefined =
    $state()
  onMount(async () => {
    try {
      transactions =
        await trpc($page).stock.getRecentTransaoEstoque.query(caixa_id)

      caixa = await trpc($page).distribuidora.getCashierById.query(caixa_id)

      isLoading = false
    } catch (error: any) {
      toast.error(error.message)
    }
  })

  let totalMovimentado = $derived.by(() => {
    if (!transactions) return 0
    return transactions.reduce((acc, transaction) => {
      return acc + (transaction.currency ?? 0)
    }, 0)
  })
</script>

<Modal title="Ultimas transacões">
  <div class="my-3">
    {#if isLoading || !transactions}
      <div class="flex items-center justify-center">
        <Loading />
      </div>
    {:else if caixa !== undefined}
      <p class="mb-3 text-center">
        Quantidade no caixa {formatCurrency(caixa.currency)}
      </p>
      <div class="overflow-x-auto">
        <table class="table table-zebra table-xs">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <!-- <th>Valor</th> -->
              <th>Data de Criação</th>
            </tr>
          </thead>
          <tbody>
            {#each transactions as transaction}
              <tr>
                <td>{transaction.id}</td>
                <td>{transaction.type}</td>
                <!-- <td>{formatCurrency(transaction.metadata.currency)}</td> -->
                <td>{transaction.created_at}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</Modal>
