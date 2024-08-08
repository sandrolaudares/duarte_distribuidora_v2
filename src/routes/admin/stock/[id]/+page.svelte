<script lang="ts">
  import type { PageData } from './$types'

  export let data: PageData

  const { estoque } = data

  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'

  import {
    renderComponent,
    type ColumnDef,
    type TableOptions,
  } from '@tanstack/svelte-table'
  import Datatable from '$components/table/Datatable.svelte'
  import {
    type TableState,
    getParams,
    EditRowButton,
    EditRowInput,
    RowActions,
  } from '$lib/components/table'
  import type { RouterOutputs, RouterInputs } from '$trpc/router'

  import type { metaEntrada, metaSaida, MetaUnion } from '$db/schema'
  import { icons } from '$lib/utils'
  function isMetaEntrada(meta: MetaUnion): meta is metaEntrada {
    return meta.type === 'entrada'
  }

  function isMetaSaida(meta: MetaUnion): meta is metaSaida {
    return meta.type === 'saida'
  }

  type Transaction = RouterOutputs['stock']['paginatedTransactions']['rows'][0]

  const defaultColumns: ColumnDef<Transaction>[] = [
    {
      header: 'ID',
      accessorKey: 'id',
    },
    {
      header: 'Quantidade',
      accessorKey: 'quantity',
    },
    {
      header: 'ID Pedido',

      accessorFn: r => JSON.stringify(r.meta_data),
    },
    {
      header: 'Tipo',
      accessorKey: 'type',
    },
  ]
</script>

<!-- TODO: frontend, mas ainda nao faz que vou precisar fazer um refactor pra gente colocar as transacoes em uma table -->
<h1>
  {estoque.name}
</h1>

<div class="container mx-auto flex flex-col">
  {#each estoque.product_stock as stock}
    <div class="flex items-center justify-center">
      <div class="stats shadow">
        <div class="stat">
          <div class="stat-figure text-secondary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              class="inline-block h-8 w-8 stroke-current"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <!-- <div class="stat-title">{stock.distribuidora.name}</div> -->
          <div class="stat-value">{stock.distribuidora.name}</div>
          <!-- <div class="stat-desc">Jan 1st - Feb 1st</div> -->
        </div>

        <div class="stat">
          <div class="stat-figure text-secondary">
            {@html icons.box()}
          </div>
          <div class="stat-title">Quantidade em Estoque</div>
          <div class="stat-value">{stock.quantity}</div>
          <!-- <div class="stat-desc">↗︎ 400 (22%)</div> -->
        </div>
      </div>
    </div>
    <div class="mx-auto h-[70vh] overflow-x-auto border p-2">
      <Datatable
        columns={defaultColumns}
        load={async s => {
          const resp = await trpc($page).stock.paginatedTransactions.query({
            distribuidora_id: stock.distribuidora_id,
            sku: stock.sku,
            table_state: s,
          })

          return {
            data: resp.rows ?? [],
            count: resp.total ?? 0,
          }
        }}
      />
    </div>
  {/each}
</div>
