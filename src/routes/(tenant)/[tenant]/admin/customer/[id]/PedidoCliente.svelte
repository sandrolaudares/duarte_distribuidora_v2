<script lang="ts">
  import SuperSelect from '$lib/components/input/Select.svelte'
  import { icons } from '$lib/utils/icons'
  import { modal, FormModal } from '$components/modal'
  import type { PageData } from './$types'

  import type { RouterInputs } from '$trpc/router'


  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'

  import { toast } from 'svelte-sonner'
  import AddressModal from '$lib/components/modal/AddressModal.svelte'
  import CardShowPedidos from '$lib/components/cards/CardShowPedidos.svelte'
  import { onMount } from 'svelte'
  import DateFilter from '$lib/components/DateFilter.svelte'
  import {
    TableHandler,
    Datatable,
    ThSort,
    ThFilter,
    Th,
    RowsPerPage,
    Pagination,
  } from '@vincjo/datatables'
  import NoResults from '$lib/components/NoResults.svelte'
  import ThCalendar from './ThCalendar.svelte'
  import InfoCliente from './InfoCliente.svelte'
  import PedidoCliente from './PedidoCliente.svelte'
  import { DateFormatter } from '@internationalized/date'

  export let table: TableHandler<PageData['orders'][0]>

  export let total = 0

  const df = new DateFormatter('pt-BR', {
    dateStyle: 'medium',
  })
</script>

<div class="mt-10 h-full max-h-[calc(100vh-38vh)]">
    <Datatable basic {table} headless>
      {#snippet header()}{/snippet}
      <table class="table table-zebra table-sm">
        <thead>
          <tr class="">
            <ThSort {table} field="id">ID</ThSort>
            <Th>Status</Th>
            <Th>Data:</Th>
            <Th>Observações:</Th>
            <ThSort {table} field="total">Total do pedido</ThSort>
            <Th>Detalhes</Th>
          </tr>
          <tr>
            <ThFilter {table} field="id" />
            <ThFilter {table} field="status" />

            <!-- <ThCalendar {table} field="created_at" /> -->
            <Th>
              <!-- <DateFilter
                onchange={(start, end) => {
                  if (start && end) {
                    filtered = filteredOrders(start, end)
                    console.log(filtered)
                    table.setRows(filtered)
                  }
                }}
              /> -->
            </Th>

            <ThFilter {table} field="observation" />
            <Th />
            <Th />
          </tr>
        </thead>
        <tbody>
          {#each table.rows as row}
            <tr>
              <td>{row.id}</td>
              <td>{row.status}</td>
              <td>{row.created_at ? df.format(row.created_at) : 'N/A'}</td>
              <td class:text-error={!row.observation}>{row.observation ? row.observation : 'N/A'}</td>
              <td class="text-lg font-semibold">
                R${(row.total / 100).toFixed(2)}
              </td>
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
            <td class="text-xl font-bold">
              Total: <span class="text-secondary">
                R${(total/ 100).toFixed(2)}
              </span>
            </td>
            <td></td>
          </tr>
        </tbody>
      </table>
      {#if table.rows.length === 0}
        <NoResults type={'Pedido'} />
      {/if}
      {#snippet footer()}
        <Pagination {table} />
      {/snippet}
    </Datatable>
  </div>