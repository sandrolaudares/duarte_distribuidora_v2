<script lang="ts">
  import CurrencyInput from '$lib/components/input/CurrencyInput.svelte'
  import { Modal } from '$lib/components/modal'
  import type { RouterOutputs } from '$trpc/router'

  export let total_pedido = 0

  export let cliente_selecionado:
    | RouterOutputs['customer']['getCustomers'][0]
    | null = null

  export let realizarPedido = (metodo_pagamento:string) => {}

  let isDinheiro = false

  let valor_recebido = 0

  let troco = 0

  $: troco = valor_recebido - total_pedido
</script>

<Modal title="Pagamento">
  <div class="my-3">
    <div class=" my-3 flex flex-col items-center justify-center gap-3">
      {#if cliente_selecionado}
        <button class="btn btn-primary w-full" on:click={()=>{realizarPedido('fiado')}}>FIADO</button>
      {/if}
      <button class="btn btn-primary w-full" on:click={()=>{realizarPedido('pago')}}>PAGO</button>
      <button
        class="btn btn-primary w-full"
        on:click={() => {
          isDinheiro = true
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
            <button class="btn btn-primary" on:click={()=>{realizarPedido('dinheiro')}} disabled={total_pedido >=valor_recebido}>CONFIRMAR</button>
          </label>
        </div>
        {#if valor_recebido && valor_recebido >= total_pedido}
          <h1 class="font-lg">
            Troco do cliente: <span class="font-bold">R${(troco/100).toFixed(2)}</span>
          </h1>
        {/if}
      {/if}
    </div>
  </div>
</Modal>
