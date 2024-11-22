<script lang="ts">
  import type { PageData } from './$types'
  import * as Tabs from '$lib/components/ui/tabs/index.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import Separator from '$lib/components/ui/separator/separator.svelte'
  import { TableHandler, Th, ThFilter, ThSort } from '@vincjo/datatables'
  import { Datatable, Search, RowsPerPage, RowCount, Pagination } from '@vincjo/datatables'
  import NoResults from '$lib/components/NoResults.svelte'

  let { data }: { data: PageData } = $props()

  let solicitacoes = data.solicitacoes
  let distribuidoras = data.distribuidoras

  const table = new TableHandler(solicitacoes, { rowsPerPage: solicitacoes.length })
</script>

<main class="container mx-auto mt-10">
  <Tabs.Root value={distribuidoras[0].subdomain} class="h-full space-y-6">
    <div class="flex items-center justify-center">
      <Tabs.List>
        {#each distribuidoras as distribuidora}
          <Tabs.Trigger value={distribuidora.subdomain} class="relative">
            {distribuidora.name}
          </Tabs.Trigger>
        {/each}
      </Tabs.List>
    </div>
    {#each distribuidoras as distribuidora}
      <Tabs.Content
        value={distribuidora.subdomain}
        class="border-none p-0 outline-none"
      >
        <h2 class="mb-4 text-xl">
          Solicitações de <strong>{distribuidora.name}</strong>
        </h2>
        <!-- <ul class="space-y-2">
          {#each solicitacoes.filter(s => s.toTenantId === distribuidora.tenantId) as solicitacao}
            <li class="rounded-md border p-4 shadow-sm">
              <p>
                <strong>ID:</strong>
                {solicitacao.id}
              </p>
              {solicitacao.sku_name} - {solicitacao.quantity}
            </li>
          {/each}
        </ul> -->
        <Datatable {table} headless>
          <table class="table table-zebra">
              <thead>
                  <tr>
                      <ThSort {table} field="sku">SKU</ThSort>
                      <Th>Produto</Th>
                      <ThSort {table} field="quantity">Quantidade</ThSort>
                      <Th>Saindo de</Th>
                  </tr>
                  <tr>
                      <Th/>
                      <ThFilter {table} field="sku_name" />
                      <Th />
                      <Th>
                      <select name="" id="" class="select select-bordered">
                        {#each distribuidoras.filter(s=>s.tenantId != distribuidora.tenantId) as dis}
                        <option value="">{dis.name}</option>
                        {/each}
                      </select></Th>
                  </tr>
              </thead>
              <tbody>
                  {#each table.rows.filter(s => s.toTenantId === distribuidora.tenantId) as row}
                      <tr>
                          <td>{row.sku}</td>
                          <td>{row.sku_name}</td>
                          <td>{row.quantity}</td>
                          <td>A definir</td>
                      </tr>
                  {/each}
              </tbody>
          </table>
      </Datatable>
        {#if solicitacoes.filter(s => s.toTenantId === distribuidora.tenantId).length === 0}
          <NoResults/>
        {/if}
      </Tabs.Content>
    {/each}
  </Tabs.Root>
</main>
