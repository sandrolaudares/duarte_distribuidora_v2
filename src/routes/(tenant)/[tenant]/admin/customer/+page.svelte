<script lang="ts">
  import { navigating } from '$app/stores'
  import { SSRFilters } from '$lib/components/datatable/filter.svelte'
  import { modal, FormModal } from '$lib/components/modal'
  import UsedCredits from '$lib/components/UsedCredits.svelte'
  import { page } from '$app/stores'
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
  import { tr } from 'date-fns/locale'
  import NoResults from '$lib/components/NoResults.svelte'
  import EditableCell from './EditableCell.svelte'

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

  async function handleUpdate(value:unknown, key = '', row) {
    const last_val = row[key]
    try {
      await trpc($page).customer.updateCustomer.mutate({
        id: row.id,
        customer: { [key]: value },
      })
      row[key] = value
      toast.success('Atualizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao atualizar')
      row[key] = last_val
    }
  }
</script>

<main class="container mx-auto h-full max-h-[calc(100vh-20vh)]">
  <section class="container mx-auto mb-4 px-4">
    <div class="mt-2 flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Clientes:</h1>
      <button class="btn btn-primary min-w-96" onclick={add}>
        Criar cliente
      </button>
    </div>
  </section>
  <Datatable {table}>
    <!-- {#snippet header()}
      <Search {table} />
     
    {/snippet} -->
    <!-- svelte-ignore component_name_lowercase -->
    <table class="table table-zebra">
      <thead>
        <tr>
          <ThSort {table} field="id">ID</ThSort>
          <ThSort {table} field="name">Nome</ThSort>
          <ThSort {table} field="email">Email</ThSort>
          <Th>CPF/CNPJ</Th>
          <ThSort {table} field="is_retail">Tipo pessoa</ThSort>
          <Th>RG/IE</Th>
          <Th>Telefone</Th>
          <Th>Créditos usados</Th>
          <ThSort {table} field="max_credit">Máximo de créditos</ThSort>
          <Th>Ver detalhes</Th>
        </tr>
        <tr>
          <Th />
          <ThFilter {table} field="name" />
          <ThFilter {table} field="email" />
          <ThFilter {table} field="cpf_cnpj" />
          <Th />
          <Th />
          <ThFilter {table} field="phone" />
          <Th />
          <Th />
          <Th />
        </tr>
      </thead>
      <tbody>
        {#each table.rows as row}
          <tr>
            <td>{row.id}</td>
            <td>
              <b>
                <EditableCell
                  value={row.name}
                  onUpdateValue={async newValue => {
                    handleUpdate(newValue,'name',row)
                  }}
                />
              </b>
            </td>
            <td>
              <b>
                <EditableCell
                  value={row.email}
                  onUpdateValue={async newValue => {
                    handleUpdate(newValue,'email',row)
                  }}
                />
              </b>
            </td>
            <td><b>{row.cpf_cnpj}</b></td>
            <td><b>{row.is_retail}</b></td>
            <td><b>{row.rg_ie}</b></td>
            <td><b>{row.phone}</b></td>
            <td><b><UsedCredits id={row.id} /></b></td>
            <td><b>R${(row.max_credit / 100).toFixed(2)}</b></td>
            <td>
              <a href="/admin/customer/{row.id}" class="badge badge-primary">
                Detalhes
              </a>
            </td>
            <!-- <td><b><SimpleSelect id={row.id} value={row.is_retail}/> TODO</b></td> -->
          </tr>
        {/each}
      </tbody>
    </table>
    {#if table.rows.length === 0}
      <NoResults />
    {/if}
    {#snippet footer()}
      <RowsPerPage {table} />
      <div></div>
      <Pagination {table} />
    {/snippet}
  </Datatable>
</main>
