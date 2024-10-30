<script lang="ts">
  import { navigating } from '$app/stores'
  import { SSRFilters } from '$lib/components/datatable/filter.svelte'
  import { modal, FormModal } from '$lib/components/modal'
  import { page } from '$app/stores'
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
  import { tr } from 'date-fns/locale'
  import NoResults from '$lib/components/NoResults.svelte'
  import DateFilter from '$lib/components/DateFilter.svelte'
  import { format } from 'date-fns'
  // import ChangeExpireDate from './ChangeExpireDate.svelte'

  let { data }: { data: PageData } = $props()

  const filters = new SSRFilters()

  const table = new TableHandler(data.rows, {
    rowsPerPage: 10,
    totalRows: data.count,
    selectBy: 'id',
  })

  table.setPage(Number(filters.get('page')) || 1)
  table.load(async s => {
    console.log(s)
    filters.fromState(s)
    await $navigating?.complete
    return data.rows
  })

  function differenceInDays(expireAt: Date): number {
    const today = new Date()
    const expirationDate = new Date(expireAt)

    today.setHours(0, 0, 0, 0)
    expirationDate.setHours(0, 0, 0, 0)

    const timeDifference = expirationDate.getTime() - today.getTime()
    const dayDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24))

    return dayDifference
  }

  function getBgColor(expireAt: Date) {
    const daysDiff = differenceInDays(expireAt)
    console.log(daysDiff)

    if (daysDiff < 0) {
      return 'bg-error text-error-content bg-opacity-50 '
    } else if (daysDiff <= 4) {
      return 'bg-warning text-warning-content bg-opacity-50 '
    } else if (daysDiff <= 7) {
      return 'table-zebra '
    }
    return 'table-zebra '
  }

  async function handleUpdate(
    newItem: any,
    key: string,
    idx: number,
    currentItem: any,
  ) {
    try {
      await trpc($page).customer.updateCustomer.mutate({
        id: newItem.id,
        customer: { [key]: newItem[key] },
      })
      toast.success('Atualizado com sucesso!')
    } catch (error: any) {
      toast.error('Erro ao atualizar')
      console.error(error)
      table.rows[idx] = currentItem
    }
    table.rows = table.rows
  }
  function calculateSum() {
    return data.rows
      .filter(row => table.selected.includes(row.id))
      .reduce((sum, row) => sum + row.total, 0)
  }
  let sum = $derived(calculateSum())
</script>

<h1 class="my-5 text-center text-2xl font-medium">
  Pedidos com pagamento pendente:
</h1>
<main class="container mx-auto h-full max-h-[calc(100vh-20vh)]">
  <Datatable {table} headless>
    <!-- {#snippet header()}
      <Search {table} />
     
    {/snippet} -->
    <div class="spinner" class:active={table.isLoading}></div>
    <!-- svelte-ignore component_name_lowercase -->
    <table class="table border">
      <thead>
        <tr>
          <Th />
          <ThSort {table} field="id">ID</ThSort>
          <Th>Cliente</Th>
          <Th>Data do pedido</Th>
          <ThSort {table} field="expire_at">Data de vencimento</ThSort>
          <Th>Dias para vencimento</Th>
          <Th>Status do pedido</Th>
          <ThSort {table} field="total">Valor do pedido</ThSort>

          <Th>Ver detalhes</Th>
        </tr>
        <tr>
          <Th />
          <Th />
          <ThFilter {table} field="name" />
          <Th>
            <DateFilter
              onchange={(start, end) => {
                if (start != null && end != null) {
                  let startDate = start.toString()
                  let endDate = end.toString()
                  filters.update({ startDate, endDate })
                }
              }}
            />
          </Th>
          <Th></Th>
          <Th />
          <Th />
          <Th />

          <Th />
        </tr>
      </thead>
      <tbody>
        {#each data.rows as row}
          <tr
          class={table.selected.includes(row.id)
            ? 'selected'
            : row.expire_at ? getBgColor(row.expire_at) : ''}
          >
            <td>
              <input
                type="checkbox"
                checked={table.selected.includes(row.id)}
                onclick={() => {
                  table.select(row.id)
                }}
              />
              <!--TODO: Show the sum of the selected rows-->
            </td>
            <td>{row.id}</td>
            <td><b>{row.name}</b></td>
            <td><b>{format(row.created_at, 'dd/MM/yyyy')}</b></td>
            <td>
              <b>
                {row.expire_at
                  ? format(new Date(row.expire_at), 'dd/MM/yyyy')
                  : 'Não registrado'}
                <!-- <ChangeExpireDate value={format(new Date(row.expire_at),'dd/MM/yyyy')} onUpdateValue={async()=>{
                
                  }}/> -->
              </b>
            </td>
            <td>
              <b>
                {#if row.expire_at}
                  {#if differenceInDays(row.expire_at) < 0}
                    VENCIDO!
                  {:else if differenceInDays(row.expire_at) === 0}
                    Vence hoje!
                  {:else}
                    {differenceInDays(row.expire_at) + ' dias'}
                  {/if}
                {/if}
              </b>
            </td>
            <td><b>{row.status}</b></td>
            <td><b class="text-xl text-success">R${row.total / 100}</b></td>

            <td>
              <a href="/admin/orders/{row.id}" class="badge badge-primary">
                Detalhes
              </a>
            </td>
          </tr>
        {/each}
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td class="text-xl font-bold">
            Total: <span class="text-secondary">
              R${sum
                ? (sum / 100).toFixed(2)
                : (data.totalSum / 100).toFixed(2)}
            </span>
          </td>
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
</style>