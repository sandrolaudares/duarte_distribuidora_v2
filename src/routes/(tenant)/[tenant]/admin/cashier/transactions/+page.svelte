<!-- <script lang="ts">
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

  const defaultColumns: ColumnDef<
    RouterOutputs['stock']['getPaginatedTransacaoCaixa']['rows']
  >[] = [
    {
      header: 'ID',
      accessorKey: 'cashier_transaction.id',
      footer: info => info.column.id,
    },
    {
      header: 'Criado em',
      accessorKey: 'cashier_transaction.created_at',
    },
    {
      header: 'caixa',
      accessorKey: 'cashier_name',
    },
    {
      header: 'Tipo',
      accessorKey: 'cashier_transaction.type',
    },
    {
      header: 'Valor',
      accessorKey: 'cashier_transaction.amount',
    },
    {
      header: 'Observacão',
      accessorKey: 'cashier_transaction.observation',
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


<div class="container mx-auto my-3 overflow-x-auto p-2">
  <Datatable columns={defaultColumns} {load} />
</div> -->


<script lang="ts">
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  import {
    createTable,
    Subscribe,
    Render,
    createRender,
    type DataLabel,
    type Column,
    type Table,
  } from '@andre-brandao/svelte-headless-table'
  import {
    addSortBy,
    addColumnOrder,
    addColumnFilters,
    addSelectedRows,
    addResizedColumns,
    addGridLayout,
    addPagination,
  } from '@andre-brandao/svelte-headless-table/plugins'
  import {
    readable,
    writable,
    type Writable,
    type Readable,
  } from 'svelte/store'
  import TextFilter from '$lib/components/newTable/filters/TextFilter.svelte'
  import { page } from '$app/stores'

  import SelectIndicator from '$lib/components/newTable/edit/SelectIndicator.svelte'
  import EditableCell from '$lib/components/newTable/edit/EditableCell.svelte'
  import { goto } from '$app/navigation'
  // import type { SelectUser } from '$drizzle/schema'
  import { onDestroy, onMount } from 'svelte'
  import {
    SSRTable,
    SSRFilter,
    type SSRTableProps,
  } from '$lib/components/newTable/ssr/index.svelte'
  import { debounce } from '$lib/utils'
  import EditableCurrency from '$lib/components/newTable/edit/EditableCurrency.svelte'
  import GoToDetails from '$lib/components/newTable/goToDetails.svelte'
  import { toast } from 'svelte-sonner'
  import { trpc } from '$trpc/client'
  import { modal, FormModal } from '$lib/components/modal'
  import type { RouterInputs } from '$trpc/router'
  import { invalidate } from '$app/navigation'

  const usernameFilter = debounce(SSRFilter.update_many, 500)
  const emailFilter = debounce(SSRFilter.update_many, 500)
  console.log(data)

  const tableRows = writable(data.rows ?? [])

  $effect(() => {
    console.log('data.rows', data.rows)

    tableRows.set(data.rows)
  })

  let Filters = $derived($page.url)

  function Filters_get(name: string) {
    return Filters.searchParams.get(name)
  }

  function Filters_update(name: string, value: string) {
    const url = new URL(Filters)
    if (value !== '') url.searchParams.set(name, value)
    else url.searchParams.delete(name)

    goto(url, { keepFocus: true })
  }

  function Filters_clear(...params: string[]) {
    const url = new URL(Filters)
    params.forEach(p => url.searchParams.delete(p))
    goto(url, { keepFocus: true })
  }

  function Filters_isFiltered(...params: string[]) {
    return params.length > 0 && params.some(p => Filters.searchParams.has(p))
  }

  function Filters_update_many(params: Record<string, string>) {
    const url = new URL(Filters)
    Object.entries(params).forEach(([name, value]) => {
      if (!value) {
        url.searchParams.delete(name)
      }
      if (value !== '') url.searchParams.set(name, value)
      else url.searchParams.delete(name)
    })

    const searchParams = url.pathname + url.search
    goto(searchParams, { keepFocus: true })
  }

  async function handleUpdate(
    newItem: any,
    key: string,
    idx: number,
    currentItem: any,
  ) {
    try {
      await trpc($page).customer.updateCustomer.mutate({
        id: newItem.id,
        customer: { [key]: newItem[key] },
      })
      toast.success('Atualizado com sucesso!')
    } catch (error: any) {
      toast.error('Erro ao atualizar')
      console.error(error)
      $tableRows[idx] = currentItem
    }
    $tableRows = $tableRows
  }

  function add() {
    modal.open(FormModal, {
      title: 'Create new Customer',
      fields: [
        {
          name: 'is_retail',
          label: 'Pessoa Fisica',
          type: 'checkbox',
        },
        {
          label: 'Name',
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          label: 'Phone',
          name: 'phone',
          type: 'text',
        },
        {
          name: 'cellphone',
          label: 'CellPhone',
          type: 'text',
        },
        {
          label: 'Email',
          name: 'email',
          type: 'email',
        },
        {
          name: 'cpf_cnpj',
          label: 'CPF/CNPJ',
          type: 'text',
        },
      ],
      save: async toSave => {
        try {
          const resp = await trpc($page).customer.insertCustomer.mutate(toSave)

          if (resp) {
            toast.success('Cliente criado')
            // invalidate()
            window.location.reload()
          }
        } catch (error: any) {
          toast.error(error.message)
          return error.message
        }
        // invalidate()
      },
    })
  }
</script>

<section class="container mx-auto px-4">
  <div class="mt-2 flex justify-between items-center ">
    <h1 class="text-2xl font-semibold">Clientes:</h1>
    <button class="btn btn-primary min-w-96" onclick={add}>Criar cliente</button>
  </div>
</section>
<SSRTable
  totalSum={3}
  count={readable(data.count)}
  {tableRows}
  columns={table => [
    // table.display({
    //   id: 'selected',
    //   header: '',
    //   cell: ({ row, column }, { pluginStates }) => {
    //     const { isSomeSubRowsSelected, isSelected } =
    //       pluginStates.select.getRowState(row)
    //     return createRender(SelectIndicator, {
    //       isSelected,
    //       isSomeSubRowsSelected,
    //     })
    //   },
    // }),
    table.column({
      header: 'ID',
      accessor: 'id',
    }),
    table.column({
      header: 'Name',
      accessor: 'name',
      cell: ({ column, row, value }) =>
        createRender(EditableCell, {
          row,
          column,
          value,
          onUpdateValue: async (
            rowDataId: string,
            columnId: string,
            newValue: unknown,
          ) => {
            console.log(rowDataId, columnId, newValue)
            // In this case, the dataId of each item is its index in $tableRows.
            // You can also handle any server-synchronization necessary here.
            const idx = parseInt(rowDataId)
            const currentItem = $tableRows[idx]
            const key = columnId // Cast as `keyof YourDataItem`
            const newItem = { ...currentItem, [key]: newValue }
            console.log(newItem)
            $tableRows[idx] = newItem
            $tableRows = $tableRows

            handleUpdate(newItem, key, idx, currentItem)

            // Handle any server-synchronization.
          },
        }),
      plugins: {
        sort: {
          invert: false,
          // disable: true,
        },
        filter: {
          initialFilterValue: '',
          render: ({ filterValue, values, preFilteredValues }) =>
            createRender(TextFilter, {
              filterValue,
              values,
              preFilteredValues,
              change: value => {
                console.log('change username', value)

                Filters_update_many({
                  name: value,
                  page: '1',
                })
              },
            }),
        },
      },
    }),
    table.column({
      header: 'Email',
      accessor: 'email',
      cell: ({ column, row, value }) =>
        createRender(EditableCell, {
          row,
          column,
          value,
          onUpdateValue: (
            rowDataId: string,
            columnId: string,
            newValue: unknown,
          ) => {
            console.log(rowDataId, columnId, newValue)
            // In this case, the dataId of each item is its index in $tableRows.
            // You can also handle any server-synchronization necessary here.
            const idx = parseInt(rowDataId)
            const currentItem = $tableRows[idx]
            const key = columnId // Cast as `keyof YourDataItem`
            const newItem = { ...currentItem, [key]: newValue }
            console.log(newItem)
            $tableRows[idx] = newItem
            $tableRows = $tableRows

            handleUpdate(newItem, key, idx, currentItem)
            // Handle any server-synchronization.
          },
        }),
      plugins: {
        sort: {
          invert: false,
          // disable: true,
        },
        filter: {
          initialFilterValue: '',
          render: ({ filterValue, values, preFilteredValues }) =>
            createRender(TextFilter, {
              filterValue,
              values,
              preFilteredValues,
              change: value =>
                Filters_update_many({
                  email: value,
                  page: `1`,
                }),
            }),
        },
      },
    }),
    table.column({
      header: 'CPF/CNPJ',
      accessor: 'cpf_cnpj',
      cell: ({ column, row, value }) =>
        createRender(EditableCell, {
          row,
          column,
          value,
          onUpdateValue: (
            rowDataId: string,
            columnId: string,
            newValue: unknown,
          ) => {
            console.log(rowDataId, columnId, newValue)
            const idx = parseInt(rowDataId)
            const currentItem = $tableRows[idx]
            const key = columnId // Cast as `keyof YourDataItem`
            const newItem = { ...currentItem, [key]: newValue }
            console.log(newItem)
            $tableRows[idx] = newItem
            $tableRows = $tableRows

            handleUpdate(newItem, key, idx, currentItem)
            // Handle any server-synchronization.
          },
        }),
    }),
    
    table.column({
      header: 'RG/IE',
      accessor: 'rg_ie',
      cell: ({ column, row, value }) =>
        createRender(EditableCell, {
          row,
          column,
          value,
          onUpdateValue: (
            rowDataId: string,
            columnId: string,
            newValue: unknown,
          ) => {
            console.log(rowDataId, columnId, newValue)
            const idx = parseInt(rowDataId)
            const currentItem = $tableRows[idx]
            const key = columnId // Cast as `keyof YourDataItem`
            const newItem = { ...currentItem, [key]: newValue }
            console.log(newItem)
            $tableRows[idx] = newItem
            $tableRows = $tableRows

            handleUpdate(newItem, key, idx, currentItem)
            // Handle any server-synchronization.
          },
        }),
    }),
    table.column({
      header: 'Telefone',
      accessor: 'phone',
      cell: ({ column, row, value }) =>
        createRender(EditableCell, {
          row,
          column,
          value,
          onUpdateValue: (
            rowDataId: string,
            columnId: string,
            newValue: unknown,
          ) => {
            console.log(rowDataId, columnId, newValue)
            const idx = parseInt(rowDataId)
            const currentItem = $tableRows[idx]
            const key = columnId // Cast as `keyof YourDataItem`
            const newItem = { ...currentItem, [key]: newValue }
            console.log(newItem)
            $tableRows[idx] = newItem
            $tableRows = $tableRows

            handleUpdate(newItem, key, idx, currentItem)
            // Handle any server-synchronization.
          },
        }),
    }),

    table.column({
      header: 'Crédito Máximo',
      accessor: 'max_credit',
      cell: ({ column, row, value }) =>
        createRender(EditableCurrency, {
          row,
          column,
          value,
          onUpdateValue: (
            rowDataId: string,
            columnId: string,
            newValue: unknown,
          ) => {
            console.log(rowDataId, columnId, newValue)
            const idx = parseInt(rowDataId)
            const currentItem = $tableRows[idx]
            const key = columnId // Cast as `keyof YourDataItem`
            const newItem = { ...currentItem, [key]: newValue }
            console.log(newItem)
            $tableRows[idx] = newItem
            $tableRows = $tableRows

            handleUpdate(newItem, key, idx, currentItem)
            // Handle any server-synchronization.
          },
        }),
    }),
    table.column({
      header: 'Ver detalhes',
      accessor: item => item,
      cell: ({ value }) =>
        createRender(GoToDetails, {
          value: `/admin/customer/${value.id}`,
          text: 'Ir para detalhes',
        }),
    }),
  ]}
/>
