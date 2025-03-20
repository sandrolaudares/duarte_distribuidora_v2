<script lang="ts">
  import type { PageData } from './$types'
  import { modal, FormModal } from '$modal'
  import type { InsertProductItem } from '$db/schema'
  import { trpc } from '$trpc/client'
  import { page } from '$app/state'
  import ProductItem from './ProductItem.svelte'
  import ImageInput from '$lib/components/input/ImageInput.svelte'

  import { toast } from 'svelte-sonner'
  import { icons } from '$lib/utils'
  import { onMount } from 'svelte'

  let { data }: {data:PageData} = $props()

  let { prod:produto} = $state(data)
  
  function handleAddItem() {
    modal.open(FormModal, {
      title: 'Adicionar item',
      fields: [
        {
          name: 'name',
          label: 'Nome',
          type: 'text',
          value: produto.name,
          required: true,
        },
        {
          name: 'quantity',
          label: 'Quantidade base',
          type: 'number',
          value: 1,
          required: true,
        },
        {
          name: 'wholesale_price',
          label: 'Preço de atacado',
          type: 'currency',
          required: true,
        },
        {
          name: 'retail_price',
          label: 'Preço de varejo',
          type: 'currency',
          required: true,
        },
        {
          name: 'visible',
          label: 'Mostrar no cardápio',
          type: 'checkbox',
          required: false,
        },
      ],
      save: async data => {
        console.log(data)
        try {
          const [resp] = await trpc(page).product.insertProductItem.mutate({
            name: data.name,
            quantity: data.quantity,
            wholesale_price: data.wholesale_price,
            retail_price: data.retail_price,
            product_id: produto.id,
            visible: data.visible,
          })
          console.log(resp)
          produto.items.push(resp)
          produto = produto
          //window.location.reload()
        } catch (error) {
          console.error(error)
          return JSON.stringify(error, null, 2)
        }
      },
    })
  }

  async function updateProductImage(image_id: number) {
    try {
      const [resp] = await trpc(page).product.updateProduct.mutate({
        id: produto.id,
        prod: { image: image_id },
      })
      if (resp) {
        toast.info(`Product Image #${produto.id} updated`)
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  async function updateProductInfo() {
    try {
      const resp = await trpc(page).product.updateProduct.mutate({
        id: produto.id,
        prod: {
          name: produto.name,
          description: produto.description,
        },
      })
      console.log(resp)
      if (resp) {
        toast.success(`Product Info #${produto.id} updated`)
      }
    } catch (error: any) {
      toast.error(error.message)
    }
    isChanged = false
  }

  async function handleDeleteProduct(id: number) {
    if(confirm('Deseja deletar produto?') === true) {
      try {
        await trpc(page).product.deleteProduct.mutate(id)
  
        toast.success('Item deletado com sucesso!')
        window.history.back()
      } catch (error: any) {
        console.error(error.message)
        toast.error('Erro ao deletar produto!')
      }
    } else {
      toast.info('Ação cancelada')
    }
  }

  let isChanged = $state(false)
</script>

<main class="flex flex-col">
  <div
    class="rounded-sm flex md:flex-row gap-3 items-center justify-between bg-surface-200 p-3 m-3"
  >
  <div class="max-w-[130px] max-h-[130px]">
    <ImageInput
      name={produto.name}
      image_id={produto.image}
      save={updateProductImage}
    />
  </div>
    <div class="flex flex-col gap-3">
      <h2
        class="title-font text-center text-xl font-semibold tracking-widest text-secondary"
      >
        {produto.category?.name}
      </h2>
      <!-- <h1 class="mb-1 text-center text-3xl font-bold text-gray-900">
        {produto.name}
      </h1> -->

      <div class="flex flex-col items-end justify-center gap-2">
        <div class="md:flex-row flex-col flex items-center gap-2">
          <label for="name">Nome:</label>
          <input
            id="name"
            name="name"
            type="text"
            class="input"
            bind:value={produto.name}
            oninput={() => (isChanged = true)}
          />
        </div>
        <div class="md:flex-row flex-col flex items-center gap-2">
          <label for="description">Descrição:</label>
          <input
            id="description"
            name="description"
            class="input"
            bind:value={produto.description}
            oninput={() => (isChanged = true)}
          />
        </div>
      </div>

      <!-- <p class="text-center text-sm font-light leading-relaxed">
        Descricão: {produto.description}
      </p> -->
    </div>

    <div class="flex flex-col gap-2">
      {#if isChanged}
        <button
          class="btn btn-info btn-md px-5"
          onclick={updateProductInfo}
          disabled={!isChanged}
        >
        Salvar
        </button>
      {/if}

        <button
          class="btn btn-error btn-md px-5"
          onclick={() => handleDeleteProduct(produto.id)}
        >
          {@html icons.trash()} Deletar {produto.name}
        </button>

      <button class="btn btn-primary btn-md px-5" onclick={handleAddItem}>
        {@html icons.plus()} Adicionar item
      </button>
    </div>
  </div>

  <div class="m-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4  cols-5-p justify-center gap-4">
    {#each produto.items as item, i (item.id)}
      <ProductItem {item} />
    {/each}
  </div>
</main>

<style>
  @media (min-width: 1746px) {
    .cols-5-p {
        grid-template-columns: repeat(5, minmax(0, 1fr));
    }
}
  </style>