<script lang="ts">
  import type { SelectProductItem, SelectSku } from '$lib/server/db/schema'
  import { getImagePath, icons } from '$lib/utils'

  export let products
  export let cart: Cart
  export let searchTerm = ''

  type Cart = Record<
    SelectSku['sku'],
    {
      sku: SelectSku
      totalQuantity: number
      item: SelectProductItem
    }
  >

  function addItem(input: {
    quantity: number
    sku: SelectSku
    item: SelectProductItem
  }) {
    const existing = cart[input.sku.sku]

    if (existing) {
      existing.totalQuantity += input.quantity
    } else {
      cart[input.sku.sku] = {
        totalQuantity: input.quantity,
        sku: input.sku,
        item: input.item,
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
    item: SelectProductItem
  }) {
    cart[input.sku.sku] = {
      totalQuantity: input.quantity,
      sku: input.sku,
      item: input.item,
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
          {#each products as item}
            {@const cartItem = cart[item.sku!.sku]}
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
                <div class="flex items-center justify-end gap-3 text-center">
                  <button
                    class="btn btn-primary hidden md:block"
                    on:click={() => {
                      if (!item.sku) {
                        console.error('SKU is null')
                        return
                      }
                      if (cartItem.totalQuantity <= 1) {
                        removeItem(item.sku)
                      } else {
                        addItem({
                          item: item,
                          quantity: -1 * item.quantity,
                          sku: item.sku,
                        })
                      }
                    }}
                  >
                    {@html icons.minus()}
                  </button>

                  <input
                    min="1"
                    class="max-w-16 bg-base-200 text-right text-xl font-bold focus:border-yellow-500 md:min-w-10 md:max-w-28"
                    value={0}
                    on:input={e => {
                      if (!item.sku) {
                        console.error('SKU is null')
                        return
                      }
                      const quant_temp = (e.target as HTMLInputElement)?.value
                      setItem({
                        item: item,
                        quantity: Number(quant_temp),
                        sku: item.sku,
                      })
                    }}
                  />
                  <button
                    on:click={() => {
                      if (!item.sku) {
                        console.error('SKU is null')
                        return
                      }
                      addItem({
                        item: item,
                        quantity: 1 * item.quantity,
                        sku: item.sku,
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
