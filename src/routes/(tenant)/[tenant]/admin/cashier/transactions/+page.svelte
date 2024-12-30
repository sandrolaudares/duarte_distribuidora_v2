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
  import { tr } from 'date-fns/locale'
  import NoResults from '$lib/components/NoResults.svelte'
  import { format } from 'date-fns'
  import { goto } from '$app/navigation';

  let { data }: { data: PageData } = $props()
  const filters = new SSRFilters()

  const table = new TableHandler(data.rows, {
    rowsPerPage: data.size,
    totalRows: data.count,
  })

  table.setPage(Number(filters.get('page')) || 1)
  table.load(async s => {
    console.log(s)
    filters.fromState(s)
    await $navigating?.complete
    return data.rows
  })
</script>

<main class="container mx-auto h-full max-h-[calc(100vh-20vh)]">
  <Datatable {table} headless>
    <!-- {#snippet header()}
      <Search {table} />
     
    {/snippet} -->
    <!-- svelte-ignore component_name_lowercase -->
    <table class="table table-zebra border">
      <thead>
        <tr>
          <Th>ID</Th>
          <Th>Usuário</Th>
          <Th>Caixa</Th>
          <Th>Logs</Th>
          <Th>Data</Th>
          <Th>Troco</Th>
          <!-- <Th>Valor</Th> -->
          <Th>Total</Th>
          <Th>Detalhes</Th>
          
        </tr>
        <tr>
          <Th />
          <ThFilter {table} field="user_name"/>
          <ThFilter {table} field="cashier"/>
          <Th/>
          <Th><DateFilter
            onchange={(start,end)=>{
              if(start != null && end !=null){
                let startDate= start.toString()
                let endDate = end.toString()
                filters.update({startDate,endDate})
              }
              }}
              /></Th>
          <Th/>
          <Th/>
          <!-- <Th/> -->
          <Th/>
          <!--FINALIZAR ESSA TABLE, FILTRO DE DATA E ETC-->
          
        </tr>
      </thead>
      <tbody>
        {#each data.rows as row}
          <tr>
            <td>{row.id}</td>
            <td>{row.user_name}</td>
            <td>{row.cashier}</td>
            <td>{row.text}</td>
            <!-- <td>{row.routeName}</td> -->
            <td>{row.created_at ? format(row.created_at,'dd/MM/yyyy') :''}</td>
            <td class="{row.metadata.troco? 'font-semibold': 'text-error'}">{row.metadata.troco ? 'R$'+(row.metadata.troco/100).toFixed(2) : 'Não tem'}</td>
            <!-- <td class="font-semibold">R${row.currency ? (row.currency/100).toFixed(2) : '0.00'}</td> -->
            <td class="font-semibold">{row.total ? 'R$'+(row.total/100).toFixed(2) : ''}</td>
            <td>
              {#if row.order_id}
              <a href="/admin/orders/{row.order_id}" class="badge badge-primary">Detalhes</a>
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
</style>