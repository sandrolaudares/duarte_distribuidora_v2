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
  import { cssPrintTable, getColor } from '../transactionsUtils'
  import TableTransactions from '$lib/components/cashierComponents/TableTransactions.svelte'

  let {
    caixa,
    transactions,
    isLoading = $bindable(true),
  }: {
    caixa: SelectCashier
    transactions: RouterOutputs['stock']['getRecentTransaoEstoque'] | undefined
    isLoading: boolean
  } = $props()

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

  let componentRef: HTMLTableElement | undefined = $state(undefined)
</script>

<!-- <button onclick={()=>{componentRef?.printTable()}} class="btn btn-primary mb-2">Imprimir resumo do dia!</button> -->
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
      <TableTransactions transactions={filteredTransactions} bind:tableRef={componentRef}/>
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