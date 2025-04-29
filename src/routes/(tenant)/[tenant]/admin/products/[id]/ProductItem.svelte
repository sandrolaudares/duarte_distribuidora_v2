<script lang="ts">
  import ImageInput from '$lib/components/input/ImageInput.svelte'
  import CurrencyInput from '$lib/components/input/CurrencyInput.svelte'

  import type { SelectProductItem } from '$db/schema'

  import { page } from '$app/state'
  import { trpc } from '$trpc/client'
  import { toast } from 'svelte-sonner'
  import { formatCurrency, getImagePath, icons } from '$lib/utils'
  import { modal } from '$lib/components/modal'
  import ModalSku from '$lib/components/modal/ModalSKU.svelte'
  import { onMount } from 'svelte'
  import type { RouterOutputs } from '$trpc/router'
  import { Checkbox } from '$lib/components/ui/checkbox/index'
  import Separator from '$lib/components/ui/separator/separator.svelte'
  import { Button } from '$lib/components/ui/button/index'
  import * as Card from '$lib/components/ui/card/index'
  import { Input } from '$lib/components/ui/input/index'
  import {
    Edit,
    ImagePlus,
    Info,
    Package2,
    Pencil,
    Save,
    Tag,
    Trash2,
    X,
  } from 'lucide-svelte'
  import Switch from '$lib/components/ui/switch/switch.svelte'
  import { DateFormatter } from '@internationalized/date'
  import { invalidateAll } from '$app/navigation'
  import TipoForm from './TipoForm.svelte'
  import { type AlimentType } from '$lib/utils/enums'
  import FormatUnidadeMedida from '$lib/components/FormatUnidadeMedida.svelte'

  type Props = {
    item: SelectProductItem
  }

  let { item }: Props = $props()

  const df = new DateFormatter('pt-BR', {
    dateStyle: 'medium',
  })

  let isEditing = $state(false)
  let isChanged = $state(false)

  async function updateProductItemImage(image_id: number) {
    item.image = image_id

    try {
      const resp = await trpc(page).product.updateProductItem.mutate({
        id: item.id,
        prod: {
          image: image_id,
        },
      })
      console.log(resp)

      if (resp) {
        toast.success(`Imagem do item #${item.id} atualizada`)
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  let isLoading = $state(false)

  async function updateProductItemInfo() {
    isLoading = true
    try {
      const resp = await trpc(page).product.updateProductItem.mutate({
        id: item.id,
        prod: {
          name: item.name,
          quantity: item.quantity,
          wholesale_price: item.wholesale_price,
          retail_price: item.retail_price,
          sku: item.sku ?? undefined,
          visible: item.visible,
          tipo: item.tipo as AlimentType ?? undefined,
          unidade: item.unidade ?? undefined,
        },
      })
      console.log(resp)

      if (resp) {
        toast.success(`SKU do #${item.id} atualizado`)
      }
      item = { ...item }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      isEditing = false
      isLoading = false
    }
  }

  function openSKUModal() {
    modal.open(ModalSku, {
      selectedSKU: async sku => {
        item.sku = sku.sku
        await updateProductItemInfo()
      },
      newSKU: { name: item.name, sku: item.sku ?? '' },
    })
  }

  async function handleDeleteProductItem() {
    try {
      await trpc(page).product.deleteProductItem.mutate(item.id)

      toast.success('Deletado com sucesso!')
      //TODO: Fix delete update sem recarregar
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  type CostPrice = RouterOutputs['stock']['getLastCostPrice']

  let costPrice: CostPrice | undefined = $state()

  let loadingCost = $state(true)

  onMount(async () => {
    if (item.sku) {
      try {
        costPrice = await trpc(page).stock.getLastCostPrice.query({
          sku: item.sku,
        })
        console.log(costPrice)
      } catch (error: any) {
        toast.error(error.message)
      } finally {
        loadingCost = false
      }
    }
  })
</script>

<Card.Root class="w-full  relative">
  {#if isLoading}
    <div class="absolute inset-0 bg-base-200 bg-opacity-50 flex items-center justify-center z-10">
      <div class="spinner-border animate-spin h-8 w-8 border-t-4 border-primary rounded-full"></div>
    </div>
  {/if}
  <Card.Header class="pb-0">
    <div class="flex items-center justify-between gap-2">
      <div>
        {#if isEditing}
          <input
            bind:value={item.name}
            class="text-md input input-xs input-bordered w-full font-bold"
            oninput={() => (isChanged = true)}
          />
        {:else}
          <h2 class="text-md font-bold">{item.name}</h2>
        {/if}
      </div>

      <div class="flex items-center gap-2">
        {#if isEditing}
          <div class="flex items-center gap-2">
            <label for="visible" class="text-sm">Visible</label>
            <Switch
              id="visible"
              checked={item.visible}
              onCheckedChange={checked => {
                item.visible = checked
                isChanged = true
              }}
            />
          </div>
        {:else}
          <div
            class="badge badge-sm {item.visible
              ? 'border-success/50 bg-success text-white '
              : 'border-base-300/80 bg-base-300/70 text-gray-700'}"
          >
            {item.visible ? 'Visível' : 'Não Visível'}
          </div>
        {/if}
      </div>
    </div>
    <div
      class="flex items-center {!isEditing ? 'justify-between' : 'justify-end'}"
    >
      {#if !isEditing}
        <Button
          class="border {!item.sku
            ? 'bg-error/10 hover:bg-error hover:text-error-content'
            : 'bg-success/10 hover:bg-success hover:text-success-content'}"
          onclick={openSKUModal}
        >
          <Tag class="h-4 w-4" />
          <span>SKU: {item.sku ? item.sku : 'AINDA SEM'}</span>
          {@html icons.box()}
        </Button>
        <div class="flex">
          <Button
            variant="ghost"
            size="icon"
            onclick={() => (isEditing = true)}
          >
            <Pencil class="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onclick={handleDeleteProductItem}
            class="text-error"
          >
            <Trash2 class="h-4 w-4" />
          </Button>
        </div>
      {:else}
        <div class="flex items-center gap-1">
          {#if !isChanged}
            <Button
              variant="ghost"
              size="icon"
              onclick={() => (isEditing = false)}
            >
              <X class="h-4 w-4" />
            </Button>
          {:else}
            <h2 class="text-md text-success">Lembre de salvar</h2>
          {/if}
          <Button variant="ghost" size="icon" disabled={isLoading} onclick={updateProductItemInfo}>
            <Save class="h-4 w-4" />
          </Button>
        </div>
      {/if}
    </div>
  </Card.Header>
  <Card.Content class="pt-4">
    <div
      class="relative mb-4 aspect-square overflow-hidden rounded-lg bg-base-200"
    >
      {#if isEditing}
        <div class="flex h-full w-full flex-col items-center justify-center">
          <div class="absolute inset-0 flex items-center justify-center">
            <ImageInput
              image_id={item.image}
              name={item.name}
              save={updateProductItemImage}
            />
          </div>
        </div>
      {:else if item.image}
        <img
          src={getImagePath(item.image)}
          alt={item.name}
          class="rounded-lg"
        />
      {:else}
        <div class="flex h-full items-center justify-center">
          <Package2 class="h-12 w-12 text-gray-600 opacity-50" />
        </div>
      {/if}
    </div>
    <div class="mb-2 flex items-center gap-2">
      <p class="text-xs font-medium text-gray-600">Quantidade incluida:</p>
      {#if isEditing}
        <input
          type="number"
          class="input input-xs input-bordered max-w-24 w-full"
          bind:value={item.quantity}
          oninput={() => (isChanged = true)}
        />
      {:else}
        <p class="text-md font-bold">{item.quantity}</p>
      {/if}
    </div>
    <Separator class="bg-base-200 my-2" />
    <div class="mb-2">
      <p class="text-xs font-medium text-gray-600 mb-1">Tipo de produto</p>
      {#if isEditing}
        <TipoForm bind:value={item.tipo as AlimentType} customClass="select-xs text-xs "/>
      {:else}
      <p class="text-sm font-bold">
        {item.tipo}
      </p>
      {/if}
    </div>
    <div class="mb-2">
      {#if isEditing}
      <div class="flex items-center justify-start gap-2">
        <p class="text-xs font-medium text-gray-600 mb-1">Unidade de medida </p>
        <div class="tooltip" data-tip="Para alimento, use gramas. Para bebida, use ML.">
          <button class=" btn-info"><Info class="h-4 w-4 text-info"/></button>
        </div>
      </div>
        <input
          type="number"
          class="input input-xs input-bordered w-full"
          bind:value={item.unidade}
          oninput={() => (isChanged = true)}
        />
      {:else if item.unidade}
        <p class="text-xs font-medium text-gray-600 mb-1">Unidade de medida (Gramas/ML/etc...)</p>
        <p class="text-sm font-bold">
          <FormatUnidadeMedida tipo={item.tipo as AlimentType} unidade={item.unidade}/>
        </p>
      {/if}
    </div>
    
    <Separator class="bg-base-200 my-2" />
    <div class="grid grid-cols-2 gap-2">
      <div>
        <p class="text-xs font-medium text-gray-600">Preço de varejo</p>
        {#if isEditing}
          <CurrencyInput
            size="input-xs"
            bind:value={item.retail_price}
            oninput={() => (isChanged = true)}
          />
        {:else}
          <p class="text-md font-bold">{formatCurrency(item.retail_price)}</p>
        {/if}
      </div>
      <div>
        <p class="text-xs font-medium text-gray-600">Preço de atacado</p>
        {#if isEditing}
          <CurrencyInput
            size="input-xs"
            bind:value={item.wholesale_price}
            oninput={() => (isChanged = true)}
          />
        {:else}
          <p class="text-md font-bold">
            {formatCurrency(item.wholesale_price)}
          </p>
        {/if}
      </div>
      <div>
        <p class="text-xs font-medium text-gray-600">Preço de custo</p>
        {#if loadingCost}
        <p class="animate-pulse text-md font-bold">
          Carregando...
        </p>
        {:else if costPrice}
          <p class="text-md font-bold">
            {formatCurrency(costPrice.cost_price ?? 0)}
          </p>
        {:else}
          <p class="text-md font-bold">N/A</p>
        {/if}
      </div>
    </div>
    
  </Card.Content>
  <Separator class="bg-base-200" />
  <Card.Footer class="flex justify-between py-3 text-xs text-gray-600">
    <div>Criado em {item.created_at ? df.format(item.created_at) : 'N/A'}</div>
  </Card.Footer>
</Card.Root>
