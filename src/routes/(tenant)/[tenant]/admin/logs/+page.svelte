<script lang="ts">
  import { navigating } from '$app/state'
  import { SSRFilters } from '$lib/components/datatable/filter.svelte'
  import { modal, FormModal } from '$lib/components/modal'
  import DateFilter from '$lib/components/DateFilter.svelte'
  import { page } from '$app/state'
  import * as Tooltip from '$lib/components/ui/tooltip/index'

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
  import { User } from 'lucide-svelte'
  import SelectSearch from '$lib/components/selectSearch.svelte'
  import SelectFilter from '$lib/components/datatable/SelectFilter.svelte'
  import LoadingBackground from '$lib/components/datatable/LoadingBackground.svelte'
  import { formatCurrency } from '$lib/utils'
  import ThDateFilter from '$lib/components/datatable/ThDateFilter.svelte'

  let { data }: { data: PageData } = $props()
  const filters = new SSRFilters()

  const table = new TableHandler(data.rows, {
    rowsPerPage: pageConfig.rowPages,
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
      await filters.fromState(s,['startDate', 'endDate'])
      s.setTotalRows(data.count)
    } catch (error) {
      console.error(error)
    }
    return data.rows
  })

  const colorMap:{ [key: string]: string } = {
    C: 'badge-accent',
    L: 'badge-info',
    S: 'badge-primary',
  }

  function getColor(type: string) {
    const firstLetter = type.charAt(0).toUpperCase()
    return colorMap[firstLetter] || 'badge-neutral'
  }

  let logTypeEnum = ['LOG', 'SYSTEM', 'ERROR', 'CAIXA']
  const delegateQuery = () => {
  return Promise.resolve(logTypeEnum);
};
let value = $state({
    start: filters.getFilterValue('startDate'),
    end: filters.getFilterValue('endDate'),
  })
</script>

<main class="mx-4 h-full max-h-[calc(100vh-10vh)]">
  <Datatable {table} >
    <!-- {#snippet header()}
        <Search {table} />
      
      {/snippet} -->
    <!-- svelte-ignore component_name_lowercase -->
    {#if table.isLoading}
      <LoadingBackground />
    {/if}
    <table class="table table-xs rounded-none">
      <thead>
        <tr>
          <ThSort {table} field="id">ID</ThSort>
          <Th>Usuário</Th>
          <Th>Logs</Th>
          <Th>Nome da rota</Th>
          <Th>Pathname</Th>
          <Th>Tipo</Th>
          <Th>Dinheiro</Th>
          <Th>Metadata</Th>
          <Th>Erro</Th>
          <Th>Data</Th>
        </tr>
        <tr>
          <Th />
            <SelectFilter  
            {table}
            filterKey="user_name"
            placeholder="o usuario"
            delegateQuery={trpc(page).auth.getUsers.query}
            config={{ value: c => c.username, label: c => c.username }}/>
          <ThFilter {table} field="text" />
          <Th />
          <Th />
            <SelectFilter 
            {table}
            filterKey="type"
            delegateQuery={delegateQuery}
            placeholder="o tipo"
            config={{ value: c => c, label: c => c }}/>
          <Th />
          <Th />
          <Th />
          <ThDateFilter {table} {filters} bind:value />

          <!--FINALIZAR ESSA TABLE, FILTRO DE DATA E ETC-->
        </tr>
      </thead>
      <tbody>
        {#each data.rows as row (row.id)}
          <tr>
            <td>{row.id}</td>
            <td >
              <span class="flex items-center gap-2">

                <User class="size-4" />{row.user_name}
              </span>
            </td>
            <td>{row.text}</td>
            <td>{row.pathname}</td>
            <td>{row.routeName}</td>
            <td >
              <span class="badge badge-xs {getColor(row.type)}">
                {row.type}
              </span>
              </td>
            <td>
              {row.currency
                ? formatCurrency(row.currency)
                : 'N/A'}
            </td>
            <td>
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger>
                    <span class="badge badge-info badge-xs">Visualizar</span>
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    <!-- <pre>{JSON.stringify(row.metadata, null, 2)}</pre> -->
                     <div>
                      {#each Object.keys(row.metadata) as key}
                        <div>
                          <span>{key}:</span>
                          <span>{row.metadata[key]}</span>
                        </div>
                      {/each}
                     </div>
                    {#if row.metadata.order_id}
                      <a
                        class="badge badge-neutral badge-sm"
                        href="/admin/orders/{row.metadata.order_id}"
                      >
                        Ver pedido
                      </a>
                    {/if}
                    {#if row.metadata.customer_id}
                      <a
                        class="badge badge-neutral badge-sm"
                        href="/customers/{row.metadata.customer_id}"
                      >
                        Ver cliente
                      </a>
                    {/if}
                  </Tooltip.Content>
                </Tooltip.Root>
              </Tooltip.Provider>
            </td>

            <td>{row.error ?? 'Não tem'}</td>
            <td>
              {row.created_at ? df.format(row.created_at) : ''}
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
