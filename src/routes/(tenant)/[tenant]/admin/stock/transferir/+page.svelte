<script lang="ts">
  import type { PageData } from './$types'
  import Cardapio from '$lib/components/Cardapio.svelte'
  import { icons } from '$lib/utils'

  import { getImagePath } from '$lib/utils/image'
  import type { SelectProductItem, SelectSku } from '$lib/server/db/schema'
  import { enhance } from '$app/forms'
  import Success from '$lib/components/transfer/success.svelte'
  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'
  import type { InsertStockTransference } from '$lib/server/db/central/schema'
  import { toast } from 'svelte-sonner'
  import { createInsertSchema } from 'drizzle-zod'
  import { Item } from '$lib/components/ui/dropdown-menu'
  import ListaProdutos from './ListaProdutos.svelte'
  import { se } from 'date-fns/locale'

  export let data: PageData

  type Cart = Record<
    SelectSku['sku'],
    {
      sku: SelectSku
      totalQuantity: number
      // productQuantity:number
      item: SelectProductItem
    }
  >

  let products = data.products
  let cart: Cart = {}

  let searchTerm = ''

  $: {
    products = data.products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  let isLoading = false

  async function handleSolicitarTransferir(data: InsertStockTransference[]) {
    if (!Object.values(cart).length) {
      toast.error('Carrinho está vazio')
      return
    }
    isLoading = true
    try {
      for (let dat of data) {
        await trpc($page).distribuidora.solicitarTransference.mutate({
          meta_data: JSON.stringify(dat.meta_data),
          sku: dat.sku,
          sku_name: dat.sku_name,
          toTenantId: dat.toTenantId,
          fromTenantId: dat.fromTenantId,
          status: dat.status,
          quantity: dat.quantity,
        })
      }
      toast.success('Solicitado com sucesso!')
      cart = {}
    } catch (error) {
      console.error(error)
      toast.error('Erro ao solicitar')
    } finally {
      isLoading = false
    }
  }
</script>

<div class="container mx-auto max-w-7xl p-4">
  <h1 class="mb-6 text-center text-3xl font-bold">
    Solicitar estoque para central
  </h1>

  <div class="flex flex-col gap-6 lg:flex-row">
    <ListaProdutos bind:cart {products} bind:searchTerm />
    <div class="space-y-6 lg:w-1/3">
      <div class="rounded-lg bg-base-200 p-6 shadow-md">
        <h2 class="mb-4 text-xl font-semibold">Produtos à solicitar</h2>
        {#if Object.values(cart).length > 0}
          <ul class="space-y-2">
            {#each Object.values(cart) as product}
              <li class="flex items-center justify-between">
                <span>{product.sku.name}</span>
                <span class="font-semibold">Qnt: {product.totalQuantity}</span>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="text-gray-500">Nenhum produto</p>
        {/if}
      </div>
      <div>
        <button
          on:click={() => {
            const dataInsert: InsertStockTransference[] = Object.values(
              cart,
            ).map(product => ({
              sku: product.sku.sku,
              sku_name: product.sku.name,
              status: 'REQUESTED',
              fromTenantId: null,
              toTenantId: data.tenant?.tenantId || 0,
              quantity: product.totalQuantity * product.item.quantity,
              meta_data: {},
            }))
            handleSolicitarTransferir(dataInsert)
          }}
          class="btn btn-primary w-full transition duration-150 ease-in-out focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isLoading || Object.values(cart).length === 0}
        >
          {isLoading ? 'Solicitando...' : 'Solicitar transferência'}
        </button>
      </div>
    </div>
  </div>
</div>
