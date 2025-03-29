<script lang="ts">
  import CurrencyInput from '$lib/components/input/CurrencyInput.svelte'
  import SelectSearch from '$lib/components/selectSearch.svelte'
  import * as Dialog from '$lib/components/ui/dialog/index'
  import type { SelectConta } from '$lib/server/db/schema'
  import { DateFormatter } from '@internationalized/date'
  import { trpc } from '$trpc/client'
  import { page } from '$app/state'
  import { toast } from 'svelte-sonner'
  import { invalidateAll } from '$app/navigation'

//   type Props = {
//     table: TableHandler<PageData['rows'][0]>
//     data: PageData
//   }

//   let { table,data }: Props = $props()

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

  const df = new DateFormatter('pt-BR', {
    dateStyle: 'medium',
  })

  let selectedCategory: string = $state('')
  let selectedSupplier: string = $state('')
  let selectedPagamento: string = $state('')

  let isLoading = $state(false)
  let open = $state(false)

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
    open = false
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      isLoading = false
    }
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger>
    <button class="btn btn-primary btn-sm h-full">Criar nova conta</button>
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
            delegateQuery={trpc(page).stock.getSupplier.query}
            config={{ value: c => c.id, label: c => c.name }}
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
      <div class="mt-2 grid grid-cols-1 items-center gap-4 md:grid-cols-2">
        <div class=" form-control">
          <SelectSearch
            placeholder="categoria"
            delegateQuery={trpc(page).contas.getCategorias.query}
            config={{ value: c => c.id, label: c => c.nome }}
            bind:value={selectedCategory}
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
          placeholder="o tipo"
          delegateQuery={trpc(page).contas.getTipoPagamento.query}
          config={{ value: c => c.id, label: c => c.nome }}
          bind:value={selectedPagamento}
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
