<script lang="ts">
  import { onMount } from 'svelte'
  import { navigating } from '$app/stores'
  import { SSRFilters } from '$lib/components/datatable/filter.svelte'
  import { fade, slide, fly } from 'svelte/transition'
  import type { PageData } from './$types'
  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'
  import * as Dialog from '$lib/components/ui/dialog/index'

  import { TableHandler } from '@vincjo/datatables/server'
  import CurrencyInput from '$lib/components/input/CurrencyInput.svelte'
  import NoResults from '$lib/components/NoResults.svelte'
  import type {
    SelectConta,
    SelectSupplier,
    SelectTipoPagamento,
  } from '$lib/server/db/schema'
  import { toast } from 'svelte-sonner'
  import { invalidate, invalidateAll } from '$app/navigation'
  import DateFilter from '$lib/components/DateFilter.svelte'
  import * as Select from '$lib/components/ui/select/index'
  import { pageConfig } from '$lib/config'
  import { DateFormatter } from '@internationalized/date'
  import SelectSearch from '$lib/components/selectSearch.svelte'
  import TableConta from './TableConta.svelte'
  import Separator from '$lib/components/ui/separator/separator.svelte'

  let { data }: { data: PageData } = $props()

  const filters = new SSRFilters()

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
    pagamento_id: 0,
    paid_at: new Date(),
  }
  let isLoading = $state(false)
  async function createConta() {
    isLoading = true

    const parseValue = (value: any, errorMessage: string) => {
      if (value != null) {
        const parsedValue = Number(value)
        if (isNaN(parsedValue)) {
          toast.error(errorMessage)
          isLoading = false
          return
        }
        return parsedValue
      }
      return
    }

    const parsedTipoPagamentoId = parseValue(
      selectedPagamento,
      'Tipo de pagamento inválido',
    )
    const parsedSupplierId = parseValue(selectedSupplier, 'Fornecedor inválido')
    const parsedCategoryId = parseValue(selectedCategory, 'Categoria inválida')

    try {
      await trpc($page).contas.insertConta.mutate({
        valor_conta: newConta.valor_conta,
        expire_at: newConta.expire_at,
        descricao: newConta.descricao,
        titulo: newConta.titulo,
        isPaid: newConta.isPaid,
        fornecedor_id: parsedSupplierId,
        categoria_id: parsedCategoryId,
        pagamento_id: parsedTipoPagamentoId,
      })
      await invalidateAll()
      toast.success('Sucesso ao criar conta')
      table.rows = data.rows
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      isLoading = false
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
    }
  }

  let messageTipoPag = $state('')
  let nameTipoPag = $state('')
  async function createTipoPag() {
    isLoading = true
    try {
      await trpc($page).contas.insertTipoPagamento.mutate({
        nome: nameTipoPag,
      })
      await invalidateAll()
      toast.success('Sucesso ao criar tipo de pagamento')
      messageTipoPag = 'Successo ao criar tipo de pagamento!'
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      isLoading = false
    }
  }

  const paidFilter = table.createFilter('isPaid')

  const filtersPaid = [
    { value: 'todos', label: 'Todos' },
    { value: 'paid', label: 'Pagos' },
    { value: 'unpaid', label: 'Não pagos' },
  ]

  const triggerContent = $derived(
    filtersPaid.find(f => f.value === paidFilter.value)?.label ??
      'Selecione...',
  )

  let selectedCategory: string = $state('')

  const categoryConfig = {
    value: (item: { id: number; nome: string }) => String(item.id),
    label: (item: { id: number; nome: string }) => item.nome,
  }

  let selectedSupplier: string = $state('')

  const supplierConfig = {
    value: (item: SelectSupplier) => String(item.id),
    label: (item: SelectSupplier) => item.name,
  }

  let selectedPagamento: string = $state('')

  const pagamentoConfig = {
    value: (item: SelectTipoPagamento) => String(item.id),
    label: (item: SelectTipoPagamento) => item.nome,
  }
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
      <Dialog.Root>
        <Dialog.Trigger>
          <button class="btn btn-primary">Criar nova conta</button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Nova Conta</Dialog.Title>
          </Dialog.Header>
          <div>
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
                <SelectSearch
                  placeholder="o fornecedor"
                  options={data.fornecedores}
                  config={supplierConfig}
                  bind:value={selectedSupplier}
                />
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
            <div
              class="mt-2 grid grid-cols-1 items-center gap-4 md:grid-cols-2"
            >
              <div class=" form-control">
                <SelectSearch
                  placeholder="categoria"
                  bind:value={selectedCategory}
                  options={data.categorias}
                  config={categoryConfig}
                />
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
            <div class="mt-2">
              <SelectSearch
                placeholder="tipo de pagamento"
                bind:value={selectedPagamento}
                options={data.tipoPagamentoConta}
                config={pagamentoConfig}
              />
            </div>
            <button
              class="btn btn-primary mt-2 w-full"
              onclick={createConta}
              disabled={isLoading}
            >
              Criar conta
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Root>

      <div class="inline-block w-0.5 self-stretch bg-base-100"></div>
      <input
        type="text"
        bind:value={nameCat}
        class="input input-bordered max-w-[200px]"
        placeholder="Nova categoria"
      />
      <button
        class="btn btn-secondary"
        onclick={createCategoria}
        disabled={isLoading || nameCat === ''}
      >
        Confirmar nova categoria
      </button>

      <div class="inline-block w-0.5 self-stretch bg-base-100"></div>

      <input
        type="text"
        bind:value={nameTipoPag}
        class="input input-bordered max-w-[200px]"
        placeholder="Tipo de pagamento"
      />
      <button
        class="btn btn-secondary"
        onclick={createTipoPag}
        disabled={isLoading || nameTipoPag === ''}
      >
        Novo pagamento
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
        <Select.Trigger class="h-full w-[180px]">
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

  <TableConta {table} />

  <div
    class="mt-6 flex items-center justify-between rounded-lg bg-gray-100 p-4 shadow"
  >
    <h2 class="text-xl font-semibold text-gray-800">Total das contas:</h2>
    <span class="text-2xl font-bold text-success">
      R${(data.totalSum / 100).toFixed(2)}
    </span>
  </div>
</div>
