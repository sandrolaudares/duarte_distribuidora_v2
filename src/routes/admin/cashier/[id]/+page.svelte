<script lang="ts">
  import type { PageData } from './$types'
  import Cardapio from '$lib/components/Cardapio.svelte'

  export let data: PageData

  let caixa = data.caixa
  let user = data.user

  let isOpenModal: HTMLDialogElement | null = null
</script>

<div class="flex flex-col justify-center gap-4 xl:flex-row">
  <div class="col-auto flex h-auto flex-col justify-between">
    <div class="">
      <h2 class="text-3xl font-bold">Informações do pedido:</h2>
      <!-- <div
        class={`mt-5 w-full rounded-lg px-3 py-1 text-center font-bold text-white  ${caixa.status == 'aberto' ? 'success-bg' : 'bg-red-500'}`}
      >
        {caixa.status == 'aberto' ? 'Em aberto' : 'Fechado'}
      </div> -->
        <div class="mt-4">
          <p>
            Número do pedido <span class="font-bold text-primary">
              #{caixa.id}
            </span>
          </p>
          <p>Pedido iniciado {caixa.updated_at}</p>
          <p>
            Criado por: <span class="font-bold text-primary">
              {user?.email}
            </span>
          </p>
        </div>
    </div>
  </div>
  <div>
    <!-- {#if !cliente_selecionado}
        <ModalCliente
          {supabase}
          {clientes}
          on:cliente_selecionado={(e) => {
            const c = e.detail.cliente
            cliente_selecionado = c
          }}
        />
      {:else}
        <div class="mb-3 flex items-center justify-between text-center">
          <h1 class="rounded border-2 p-1 px-3">
            {cliente_selecionado.nome}
          </h1>
          <Button on:click={() => (cliente_selecionado = null)}>
            <span class="flex items-center justify-center gap-3 text-center"
              >Remover cliente <CircleX /></span
            >
          </Button>
        </div>
      {/if} -->
    <button class="w-full">
      <!-- <ButtonCardapio label={'CANCELAR'} Icon={Ban} href="#" /> -->
    </button>
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

  <div>
    <div class="mb-4">
      <!-- <ButtonCardapio label={'IMPRIMIR'} Icon={Printer} /> -->
    </div>
    <!-- <Dialog.Root
      onOpenChange={(e) => {
        if (!e) {
          dinheiro_recebido = '0'
          isDinheiro = false
        }
      }}
      bind:open={isOpen}
    >
      <Dialog.Trigger class="w-full">
        <button
          class="group flex w-full content-center items-center justify-center gap-2 rounded-lg bg-primary py-3 text-center font-semibold text-secondary-foreground shadow-sm transition ease-in-out hover:bg-yellow-300 disabled:bg-yellow-100"
          disabled={$pedidoStore.length === 0}
        >
          PAGAMENTO
          <DollarSign />
        </button></Dialog.Trigger
      >
      <Dialog.Content class=" overflow-hidden sm:min-w-[600px]">
        <Dialog.Header>
          <Dialog.Title>Qual foi a forma de pagamento?</Dialog.Title>
          <Dialog.Description>
            Selecione a forma de pagamento do cliente, Pedidos Fiado
            necessitam de credito do cliente
          </Dialog.Description>
          <div
            class=" my-3 flex flex-col items-center justify-center gap-3"
          >
            {#if cliente_selecionado}
              <button
                class="w-full"
                on:click={() => handleRealizarPedido('fiado')}
              >
                <ButtonCardapio label={'FIADO'} Icon={Handshake} />
              </button>
            {/if}
            <button class="w-full" on:click={() => handleRealizarPedido('pago')}>
              <ButtonCardapio label={'PAGO'} Icon={DollarSign} />
            </button>
            <button class="w-full" on:click={mudaStatus}>
              <ButtonCardapio label={'DINHEIRO'} Icon={HandCoins} />
            </button>
  
            {#if isDinheiro}
              <div class="flex w-full items-center justify-center gap-4">
                <Label for="troco" class="w-fit">Valor recebido:</Label>
                <input
                  class="flex h-9 w-fit rounded-md border border-gray-300 bg-transparent bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  type="number"
                  min={valor_pedido_in_cents}
                  use:mask={{
                    mask: 'money',
                  }}
                  bind:value={dinheiro_recebido}
                />
                <Button on:click={() => handleRealizarPedido('dinheiro')}
                  >CONFIRMAR</Button
                >
              </div>
              {#if dinheiro_recebido && Number(dinheiro_recebido) * 100 >= valor_pedido_in_cents}
                <h1 class="font-lg">
                  Troco do cliente: <span class="font-bold"
                    >R${formatM(troco_in_cents)}</span
                  >
                </h1>
              {/if}
            {/if}
          </div>
        </Dialog.Header>
      </Dialog.Content>
    </Dialog.Root> -->
  </div>
</div>

<pre>{JSON.stringify(data, null, 2)}</pre>

<button class="btn" on:click={() => isOpenModal?.showModal()}>
  open modal
</button>

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
