<script lang="ts">
  import { navigating } from '$app/stores'
  import { SSRFilters } from '$lib/components/datatable/filter.svelte'
  import { modal, FormModal } from '$lib/components/modal'
  import DateFilter from '$lib/components/DateFilter.svelte'
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
  import NoResults from '$lib/components/NoResults.svelte'
  import { goto } from '$app/navigation'
  import { pageConfig } from '$lib/config'
  import { DateFormatter } from '@internationalized/date'
  import Console from "@node-escpos/console";
import USB from "@node-escpos/usb-adapter"
  import Printer from '@node-escpos/core'

  let { data }: { data: PageData } = $props()

  const filters = new SSRFilters()

  const table = new TableHandler(data.rows, {
    rowsPerPage: pageConfig.rowPages,
    totalRows: data.count,
  })

  const df = new DateFormatter('pt-BR', {
    dateStyle: 'medium',
  })

  table.setPage(Number(filters.get('page')) || 1)
  table.load(async s => {
    console.log(s)
    try {
      filters.fromState(s)
      await $navigating?.complete
    } catch (error) {
      console.log(error)
    }
    return data.rows
  })

  async function printOrder(order_id:number) {
    const device = new USB();
    const options = { encoding: "GB18030" }
    const printer = new Printer(device,options);
    console.log('print')
    // await trpc($page).distribuidora.realizarImpressao.mutate({
    //   order_id:order_id,
    //   tenant_id:data.tenant?.tenantId ?? 10
    // })
    device.open(async (err) => {
        if (err) {
          console.error("Failed to open printer:", err);
          return;
        }
        printer
          .font('a')
          .align('ct')
          .style('bu')
          .size(1, 1)
          .text(`Testando`,)
        .cut()
        .close()
      })
  }
</script>

<main class="m-4 h-full max-h-[calc(100vh-20vh)]">
  <div class="flex justify-between items-center">
    <h1 class="my-5 text-center text-2xl font-medium">Todos os pedidos:</h1>
    <button class="btn btn-primary" onclick={()=>filters.clear('name','created_by','startDate','endDate')}>Limpar filtros</button>
  </div>
  <Datatable {table} headless>
    <!-- {#snippet header()}
      <Search {table} />
     
    {/snippet} -->
    <!-- svelte-ignore component_name_lowercase -->
    <table class="table table-zebra table-sm">
      <thead>
        <tr>
          <ThSort {table} field="id">ID</ThSort>
          <Th>Cliente</Th>
          <Th>Caixa</Th>
          <Th>Observações</Th>
          <ThSort {table} field="created_at">Data do pedido</ThSort>
          <ThSort {table} field="total">Valor do pedido</ThSort>

          <Th>Ver detalhes</Th>
        </tr>
        <tr>
          <Th />
          <ThFilter {table} field="name" />
          <ThFilter {table} field="created_by" />
          <Th />
          <Th>
            <DateFilter
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
        </tr>
      </thead>
      <tbody>
        {#each data.rows as row}
          <tr>
            <td>{row.id}</td>
            <td><b class:text-error={!row.name}>{row.name ? row.name : 'Não vinculado'}</b></td>
            <td><b>{row.created_by}</b></td>
            <td><b class:text-error={!row.observation}>{row.observation ? row.observation :'N/A'}</b></td>
            <td>
              <b>
                {row.created_at ? df.format(row.created_at) : ''}
              </b>
            </td>
            <td><b class="text-xl text-success">R${row.total / 100}</b></td>

            <td>
              <a href="/admin/orders/{row.id}" class="badge badge-primary">
                Detalhes
              </a>
            </td>
            <td><button onclick={()=>printOrder(row.id)}>imprimir</button></td>
          </tr>
        {/each}
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td class="text-xl font-bold">
            Total: <span class="text-secondary">
              R${(data.totalSum / 100).toFixed(2)}
            </span>
          </td>
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
</style>
