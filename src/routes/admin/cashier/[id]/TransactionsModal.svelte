<script lang="ts">
  import { Modal } from '$lib/components/modal'
  import { trpc } from '$trpc/client'

  import { page } from '$app/stores'
  import { onMount } from 'svelte'

  import type { RouterOutputs } from '$trpc/router'
  import { toast } from 'svelte-sonner'
  import Loading from '$lib/components/Loading.svelte'

  export let caixa_id

  let isLoading = true

  let transactions: RouterOutputs['stock']['getRecentTransaoEstoque']
  onMount(async () => {
    try {
      transactions =
        await trpc($page).stock.getRecentTransaoEstoque.query(caixa_id)

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
    {/if}
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
              <td>{transaction.amount}</td>
              <td>{transaction.created_at}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</Modal>
