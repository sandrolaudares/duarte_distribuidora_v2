<script lang="ts">
  import { onMount } from 'svelte'
  import { navigating } from '$app/stores'
  import { SSRFilters } from '$lib/components/datatable/filter.svelte'
  import { fade, slide, fly } from 'svelte/transition'
  import type { PageData } from './$types'
  import { trpc } from '$trpc/client'
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
  import CurrencyInput from '$lib/components/input/CurrencyInput.svelte'
  import NoResults from '$lib/components/NoResults.svelte'
  import type { SelectConta } from '$lib/server/db/schema'
  import { toast } from 'svelte-sonner'
  import { invalidate, invalidateAll } from '$app/navigation'
  import DateFilter from '$lib/components/DateFilter.svelte'
  import * as Select from '$lib/components/ui/select/index'
  import { pageConfig } from '$lib/config'
  import { DateFormatter } from '@internationalized/date'

  let { data }: { data: PageData } = $props()

  const filters = new SSRFilters()

  let isOpenModal: HTMLDialogElement | null = null

  const table = new TableHandler(data.rows, {
    rowsPerPage: pageConfig.rowPages,
    totalRows: data.count,
  })

  const df = new DateFormatter('pt-BR', {
    dateStyle: 'medium',
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

  let newConta: SelectConta = {
    valor_conta: 0,
    id: 0,
    expire_at: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: new Date(),
    status: '',
    fornecedor_id: 0,
    descricao: '',
    titulo: '',
    isPaid: false,
    categoria_id: 0,
    paid_at: new Date(),
  }
  let isLoading = $state(false)
  async function createConta() {
    isLoading = true
    try {
      await trpc($page).contas.insertConta.mutate({
        valor_conta: newConta.valor_conta,
        expire_at: newConta.expire_at,
        descricao: newConta.descricao,
        titulo: newConta.titulo,
        isPaid: newConta.isPaid,
        fornecedor_id: newConta.fornecedor_id,
        categoria_id: newConta.categoria_id,
      })
      await invalidateAll()
      toast.success('Sucesso ao criar conta')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      isLoading = false
      isOpenModal?.close()
      window.location.reload()
      //TODO: FIX PRA FUNCIONAR SEM RELOAD NA PAGINA
    }
  }

  let messageCat = $state('')

  let nameCat = $state('')
  async function createCategoria() {
    isLoading = true
    try {
      await trpc($page).contas.insertCategoria.mutate({
        nome: nameCat,
      })
      await invalidateAll()
      toast.success('Sucesso ao criar categoria')
      messageCat = 'Successo ao criar categoria!'
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      isLoading = false
      // window.location.reload()
    }
  }

  const paidFilter = table.createFilter('isPaid')

  async function pagar(id: number) {
    isLoading = true
    try {
      await trpc($page).contas.pagarConta.mutate(id)
      await invalidateAll()
      toast.success('Sucesso ao pagar conta')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      isLoading = false
      window.location.reload()
    }
  }

  const filtersPaid = [
    { value: 'todos', label: 'Todos' },
    { value: 'paid', label: 'Pagos' },
    { value: 'unpaid', label: 'Não pagos' },
  ]

  const triggerContent = $derived(
    filtersPaid.find(f => f.value === paidFilter.value)?.label ??
      'Selecione...',
  )
</script>

<div class="mx-4 p-4">
  <h1 class="mb-6 text-3xl font-bold">Contas à pagar</h1>
  {#if messageCat}
    <p class="text-lg font-bold text-success">
      {messageCat}
    </p>
  {/if}

  <div class="mb-6 flex justify-between rounded-lg bg-base-200 p-4 shadow">
    <div class="flex gap-2 divide-x">
      <button
        class="btn btn-primary"
        onclick={() => isOpenModal?.showModal()}
        disabled={isLoading}
      >
        Criar nova conta
      </button>
      <div class="inline-block w-0.5 self-stretch bg-base-100"></div>
      <input
        type="text"
        bind:value={nameCat}
        class="input input-bordered"
        placeholder="Nova categoria"
      />
      <button
        class="btn btn-secondary"
        onclick={createCategoria}
        disabled={isLoading || nameCat === ''}
      >
        Confirmar nova categoria
      </button>
    </div>
    <div class="flex gap-2 divide-x">
      <Select.Root
        type="single"
        bind:value={paidFilter.value}
        onValueChange={e => {
          paidFilter.set()
        }}
      >
        <Select.Trigger class="w-[180px] h-full">
          {triggerContent}
        </Select.Trigger>
        <Select.Content>
          {#each filtersPaid as filter}
            <Select.Item value={filter.value} label={filter.label}>
              {filter.label}
            </Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
    </div>
  </div>

  <div class="bg-base overflow-x-auto rounded-lg shadow">
    <Datatable {table} headless>
      <table class="w-full">
        <thead>
          <tr class="bgg bg-base-200 text-left">
            <Th>Titulo</Th>
            <Th>Observações</Th>
            <Th>Fornecedor</Th>
            <Th>Categoria</Th>
            <Th>Data vencimento</Th>
            <Th>Pago em</Th>
            <ThSort {table} field="valor_conta">Valor</ThSort>
            <Th></Th>
            <Th></Th>
          </tr>
          <tr>
            <ThFilter {table} field="titulo" />
            <Th />
            <ThFilter {table} field="supName" />
            <!-- <ThFilter {table} field="catName" /> -->
            <Th />
            <Th />
            <Th>
              <!-- <DateFilter
              onchange={(start, end) => {
                if (start != null && end != null) {
                  let startDate = start.toString()
                  let endDate = end.toString()
                  filters.update({ startDate, endDate })
                }
              }}
            /> -->
            </Th>
            <Th />
            <Th />
            <Th />
          </tr>
        </thead>

        <tbody>
          {#each table.rows as conta}
            <tr
              transition:fade|local
              class="border-t border-gray-200 transition-colors hover:bg-gray-50"
              class:opacity-50={conta.isPaid}
            >
              <td class="p-3">{conta.titulo}</td>
              <td class="p-3 {conta.descricao ? '' : 'text-error'}">
                {conta.descricao ? conta.descricao : 'Não possui'}
              </td>
              <td class="p-3">{conta.supName}</td>
              <td class="p-3">{conta.catName ?? 'Não cadastrado'}</td>
              <td class="p-3">{df.format(conta.expire_at!)}</td>

              <td class="p-3">
                {conta.paid_at
                  ? df.format(conta.paid_at)
                  : 'Ainda não foi paga'}
              </td>
              <td class="p-3">R${(conta.valor_conta / 100).toFixed(2)}</td>
              <td class="p-3">
                <span
                  class="rounded px-2 py-1 text-sm font-semibold"
                  class:bg-green-200={conta.isPaid}
                  class:text-green-800={conta.isPaid}
                  class:bg-red-200={!conta.isPaid}
                  class:text-red-800={!conta.isPaid}
                >
                  {conta.isPaid ? 'Pago' : 'Não pago'}
                </span>
              </td>
              <td class="p-3">
                <button
                  onclick={() => pagar(conta.id)}
                  class="btn btn-sm"
                  class:btn-success={!conta.isPaid}
                  class:text-success-content={!conta.isPaid}
                  disabled={isLoading || conta.isPaid}
                >
                  {conta.isPaid ? 'PAGO' : 'Pagar'}
                </button>
              </td>
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
  </div>

  <div
    class="mt-6 flex items-center justify-between rounded-lg bg-gray-100 p-4 shadow"
  >
    <h2 class="text-xl font-semibold text-gray-800">Total das contas:</h2>
    <span class="text-2xl font-bold text-success">
      R${(data.totalSum / 100).toFixed(2)}
    </span>
  </div>
</div>

<dialog
  class="modal"
  bind:this={isOpenModal}
  in:fly={{ y: 50, duration: 300 }}
  out:fade={{ duration: 200 }}
>
  <div class="modal-box max-w-2xl">
    <h2 class="mb-6 text-2xl font-semibold">Nova Conta</h2>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div class="form-control">
        <label for="titulo" class="label">
          <span class="label-text">Título da conta</span>
        </label>
        <input
          id="titulo"
          type="text"
          placeholder="Título da conta"
          class="input input-bordered w-full"
          bind:value={newConta.titulo}
          required
        />
      </div>
      <!-- <CurrencyInput bind:value={newConta.valor_conta} /> -->
      <div class="form-control">
        <label for="valor" class="label">
          <span class="label-text">Valor</span>
        </label>

        <CurrencyInput bind:value={newConta.valor_conta} />
      </div>
      <div class="form-control">
        <label for="expire_at" class="label">
          <span class="label-text">Data de vencimento</span>
        </label>
        <input
          id="expire_at"
          type="date"
          class="input input-bordered w-full"
          min={df.format(new Date())}
          onchange={e => {
            const v = (e.target as HTMLInputElement).value
            const dateV = new Date(v + 'T00:00:00')
            newConta.expire_at = dateV
          }}
          required
        />
      </div>
      <div class="form-control">
        <label for="fornecedor" class="label">
          <span class="label-text">Fornecedor</span>
        </label>
        <select
          id="fornecedor"
          bind:value={newConta.fornecedor_id}
          class="select select-bordered w-full"
          required
        >
          <option disabled value={0}>Selecione um fornecedor</option>
          {#each data.fornecedores as fornecedor}
            <option value={fornecedor.id}>{fornecedor.name}</option>
          {/each}
        </select>
      </div>
    </div>
    <div class="form-control">
      <label for="descricao" class="label">
        <span class="label-text">Observações</span>
      </label>
      <textarea
        id="descricao"
        class="textarea textarea-bordered h-24"
        placeholder="Observações"
        bind:value={newConta.descricao}
      ></textarea>
    </div>
    <div class="grid grid-cols-1 items-center gap-4 md:grid-cols-2">
      <div class="form-control">
        <label for="categoria" class="label">
          <span class="label-text">Categoria</span>
        </label>
        <select
          id="categoria"
          bind:value={newConta.categoria_id}
          class="select select-bordered w-full"
          required
        >
          <option disabled value={0}>Selecione uma categoria</option>
          {#each data.categorias as categoria}
            <option value={categoria.id}>{categoria.nome}</option>
          {/each}
        </select>
      </div>
      <div class="form-control flex items-center">
        <label class="label cursor-pointer">
          <span class="label-text mr-4">Marcar como pago</span>
          <input
            type="checkbox"
            class="toggle toggle-primary"
            bind:checked={newConta.isPaid}
          />
        </label>
      </div>
    </div>
    <button
      class="btn btn-primary mt-2 w-full"
      onclick={createConta}
      disabled={isLoading}
    >
      Criar conta
    </button>
  </div>

  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<style>
  .bgg {
    background-color: oklch(var(--b2)) !important;
  }
</style>
