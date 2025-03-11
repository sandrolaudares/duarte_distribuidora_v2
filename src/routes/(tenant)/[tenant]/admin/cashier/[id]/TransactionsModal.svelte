<script lang="ts">
  import { Modal } from '$lib/components/modal'
  import { trpc } from '$trpc/client'

  import { page } from '$app/stores'
  import { onMount } from 'svelte'

  import type { RouterOutputs } from '$trpc/router'
  import { toast } from 'svelte-sonner'
  import Loading from '$lib/components/Loading.svelte'
  import { formatCurrency } from '$lib/utils'

  export let caixa_id

  let isLoading = true

  let transactions: RouterOutputs['stock']['getRecentTransaoEstoque']
  let caixa: RouterOutputs['distribuidora']['getCashierById'][0]
  onMount(async () => {
    try {
      transactions =
        await trpc($page).stock.getRecentTransaoEstoque.query(caixa_id)

        const [temp] = await trpc($page).distribuidora.getCashierById.query(caixa_id)
        caixa = temp

      isLoading = false
    } catch (error: any) {
      toast.error(error.message)
    }
  })
</script>

<Modal title="Ultimas transacões">
  <div class="my-3">
    {#if isLoading}
      <div class="flex items-center justify-center">
        <Loading />
      </div>
    {:else}
    <p class="text-center mb-3">Quantidade no caixa {formatCurrency(caixa.currency)}</p>
      <div class="overflow-x-auto">
        <table class="table table-zebra table-xs">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Valor</th>
              <th>Data de Criação</th>
            </tr>
          </thead>
          <tbody>
            {#each transactions as transaction}
              <tr>
                <td>{transaction.id}</td>
                <td>{transaction.type}</td>
                <td>{formatCurrency(transaction.amount)}</td>
                <td>{transaction.created_at}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</Modal>
