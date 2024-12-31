<script lang="ts">
  import type { RouterOutputs } from '$trpc/router'
  import * as Card from '$lib/components/ui/card/index'
  import { getImagePath } from '$lib/utils'
  import { getCartContext } from './cartContext.svelte'

  let { image = 0, name = 'Não encontrado', quantity = 0, price = 0 } = $props()
</script>

<tr>
  <td class="whitespace-nowrap py-4">
    <div class="flex items-center gap-4">
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
    {quantity}x R${(price / 100).toFixed(2)}
  </td>

  <td class="p-4 text-right text-base font-bold text-opacity-90">
    R${((price * quantity) / 100).toFixed(2)}
  </td>
</tr>
