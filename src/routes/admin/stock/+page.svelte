<script lang="ts">
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

  type SKU = RouterOutputs['stock']['paginatedSKUs']['rows'][0]

  const defaultColumns: ColumnDef<SKU>[] = [
    {
      header: 'Name',
      accessorKey: 'name',

      footer: info => info.column.id,
    },

    {
      header: 'Quantidade em Estoque',
      accessorKey: 'quantity',
    },
    {
      id: 'actions',
      header: () => 'Actions',
      cell: info =>
        renderComponent(RowActions, {
          actions: [
            {
              name: 'View Details',
              fn: () => {
                goto(`/admin/stock/${info.row.original.sku}`)
              },
            },
          ],
        }),
    },
  ]

  async function load(s: TableState) {
    const resp = await trpc($page).stock.paginatedSKUs.query(s)

    return {
      data: resp.rows ?? [],
      count: resp.total ?? 0,
    }
  }

  function add(invalidate: Function) {
    modal.open(FormModal<RouterInputs['stock']['insertSKU']>, {
      title: 'Create new Customer',
      fields: [
        {
          label: 'Name',
          name: 'name',
          type: 'text',
          required: true,
        },
      ],
      save: async toSave => {
        try {
          const resp = await trpc($page).stock.insertSKU.mutate(toSave)

          if (resp) {
            toast.success('SKU Created')
            invalidate()
          }
        } catch (error: any) {
          toast.error(error.message)
          return error.message
        }
      },
    })
  }
</script>

<div class="container mx-auto overflow-x-auto p-2">
  <div class="mb-2 flex justify-end gap-2">
    <!-- <a href="/admin/stock/transferir"  class="btn btn-success">Transferir estoque</a> -->
    <a href="/admin/stock/entrada" class="btn btn-primary">
      Entrada de estoque
    </a>
  </div>
  <Datatable columns={defaultColumns} {load} {add} />
</div>
