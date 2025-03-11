<script lang="ts">
  // import { getCartContext } from '$lib/stores/cart'
  import { formatCurrency, icons } from '$lib/utils'
  import { getCartContext } from './cartContext.svelte'

  const cart = getCartContext()

  let total = $derived.by(() => {
    return Object.values(cart.cart).reduce((acc, item) => {
      return (
        acc +
        item.item[item.meta.is_retail ? 'retail_price' : 'wholesale_price'] *
          item.quantity
      )
    }, 0) + (cart.meta.isDelivery ? cart.meta.taxaEntrega : 0)
  })
</script>

<ul class="mb-4 max-h-[50vh] overflow-scroll text-center text-lg">
  {#each Object.values(cart.cart) as item}
    <div class="flex items-center justify-between">
      <div class="flex">
        <label class="swap m-1 rounded-md border p-1">
          <input type="checkbox" bind:checked={item.meta.is_retail} />
          <div class="swap-on">Varejo</div>
          <div class="swap-off">Atacado</div>
        </label>
        <li class="py-2 font-bold">
          ({item.quantity}x)
          <span class="text-sm text-secondary">
            {formatCurrency(item.item[item.meta.is_retail ? 'retail_price' : 'wholesale_price'])}
          </span>
          {item.item.name} -
          <span class="text-success">
          {formatCurrency(item.quantity * item.item[item.meta.is_retail ? 'retail_price' : 'wholesale_price'])}
          </span>
        </li>
      </div>
      <button
        class="btn btn-circle m-1"
        onclick={e => {
          cart.removeItem(item.item)
          }}
      >
        {@html icons.x({ stroke: 'red' })}
      </button>
    </div>
    <hr />
  {/each}
</ul>

<h2 class="mx-10 flex justify-center text-3xl font-bold">
  Preço total:&nbsp;
  <span class="text-success">
    {formatCurrency(total)}
  </span>
</h2>
{#if cart.meta.isDelivery}
  <p class="text-center">
    Taxa entrega: <span class="font-bold text-success">
      {formatCurrency(cart.meta.taxaEntrega)}
    </span>
  </p>
{/if}
