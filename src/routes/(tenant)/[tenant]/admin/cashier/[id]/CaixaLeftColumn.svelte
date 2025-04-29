<script lang="ts">
  import ModalEndereco from '$lib/components/cashierComponents/ModalEndereco.svelte'
  import ModalCliente from './ModalCliente.svelte'
  import { modal } from '$lib/components/modal'
  // import { getCartContext } from '$lib/stores/cart'
  import { icons } from '$lib/utils/icons'
  import type { RouterOutputs } from '$trpc/router'
  import ModalMotoboy from '$lib/components/cashierComponents/ModalMotoboy.svelte'
  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'
  import { toast } from 'svelte-sonner'
  import { onMount } from 'svelte'
  import CurrencyInput from '$lib/components/input/CurrencyInput.svelte'
  import Loading from '$lib/components/Loading.svelte'
  import UsedCredits from '$lib/components/UsedCredits.svelte'
  import AvailableCredits from '$lib/components/AvailableCredits.svelte'
  import CustomerInfo from '$lib/components/cards/CustomerInfo.svelte'
  import { getCartContext } from '$lib/state/contextCashier/cartContext.svelte'
  import type { SelectUser } from '$lib/server/db/schema'
  import { getDistance } from '$lib/utils/distance'
  import Alert from '$lib/components/modal/base/Alert.svelte'

  // export let tipo_preco: 'retail_price' | 'wholesale_price' = 'retail_price'

  let {
    tipo_preco = $bindable('retail_price'),
    user,
    fee = 0,
  }: {
    tipo_preco: 'retail_price' | 'wholesale_price'
    fee: number
    user: SelectUser | null
  } = $props()

  // export let user

  const cart = getCartContext()

  // export let fee = 0

  function handleSelectClient() {
    modal.open(ModalCliente, {
      selectedClient: client => {
        cart.meta.clienteSelecionado = client
        modal.open(ModalEndereco, {
          addresses: client.adresses,
          customer_id: cart.meta.clienteSelecionado.id,
          selectedAddress: async (address) => {
            cart.meta.enderecoSelecionado = address
            console.log(address)
            try {
              cart.meta.taxaEntrega = await getDistance(cart.meta.enderecoSelecionado,fee)
            } catch (error: any) {
              toast.error(error.message)
            }
          },
        })
        if (cart.meta.clienteSelecionado.is_retail) {
          tipo_preco = 'retail_price'
        } else {
          tipo_preco = 'wholesale_price'
        }
      },
    })
  }

  function handleSelectMotoboy() {
    modal.open(ModalMotoboy, {
      selectedMotoboy: motoboy => {
        cart.meta.motoboySelecionado = motoboy
      },
    })
  }
  function toggleDelivery() {
    cart.meta.isDelivery = !cart.meta.isDelivery

    if (!cart.meta.isDelivery) {
      cart.meta.motoboySelecionado = null
    }
  }

  let distance = $state(0)

  let isLoading = $state(false)

  $effect(() => {
    if (cart.meta.enderecoSelecionado) {
      cart.meta.isDelivery = true
    }
  })

  $inspect(cart.meta)
</script>

<div class="flex h-auto flex-col-reverse justify-between md:flex-col">
  <h2 class="mb-2 hidden text-3xl font-bold md:block">
    Informações do pedido:
  </h2>
  <!-- <p>
      Número do pedido: <span class="font-bold text-primary">
        #{caixa.id}
      </span>
    </p> -->
  <p>
    Criado por: <span class="font-bold text-success">{user?.email}</span>
  </p>
  <div>
    <div class="mt-2 flex w-full flex-col lg:flex-row">
      <div class="grid flex-grow place-items-center">
        <button
          class="btn btn-primary w-full"
          onclick={() => {
            tipo_preco = 'retail_price'
            Object.values(cart.cart).forEach(cartItem => {
              cartItem.meta.is_retail = true
            })
            console.log(cart)
          }}
          disabled={tipo_preco === 'retail_price' ||
            Object.values(cart.cart).length >= 1}
        >
          Varejo
        </button>
      </div>
      <div class="divider lg:divider-horizontal">OU</div>
      <div class="grid flex-grow place-items-center">
        <button
          class="btn btn-primary w-full"
          onclick={() => {
            tipo_preco = 'wholesale_price'
            Object.values(cart.cart).forEach(cartItem => {
              cartItem.meta.is_retail = false
            })
          }}
          disabled={tipo_preco === 'wholesale_price' ||
            Object.values(cart.cart).length >= 1}
        >
          Atacado
        </button>
      </div>
    </div>
  </div>
  <div class="mt-2 flex flex-col-reverse gap-2 md:flex-col">
    <div class="flex justify-center">
      {#if cart.meta.clienteSelecionado}
        <CustomerInfo
          {distance}
          {isLoading}
          desvincular={() => {
            cart.clearMeta()
            distance = 0
          }}
        >
          <AvailableCredits
            customer={cart.meta.clienteSelecionado}
            max_credit={cart.meta.clienteSelecionado.max_credit}
          />
        </CustomerInfo>
      {:else}
        <button
          class="btn btn-outline w-full disabled:bg-opacity-50"
          onclick={handleSelectClient}
        >
          <span class="mr-1">Vincular compra a um cliente</span>
        </button>
      {/if}
    </div>
    <div class="my-1 flex flex-col items-center justify-center gap-1">
      {#if cart.meta.clienteSelecionado && cart.meta.enderecoSelecionado}
        <div class="flex items-center justify-center gap-3">
          <h1>É um pedido delivery?</h1>
          <input
            type="checkbox"
            class="toggle toggle-success"
            checked={cart.meta.isDelivery}
            onclick={toggleDelivery}
          />
        </div>
      {/if}
      {#if cart.meta.isDelivery && cart.meta.clienteSelecionado}
        {#if cart.meta.motoboySelecionado}
          <div class="m-2 flex w-full items-center justify-center gap-3">
            <p class="flex flex-col">
              <span>
                Motoboy: <strong>
                  {cart.meta.motoboySelecionado.username}
                </strong>
              </span>
            </p>
            <button
              class="btn btn-accent btn-sm"
              onclick={() => {
                cart.meta.motoboySelecionado = null
                cart.meta.isDelivery = false
              }}
            >
              Desvincular
            </button>
          </div>
        {:else}
          <button class="btn btn-outline w-full" onclick={handleSelectMotoboy}>
            Selecione o motoboy
          </button>
        {/if}
      {/if}
    </div>
    <button
      class="btn btn-primary w-full disabled:bg-opacity-50"
      onclick={() => {
        modal.open(Alert,{
          onConfirm() {
            cart.clear()
          },
          title: 'Tem certeza que deseja cancelar?',
          text: 'Essa ação irá limpar todas informações, incluido items do carrinho, cliente e endereço.',
        })
      }}
    >
      <span class="mr-1">CANCELAR</span>
      {@html icons.x()}
    </button>
  </div>
</div>
