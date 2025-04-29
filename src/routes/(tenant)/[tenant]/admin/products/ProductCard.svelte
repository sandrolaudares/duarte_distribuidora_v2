<script lang="ts">
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from '$lib/components/ui/card'
  import type { SelectProduct } from '$lib/server/db/schema'
  import { getImagePath } from '$lib/utils'

  type Props = {
    product: SelectProduct
  }

  let { product }: Props = $props()
</script>

<a href="products/{product.id}" class="m-0 p-0">
  <Card
    class="group h-full overflow-hidden transition-colors hover:bg-muted/10"
  >
    <CardHeader class="p-4 pb-0">
      <img
        src={getImagePath(product.image)}
        alt={product.name}
        class="aspect-square h-full w-full rounded-md object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </CardHeader>
    <CardContent class="p-4">
      <CardTitle class="line-clamp-1 text-base">{product.name}</CardTitle>
      {#if product.description}
        <p class="mt-1 line-clamp-2 text-sm text-gray-500">
          {product.description}
        </p>
      {:else}
        <p class="mt-1 line-clamp-2 text-sm text-gray-500">Sem descrição</p>
      {/if}
    </CardContent>
  </Card>
</a>
