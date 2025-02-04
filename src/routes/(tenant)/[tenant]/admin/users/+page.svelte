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
  import type { Role } from '$lib/utils/permissions'
  import { pageConfig } from '$lib/config'

  let { data }: { data: PageData } = $props()
  let isOpenModal: HTMLDialogElement | null = null

  const filters = new SSRFilters()

  const table = new TableHandler(data.rows, {
    rowsPerPage: pageConfig.rowPages,
    totalRows: data.count,
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

  let newMotoboy = {
    username: '',
    email: '',
    role: 'motoboy' as Role,
  }
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
    try {
      isLoading = true
      newMotoboy.role = 'motoboy'
      await trpc($page).auth.insertUser.mutate(newMotoboy)
      newMotoboy.username = ''
      newMotoboy.email = ''
      toast.success('Motoboy inserido com sucesso!')
      setTimeout(() => {
        isOpenModal?.close()
        window.location.reload()
        isLoading = false
      }, 1300)
    } catch (error: any) {
      toast.error(error.message)
      console.error(error.message)
    }
  }
</script>

<main
  class="container mx-auto flex h-full max-h-[calc(100vh-10vh)] flex-col items-end gap-2"
>
<div class="flex gap-2">
  <button onclick={() => isOpenModal?.showModal()} class="btn btn-primary">
    Criar motoboy
  </button>
  <button class="btn btn-secondary" onclick={()=>filters.clear('username','email')}>Limpar filtros</button>
</div>
  <Datatable {table}>
    <!-- {#snippet header()}
      <Search {table} />
     
    {/snippet} -->
    <table class="table table-zebra">
      <thead>
        <tr>
          <ThSort {table} field="id">ID</ThSort>
          <ThSort {table} field="username">Nome</ThSort>
          <ThSort {table} field="email">Email</ThSort>
          <ThSort {table} field="role">Cargo</ThSort>
          <ThSort {table} field="meta">Permissões</ThSort>
          <ThSort {table} field="emailVerified">Email verificado</ThSort>
        </tr>
        <tr>
          <Th />
          <ThFilter {table} field="username" />
          <ThFilter {table} field="email" />
          <Th />
          <Th />
          <Th />
          <Th />
        </tr>
      </thead>
      <tbody>
        {#each data.rows as row}
          <tr>
            <td>{row.id}</td>
            <td><b>{row.username}</b></td>
            <td><b>{row.email}</b></td>
            <td>
              <b>
                <EditRole
                  userId={row.id}
                  userRole={row.role}
                />
                {#if row.role === 'caixa'}
                  <EditCaixa userId={row.id} userCashier={row} />
                {/if}
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
            <td><span>{row.emailVerified ? '✅' : '❌'}</span></td>
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
