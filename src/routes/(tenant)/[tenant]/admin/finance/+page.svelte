<script lang="ts">
  import { navigating } from '$app/state'
  import { SSRFilters } from '$lib/components/datatable/filter.svelte'
  import { modal, FormModal } from '$lib/components/modal'
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
  import DateFilter from '$lib/components/DateFilter.svelte'
  import ChangeExpireDate from './ChangeExpireDate.svelte'
  import { pageConfig } from '$lib/config'
  import {
    DateFormatter,
    type DateValue,
    getLocalTimeZone,
  } from '@internationalized/date'
  import LoadingBackground from '$lib/components/datatable/LoadingBackground.svelte'
  import { differenceInDays, getBgColor } from '$lib/utils/expire'
  import { invalidateAll } from '$app/navigation'
  import { flip } from 'svelte/animate'
  import { cubicInOut } from 'svelte/easing'
  import { formatCurrency } from '$lib/utils'
  import * as Select from "$lib/components/ui/select/index";
  import type { Field } from '@vincjo/datatables'
  import ThDateFilter from '$lib/components/datatable/ThDateFilter.svelte'

  let { data }: { data: PageData } = $props()

  const filters = new SSRFilters()

  const table = new TableHandler(data.rows, {
    rowsPerPage: pageConfig.rowPages,
    totalRows: data.count,
    selectBy: 'id',
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
      await filters.fromState(s)
      s.setTotalRows(data.count)
      console.log(data.count)
    } catch (error) {
      console.error(error)
    }
    return data.rows
  })

  function calculateSum() {
    return data.rows
      .filter(row => table.selected.includes(row.id))
      .reduce((sum, row) => sum + row.total, 0)
  }
  let sum = $derived(calculateSum())

  let loadingRows: Record<number, boolean> = $state({})

  async function handleUpdate(value: Date, key = '', row: any) {
    loadingRows[row.id] = true
    const last_val = row[key]

    try {
      await trpc(page).customer.updateOrderExpireDate.mutate({
        order_id: row.id,
        expire_at: value,
      })
      row[key] = value
      toast.success('Atualizado com sucesso!')
      // table.invalidate()
      invalidateAll()
      // table.rows = data.rows
    } catch (error) {
      row[key] = last_val
      toast.error('Erro ao atualizar')
    } finally {
      loadingRows[row.id] = false
    }
  }

  const filter = table.createFilter('atrasados' as Field<typeof data.rows[number]>)

  const options = [
    { value: "", label: "Todos" },
    { value: "true", label: "Pagamentos atrasados" },
  ];

  const triggerContent = $derived(
    options.find((f) => f.value === filter.value)?.label ?? "Todos"
  );
</script>

<h1 class="my-5 text-center text-2xl font-medium">
  Pedidos com pagamento pendente:
</h1>
<main class="mx-4 h-full max-h-[calc(100vh-24vh)]">
  <div class="flex items-center justify-start gap-2 mb-2">
    <Select.Root type="single" bind:value={filter.value} onValueChange={value => {
        filter.value = value
        filter.set()
    }}>
      <Select.Trigger class="max-w-[280px] select select-bordered !text-gray-700">{triggerContent}</Select.Trigger>
      <Select.Content>
        {#each options as option (option.value)}
          <Select.Item value={option.value} label={option.label} />
        {/each}
      </Select.Content>
    </Select.Root>
    <button
      class="btn btn-primary"
      onclick={() =>
        table.clearFilters()}
    >
      Limpar filtros
    </button>
  </div>
  <Datatable {table} headless>
    {#if table.isLoading}
      <LoadingBackground />
    {/if}
    <table class=" table">
      <thead>
        <tr>
          <Th />
          <ThSort {table} field="id">ID</ThSort>
          <Th>Cliente</Th>
          <Th>Data do pedido</Th>
          <ThSort {table} field="expire_at">Data de vencimento</ThSort>
          <Th>Dias para vencimento</Th>

          <ThSort {table} field="total">Valor pendente</ThSort>
          <ThSort {table} field="amount_paid">Valor pago</ThSort>

          <Th>Ver detalhes</Th>
        </tr>
        <tr>
          <Th />
          <Th />
          <ThFilter {table} field="name" />
          <ThDateFilter {table} startValue={filters.getFilterValue('startDate')} endValue={filters.getFilterValue('endDate')}/>
          <ThDateFilter enableFuture={true} keyStart={'startExpireDate'} keyEnd={'endExpireDate'} {table} startValue={filters.getFilterValue('startExpireDate')} endValue={filters.getFilterValue('endExpireDate')}/>
          <Th />
          <Th />
          <Th />

          <Th />
        </tr>
      </thead>
      <tbody>
        {#each data.rows as row (row.id)}
          <tr class={table.selected.includes(row.id) ? 'bg-base-200' : ''} animate:flip={{ duration: 500, easing: cubicInOut }}>
            <td>
              <input
                type="checkbox"
                checked={table.selected.includes(row.id)}
                onclick={() => {
                  table.select(row.id)
                }}
              />
            </td>
            <td>{row.id}</td>
            <td>{row.name}</td>
            <td>{row.created_at ? df.format(row.created_at) : ''}</td>
            <td>
              {#if loadingRows[row.id] == true}
                Atualizando...
              {:else}
                <ChangeExpireDate
                  {df}
                  value={row.expire_at ? new Date(row.expire_at) : new Date()}
                  onUpdateValue={async value => {
                    const dateValue = new Date(value)
                    dateValue.setUTCHours(23, 59, 59, 999)

                    handleUpdate(dateValue, 'expire_at', row)
                  }}
                />
              {/if}
            </td>
            <td>
              <b
                class="{row.expire_at ? getBgColor(row.expire_at) : ''} text-center">
                {#if loadingRows[row.id] == true}
                  Atualizando...
                {:else}
                  {#if row.expire_at}
                    {#if differenceInDays(row.expire_at) < 0}
                      VENCIDO!
                    {:else if differenceInDays(row.expire_at) === 0}
                      Vence hoje!
                    {:else}
                      {differenceInDays(row.expire_at) + ' dias'}
                    {/if}
                  {/if}
                {/if}
              </b>
            </td>
            <td><b class="text-lg text-rose-500">{formatCurrency(row.pending_amount)}</b></td>
            <td><b class="text-lg text-success">{formatCurrency(row.amount_paid)}</b></td>

            <td>
              <a href="/admin/orders/{row.id}" class="badge badge-primary">
                Detalhes
              </a>
            </td>
          </tr>
        {/each}
        <tr class="sticky bottom-0 bg-colorr">
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>

          <td class="text-xl font-bold">
            Total: <span class="text-secondary">
              {sum
                ? formatCurrency(sum)
                :formatCurrency(data.totalSum)}
                
            </span>
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
  .bg-colorr {
    background-color: oklch(var(--b1)) !important;
  }

  tbody td {
    border-bottom: 1px solid var(--grey-lighten, #eee) !important;
  }
</style>
