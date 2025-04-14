<script lang="ts">
  import { modal, Modal } from '$lib/components/modal'
  import { cashierTransactionEnum } from '$lib/utils/permissions'
  import { trpc } from '$trpc/client'
  import CurrencyInput from '../input/CurrencyInput.svelte'
  import SelectSearch from '../selectSearch.svelte'
  import { page } from '$app/state'
  import { toast } from 'svelte-sonner'
  import Loading from '../Loading.svelte'

  let { caixa_id,handleInvalidate }: { caixa_id: number,handleInvalidate?:()=>void } = $props()

  let selectedType: 'Sangria' | 'Deposito' | 'Retirada' | '' = $state('')
  let qntRetirada = $state(0)
  let motivo = $state('')
  let isLoading = $state(false)

  $inspect(caixa_id)

  function delegateQuery() {
    return Promise.resolve(
      Array.from(cashierTransactionEnum).filter(
        v => !['Abertura', 'Fechamento', 'Pagamento'].includes(v),
      ),
    )
  }

  async function handleInsertTransaction() {
    isLoading = true
    if (!selectedType) {
      toast.error('Selecione o tipo de retirada/depósito')
      return
    }
    try {
      await trpc(page).distribuidora.inserirTransacao.mutate({
        caixa_id: caixa_id,
        type: selectedType,
        amount: qntRetirada,
        motivo,
      })
      toast.success('Sucesso ao realizar transação!')
      handleInvalidate?.()
    } catch (error:unknown) {
      toast.error(error.message)
    } finally {
      isLoading = false
      modal.close()
    }
  }
</script>

<Modal title="Sangria, retiradas e depósito">
  <div class="mt-4 flex flex-col">
    <label class="form-control">
      <div class="label">
        <span class="label-text">Selecione o tipo de retirada/depósito</span>
      </div>
      <SelectSearch
        placeholder="o tipo"
        {delegateQuery}
        config={{ value: c => c, label: c => c }}
        bind:value={selectedType}
      />
    </label>

    <label class="form-control">
      <div class="label">
        <span class="label-text">Quantidade para retirada/deposito</span>
      </div>
      <CurrencyInput bind:value={qntRetirada} />
    </label>
    <label class="form-control">
      <div class="label">
        <span class="label-text">Motivo:</span>
      </div>
      <textarea
        bind:value={motivo}
        class="textarea textarea-bordered h-24"
        placeholder="Digite o motivo..."
      ></textarea>
    </label>
    <button class="btn btn-primary mt-4" disabled={isLoading} onclick={handleInsertTransaction}>
      {#if isLoading}
        <Loading />
      {:else}
        Concluir!
      {/if}
    </button>
  </div>
</Modal>
