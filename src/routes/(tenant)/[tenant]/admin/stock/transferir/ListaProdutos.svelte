<script lang="ts">
  import type { SelectProductItem, SelectSku } from '$lib/server/db/schema'
  import { getImagePath, icons } from '$lib/utils'

  export let products:SelectSku[]
  export let cart: Cart
  export let searchTerm = ''

  type Cart = Record<
    SelectSku['sku'],
    {
      sku: SelectSku
      totalQuantity: number
    }
  >

  function addItem(input: {
    quantity: number
    sku: SelectSku
  }) {
    const existing = cart[input.sku.sku]

    if (existing) {
      existing.totalQuantity += input.quantity
    } else {
      cart[input.sku.sku] = {
        totalQuantity: input.quantity,
        sku: input.sku,
      }
    }

    cart = { ...cart }
    return cart
  }

  function removeItem(sku_id: SelectSku['sku']) {
    delete cart[sku_id]
    cart = { ...cart }
    return cart
  }

  function setItem(input: {
    quantity: number
    sku: SelectSku
  }) {
    cart[input.sku.sku] = {
      totalQuantity: input.quantity,
      sku: input.sku,
    }
    cart = { ...cart }
    return cart
  }
</script>

<div class="lg:w-2/3">
  <div class="max-h-[80vh] overflow-auto rounded-lg bg-base-200 p-6 shadow-md">
    <div class="flex justify-between">
      <h2 class="mb-4 text-xl font-semibold">
        Escolha produtos para solicitar transferencia
      </h2>
      <input
        type="text"
        placeholder="Procurar..."
        class="input input-bordered max-w-xs"
        bind:value={searchTerm}
      />
    </div>

    <div class="max-h-[calc(100vh-320px)] space-y-2 overflow-y-auto pr-2">
      <div class="card w-full p-1">
        <div class="grid grid-cols-1 gap-3">
          {#each products as skus}
            {@const cartItem = cart[skus.sku]}
            <hr />
            <div class="flex w-full">
              <div class=" hidden flex-none md:block md:w-auto">
                <img
                  alt="imagem"
                  src={getImagePath(skus.image)}
                  class="h-10 w-10 rounded-lg object-cover md:h-16 md:w-16"
                />
              </div>
              <div class="ml-4 w-full">
                <h2 class="font-bold md:text-xl">{skus.name}</h2>
                <h3 class="md:text-md">
                  Em estoque: <strong>{skus.quantity}</strong>
                </h3>
              </div>
              <div class="w-full text-right">
                <div class="flex items-center justify-end gap-3 text-center">
                  {#if cartItem?.totalQuantity >= 1}
                  <button
                    class="btn btn-primary hidden md:block"
                    on:click={() => {
                      if (cartItem.totalQuantity <= 1) {
                        removeItem(skus.sku)
                      } else {
                        addItem({
                          sku: skus,
                          quantity: -1,
                          
                        })
                      }
                    }}
                  >
                    {@html icons.minus()}
                  </button>
                  {/if}
                  <input
                    min="1"
                    class="max-w-16 bg-base-200 text-right text-xl font-bold focus:border-yellow-500 md:min-w-10 md:max-w-28"
                    value={cart[skus.sku]?.totalQuantity ?? 0}
                    on:input={e => {
                      const quant_temp = (e.target as HTMLInputElement)?.value
                      setItem({
                        quantity: Number(quant_temp),
                        sku: skus,
                      })
                    }}
                  />
                  <button
                    on:click={() => {
                      addItem({
                        quantity: 1,
                        sku: skus,
                      })
                    }}
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
    </div>
  </div>
</div>
