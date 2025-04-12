<script lang="ts">
  import { Modal, modal } from '$lib/components/modal'
  import { trpc } from '$trpc/client'

  import { page } from '$app/state'
  import { onMount } from 'svelte'

  import type { RouterOutputs } from '$trpc/router'
  import { toast } from 'svelte-sonner'
  import Loading from '$lib/components/Loading.svelte'
  import { formatCurrency } from '$lib/utils'
  import type { SelectCashier } from '$lib/server/db/schema'
  import { cashierTransactionEnum, paymentMethodLabel } from '$lib/utils/permissions'
  import Separator from '$lib/components/ui/separator/separator.svelte'

  let { caixa }: { caixa: SelectCashier } = $props()

  let isLoading = $state(true)

  const colorMap: { [key: string]: string } = {
    P: 'badge-primary',
    A: 'badge-success text-white',
    F: 'badge-error text-white',
    S: 'badge-warning',
    D: 'badge-info',
  }

  function getColor(type: string) {
    const firstLetter = type.charAt(0).toUpperCase()
    return colorMap[firstLetter] || 'badge-neutral'
  }

  let transactions:
    | RouterOutputs['stock']['getRecentTransaoEstoque']
    | undefined = $state()
  let filteredTransactions:
    | RouterOutputs['stock']['getRecentTransaoEstoque']
    | undefined = $state()
  onMount(async () => {
    try {
      transactions = await trpc(page).stock.getRecentTransaoEstoque.query(
        caixa.id,
      )

      isLoading = false
    } catch (error: any) {
      toast.error(error.message)
    }
  })

  let activeTab = $state('all')

  $effect(() => {
    if (!transactions) return

    if (activeTab === 'all') {
      filteredTransactions = transactions
    } else {
      filteredTransactions = transactions.filter(
        t => t.type === activeTab,
      )
    }
  })

  function filterByType(type: string) {
    activeTab = type
  }
</script>

<Modal title="Ultimas transacões">
  <div class="p-1">
    {#if isLoading || !transactions || !filteredTransactions}
      <div class="flex h-64 items-center justify-center">
        <Loading />
      </div>
    {:else}
      <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="rounded-xl bg-base-200 p-5 shadow-sm">
          <h3 class="mb-1 text-sm font-medium text-slate-500">
            Quantidade em caixa
          </h3>
          <p class="text-2xl font-bold">{formatCurrency(caixa.currency)}</p>
        </div>

        <div class="rounded-xl bg-base-200 p-5 shadow-sm">
          <h3 class="mb-1 text-sm font-medium text-slate-500">
            Total de Transações
          </h3>
          <p class="text-2xl font-bold">{transactions.length}</p>
        </div>
      </div>

      <div class="mb-4 flex flex-wrap gap-2">
        <button
          class={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${activeTab === 'all' ? 'bg-primary' : 'bg-base-200  hover:bg-base-300'}`}
          onclick={() => filterByType('all')}
        >
          Todos
        </button>
        {#each cashierTransactionEnum as type}
          <button
            class={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${activeTab === type ? 'bg-primary' : 'bg-base-200  hover:bg-base-300'}`}
            onclick={() => filterByType(type)}
          >
            {type}
          </button>
        {/each}
      </div>

      <Separator class="bg-gray-300"/>

      <div class="overflow-x-auto">
        <table class="table table-md">
          <thead>
            <tr class="uppercase">
              <th>ID</th>
              <th>Tipo</th>
              <th>Metodo de pagamento</th>
              <th>Valor</th>
              <th>Troco</th>
              <th>Pedido</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredTransactions as transaction}
              <tr>
                <td>{transaction.id}</td>
                <td class="whitespace-nowrap px-4 py-3 text-sm">
                  <span class={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getColor(transaction.type)}`}>
                    {transaction.type}
                  </span>
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-sm">
                  {#if transaction.metadata?.metodo_pagamento != null}
                    <div class="flex items-center gap-1.5">
                      <span
                        class="inline-block h-2 w-2 rounded-full bg-emerald-400"
                      ></span>
                      <span class="font-medium text-slate-800">
                        {paymentMethodLabel[
                          transaction.metadata.metodo_pagamento
                        ]}
                      </span>
                    </div>
                  {:else}
                    <div class="flex items-center gap-1.5">
                      <span
                        class="inline-block h-2 w-2 rounded-full bg-rose-400"
                      ></span>
                      <span class="text-error">Nenhum</span>
                    </div>
                  {/if}
                </td>
                <td>{formatCurrency(transaction.amount)}</td>
                <td class="whitespace-nowrap px-4 py-3 text-sm">
                  {#if transaction.metadata?.metodo_pagamento === 'dinheiro'}
                      <span class=" text-success font-bold ">{formatCurrency(transaction.metadata?.troco)}</span>
                    {:else}
                      <span>—</span>
                    {/if}
                </td>
                <td>
                  {#if transaction.order_id}
                    <a
                      href="/admin/orders/{transaction.order_id}"
                      onclick={() => modal.close()}
                      class="badge badge-primary"
                    >
                      Pedido
                    </a>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      {#if filteredTransactions.length === 0}
        <div
          class="mt-6 rounded-xl border border-base-300 bg-base-200 p-8 text-center"
        >
          <p>Nenhuma transação encontrada</p>
          {#if activeTab !== 'all'}
            <button
              class="mt-3 text-sm font-medium text-secondary transition-all hover:text-primary"
              onclick={() => filterByType('all')}
            >
              Mostrar todas as transações
            </button>
          {/if}
        </div>
      {/if}
    {/if}
  </div>
</Modal>

<style>
  :global(.modal-container) {
    max-width: 95vw;
    width: 1000px;
  }

  @media (max-width: 640px) {
    table {
      font-size: 0.75rem;
    }

    th,
    td {
      padding-left: 0.5rem;
      padding-right: 0.5rem;
    }
  }
</style>
