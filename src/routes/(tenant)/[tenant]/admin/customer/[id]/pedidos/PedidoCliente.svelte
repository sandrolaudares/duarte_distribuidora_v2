<script lang="ts">
  import SuperSelect from '$lib/components/input/Select.svelte'
  import { icons } from '$lib/utils/icons'
  import { modal, FormModal } from '$components/modal'
  import type { PageData } from './$types'

  import type { RouterInputs } from '$trpc/router'


  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'

  import { toast } from 'svelte-sonner'
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
  import { DateFormatter } from '@internationalized/date'
  import { formatCurrency } from '$lib/utils'
  import CustomThFilter from '$lib/components/datatable/CustomThFilter.svelte'

  export let table: TableHandler<PageData['orders'][0]>

  export let total = 0

  export let df:DateFormatter

</script>

  
<div class="overflow-hidden h-[80vh]">
  <Datatable {table} >
    <table class="table table-xs">
      <thead>
        <tr>
          <!-- <ThSort {table} field="id">ID</ThSort> -->
          <Th>Status</Th>
          <Th>Data do pedido:</Th>
          <Th>Observações:</Th>
          <ThSort {table} field="total">Total do pedido</ThSort>
          <Th>Detalhes</Th>
        </tr>
        <tr>
          <!-- <ThFilter {table} field="id" /> -->
          <!-- <ThFilter {table} field="status" /> -->
           <!-- <Th/> -->

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
          <!-- <ThCalendar {table} field="created_at" /> -->
                <Th/>
          <ThFilter {table} field="observation" />
          <Th />
          <Th />
        </tr>
      </thead>
      <tbody>
        {#each table.rows as row (row.id)}
          <tr>
            <!-- <td>{row.id}</td> -->
            <td>
              <div
              class:badge-info={row.status === 'CONFIRMED'}
              class:badge-error={row.status === 'CANCELED'}
              class:badge-Accent={row.status === 'PENDING'}
              class:badge-success={row.status === 'DELIVERED'}
              class:badge-primary={row.status === 'ON THE WAY'}
               class="badge badge-sm text-white">
                {row.status}
              </div>
            
            </td>
            <td>{row.created_at ? df.format(row.created_at) : 'N/A'}</td>
            <td class:text-error={!row.observation}>{row.observation ? row.observation : 'N/A'}</td>
            <td class="text-md font-semibold">
              {formatCurrency(row.total)}
            </td>
            <td>
              <a href="/admin/orders/{row.id}" class="badge badge-sm font-bold">
                Detalhes
              </a>
            </td>
          </tr>
        {/each}
        <tr class="sticky bottom-0 bg-colorr">
          <td></td>
          <td></td>
          <td></td>
          <td class="text-[16px] font-bold">
            Total: <span class="text-secondary">
              {formatCurrency(total)}
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
    <RowsPerPage {table} />
    <div></div>
    <Pagination {table} />
    {/snippet}
  </Datatable>
</div>

  <style>
    thead {
      background-color: oklch(var(--b1)) !important;
    }
    .bg-colorr {
    background-color: oklch(var(--b1)) !important;
  }
  </style>
  