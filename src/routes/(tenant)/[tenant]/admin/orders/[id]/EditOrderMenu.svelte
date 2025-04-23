<script lang="ts">
  import { getImagePath } from '$lib/utils/image'
  import { icons } from '$lib/utils/icons'
  import Cardapio from '$lib/components/Cardapio.svelte'
  import type { RouterOutputs } from '$trpc/router'
  import { getCartContext } from '$lib/state/contextEditOrder/cartContext.svelte'
  import { formatCurrency } from '$lib/utils'

  let {
    products,
    tipo_preco = 'retail_price',
  }: {
    products: RouterOutputs['product']['queryCategorysWithProductItems']
    tipo_preco?: 'retail_price' | 'wholesale_price'
  } = $props()

  let filteredResults = $state(products)

  const cart = getCartContext()
</script>

<Cardapio
  data={filteredResults}
  onFilterChange={value => {
    filteredResults = products
      .map(product => {
        const filteredSubProducts = product.products.map(subProduct => {
          const filteredItems = subProduct.items.filter(item =>
            item.name.toLowerCase().includes(value),
          )
          return { ...subProduct, items: filteredItems }
        })

        return { ...product, products: filteredSubProducts }
      })
      .filter(product =>
        product.products.some(subProduct => subProduct.items.length > 0),
      )
  }}
>
  {#snippet card(p)}
    <div class="card w-full p-1 {p.items.length == 0 ? 'hidden' : ''}">
      <div class="grid grid-cols-1 gap-3">
        {#each p.items as item}
          {@const cartItem = cart.cart[item.id]}

          <hr />
          <div class="flex w-full py-2">
            <div class=" hidden flex-none md:block md:w-auto">
              <img
                alt="imagem"
                src={getImagePath(item.image)}
                class="h-16 w-16 rounded-lg object-cover md:h-20 md:w-20"
              />
            </div>
            <div class="ml-4 w-full">
              <h2 class="font-bold md:text-xl">{item.name}</h2>
              <h3 class="md:text-md text-secondary">{p.description}</h3>
            </div>
            <div class="w-full text-right">
              <span class="block pb-3 text-xl font-bold">
                {formatCurrency(item[tipo_preco])}
              </span>
              <div class="flex items-center justify-end gap-3 text-center">
                {#if cartItem?.quantity >= 1}
                  <button
                    class="btn btn-primary hidden md:block"
                    onclick={() => {
                      cart.subtractItem(item)
                    }}
                  >
                    {@html icons.minus()}
                  </button>
                {/if}
                <input
                  min="1"
                  class="max-w-16 bg-base-100 text-right text-xl font-bold focus:border-yellow-500 md:min-w-10 md:max-w-28"
                  value={cartItem?.quantity ?? 0}
                  onchange={e => {
                    const quant_temp = (e.target as HTMLInputElement)?.value
                    cart.setItem(item, Number(quant_temp), {
                      is_retail: tipo_preco === 'retail_price' ? true : false,
                      price : item[tipo_preco]
                    })
                  }}
                />
                <button
                  onclick={() => {
                    cart.addItem(item, {
                      is_retail: tipo_preco === 'retail_price' ? true : false,
                      price : item[tipo_preco]
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
  {/snippet}
</Cardapio>
