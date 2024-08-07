<script lang="ts">
  import type { PageData } from './$types'
  import Cardapio from '$lib/components/Cardapio.svelte'

  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'

  import type { RouterOutputs } from '$trpc/router'

  import { modal } from '$modal'
  import ModalCliente from './ModalCliente.svelte'

  import { getCartContext } from '$lib/stores/cart'

  const cart = getCartContext()

  export let data: PageData

  let { caixa, user, products } = data

  let isOpenModal: HTMLDialogElement | null = null

  let tipo_preco: 'retail_price' | 'wholesale_price' = 'retail_price'

  let observacao: string = ''

  let clienteSelecionado: RouterOutputs['customer']['getCustomers'][0] | null =
    null

  $: total = $cart.reduce((acc, item) => {
    return acc + item.item[tipo_preco] * item.quantity
  }, 0)

  async function createOrder() {
    try {
      const resp = await trpc($page).customer.insertOrder.mutate({
        order_info: {
          customer_id: clienteSelecionado?.id,
          address_id: clienteSelecionado?.adresses[0].id,
          total,
          distribuidora_id: caixa.distribuidora_id,
          observation: observacao,
          payment_method: 'dinheiro',
        },

        order_items: $cart.map(item => ({
          product_id: item.item.id,
          quantity: item.quantity,
          price: item.item[tipo_preco],
        })),
      })
    } catch (error) {}
  }

  function handleSelectClient() {
    modal.open(ModalCliente, {
      selectedClient: client => {
        clienteSelecionado = client
      },
    })
  }
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
      {#if clienteSelecionado}
        <div class="flex items-center justify-between">
          <p class="font-bold">{clienteSelecionado.name}</p>
          <button
            class="btn btn-primary"
            on:click={() => (clienteSelecionado = null)}
          >
            Desvincular
          </button>
        </div>
      {:else}
        <button
          class="btn btn-outline w-full disabled:bg-opacity-50"
          on:click={handleSelectClient}
        >
          <span class="mr-1">Vincular compra a um cliente</span>
        </button>
      {/if}
      <button class="btn btn-primary w-full disabled:bg-opacity-50">
        <span class="mr-1">CANCELAR</span>
      </button>
    </div>
  </div>

  <div class="col-auto rounded-lg border-4 border-opacity-50 p-4">
    <ul class="mb-4 text-center text-lg">
      {#each $cart as item}
        <div class="flex justify-center">
          <li class="py-2 font-bold">
            ({item.quantity}x)
            {item.item.name}

            <span class="text-green-500">R${item.item[tipo_preco]}</span>
          </li>
          <button class="px-2" on:click={e => cart.removeItem(item.item.id)}>
            <!-- todo: add icon -->
            del
          </button>
        </div>
        <hr />
      {/each}
    </ul>
    <h2 class="mx-10 flex justify-center text-3xl font-bold">
      Preco total:&nbsp;
      <span class="text-green-500">R${total}</span>
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
        bind:value={observacao}
        placeholder="Anotar observacões..."
        class="textarea textarea-bordered textarea-lg mb-5 w-full"
      ></textarea>
    </div>
    <div class="flex flex-col gap-2">
      <button class="btn btn-primary w-full disabled:bg-opacity-50">
        <span class="mr-1">IMPRIMIR</span>
      </button>
      <button
        class="btn btn-primary w-full disabled:bg-opacity-50"
        on:click={createOrder}
      >
        <span class="mr-1">PAGAMENTO</span>
      </button>
    </div>
  </div>
</div>

<!-- <pre>{JSON.stringify(data, null, 2)}</pre> -->

<dialog class="modal" bind:this={isOpenModal}>
  <div class="modal-box max-w-full">
    <Cardapio data={products}>
      {#snippet card(p)}
        <div class="card bg-base-200 p-1">
          <h2>{p.name}</h2>
          <p>{p.description}</p>

          <div class="flex gap-3">
            {#each p.items as item}
              <!-- TODO: make better card with + and - but -->
              <button
                class="btn btn-primary"
                on:click={() =>
                  cart.addItem({
                    item: item,
                    quantity: 1,
                  })}
              >
                {item.name}
              </button>
            {/each}
          </div>
        </div>
      {/snippet}
    </Cardapio>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
