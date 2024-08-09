<script lang="ts">
  import CurrencyInput from '$lib/components/input/CurrencyInput.svelte'
  import type { PageData } from './$types'
  import Cardapio from '$lib/components/Cardapio.svelte'
  import { icons } from '$lib/utils/icons'
  import { getImagePath } from '$lib/utils/image'

  import { toast } from 'svelte-sonner'

  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'

  import type { RouterOutputs } from '$trpc/router'
  import { modal } from '$components/modal'
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

  $: total = Object.values($cart).reduce((acc, item) => {
    return acc + item.item[tipo_preco] * item.quantity
  }, 0)

  async function createOrder() {
    try {
      const resp = await trpc($page).customer.insertOrder.mutate({
        order_info: {
          customer_id: clienteSelecionado?.id,
          address_id: clienteSelecionado?.adresses[0].id,
          total: 50,
          distribuidora_id: caixa.distribuidora_id,
          observation: observacao,
          payment_method: 'dinheiro',
        },

        order_items: Object.values($cart).map(item => ({
          product_id: item.item.id,
          quantity: item.quantity,
          // price: item.item[tipo_preco],
          price: 12,
        })),
      })

      toast.info(JSON.stringify(resp))
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  function handleSelectClient() {
    modal.open(ModalCliente, {
      selectedClient: client => {
        clienteSelecionado = client

        if (clienteSelecionado.is_retail) {
          tipo_preco = 'retail_price'
        } else {
          tipo_preco = 'wholesale_price'
        }
      },
    })
  }

  let dinheiro_caixa = 0

  async function handleAbrirCaixa() {
    try {
      const resp = await trpc($page).distribuidora.abrirCaixa.mutate({
        id: caixa.id,
        data: {
          amount: dinheiro_caixa,
        },
      })

      console.log(resp)
      toast.success('Caixa aberto com sucesso!')
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  async function handleFecharCaixa() {
    const confirmacao = confirm('Você está prestes a fechar o caixa. Deseja continuar?');
    
    if (!confirmacao) {
        return;
    }
    try {
        const resp = await trpc($page).distribuidora.fecharCaixa.mutate({
            id: caixa.id,
            data: {
                amount: dinheiro_caixa,
            },
        });
        console.log(resp);
        toast.success('Caixa fechado com sucesso!');
        window.location.reload();
    } catch (error: any) {
        toast.error(error.message);
    }
}
  //TODO: endereco na hora de selecionar cliente
</script>
    <h1 class="text-center text-3xl font-semibold mb-3">Caixa:</h1>
{#if caixa.status === 'Fechado'}
  <div class="flex justify-center">
    <label class="form-control w-full max-w-xs gap-2">
      <div class="label justify-center">
        <span class="label-text">Digite o valor no caixa!</span>
      </div>
      <CurrencyInput bind:value={dinheiro_caixa} />
      <button class="btn btn-primary" on:click={handleAbrirCaixa}>Abrir caixa</button>
    </label>
  </div>
{:else}
<div class="flex justify-center gap-2 mb-3">
  <button class="btn btn-error" on:click={handleFecharCaixa}>Fechar caixa</button>
</div>
  <div class="mt-15 flex flex-col justify-center gap-4 md:flex-row m-4">
    <div class="flex h-auto md:flex-col flex-col-reverse justify-between">
      <h2 class="text-3xl font-bold hidden md:block">Informações do pedido:</h2>
      <div
        class={`mt-5 w-full rounded-lg px-3 py-1 text-center font-bold hidden md:block  ${
          caixa.status === 'Aberto' ? 'bg-success' : 'bg-error'
        }`}
      >
        {caixa.status === 'Aberto' ? 'Em aberto' : 'Fechado'}
      </div>
      <div class="mt-4">
        <p>
          Número do pedido: <span class="font-bold text-primary">
            #{caixa.id}
          </span>
        </p>
        <p>ID distribuidora {caixa.distribuidora_id}</p>
        <p>
          Criado por: <span class="font-bold text-primary">{user?.email}</span>
        </p>
      </div>
      <div class="flex md:flex-col flex-col-reverse  gap-2">
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
        <a
          href="/admin/cashier"
          class="btn btn-primary w-full disabled:bg-opacity-50"
        >
          <!--TODO: ao cancelar tem que resetar o que ta adicionado no "carrinho"-->
          <span class="mr-1">CANCELAR</span>
          {@html icons.x()}
        </a>
      </div>
    </div>

    <div
      class="col-auto rounded-lg border-4 border-secondary border-opacity-50 p-4"
    >
      <ul class="mb-4 text-center text-lg">
        {#each Object.values($cart) as item}
          <div class="flex justify-between">
            <li class="py-2 font-bold">
              ({item.quantity}x) {item.item.name}
              <span class="text-secondary">R${item.item[tipo_preco]}</span>
            </li>
            <button
              class="btn btn-circle"
              on:click={e => cart.removeItem(item.item.id)}
            >
              {@html icons.x({ stroke: 'red' })}
            </button>
          </div>
          <hr />
        {/each}
      </ul>
      <h2 class="mx-10 flex justify-center text-3xl font-bold">
        Preço total:&nbsp;
        <span class="text-primary">R${total}</span>
      </h2>
    </div>

    <div class="col-auto flex h-auto md:w-96 flex-col justify-between gap-2">
      <div>
        <button
          class="btn btn-primary w-full"
          on:click={() => isOpenModal?.showModal()}
        >
          ACESSAR PRODUTOS {@html icons.basket()}
        </button>
        <p class="mb-2 mt-4">Observações sobre compra:</p>
        <textarea
          bind:value={observacao}
          placeholder="Anotar observacões..."
          class="textarea textarea-bordered textarea-lg mb-5 w-full"
        ></textarea>
      </div>
      <div class="flex flex-col gap-2 ">
           <button class="btn btn-primary w-full disabled:bg-opacity-50 hidden md:block">
             <span class="mr-1">IMPRIMIR</span>
             {@html icons.print()}
           </button>
        <button
          class="btn btn-primary w-full disabled:bg-opacity-50"
          on:click={createOrder}
        >
          <span class="mr-1">PAGAMENTO</span>
          {@html icons.dolar()}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- <pre>{JSON.stringify(data, null, 2)}</pre> -->

<dialog class="modal" bind:this={isOpenModal}>
  <div class="modal-box max-w-4xl">
    <Cardapio data={products}>
      {#snippet card(p)}
        <div class="card w-full p-1">
          <div class="grid grid-cols-1 gap-3">
            {#each p.items as item}
              {@const cartItem = $cart[item.id]}

              <hr />
              <div class="flex w-full py-2">
                <div class=" flex-none md:w-auto hidden md:block">
                  <img
                    alt="imagem"
                    src={getImagePath(item.image)}
                    class="h-16 w-16 rounded-lg object-cover md:h-20 md:w-20"
                  />
                </div>
                <div class="ml-4 w-full">
                  <h2 class="md:text-xl font-bold">{item.name}</h2>
                  <h3 class="md:text-md text-secondary">{p.description}</h3>
                </div>
                <div class="w-full text-right">
                  <span class="block pb-3 text-xl font-bold">
                    R${item[tipo_preco]}
                  </span>
                  <div class="flex items-center justify-end gap-3 text-center">
                    {#if cartItem?.quantity >= 1}
                      <button
                        class="btn btn-primary hidden md:block"
                        on:click={() =>
                          cart.addItem({
                            item: item,
                            quantity: -1,
                          })}
                      >
                        {@html icons.minus()}
                      </button>
                    {/if}
                    <input
                      min="1"
                      class="md:min-w-10 md:max-w-28 max-w-16  bg-base-100 text-right text-xl font-bold focus:border-yellow-500"
                      value={$cart[item.id]?.quantity ?? 0}
                      on:change={e => {
                        const quant_temp = (e.target as HTMLInputElement)?.value
                        cart.setItem({
                          item: item,
                          quantity: Number(quant_temp),
                        })
                      }}
                    />
                    <button
                      on:click={() =>
                        cart.addItem({
                          item: item,
                          quantity: 1,
                        })}
                      class="btn btn-primary"
                    >
                      {@html icons.plus()}
                    </button>
                  </div>
                </div>
              </div>
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
