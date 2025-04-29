<script lang="ts">
  import { Modal, modal } from '$lib/components/modal'
  import type { RouterOutputs } from '$trpc/router'
  import { toast } from 'svelte-sonner'
  import { formatCurrency } from '$lib/utils'
  import { paymentMethodLabel } from '$lib/utils/enums'
  import {
    cssPrintTable,
    getColor,
  } from '../../../routes/(tenant)/[tenant]/admin/cashier/transactionsUtils'

  let {
    transactions,
    tableRef = $bindable()
  }: {
    transactions: RouterOutputs['stock']['getRecentTransaoEstoque']
    tableRef?: HTMLTableElement
  } = $props()

  let totalPayments = $derived.by(() => {
    if (!transactions) return 0
    return transactions.reduce((acc, transaction) => {
      if (transaction.type === 'Fechamento') return acc
      if (transaction.type === 'Sangria') return acc - transaction.amount
      if (transaction.type === 'Despesas') return acc - transaction.amount
      if (
        transaction.metadata &&
        transaction.metadata.troco &&
        transaction.metodo_pagamento === 'dinheiro'
      )
        return transaction.amount - transaction.metadata.troco
      return acc + transaction.amount
    }, 0)
  })

  let totalValorTroco = $derived.by(() => {
    if (!transactions) return 0
    return transactions.reduce((acc, transaction) => {
      if (!transaction.metadata?.troco) return acc
      return acc + transaction.metadata?.troco
    }, 0)
  })
</script>

<table class="table table-md" bind:this={tableRef}>
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
    {#each transactions as transaction}
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
                {paymentMethodLabel[transaction.metodo_pagamento]}
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
  <!-- <tfoot>
            <tr class="sticky bottom-0 bg-base-200">
              <td></td>
              <td></td>
              <td>Valor desconsiderando saidas:</td>
              <td class="text-xl font-bold">
                <span class="text-">{formatCurrency(totalPayments)}</span>
              </td>
              <td></td>
              <td></td>
            </tr>
        </tfoot> -->
  <tfoot>
    <tr class="sticky bottom-0 bg-base-100">
      <td></td>
      <td></td>
      <td>Valor apenas de entradas:</td>
      <td class="text-xl font-bold">
        <span class="text-secondary">{formatCurrency(totalPayments)}</span>
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
