<script lang="ts">
  import { toast } from 'svelte-sonner'
  import { onMount } from 'svelte'
  import { page } from '$app/stores'
  import { trpc } from '$trpc/client'

  import type { RouterOutputs } from '$trpc/router'
  import Datatable from '$components/table/Datatable.svelte'
  import {
    renderComponent,
    type ColumnDef,
    type TableOptions,
  } from '@tanstack/svelte-table'
  import {
    type TableState,
    getParams,
    EditRowButton,
    EditRowInput,
    RowActions,
  } from '$lib/components/table'

  let transactions: RouterOutputs['stock']['getAllTransaoCaixa']

  // onMount(async () => {
  //   try {
  //     transactions = await trpc($page).stock.getAllTransaoCaixa.query()
  //   } catch (error: any) {
  //     toast.error(error.message)
  //   }
  // })

  const defaultColumns: ColumnDef<
    RouterOutputs['stock']['getAllTransaoCaixa']
  >[] = [
    {
      header: 'ID',
      accessorKey: 'id',

      footer: info => info.column.id,
    },
    {
      header: 'Tipo',
      accessorKey: 'type',
    },

    {
      header: 'Criado em',
      accessorKey: 'created_at',
    },

    {
      header: 'Observacão',
      accessorKey: 'observation',
    },

    {
      header: 'Valor',
      accessorKey: 'amount',
    },
  ]

  async function load(s: TableState) {
    const resp = await trpc($page).stock.getPaginatedTransacaoCaixa.query(s)
    return {
      data: resp.rows ?? [],
      count: resp.total ?? 0,
    }
  }
</script>

<main>
  {#each transactions as transaction}
    {transaction.type}
  {/each}
</main>

<div class="container mx-auto my-3 overflow-x-auto p-2">
  <Datatable columns={defaultColumns} {load} />
</div>
