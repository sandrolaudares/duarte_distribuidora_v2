<script lang="ts">
  import { navigating } from '$app/stores'
  import { SSRFilters } from '$lib/components/datatable/filter.svelte'
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
  import EditPermissions from './EditPermissions.svelte'
    import EditRole from './EditRole.svelte'
  import { onMount } from 'svelte'
  import { trpc } from '$trpc/client'

import { page } from '$app/stores'
  import type { SelectCashier, SelectUser } from '$lib/server/db/schema'
  import { toast } from 'svelte-sonner'
  import EditCaixa from './EditCaixa.svelte'

  let { data }: { data: PageData } = $props()

  const filters = new SSRFilters()

  const table = new TableHandler(data.rows, {
    rowsPerPage: 10,
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

<main class="container mx-auto h-full max-h-[calc(100vh-10vh)]">
  <Datatable {table}>
    <!-- {#snippet header()}
      <Search {table} />
     
    {/snippet} -->
    <table class="table table-zebra">
      <thead>
        <tr>
          <ThSort {table} field="id">ID</ThSort>
          <ThSort {table} field="username">Nome</ThSort>
          <ThSort {table} field="email">Email</ThSort>
          <ThSort {table} field="role">Cargo</ThSort>
          <ThSort {table} field="meta">Permissões</ThSort>
          <ThSort {table} field="emailVerified">Email verificado</ThSort>
        </tr>
        <tr>
          <Th />
          <ThFilter {table} field="username" />
          <ThFilter {table} field="email" />
          <Th/>
          <Th/>
          <Th />
          <Th />
        </tr>
      </thead>
      <tbody>
        {#each table.rows as row}
          <tr>
            <td>{row.id}</td>
            <td><b>{row.username}</b></td>
            <td><b>{row.email}</b></td>
            <td><b><EditRole userId={row.id} userName={row.username} userRole={row.role}/> 
              {#if row.role === 'caixa'}
                <EditCaixa userId={row.id} userCashier={row}/>
              {/if} 
          </b></td>
            <td><b><EditPermissions userId={row.id} userName={row.username} userPermissions={row.meta.permissions ?? []}/></b></td>
            <td><span>{row.emailVerified ? '✅' : '❌'}</span></td>
          </tr>
        {/each}
      </tbody>
    </table>
    {#snippet footer()}
      <RowsPerPage {table} />
      <div></div>
      <Pagination {table} />
    {/snippet}
  </Datatable>
</main>