<script lang="ts" generics="CartMeta extends { taxaEntrega?:number }, CartProductMeta extends { is_retail: boolean }">
    import { getImagePath } from '$lib/utils/image'
    // import { getCartContext } from '$lib/stores/cart'
    import { icons } from '$lib/utils/icons'
    import Cardapio from '$lib/components/Cardapio.svelte'
    import type { RouterOutputs } from '$trpc/router'
    import { type Item } from '$lib/state/contextCashier/cartContext.svelte'
    import { formatCurrency } from '$lib/utils'
    import { createSearchStore, searchHandler } from './searchCardapio'
    import { onDestroy } from 'svelte'
    import { SearchIcon } from 'lucide-svelte'
    import { Cart } from '$lib/state/cart.svelte'
  
    type Props = {
      products: RouterOutputs['product']['queryCategorysWithProductItems']
      tipo_preco: 'retail_price' | 'wholesale_price'
      cart: Cart<Item, CartProductMeta, CartMeta>
    }
  
    let { products, tipo_preco,cart }: Props = $props()
  
    const searchProducts = products.map(product => {
      const allItemTerms = product.products.flatMap(subProduct =>
        subProduct.items.map(
          item => `${product.name} ${subProduct.name} ${item.name}`,
        ),
      )
  
      return {
        ...product,
        searchTerms: allItemTerms.join(' ').toLowerCase(),
      }
    })
  
    const searchStore = createSearchStore(searchProducts)
  
    const unsubscribe = searchStore.subscribe(model => searchHandler(model))
  
    onDestroy(() => {
      unsubscribe()
    })
  </script>
  
  <Cardapio data={$searchStore.filtered}>
    {#snippet filter()}
      <div class="hidden md:block">
        <label class="input input-bordered flex h-full items-center gap-2">
          <input
            type="text"
            class="grow"
            placeholder="Buscar..."
            bind:value={$searchStore.search}
          />
          <SearchIcon class="h-4 w-4 opacity-70"/>
        </label>
      </div>
    {/snippet}
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
                        ...cartItem?.meta,
                        is_retail: tipo_preco === 'retail_price',
                      })
                    }}
                  />
                  <button
                    onclick={() => {
                      cart.addItem(item, {
                        ...cartItem?.meta,
                        is_retail: tipo_preco === 'retail_price' ? true : false,
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
  