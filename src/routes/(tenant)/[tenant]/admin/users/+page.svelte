<script lang="ts">
  import { navigating } from '$app/stores'
  import { SSRFilters } from '$lib/components/datatable/filter.svelte'
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
  import EditPermissions from './EditPermissions.svelte'
  import EditRole from './EditRole.svelte'
  import { onMount } from 'svelte'
  import { trpc } from '$trpc/client'

  import { page } from '$app/stores'
  import type { SelectCashier, SelectUser } from '$lib/server/db/schema'
  import { toast } from 'svelte-sonner'
  import EditCaixa from './EditCaixa.svelte'
  import type { Role } from '$lib/utils/enums'
  import { pageConfig } from '$lib/config'
  import LoadingBackground from '$lib/components/datatable/LoadingBackground.svelte'
  import EditableCell from '$lib/components/editableCells/EditableCell.svelte'
  import EditableBoolean from '$lib/components/editableCells/EditableBoolean.svelte'
  import { invalidateAll } from '$app/navigation'

  let { data }: { data: PageData } = $props()
  let isOpenModal: HTMLDialogElement | null = null

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
      await filters.fromState(s)
      s.setTotalRows(data.count)
    } catch (error) {
      console.error(error)
    }
    return data.rows
  })

  let newMotoboy = $state({
    username: '',
    email: '',
    role: 'motoboy' as Role,
  })
  let errors = {
    emailError: '',
    nameError: '',
  }
  let isLoading = $state(false)
  async function handleInsertMotoboy() {
    if (newMotoboy.username.length < 3) {
      errors.nameError = 'Nome do cliente deve conter mais de 3 caracteres'
      toast.error(errors.nameError)
      return
    }
    if (!newMotoboy.email) {
      errors.emailError = 'Email é obrigatório'
      toast.error(errors.emailError)
      return
    }
    isLoading = true
    table.isLoading = true
    try {
      newMotoboy.role = 'motoboy'
      await trpc($page).auth.insertUser.mutate(newMotoboy)
      newMotoboy.username = ''
      newMotoboy.email = ''
      toast.success('Motoboy inserido com sucesso!')
      isOpenModal?.close()
      invalidateAll()
    } catch (error: any) {
      toast.error(error.message)
      console.error(error.message)
    } finally {
      table.isLoading = false
      isLoading = false
    }
  }

  async function handleUpdate(value: boolean, row: typeof data.rows[0]) {
    table.isLoading = true
    const last_val = row['is_active']
    try {
      await trpc($page).auth.updateUser.mutate({
        userId: row.id,
        user: { is_active: value },
      })
      row['is_active'] = value
      invalidateAll()
      toast.success('Atualizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao atualizar')
      row['is_active'] = last_val
    } finally {
      table.isLoading = false
    }
  }

  $inspect(table.isLoading)
</script>

<main class="mx-4 flex h-full max-h-[calc(100vh-10vh)] flex-col gap-2">
  <div class="flex justify-end gap-2">
    <button onclick={() => isOpenModal?.showModal()} class="btn btn-primary">
      Criar motoboy
    </button>
    <button
      class="btn btn-secondary"
      onclick={() => table.clearFilters()}
    >
      Limpar filtros
    </button>
  </div>
  <Datatable {table}>
    <!-- {#snippet header()}
      <Search {table} />
     
    {/snippet} -->
    {#if table.isLoading}
      <LoadingBackground />
    {/if}
    <table class="table table-zebra">
      <thead>
        <tr>
          <Th>ID</Th>
          <ThSort {table} field="username">Nome</ThSort>
          <ThSort {table} field="email">Email</ThSort>
          <ThSort {table} field="role">Cargo</ThSort>
          <Th>Permissões</Th>
          <Th>Ativo?</Th>
        </tr>
        <tr>
          <Th />
          <ThFilter {table} field="username" />
          <ThFilter {table} field="email" />
          <Th />
          <Th />
          <Th />
        </tr>
      </thead>
      <tbody>
        {#each data.rows as row (row.id)}
          <tr>
            <td class="max-w-[100px] truncate text-sm">
              <span>
                {row.id}
              </span>
            </td>
            <td><b>{row.username}</b></td>
            <td><b>{row.email}</b></td>
            <td>
              <b>
                <EditRole userId={row.id} userRole={row.role} />
                <!-- {#if row.role === 'caixa'}
                  <EditCaixa userId={row.id} userCashier={row} />
                {/if} -->
              </b>
            </td>
            <td>
              <b>
                <EditPermissions
                  userId={row.id}
                  userName={row.username}
                  userPermissions={row.meta.permissions ?? []}
                />
              </b>
            </td>
            <td>
              <span class:badge-success={row.is_active} class:badge-error={!row.is_active} class="badge">
                <EditableBoolean
                  labelTrue="Ativo"
                  labelFalse="Inátivo"
                  value={row.is_active}
                  onUpdateValue={async(newV) => {
                    await handleUpdate(newV, row)
                  }}
                />
              </span>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
    {#snippet footer()}
      <RowsPerPage {table} />
      <div></div>
      <Pagination {table} />
    {/snippet}
  </Datatable>
</main>

<dialog class="modal" bind:this={isOpenModal}>
  <div class="modal-box max-w-lg">
    <h1 class="mb-2 text-lg">Criar motoboy</h1>
    <div class="flex flex-col gap-2">
      <label class="input input-bordered flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          class="h-4 w-4 opacity-70"
        >
          <path
            d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z"
          />
        </svg>
        <input
          type="text"
          class="grow"
          placeholder="Nome"
          bind:value={newMotoboy.username}
        />
      </label>
      <label class="input input-bordered flex items-center gap-2">
        <input
          type="text"
          class="grow"
          placeholder="Email"
          bind:value={newMotoboy.email}
        />
      </label>
      {#if errors}
        <p class="text-error">
          {errors.emailError}
          {errors.nameError}
        </p>
      {/if}
      <button
        class="btn btn-primary"
        disabled={isLoading}
        onclick={() => {
          handleInsertMotoboy()
        }}
      >
        Adicionar
      </button>
    </div>
    <div>
      {#if errors.nameError}
        <p class="text-error">
          {errors.nameError}
        </p>
      {/if}
      {#if errors.emailError}
        <p class="text-error">
          {errors.emailError}
        </p>
      {/if}
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
