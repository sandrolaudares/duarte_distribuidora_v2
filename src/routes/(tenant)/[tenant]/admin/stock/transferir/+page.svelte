<script lang="ts">
  import type { PageData } from './$types'
  import Cardapio from '$lib/components/Cardapio.svelte'
  import { icons } from '$lib/utils'

  import { getImagePath } from '$lib/utils/image'
  import type { SelectProductItem } from '$lib/server/db/schema'
  import { enhance } from '$app/forms'
  import Success from '$lib/components/transfer/success.svelte'

  export let data: PageData
  export let form

  type Cart = Record<
    SelectProductItem['id'],
    {
      item: SelectProductItem
      quantity: number
      is_retail?: boolean
    }
  >

  let products = data.products
  let cart: Cart = {}

  let searchTerm = ''

  $: {products = data.products.filter(product =>
  product.name.toLowerCase().includes(searchTerm.toLowerCase())
  )}

  $:console.log(products)

  function addItem(input: { item: SelectProductItem; quantity: number }) {
    const existing = cart[input.item.id]

    if (existing) {
      existing.quantity += input.quantity
    } else {
      cart[input.item.id] = {
        item: input.item,
        quantity: input.quantity,
      }
    }

    cart = {...cart}
    return cart
  }

  function removeItem(item_id: number) {
    delete cart[item_id]
    cart = {...cart}
    return cart
  }

  function setItem(input: { item: SelectProductItem; quantity: number }) {
        cart[input.item.id] = {
          item: input.item,
          quantity: input.quantity,
        }
        cart = {...cart}
        return cart
    }

let isLoading = false
</script>

<div class="container mx-auto max-w-7xl p-4">

  {#if form?.success}
  <div class="flex justify-center mt-20">
    <Success transferDetails={form.result[0]} tenant={data.tenant!}/>
  </div>
  {:else}
  <h1 class="mb-6 text-center text-3xl font-bold">
    Solicitar estoque para central
  </h1>

  <div class="flex flex-col gap-6 lg:flex-row">
    <div class="lg:w-2/3">
      <div
        class="max-h-[80vh] overflow-auto rounded-lg bg-base-200 p-6 shadow-md"
      >
      <div class="flex justify-between">
        <h2 class="mb-4 text-xl font-semibold">
          Escolha produtos para solicitar transferencia
        </h2>
        <input type="text" placeholder="Procurar..." class="input input-bordered max-w-xs" bind:value={searchTerm}/>
      </div>

        <div class="max-h-[calc(100vh-300px)] space-y-2 overflow-y-auto pr-2">
          <!-- <Cardapio data={products}>
            {#snippet card(p)} -->
              <div class="card w-full p-1">
                <div class="grid grid-cols-1 gap-3">
                  {#each products as item}
                    {@const cartItem = cart[item.id]}
                    <hr />
                    <div class="flex w-full">
                      <div class=" hidden flex-none md:block md:w-auto">
                        <img
                          alt="imagem"
                          src={getImagePath(item.image)}
                          class="h-10 w-10 rounded-lg object-cover md:h-16 md:w-16"
                        />
                      </div>
                      <div class="ml-4 w-full">
                        <h2 class="font-bold md:text-xl">{item.name}</h2>
                        <h3 class="md:text-md">
                          Em estoque: <strong>{item.sku?.quantity}</strong>
                        </h3>
                      </div>
                      <div class="w-full text-right">
                        <div
                          class="flex items-center justify-end gap-3 text-center"
                        >
                          <button
                            class="btn btn-primary hidden md:block"
                            on:click={() => {
                              if (cartItem.quantity <= 1) {
                                removeItem(item.id)
                              } else {
                                addItem({
                                  item: item,
                                  quantity: -1,
                                })
                              }
                            }}
                          >
                            {@html icons.minus()}
                          </button>

                          <input
                            min="1"
                            class="max-w-16 bg-base-200 text-right text-xl font-bold focus:border-yellow-500 md:min-w-10 md:max-w-28"
                            value={cartItem?.quantity ?? 0}
                            on:input={e => {
                              const quant_temp = (e.target as HTMLInputElement)?.value
                              setItem({
                                item: item,
                                quantity: Number(quant_temp),
                              })
                            }}
                          />
                          <button
                            on:click={() =>
                              addItem({
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
            <!-- {/snippet}
          </Cardapio> -->
        </div>
      </div>
    </div>
    <div class="space-y-6 lg:w-1/3">
      <div class="rounded-lg bg-base-200 p-6 shadow-md">
        <h2 class="mb-4 text-xl font-semibold">Produtos à solicitar</h2>
        {#if Object.values(cart).length > 0}
          <ul class="space-y-2">
            {#each Object.values(cart) as product}
              <li class="flex justify-between items-center">
                <span>{product.item.name}</span>
                <span class="font-semibold">Qnt: {product.quantity}</span>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="text-gray-500">Nenhum produto</p>
        {/if}
      </div>
      <form method="post" use:enhance={({formData})=>{
        isLoading = true
         formData.set('data', JSON.stringify(Object.values(cart).map(product => ({
            sku: product.item.sku,
            sku_name: product.item.name,
            status: 'REQUESTED',
            fromTenantId: null,
            toTenantId: data.tenant?.tenantId,
            quantity: product.quantity,
            meta_data:{
              todo:'TODO'
            }
      }))))
        return async ({ update }) => {
            await update()
            isLoading = false
            cart = {}
        }
      }}>
        <button
          type="submit"
          class="btn btn-primary w-full transition duration-150 ease-in-out focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isLoading || Object.values(cart).length ===0}
        >
        {isLoading?'Solicitando...':'Solicitar transferência'}
        </button>
      </form>
      {#if form?.error}
        <p class="text-error text-center">{form.message}</p>
      {/if}

    </div>
  </div>
  {/if}
</div>

<style>
  /* Custom scrollbar styles for Webkit browsers */
  .overflow-y-auto::-webkit-scrollbar {
    width: 8px;
  }

  .overflow-y-auto::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
</style>
