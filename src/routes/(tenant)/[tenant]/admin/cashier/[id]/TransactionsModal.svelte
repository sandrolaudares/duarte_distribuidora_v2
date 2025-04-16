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
  import {
    cashierTransactionEnum,
    paymentMethodLabel,
  } from '$lib/utils/permissions'
  import Separator from '$lib/components/ui/separator/separator.svelte'

  let {
    caixa,
    transactions,
    isLoading = $bindable(true),
  }: {
    caixa: SelectCashier
    transactions: RouterOutputs['stock']['getRecentTransaoEstoque'] | undefined
    isLoading: boolean
  } = $props()

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
  let filteredTransactions = $state(transactions)
  let activeTab = $state('all')

  $effect(() => {
    if (!transactions) return

    if (activeTab === 'all') {
      filteredTransactions = transactions
    } else {
      filteredTransactions = transactions.filter(t => t.type === activeTab)
    }
  })

  function filterByType(type: string) {
    activeTab = type
  }

  let totalValor = $derived.by(() => {
    if (!filteredTransactions) return 0
    return filteredTransactions.reduce((acc, transaction) => {
      return acc + transaction.amount
    }, 0)
  })
  let totalValorTroco = $derived.by(() => {
    if (!filteredTransactions) return 0
    return filteredTransactions.reduce((acc, transaction) => {
      if (!transaction.metadata?.troco) return acc
      return acc + transaction.metadata?.troco
    }, 0)
  })
</script>

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
        <p class="text-2xl font-bold">{filteredTransactions.length}</p>
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

    <Separator class="bg-gray-300" />

    <div class="h-full max-h-[calc(100vh-50vh)] overflow-x-auto">
      <table class="table table-md">
        <thead class="sticky top-0 bg-base-200">
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
                <span
                  class={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getColor(transaction.type)}`}
                >
                  {transaction.type}
                </span>
              </td>
              <td class="whitespace-nowrap px-4 py-3 text-sm">
                {#if transaction.metodo_pagamento !== null}
                  <div class="flex items-center gap-1.5">
                    <span
                      class="inline-block h-2 w-2 rounded-full bg-emerald-400"
                    ></span>
                    <span class="font-medium text-slate-800">
                      {paymentMethodLabel[
                        transaction.metodo_pagamento
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
              <td class="text-sm font-semibold">
                {#if transaction.amount !== 0}
                  {formatCurrency(transaction.amount)}
                {:else}
                  <span>—</span>
                {/if}
              </td>
              <td class="whitespace-nowrap px-4 py-3 text-sm">
                {#if transaction.metodo_pagamento === 'dinheiro'}
                  <span class=" font-bold text-success">
                    {formatCurrency(transaction.metadata?.troco ?? 0)}
                  </span>
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
                {:else}
                  <span>—</span>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
        <tfoot>
          <tr class="sticky bottom-0 bg-base-200">
            <td></td>
            <td></td>
            <td></td>
            <td class="text-xl font-bold">
              <span class="text-secondary">{formatCurrency(totalValor)}</span>
            </td>
            <td class="text-xl font-bold">
              <span class="text-success">
                {formatCurrency(totalValorTroco)}
              </span>
            </td>
            <td></td>
          </tr>
        </tfoot>
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

<style>
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
