<script lang="ts">
  import { onMount } from 'svelte'
  import { navigating } from '$app/state'
  import { SSRFilters } from '$lib/components/datatable/filter.svelte'
  import type { PageData } from './$types'
  import { trpc } from '$trpc/client'
  import { page } from '$app/state'
  import * as Dialog from '$lib/components/ui/dialog/index'

  import { TableHandler } from '@vincjo/datatables/server'
  import CurrencyInput from '$lib/components/input/CurrencyInput.svelte'
  import type {
    SelectConta,
  } from '$lib/server/db/schema'
  import { toast } from 'svelte-sonner'
  import { invalidate, invalidateAll } from '$app/navigation'
  import * as Select from '$lib/components/ui/select/index'
  import { pageConfig } from '$lib/config'
  import { DateFormatter } from '@internationalized/date'
  import SelectSearch from '$lib/components/selectSearch.svelte'
  import TableConta from './TableConta.svelte'
  import ModalCreate from './ModalCreate.svelte'
  import { formatCurrency } from '$lib/utils'

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

  const df = new DateFormatter('pt-BR', {
    dateStyle: 'medium',
  })

  table.setPage(Number(filters.get('page')) || 1)
  table.load(async s => {
    try {
      console.log(s)
      filters.fromState(s)
      await navigating?.complete
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
      await trpc(page).contas.insertConta.mutate({
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
      await trpc(page).contas.insertCategoria.mutate({
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
      await trpc(page).contas.insertTipoPagamento.mutate({
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
      'Filtrar...',
  )

  let selectedCategory: string = $state('')
  let selectedSupplier: string = $state('')
  let selectedPagamento: string = $state('')

  $effect(()=>{
    if(data.rows){
      table.rows = data.rows
    }
  })
</script>

<div class="m-2 h-full max-h-[calc(100vh-20vh)]">
  <!-- <h1 class="mb-6 text-3xl font-bold">Contas à pagar</h1> -->
  {#if messageCat}
    <p class="text-lg font-bold text-success">
      {messageCat}
    </p>
  {/if}

  <div class="mb-6 flex justify-between rounded-lg bg-base-200 p-2 shadow">
    <div class="flex gap-2 divide-x">
      
      <ModalCreate />

      <div class="inline-block w-0.5 self-stretch bg-base-100"></div>
      <input
        type="text"
        bind:value={nameCat}
        class="input input-bordered input-sm max-w-[200px] h-full"
        placeholder="Nova categoria"
      />
      <button
        class="btn btn-secondary btn-sm h-full"
        onclick={createCategoria}
        disabled={isLoading || nameCat === ''}
      >
        Confirmar nova categoria
      </button>

      <div class="inline-block w-0.5 self-stretch bg-base-100"></div>

      <input
        type="text"
        bind:value={nameTipoPag}
        class="input input-bordered input-sm h-full max-w-[200px]"
        placeholder="Tipo de pagamento"
      />
      <button
        class="btn btn-secondary btn-sm h-full"
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
    class="my-3 flex items-center justify-between rounded-lg bg-gray-100 p-2 shadow"
  >
    <h2 class="text-lg font-semibold text-gray-800">Total das contas:</h2>
    <span class="text-xl font-bold text-success">
      {formatCurrency(data.totalSum)}
    </span>
  </div>
</div>
