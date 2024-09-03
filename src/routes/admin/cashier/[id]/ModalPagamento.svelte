<script lang="ts">
  import CurrencyInput from '$lib/components/input/CurrencyInput.svelte'
  import Loading from '$lib/components/Loading.svelte'
  import { Modal } from '$lib/components/modal'
  import type { RouterOutputs } from '$trpc/router'

  export let total_pedido = 0

  export let cliente_selecionado:
    | RouterOutputs['customer']['getCustomers'][0]
    | null = null

  export let realizarPedido = (
    metodo_pagamento: string,
    status_pagamento: string,
    isChecked:boolean,
    valor_recebido:number
  ) => {}

  let valor_recebido = 0

  let metodo_pagamento = ''

  let isPago = false

  let isDinheiro = false

  let troco = 0

  $: troco = valor_recebido - total_pedido

  let isLoading = false

  let isChecked = false

</script>

<Modal title="Pagamento">
  {#if isLoading}
    <div class="flex items-center justify-center">
      <Loading />
    </div>
  {:else}
    <div class="my-3">
      <div class=" my-3 flex flex-col items-center justify-center gap-3">
        {#if cliente_selecionado}
          <button
            class="btn btn-primary w-full"
            on:click={() => {
              isLoading=true
              realizarPedido('fiado', 'PENDING',isChecked,valor_recebido)
            }}
          >
            FIADO
          </button>
        {/if}
        <button
          class="btn btn-primary w-full"
          on:click={() => {
            ;(isPago = true), (isDinheiro = false)
          }}
        >
          PAGO
        </button>
        {#if isPago}
          <select
            class="select select-bordered w-full"
            bind:value={metodo_pagamento}
          >
            <option disabled selected>Qual foi o metodo?</option>
            <option value="credit_card">Cartão de crédito</option>
            <option value="debit_card">Cartão de debito</option>
            <option value="pix">Pix</option>
            <option value="dinheiro">Dinheiro</option>
          </select>
          <button
            class="btn btn-accent w-full"
            on:click={() => {
              isLoading=true
              realizarPedido(metodo_pagamento, 'CONFIRMED',isChecked,valor_recebido)

            }}
            disabled={metodo_pagamento === ''}
          >
            CONFIRMAR
          </button>
          <hr class="w-full bg-base-300" />
        {/if}
        <button
          class="btn btn-primary w-full"
          on:click={() => {
            isDinheiro = true
            isPago = false
          }}
        >
          DINHEIRO
        </button>

        {#if isDinheiro}
          <div class="flex w-full items-center justify-center gap-4">
            <label class="form-control w-full gap-2">
              <div class="label">
                <span class="label-text">Valor recebido:</span>
                <span class="label-text-alt">(Valor pago pelo cliente)</span>
              </div>
              <CurrencyInput bind:value={valor_recebido} />
              <button
                class="btn btn-accent"
                on:click={() => {
                  isLoading=true
                  realizarPedido('dinheiro', 'CONFIRMED',isChecked,valor_recebido)
                }}
                disabled={total_pedido >= valor_recebido}
              >
                CONFIRMAR
              </button>
            </label>
          </div>
          {#if valor_recebido && valor_recebido >= total_pedido}
            <h1 class="font-lg">
              Troco do cliente: <span class="font-bold">
                R${(troco / 100).toFixed(2)}
              </span>
            </h1>
          {/if}
        {/if}
        <div class="flex gap-2">
          Deseja finalizar este pedido?
          <input type="checkbox" class="checkbox checkbox-primary" on:change={()=> (isChecked = !isChecked)}/>
        </div>
      </div>
    </div>
  {/if}
</Modal>
