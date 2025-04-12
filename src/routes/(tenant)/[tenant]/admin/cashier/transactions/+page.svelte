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
  import { formatCurrency, getFilterValue } from '$lib/utils'
  import { DateFormatter } from '@internationalized/date'
  import SelectFilter from '$lib/components/datatable/SelectFilter.svelte'
  import LoadingBackground from '$lib/components/datatable/LoadingBackground.svelte'
  import { paymentMethodLabel } from '$lib/utils/permissions'
  import { User } from 'lucide-svelte'

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
      // console.log(s)
      filters.fromState(s)
      await navigating?.complete
    } catch (error) {
      console.error(error)
    }
    return data.rows
  })

  let cashierFilter = $state(filters.get('cashier') || '')

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

  let selectedType: string = $state('')

  let cashierTransactionTypeEnum = [
    'Abertura',
    'Fechamento',
    'Pagamento',
    'Sangria',
    'Deposito',
  ]
  const delegateQuery = () => {
    return Promise.resolve(cashierTransactionTypeEnum)
  }
</script>

<main class="mx-4 h-full max-h-[calc(100vh-20vh)]">
  <div class="mb-2 flex justify-end">
    <button
      class="btn btn-primary"
      onclick={() => {
        filters.clear('username', 'cashier', 'endDate', 'startDate','tipo')
        cashierFilter = ''
      }}
    >
      Limpar filtros
    </button>
  </div>
  <Datatable {table} headless>
    <!-- {#snippet header()}
      <Search {table} />
     
    {/snippet} -->
    <!-- svelte-ignore component_name_lowercase -->
    {#if table.isLoading}
      <LoadingBackground />
    {/if}
    <table class="table table-xs">
      <thead>
        <tr class="uppercase">
          <Th>ID</Th>
          <Th>Tipo</Th>
          <!-- <Th>Valor</Th> -->
          <Th>Metodo de pagamento</Th>
          <Th>Usuário</Th>
          <Th>Caixa</Th>
          <Th>Data</Th>
          <Th>Valor</Th>
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
            bind:selectedValue={selectedType}
          />
          <Th />
          <ThFilter {table} field="username" />
          <!-- <ThFilter {table} field="cashier" /> -->
          <SelectFilter
            {table}
            filterKey="cashier"
            delegateQuery={trpc(page).distribuidora.getCaixas.query}
            bind:selectedValue={cashierFilter}
            config={{ value: c => c.id, label: c => c.name }}
            placeholder={'o caixa'}
          />
          <Th>
            <DateFilter
              startValue={getFilterValue(filters, 'startDate')}
              endValue={getFilterValue(filters, 'endDate')}
              onChange={(startDate, endDate) => {
                if (!startDate || !endDate) return

                filters.update({
                  startDate: String(startDate),
                  endDate: String(endDate),
                })
              }}
            />
          </Th>
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
              <span class={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getColor(row.type)}`}>
                {row.type}
              </span>
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-sm">
              {#if row.metadata?.metodo_pagamento != null}
                <div class="flex items-center gap-1.5">
                  <span
                    class="inline-block h-2 w-2 rounded-full bg-emerald-400"
                  ></span>
                  <span class="font-medium text-slate-800">
                    {paymentMethodLabel[
                      row.metadata.metodo_pagamento
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
            <td> <span class="flex items-center gap-1">
              <User class="size-4" />{row.username}
            </span></td>
            <td>{row.cashier}</td>
            <!-- <td>{row.routeName}</td> -->
            <td>
              {row.created_at ? df.format(row.created_at) : ''}
            </td>
            <td class="font-semibold text-sm">
              {#if row.amount !==0}
              {formatCurrency(row.amount)}
                
              {:else}
              <span>—</span>
              {/if}
            </td>
            <td class="whitespace-nowrap text-sm">
              {#if row.metadata?.metodo_pagamento === 'dinheiro'}
                  <span class=" text-success font-bold ">{formatCurrency(row.metadata?.troco)}</span>
                {:else}
                <span class="text-slate-400">—</span>
                {/if}
            </td>
            <td class="max-w-[100px] truncate text-sm">
              {#if row.metadata?.observacoes}
                <span class="font-medium " title={row.metadata.observacoes}>
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
