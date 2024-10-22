<script lang="ts">
  import { toast } from 'svelte-sonner'
  import type { PageData } from './$types'
  import DnDBoard from '$components/dnd/DnDBoard.svelte'
  import { modal, FormModal } from '$modal'
  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'
  import { invalidate } from '$app/navigation'
  import { icons } from '$lib/utils/icons'

  export let data: PageData

  let columnsData = data.products.map(cat => ({
    id: cat.id,
    category: cat,
    items: cat.products,
  }))
  console.log(columnsData)

  async function handleBoardUpdated(newColumnsData: typeof columnsData) {
    console.log(newColumnsData)
    columnsData = newColumnsData
  }

  async function handleDeleteCategory(id: number) {
    if(confirm('Tem certeza que deseja deletar categoria')===true){
      try {
        await trpc($page).product.deleteProductCategory.mutate(id)
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
      FormModal<{
        name: string
        description: string
      }>,
      {
        fields: [
          {
            name: 'name',
            label: 'Name',
            type: 'text',
            required: true,
          },
          {
            name: 'description',
            label: 'Description',
            type: 'text',
          },
        ],
        save: async data => {
          console.log(data)
          try {
            const [resp] = await trpc($page).product.insertProduct.mutate({
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
        title: 'Add Product',
      },
    )
  }

  function handleAddCategory() {
    modal.open(
      FormModal<{
        name: string
      }>,
      {
        fields: [
          {
            name: 'name',
            label: 'Name',
            type: 'text',
            required: true,
          },
        ],
        save: async data => {
          console.log(data)
          try {
            const [resp] = await trpc(
              $page,
            ).product.insertProductCategory.mutate({
              name: data.name,
            })
            columnsData.push({
              id: resp.id,
              category: { ...resp, products: [] },
              items: [],
            })
            columnsData = columnsData
            console.log(resp)
            toast.success('Categoria adicionada com sucesso!')
            window.location.reload()
          } catch (error) {
            return JSON.stringify(error)
          }
        },
        title: 'Add Category',
      },
    )
  }
</script>

<div class="mx-auto flex items-center justify-center gap-3">
  <p>Produtos</p>
  <button class="btn btn-primary" onclick={handleAddCategory}>
    Adicionar categoria
  </button>
</div>
<!--TODO: Ao mover de uma categoria para outra não ta movendo, ao atualizar a pagina sai-->
<DnDBoard
  columns={columnsData}
  onFinalUpdate={handleBoardUpdated}
  disabled={{
    card: false,
    column: false,
  }}
>
  {#snippet collum(cat)}
    <div class="flex items-center justify-between gap-4">
      <p>
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
      <a href="/admin/products/{p.id}" class="w-full px-4 py-3 text-center">
        <p class="text-xl font-bold">{p.name}</p>
        <p class="font-light">{p.description}</p>
      </a>

      <!-- <button
        onclick={() => handleDeleteProduct(p.id)}
        class="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-red-500 bg-opacity-0 hover:cursor-pointer"
      >
        {@html icons.trash({ stroke: 'red' })}
      </button> -->
    </div>
  {/snippet}
</DnDBoard>
