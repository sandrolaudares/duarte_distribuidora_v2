<script lang="ts">
  import { fade, slide } from 'svelte/transition'
  import { PlusIcon, Trash2Icon } from 'lucide-svelte'
  import { Button } from '$lib/components/ui/button'
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from '$lib/components/ui/card'
  import ProductCard from './ProductCard.svelte'
  import type { SelectProduct } from '$lib/server/db/schema'

  type Category = {
    name: string
    products: SelectProduct[]
  }

  type Props = {
    category: Category
    onDelete: () => void
    onAddProduct: () => void
  }

  let { category, onDelete, onAddProduct }: Props = $props()
</script>

<Card class="h-full overflow-hidden">
  <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-4">
    <CardTitle class="text-xl font-bold">
      {category.name}
      <span class="ml-2 text-sm font-normal text-gray-600">
        ({category.products.length}
        {category.products.length === 1 ? 'produto' : 'produtos'})
      </span>
    </CardTitle>
    <div class="flex items-center gap-2">
      <button
        class="btn btn-square btn-outline btn-secondary btn-sm"
        onclick={onAddProduct}
      >
        <PlusIcon class="h-4 w-4" />
      </button>
      <button class="btn btn-square btn-error btn-sm" onclick={onDelete}>
        <Trash2Icon class="h-4 w-4" />
      </button>
    </div>
  </CardHeader>
  <CardContent class="p-6 pt-0">
    {#if category.products.length === 0}
      <div
        class="flex min-h-32 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center h-full"
        transition:fade
      >
        <p class="text-sm text-gray-600">Nenhum produto nessa categoria</p>
        <button
          class="btn btn-outline btn-secondary mt-4 w-full"
          onclick={onAddProduct}
        >
          <PlusIcon class="mr-2 h-4 w-4" />
          Adicionar produto
        </button>
      </div>
    {:else}
      <div
        class="grid gap-4"
        class:grid-cols-1={category.products.length <= 2}
        class:grid-cols-2={category.products.length > 2}
      >
        {#each category.products as product (product.id)}
          <div transition:slide|local>
            <ProductCard {product} />
          </div>
        {/each}
      </div>
    {/if}
  </CardContent>
</Card>
