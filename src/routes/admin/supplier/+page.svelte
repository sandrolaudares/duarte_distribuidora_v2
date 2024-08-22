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

  type Supplier = RouterOutputs['stock']['paginatedSupplier']

  const defaultColumns: ColumnDef<Supplier>[] = [
    {
      header: 'ID',
      accessorKey: 'id',

      footer: info => info.column.id,
    },
    {
      header: 'name',
      accessorKey: 'name',
    },
    {
      header: 'Razao social',
      accessorKey: 'razao_social',
    },
    {
      header: 'CPF/CNPJ',
      accessorKey: 'cnpj_cpf',
    },
    {
      header: 'RG/IE',
      accessorKey: 'ie_rg',
    },
    {
      header: 'CEP',
      accessorKey: 'cep',
    },
    {
      header: 'Telephone 1',
      accessorKey: 'telephone_1',
    },
    {
      header: 'Criado em',
      accessorKey: 'created_at',
    },

    // {
    //   id: 'edit',
    //   header: () => 'Edit',
    //   cell: info =>
    //     renderComponent(EditRowButton<Supplier>, {
    //       row: info.row.original,
    //     }),
    //   footer: info => info.column.id,
    // },
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
    //TODO:GET PAGINATED SUPPLIER

    return {
      data: resp.rows ?? [],
      count: resp.total ?? 0,
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
  <Datatable columns={defaultColumns} {load} />
</div>
