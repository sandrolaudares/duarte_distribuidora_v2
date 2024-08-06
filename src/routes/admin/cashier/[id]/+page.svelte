<script lang="ts">
  import type { PageData } from './$types'
  import Cardapio from '$lib/components/Cardapio.svelte'

  export let data: PageData

  let caixa = data.caixa
  let user = data.user

  let isOpenModal: HTMLDialogElement | null = null
</script>

<div class="flex flex-col justify-center gap-4 xl:flex-row">
  <div class="flex h-auto flex-col justify-between">
    <h2 class="text-3xl font-bold">Informações do pedido:</h2>
    <!-- <div
        class={`mt-5 w-full rounded-lg px-3 py-1 text-center font-bold text-white  ${caixa.status == 'aberto' ? 'success-bg' : 'bg-red-500'}`}
      >
        {caixa.status == 'aberto' ? 'Em aberto' : 'Fechado'}
      </div> -->
    <div class="mt-4">
      <p>
        Número do pedido: <span class="font-bold text-primary">
          #{caixa.id}
        </span>
      </p>
      <p>Pedido iniciado: 25/08/2024</p>
      <p>
        Criado por: <span class="font-bold text-primary">
          {user?.email}
        </span>
      </p>
    </div>
    <div class="flex flex-col gap-2">
      <button class="btn btn-outline w-full disabled:bg-opacity-50">
        <span class="mr-1">Vincular compra a um cliente</span>
      </button>
      <button class="btn btn-primary w-full disabled:bg-opacity-50">
        <span class="mr-1">CANCELAR</span>
      </button>
    </div>
  </div>

  <div class="col-auto rounded-lg border-4 border-opacity-50 p-4">
    <ul class="mb-4 text-center text-lg">
      <!-- {#each $pedidoStore as item}
          <div class="flex justify-center">
            <li class="py-2 font-bold">
              ({item.quantidade}x)
              {item.nome}
  
              <span class="text-green-500"
                >R${formatM(item.unidade_em_cents * item.quantidade)}</span
              >
            </li>
            <button
              class="px-2"
              on:click={(e) =>
                pedidoStore.removeTodosItemPedido(item.var_produto_id)}
              ><X /></button
            >
          </div>
          <hr />
        {/each} -->
    </ul>
    <h2 class="mx-10 flex justify-center text-3xl font-bold">
      Preco total:&nbsp;
      <span class="text-green-500">R$</span>
    </h2>
  </div>

  <div class="col-auto flex h-auto w-96 flex-col justify-between gap-2">
    <div>
      <button
        class="btn btn-primary w-full"
        on:click={() => isOpenModal?.showModal()}
      >
        ACESSAR PRODUTOS
      </button>
      <p class="mb-2 mt-4">Observações sobre compra:</p>
      <textarea
        placeholder="Anotar observacões..."
        class="textarea textarea-bordered textarea-lg mb-5 w-full"
      ></textarea>
    </div>
    <div class="flex flex-col gap-2">
      <button class="btn btn-primary w-full disabled:bg-opacity-50">
        <span class="mr-1">IMPRIMIR</span>
      </button>
      <button class="btn btn-primary w-full disabled:bg-opacity-50">
        <span class="mr-1">PAGAMENTO</span>
      </button>
    </div>
  </div>
</div>

<pre>{JSON.stringify(data, null, 2)}</pre>

<dialog class="modal" bind:this={isOpenModal}>
  <div class="modal-box">
    <Cardapio data={data.products}>
      {#snippet card(product)}
        {JSON.stringify(product)}
        <div>
          <!--TODO:CARD-->
        </div>
      {/snippet}
    </Cardapio>
    <h3 class="text-lg font-bold">Hello!</h3>
    <p class="py-4">Press ESC key or click outside to close</p>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
