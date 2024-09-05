<script lang="ts">
  import { is } from 'drizzle-orm'
  import CurrencyInput from './input/CurrencyInput.svelte'

  export let total_pedido = 0

  let valor_recebido = 0

  let metodo_pagamento = ''
  
  let troco = 0
  
  let isPago = false
  let isDinheiro = false
  let isDiferent = false

  $: troco = valor_recebido - total_pedido
</script>

<div class="flex flex-col gap-3">
  {#if isDiferent || isPago || isDinheiro}
    <button
    class="btn btn-secondary"
      on:click={() => {
        isDiferent = false
        isPago = false
        isDinheiro = false
      }}
    >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-undo-2"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>
      Voltar
    </button>
    {:else}
    <h1 class="text-center mb-2 text-xl">Qual metodo de pagamento?</h1>
  {/if}

  {#if isDiferent}
    <div class="flex w-full flex-col lg:flex-row">
      <div
        class="card grid flex-grow place-items-center rounded-box bg-base-300"
      >
        <select class="select select-bordered w-full">
          <option value="">Dinheiro</option>
          <option value="">Dinheiro</option>
          <option value="">Dinheiro</option>
        </select>
      </div>
      <div class="divider lg:divider-horizontal"></div>
      <div
        class="card grid flex-grow place-items-center rounded-box bg-base-300"
      >
        <select class="select select-bordered w-full">
          <option value="">Dinheiro</option>
          <option value="">Dinheiro</option>
          <option value="">Dinheiro</option>
        </select>
      </div>
    </div>
  {:else if isPago}
  <div class="label">
    <span class="label-text">Selecione o metodo utilizado para pagar:</span>
  </div>
    <select class="select select-bordered w-full" bind:value={metodo_pagamento}>
      <option disabled selected>Qual foi o metodo?</option>
      <option value="credit_card">Cartão de crédito</option>
      <option value="debit_card">Cartão de debito</option>
      <option value="pix">Pix</option>
      <option value="dinheiro">Dinheiro</option>
    </select>
    <button class="btn btn-accent w-full" disabled={metodo_pagamento === ''}>
      CONFIRMAR
    </button>
    <hr class="w-full bg-base-300" />
  {:else if isDinheiro}
    <div class="flex w-full items-center justify-center gap-4">
      <label class="form-control w-full gap-2">
        <div class="label">
          <span class="label-text">Valor recebido:</span>
          <span class="label-text-alt">(Valor pago pelo cliente)</span>
        </div>
        <CurrencyInput bind:value={valor_recebido} />
        <button
          class="btn btn-accent"
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
  {:else}
    <button
      class="btn btn-primary"
      on:click={() => {
        isDiferent = !isDiferent
      }}
    >
      Varias formas de pagamento
    </button>
    <button class="btn btn-primary w-full">FIADO</button>
    <button
      class="btn btn-primary w-full"
      on:click={() => {
        ;(isPago = true), (isDinheiro = false)
      }}
    >
      PAGO
    </button>
    <button
      class="btn btn-primary w-full"
      on:click={() => {
        isDinheiro = true
        isPago = false
      }}
    >
      DINHEIRO
    </button>
  {/if}
</div>
