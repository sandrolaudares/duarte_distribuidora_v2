<script lang="ts">
  import { toast } from 'svelte-sonner'
  import type { PageData } from './$types'
  import DnDBoard from '$components/dnd/DnDBoard.svelte'
  import { modal, FormModal } from '$modal'
  import { trpc } from '$trpc/client'
  import { page } from '$app/state'
  import { invalidate } from '$app/navigation'
  import { icons } from '$lib/utils/icons'
  import Button from '$lib/components/ui/button/button.svelte'
  import { slide } from 'svelte/transition'
  import CategoryCard from './CategoryCard.svelte'
  import { PlusIcon } from 'lucide-svelte'
  import { createSearchStore, searchHandler } from '$lib/stores/search';
	import { onDestroy } from 'svelte';

  export let data: PageData

  let columnsData = data.products.map(cat => ({
    id: cat.id,
    category: cat,
    items: cat.products,
    searchTerms: `${cat.name} ${cat.products.map((product) => product.name).join(' ')}`,
  }))

  const searchStore = createSearchStore(columnsData);

  const unsubscribe = searchStore.subscribe((model) => searchHandler(model));

  onDestroy(() => {
    unsubscribe();
  });

  async function handleBoardUpdated(newColumnsData: typeof columnsData) {
    console.log(newColumnsData)
    columnsData = newColumnsData
  }

  async function handleDeleteCategory(id: number) {
    if(confirm('Tem certeza que deseja deletar categoria')===true){
      try {
        await trpc(page).product.deleteProductCategory.mutate(id)
        toast.success('Categoria deletada com sucesso!')
        window.location.reload()
      } catch (error: any) {
        console.error(error.message)
        toast.error('Erro ao deletar categoria!')
      }
    } else {
      toast.info('Ação cancelada')
    }
  }
  //TODO:fix not use window.location.reload()
  function handleAddProduct(category_id: number) {
    console.log('add product')
    modal.open(
      FormModal,
      {
        fields: [
          {
            name: 'name',
            label: 'Nome',
            type: 'text',
            required: true,
          },
          {
            name: 'description',
            label: 'Descrição',
            type: 'text',
          },
        ],
        save: async data => {
          console.log(data)
          try {
            const [resp] = await trpc(page).product.insertProduct.mutate({
              name: data.name,
              description: data.description ?? '',
              category_id: category_id,
            })
            columnsData.map(col => {
              if (col.id === category_id) {
                col.items.push(resp)
              }
            })
            console.log(resp)
            toast.success('Produto adicionado com sucesso!')
            window.location.reload()
          } catch (error) {
            return JSON.stringify(error)
          }
        },
        title: 'Adicionar produto',
      },
    )
  }

  function handleAddCategory() {
    modal.open(
      FormModal,
      {
        fields: [
          {
            name: 'name',
            label: 'Nome',
            type: 'text',
            required: true,
          },
        ],
        save: async data => {
          console.log(data)
          try {
            const [resp] = await trpc(
              page,
            ).product.insertProductCategory.mutate({
              name: data.name,
            })
            columnsData.push({
              id: resp.id,
              category: { ...resp, products: [] },
              items: [],
              searchTerms: ``,
            })
            columnsData = columnsData
            console.log(resp)
            toast.success('Categoria adicionada com sucesso!')
            window.location.reload()
          } catch (error) {
            return JSON.stringify(error)
          }
        },
        title: 'Adicionar categoria',
      },
    )
  }
</script>

<div class="min-h-dvh bg-background">
	<nav class="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
		<div class="mx-auto flex h-16  items-center justify-between px-4">
			<h1 class="text-2xl font-bold">Produtos</h1>
      <div class="flex items-center gap-4">
        <input type="search" placeholder="Buscar..." class="input input-bordered" bind:value={$searchStore.search} />
        <button class="btn btn-primary" onclick={handleAddCategory}>
          <PlusIcon class="mr-2 h-4 w-4"/>
          Adicionar categoria
        </button>
      </div>
		</div>
	</nav>

	<main class="mx-auto  px-4 py-8">
		<div class="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
			{#each $searchStore.filtered as category (category.id)}
				<div transition:slide|local>
					<CategoryCard category={category.category} onDelete={() => {handleDeleteCategory(category.id)}} onAddProduct={() => {handleAddProduct(category.id)}} />
				</div>
			{/each}
		</div>
	</main>
</div>

<!-- <div class="mx-auto flex items-center justify-center gap-3">
  <p>Produtos</p>
  <button class="btn btn-primary" onclick={handleAddCategory}>
    Adicionar categoria
  </button>
</div> -->
<!--TODO: Ao mover de uma categoria para outra não ta movendo, ao atualizar a pagina sai-->
<!-- <DnDBoard
  columns={columnsData}
  onFinalUpdate={handleBoardUpdated}
  disabled={{
    card: false,
    column: false,
  }}
>
  {#snippet collum(cat)}
    <div class="flex items-center justify-between gap-4  max-w-full">
      <p class="text-xl overflow-auto">
        {cat.name}
      </p>
      <button
        class="btn btn-outline btn-primary"
        onclick={() => handleAddProduct(cat.id)}
      >
        {@html icons.plus()}
      </button>

        <button
          class="btn btn-outline btn-error"
          onclick={() => handleDeleteCategory(cat.id)}
        >
          {@html icons.trash()}
        </button>

    </div>
  {/snippet}
  {#snippet card(p)}
    <div class="flex w-full gap-0 rounded-lg bg-base-300 text-center">
      <a href="/admin/products/{p.id}" class="w-full px-4 py-1 text-center">
        <p class="text-lg font-bold">{p.name}</p>
        <p class="font-light">{p.description}</p>
      </a>


    </div>
  {/snippet}
</DnDBoard> -->
