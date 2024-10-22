<!-- <script lang="ts">
  import { toast } from 'svelte-sonner'
  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'

  import { modal, FormModal } from '$lib/components/modal'

  import SuperSelect from '$lib/components/input/Select.svelte'
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
  import { goto } from '$app/navigation'

  type Logs = RouterOutputs['bugReport']['paginatedLogs']['rows'][0]

  const defaultColumns: ColumnDef<Logs>[] = [
    {
      header: 'ID',
      accessorKey: 'id',

      footer: info => info.column.id,
    },
    {
      header: 'name',
      accessorKey: 'user_name',
    },
    {
      header: 'log',
      accessorKey: 'text',
    },
    {
      header: 'Metadata',
      accessorFn: row => JSON.stringify(row.metadata),
    },

    {
      header: () => 'Error',
      accessorKey: 'error',

      footer: info => info.column.id,
    },
    {
      header: 'Date',
      accessorFn: row => new Date(row.created_at ?? '').toLocaleString(),
    },
  ]

  async function load(s: TableState) {
    const resp = await trpc($page).bugReport.paginatedLogs.query(s)

    return {
      data: resp.rows ?? [],
      count: resp.total ?? 0,
    }
  }
</script>

<div class=" h-[70vh] overflow-x-auto p-4">
  <Datatable columns={defaultColumns} {load} />
</div> -->
