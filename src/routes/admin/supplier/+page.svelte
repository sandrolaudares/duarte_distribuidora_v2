<script lang="ts">
  import type { RouterOutputs } from '$trpc/router'
  import { modal } from '$lib/components/modal'
  import { onMount } from 'svelte'
  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'
  import ModalSupplierComplete from './ModalSupplierComplete.svelte'
  import Datatable from '$components/table/Datatable.svelte'
  import {
    type TableState,
    getParams,
    EditRowButton,
    EditRowInput,
    RowActions,
  } from '$lib/components/table'
  import {
    renderComponent,
    type ColumnDef,
    type TableOptions,
  } from '@tanstack/svelte-table'
  import { goto } from '$app/navigation'
  import { toast } from 'svelte-sonner'

  type Supplier = RouterOutputs['stock']['paginatedSupplier']['rows'][0]

  const defaultColumns: ColumnDef<Supplier>[] = [
    {
      header: 'ID',
      accessorKey: 'id',
      footer: info => info.column.id,
    },
    {
      header: 'name',
      accessorKey: 'name',
      cell: info =>
        renderComponent(EditRowInput<Supplier>, {
          id: info.row.original.id,
          colID: 'name',
          editT: 'text',
          value: info.getValue(),
        }),
    },
    {
      header: 'Razao social',
      accessorKey: 'razao_social',
      cell: info =>
        renderComponent(EditRowInput<Supplier>, {
          id: info.row.original.id,
          colID: 'razao_social',
          editT: 'text',
          value: info.getValue(),
        }),
    },
    {
      header: 'CPF/CNPJ',
      accessorKey: 'cnpj_cpf',
      cell: info =>
        renderComponent(EditRowInput<Supplier>, {
          id: info.row.original.id,
          colID: 'cnpj_cpf',
          editT: 'text',
          value: info.getValue(),
        }),
    },
    {
      header: 'RG/IE',
      accessorKey: 'ie_rg',
      cell: info =>
        renderComponent(EditRowInput<Supplier>, {
          id: info.row.original.id,
          colID: 'ie_rg',
          editT: 'text',
          value: info.getValue(),
        }),
    },
    {
      header: 'CEP',
      accessorKey: 'cep',
      cell: info =>
        renderComponent(EditRowInput<Supplier>, {
          id: info.row.original.id,
          colID: 'cep',
          editT: 'text',
          value: info.getValue(),
        }),
    },
    {
      header: 'Telephone 1',
      accessorKey: 'telephone_1',
      cell: info =>
        renderComponent(EditRowInput<Supplier>, {
          id: info.row.original.id,
          colID: 'telephone_1',
          editT: 'text',
          value: info.getValue(),
        }),
    },
    {
      header: 'Criado em',
      accessorKey: 'created_at',
    },
    

    {
      id: 'edit',
      header: () => 'Edit',
      cell: info =>
        renderComponent(EditRowButton<Supplier>, {
          row: info.row.original,
        }),
      footer: info => info.column.id,
    },
    // {
    //   id: 'actions',
    //   header: () => 'Actions',
    //   cell: info =>
    //     renderComponent(RowActions, {
    //       actions: [
    //         {
    //           name: 'View Details',
    //           fn: () => {
    //             goto(`/admin/supplier/${info.row.original.id}`)
    //           },
    //         },
    //       ],
    //     }),
    // },
  ]

  async function load(s: TableState) {
    const resp = await trpc($page).stock.paginatedSupplier.query(s)

    return {
      data: resp.rows ?? [],
      count: resp.total ?? 0,
    }
  }

  async function save(changes: { [key: string]: Supplier }) {
    for (const key in changes) {
      try {
        const resp = await trpc($page).stock.updateSupplier.mutate({
          id: Number(key),
          supplier: {
            name: changes[key].name,
            razao_social: changes[key].razao_social ?? undefined,
            cep: changes[key].cep ?? undefined,
            cnpj_cpf: changes[key].cnpj_cpf ?? undefined,
            ie_rg: changes[key].ie_rg ?? undefined,
            phone_1: changes[key].telephone_1 ?? undefined,
          },
        })

        if (resp) {
          toast.success(`#${key} 'Supplier updated'`)
          window.location.reload()
        }
      } catch (error) {
        toast.error(`#${key} 'Supplier update failed'`)
      }
    }
    return {
      success: true,
    }
  }

  function openModalSupplier() {
    modal.open(ModalSupplierComplete, {})
  }
</script>

<div class="container mx-auto my-3 overflow-x-auto p-2">
  <div class="mb-2 flex justify-end gap-2">
    <button class="btn btn-primary w-96" onclick={openModalSupplier}>
      Criar fornecedor
    </button>
  </div>
  <Datatable columns={defaultColumns} {load} {save} />
</div>
