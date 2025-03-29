<script lang="ts">
  import type { RouterOutputs } from '$trpc/router'
  import * as Card from '$lib/components/ui/card/index'
  import { formatCurrency, getImagePath } from '$lib/utils'
  import { getCartContext } from './cartContext.svelte'

  let {
    image = 0,
    name = 'Não encontrado',
    quantity = 0,
    price = 0,
    is_retail = $bindable(true),
    isEditable = false,
  } = $props()


$effect(()=>{
  console.log(is_retail)
  console.log(price)
})
</script>

<td class="whitespace-nowrap py-4">
  <div class="flex items-center gap-4">
    {#if isEditable}
    <label class="swap m-1 rounded-md border p-1">
      <input type="checkbox" bind:checked={is_retail} />
      <div class="swap-on">Varejo</div>
      <div class="swap-off">Atacado</div>
    </label>
    {/if}
    <div class="flex aspect-square h-14 w-14 shrink-0 items-center">
      <img
        class="h-auto max-h-full w-full rounded-md"
        src={getImagePath(image)}
        alt="product"
      />
    </div>
    <h1>{name}</h1>
  </div>
</td>

<td class="p-4 text-right text-base font-normal text-opacity-90">
  {quantity}x {formatCurrency(price)}
</td>

<td class="p-4 text-right text-base font-bold text-opacity-90">
  {formatCurrency(price*quantity)}
</td>
