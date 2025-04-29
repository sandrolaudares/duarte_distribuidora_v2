<script lang="ts">
  import type { PageData } from './$types'
  import Cardapio from '$lib/components/Cardapio.svelte'
  import Card1 from '$lib/components/cards/Card1.svelte'

  import { getImagePath } from '$utils/image'
  import { createSearchStore, searchHandler } from './searchCardapio'
  import { onDestroy } from 'svelte'
  import { SearchIcon } from 'lucide-svelte'

  let { data }: { data: PageData } = $props()

  const { products } = data

  const searchProducts = products.map(product => {
    const subProductNames = product.products.map(p => p.name).join(' ')
    return {
      ...product,
      searchTerms: `${product.name} ${subProductNames}`.toLowerCase(),
    }
  })

  const searchStore = createSearchStore(searchProducts)

  const unsubscribe = searchStore.subscribe(model => searchHandler(model))

  onDestroy(() => {
    unsubscribe()
  })
</script>

<div class="h-full max-h-[80vh]">
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
          <SearchIcon class="h-4 w-4 opacity-70" />
        </label>
      </div>
    {/snippet}
    {#snippet card(c)}
      <a href="products/{c.id}">
        <Card1
          nome={c.name}
          descricao={c.description}
          image={getImagePath(c.image)}
          preco={'TODO'}
        />
      </a>
    {/snippet}
  </Cardapio>
</div>
