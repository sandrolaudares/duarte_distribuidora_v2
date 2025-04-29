<script lang="ts">
  import { navigating } from '$app/state'
  import { SSRFilters } from '$lib/components/datatable/filter.svelte'
  import { modal, FormModal } from '$lib/components/modal'
  import DateFilter from '$lib/components/DateFilter.svelte'
  import { page } from '$app/state'

  import {
    TableHandler,
    Datatable,
    ThSort,
    ThFilter,
    Pagination,
    RowsPerPage,
    Th,
    Search,
    type State,
  } from '@vincjo/datatables/server'

  import type { PageData } from './$types'
  import { toast } from 'svelte-sonner'
  import { trpc } from '$trpc/client'
  import NoResults from '$lib/components/NoResults.svelte'
  import { goto, invalidate } from '$app/navigation'
  import { formatCurrency } from '$lib/utils'
  import { DateFormatter } from '@internationalized/date'
  import SelectFilter from '$lib/components/datatable/SelectFilter.svelte'
  import LoadingBackground from '$lib/components/datatable/LoadingBackground.svelte'
  import {
    cashierTransactionEnum,
    paymentMethodEnum,
    paymentMethodLabel,
  } from '$lib/utils/enums'
  import { User } from 'lucide-svelte'
  import { getColor, printTable } from '../transactionsUtils'
  import ThDateFilter from '$lib/components/datatable/ThDateFilter.svelte'

  let { data }: { data: PageData } = $props()
  const filters = new SSRFilters()

  const table = new TableHandler(data.rows, {
    rowsPerPage: data.size,
    totalRows: data.count,
    i18n: {
      show: 'Mostrar',
      entries: 'entradas',
      previous: 'Anterior',
      next: 'Próximo',
      noRows: 'Nenhum encontrado',
      filter: 'Filtrar',
    },
  })

  const df = new DateFormatter('pt-BR', {
    dateStyle: 'medium',
  })

  table.setPage(Number(filters.get('page')) || 1)
  table.load(async s => {
    try {
      await filters.fromState(s, [
        'startDate',
        'endDate',

      ])
      s.setTotalRows(data.count)
    } catch (error) {
      console.error(error)
    }
    return data.rows
  })

  const delegateQuery = () => {
    return Promise.resolve(Array.from(cashierTransactionEnum))
  }

  let tableRef: HTMLTableElement | undefined = $state(undefined)

  let value = $state({
    start: filters.getFilterValue('startDate'),
    end: filters.getFilterValue('endDate'),
  })
</script>

<main class="mx-4 h-full max-h-[calc(100vh-20vh)] flex flex-col gap-2">
  <div class=" flex justify-end gap-2">
    <button onclick={() => printTable(tableRef)} class="btn btn-secondary">
      Imprimir
    </button>
    <button
      class="btn btn-primary"
      onclick={() => {
        table.clearFilters()
        filters.clear('startDate', 'endDate')
        value = {
          start: undefined,
          end: undefined,
        }
      }}
    >
      Limpar filtros
    </button>
  </div>
  <Datatable {table} headless>
    {#if table.isLoading}
      <LoadingBackground />
    {/if}
    <table class="sizeee table table-xs " bind:this={tableRef}>
      <thead>
        <tr class="uppercase">
          <Th>ID</Th>
          <Th>Tipo</Th>
          <!-- <Th>Valor</Th> -->
          <Th>Metodo de pagamento</Th>
          <Th>Usuário</Th>
          <Th>Caixa</Th>
          <Th>Data</Th>
          <ThSort {table} field="amount">Valor</ThSort>
          <Th>Troco</Th>
          <Th>Observação</Th>
          <Th>Detalhes</Th>
        </tr>
        <tr>
          <Th />
          <SelectFilter
            {table}
            filterKey="type"
            {delegateQuery}
            placeholder="o tipo"
            config={{ value: c => c, label: c => c }}
          />
          <!-- <Th /> -->
          <SelectFilter
            {table}
            filterKey="metodo_pagamento"
            delegateQuery={() => Promise.resolve(Array.from(paymentMethodEnum))}
            placeholder="o metodo"
            config={{ value: c => c, label: c => paymentMethodLabel[c] }}
          />
          <ThFilter {table} field="username" />
          <SelectFilter
            {table}
            filterKey="cashier"
            delegateQuery={trpc(page).distribuidora.getCaixas.query}
            config={{ value: c => c.id, label: c => c.name }}
            placeholder={'o caixa'}
          />

          <ThDateFilter {table} {filters} bind:value tenant={data.tenant!} />

          <Th />
          <Th />
          <Th />
          <Th />
        </tr>
      </thead>
      <tbody>
        {#each data.rows as row (row.id)}
          <tr>
            <td>{row.id}</td>
            <td class="whitespace-nowrap px-4 py-3 text-sm">
              <span
                class={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getColor(row.type)}`}
              >
                {row.type}
              </span>
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-sm">
              {#if row.metodo_pagamento !== null}
                <div class="flex items-center gap-1.5">
                  <span
                    class="inline-block h-2 w-2 rounded-full bg-emerald-400"
                  ></span>
                  <span class="font-medium text-slate-800">
                    {paymentMethodLabel[row.metodo_pagamento]}
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
            <td>
              <span class="flex items-center gap-1">
                <User class="hddd size-4" />{row.username}
              </span>
            </td>
            <td>
              {#if row.cashier}
                {row.cashier}
              {:else}
                <span class="text-slate-400">—</span>
              {/if}
            </td>
            <!-- <td>{row.routeName}</td> -->
            <td>
              {row.created_at ? df.format(row.created_at) : ''}
            </td>
            <td class="text-sm font-semibold">
              {#if row.amount !== 0}
                {formatCurrency(row.amount)}
              {:else}
                <span class="text-slate-400">—</span>
              {/if}
            </td>
            <td class="whitespace-nowrap text-sm">
              {#if row.metodo_pagamento === 'dinheiro'}
                <span class=" font-bold text-success">
                  {formatCurrency(row.metadata?.troco ?? 0)}
                </span>
              {:else}
                <span class="text-slate-400">—</span>
              {/if}
            </td>
            <td class="max-w-[100px] truncate text-sm">
              {#if row.metadata?.observacoes}
                <span class="font-medium" title={row.metadata.observacoes}>
                  {row.metadata.observacoes}
                </span>
              {:else}
                <span class="text-slate-400">—</span>
              {/if}
            </td>
            <td>
              {#if row.order_id}
                <a
                  href="/admin/orders/{row.order_id}"
                  class="badge badge-primary"
                >
                  Pedido
                </a>
              {:else}
                <span class="text-slate-400">—</span>
              {/if}
            </td>
          </tr>
        {/each}
        <tr class="sticky bottom-0 border-t bg-base-100">
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td>Valor apenas de entradas:</td>
          <td class="text-lg font-bold">
            <span class="text-secondary">{formatCurrency(data.totalSum)}</span>
          </td>
          <td class="text-xl font-bold">
            <!-- <span class="text-success">{formatCurrency(totalValorTroco)}</span> -->
          </td>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    </table>
    {#if data.rows.length === 0}
      <NoResults />
    {/if}
    {#snippet footer()}
      <RowsPerPage {table} />
      <div></div>
      <Pagination {table} />
    {/snippet}
  </Datatable>
</main>

<style>
  thead {
    background-color: oklch(var(--b1)) !important;
  }
  tbody td {
    border-bottom: 1px solid var(--grey-lighten, #eee) !important;
  }
</style>
