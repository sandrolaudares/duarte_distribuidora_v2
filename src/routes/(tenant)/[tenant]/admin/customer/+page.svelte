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
  import NoResults from '$lib/components/NoResults.svelte'
  import EditableCell from '$lib/components/editableCells/EditableCell.svelte'
  import EditableCurrency from '$lib/components/editableCells/EditableCurrency.svelte'
  import { pageConfig } from '$lib/config'
  import { invalidateAll } from '$app/navigation'
  import LoadingBackground from '$lib/components/datatable/LoadingBackground.svelte'
  import EditableBoolean from '$lib/components/editableCells/EditableBoolean.svelte'

  let { data }: { data: PageData } = $props()

  const filters = new SSRFilters()

  const table = new TableHandler(data.rows, {
    rowsPerPage: pageConfig.rowPages,
    totalRows: data.count,
    i18n: {
      show: 'Mostrar',
      entries: 'entradas',
      previous: 'Anterior',
      next: 'Próximo',
      noRows: 'Nenhum encontrado',
      filter: 'Filtrar',
    },
  })

  table.setPage(Number(filters.get('page')) || 1)
  table.load(async s => {
    try {
      console.log(s)
      filters.fromState(s)
      await $navigating?.complete
    } catch (error) {
      console.error(error)
    }
    return data.rows
  })

  function add() {
    modal.open(FormModal, {
      title: 'Criar novo cliente',
      fields: [
        {
          label: 'Nome',
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          label: 'Celular',
          name: 'cellphone',
          type: 'text',
        },
        {
          label: 'Telefone',
          name: 'phone',
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
        {
          name: 'is_retail',
          label: 'Pessoa Fisica',
          type: 'checkbox',
        },
      ],
      save: async toSave => {
        try {
          const resp = await trpc($page).customer.insertCustomer.mutate(toSave)

          if (resp) {
            toast.success('Cliente criado com sucesso')
            invalidateAll()
          }
        } catch (error: any) {
          toast.error(error.message)
          return error.message
        }
        // invalidate()
      },
    })
  }

  async function handleUpdate(value: unknown, key = '', row: any) {
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

<main class=" h-full max-h-[calc(100vh-20vh)]">
  <section class=" mb-4 px-4">
    <div class="mt-2 flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Clientes:</h1>
      <div class="flex gap-2">
        <button class="btn btn-primary min-w-96" onclick={add}>
          Criar cliente
        </button>
        <button
          class="btn btn-secondary"
          onclick={() => filters.clear('name', 'phone')}
        >
          Limpar filtros
        </button>
      </div>
    </div>
  </section>
  <Datatable {table}>
    {#if table.isLoading}
      <LoadingBackground />
    {/if}
    <table class="table table-zebra">
      <thead>
        <tr>
          <Th>ID</Th>
          <Th>Nome</Th>
          <!-- <Th"email">Email</Th>
          <Th>CPF/CNPJ</Th> -->
          <Th>Tipo pessoa</Th>
          <!-- <Th>RG/IE</Th> -->
          <Th>Telefone</Th>
          <Th>Créditos usados</Th>
          <Th>Máximo de créditos</Th>
          <Th>Ver detalhes</Th>
        </tr>
        <tr>
          <Th />
          <ThFilter {table} field="name" />
          <!-- <ThFilter {table} field="email" />
          <ThFilter {table} field="cpf_cnpj" /> -->
          <Th />
          <!-- <Th /> -->
          <ThFilter {table} field="phone" />
          <Th />
          <Th />
          <Th />
        </tr>
      </thead>
      <tbody>
        {#each data.rows as row (row.id)}
          <tr>
            <td>{row.id}</td>
            <td>
                <EditableCell
                  value={row.name}
                  onUpdateValue={async newValue => {
                    handleUpdate(newValue, 'name', row)
                  }}
                />
            </td>
            <!-- <td>
              <b>
                <EditableCell
                  value={row.email}
                  onUpdateValue={async newValue => {
                    handleUpdate(newValue,'email',row)
                  }}
                />
              </b>
            </td>
            <td><b>{row.cpf_cnpj}</b></td> -->
            <td>
                <EditableBoolean
                  labelTrue={"Pessoa Fisica"}
                  labelFalse={"Pessoa Juridica"}
                  value={row.is_retail}
                  onUpdateValue={async (newValue:boolean) => {
                    handleUpdate(Boolean(newValue), 'is_retail', row)
                  }}
                />
            </td>
            <!-- <td><b>{row.rg_ie}</b></td> -->
            <td>
                <EditableCell
                  value={row.phone}
                  onUpdateValue={async newValue => {
                    handleUpdate(newValue, 'phone', row)
                  }}
                />
            </td>
            <td><UsedCredits id={row.id} /></td>
            <td>
                <EditableCurrency
                  value={row.max_credit}
                  onUpdateValue={async newValue => {
                    handleUpdate(newValue, 'max_credit', row)
                  }}
                />
            </td>
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
    {#if data.rows.length === 0}
      <NoResults />
    {/if}
    {#snippet footer()}
      <RowsPerPage {table} />
      <div></div>
      <Pagination {table} />
    {/snippet}
  </Datatable>
</main>

<style>
  thead {
    background-color: oklch(var(--b1)) !important;
  }
</style>
