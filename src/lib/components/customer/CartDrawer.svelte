<script lang="ts">
  import {
    ShoppingCart,
    X,
    Plus,
    Minus,
    ReceiptIndianRupeeIcon,
  } from 'lucide-svelte'
  import { Button, buttonVariants } from '$lib/components/ui/button'
  import * as Sheet from '$lib/components/ui/sheet/index'
  import { Separator } from '$lib/components/ui/separator'
  import { getCartContext } from '../../state/contextCustomerOrder/cartContext'
  import { formatCurrency, getImagePath } from '$lib/utils'
  import { Tween } from 'svelte/motion'
  import { isOpen, qntdCarrinho } from '$lib/stores/carrinho';

  const cart = getCartContext()

  let totalPrice = new Tween(0, { duration: 200 })

  $effect(() => {
    if (totalPrice) {
      totalPrice.set(
        Object.values(cart.cart).reduce(
          (total, item) => total + item.item.retail_price * item.quantity,
          0,
        ),
      )
    }
  })

  $effect(() => {
    if (qntdCarrinho) {
      qntdCarrinho.set(
        Object.values(cart.cart).reduce(
          (total, item) => total + item.quantity,
          0,
        ),
      )
    }
  })

</script>

<Sheet.Root bind:open={$isOpen}>
  <Sheet.Trigger>
    <Button variant="default" size="bigicon" class="relative">
      <ShoppingCart class="h-14 w-14" />
      {#if $qntdCarrinho > 0}
        <span
          class="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-error text-xs text-white"
        >
          {$qntdCarrinho}
        </span>
      {/if}
    </Button>
  </Sheet.Trigger>
  <Sheet.Content class="flex w-full flex-col sm:max-w-md">
    <Sheet.Header>
      <Sheet.Title class="text-xl">Seu carrinho</Sheet.Title>
    </Sheet.Header>

    {#if Object.values(cart.cart).length === 0}
      <div class="flex flex-1 flex-col items-center justify-center space-y-4">
        <ShoppingCart class="h-16 w-16 text-gray-600" />
        <p class="text-gray-600">Seu carrinho está vázio</p>
        <Button variant="outlinePrimary" onclick={()=>$isOpen=false} href={'/customer/products'}>Continue escolhendo</Button>
      </div>
    {:else}
      <div class="flex-1 overflow-auto py-4">
        <ul class="space-y-6">
          {#each Object.values(cart.cart) as item (item.item.id)}
            <li class="flex space-x-4">
              <div class="relative h-20 w-20 overflow-hidden rounded-md border">
                <img
                  src={getImagePath(item.item.image)}
                  alt={item.item.name}
                  class="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <div class="flex-1 space-y-1">
                <h3 class="font-medium">{item.item.name}</h3>
                <p class="text-sm text-gray-600">
                  {formatCurrency(item.item.retail_price)}
                </p>
                <div class="flex items-center space-x-2">
                  <Button
                    variant="outlinePrimary"
                    size="icon"
                    class="h-7 w-7"
                    onclick={() => cart.subtractItem(item.item)}
                  >
                    <Minus class="h-3 w-3" />
                  </Button>
                  <span class="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outlinePrimary"
                    size="icon"
                    class="h-7 w-7"
                    onclick={() => cart.addItem(item.item)}
                  >
                    <Plus class="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                class="h-7 w-7"
                onclick={() => cart.removeItem(item.item)}
              >
                <X class="h-4 w-4" />
              </Button>
            </li>
          {/each}
        </ul>
      </div>

      <div class="space-y-4 pt-4">
        <Separator />
        <div class="space-y-2">
          <div class="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(totalPrice.current - (cart.meta.taxaEntrega ?? 0))}</span>
          </div>
          <div class="flex justify-between">
            <span>Valor de entrega</span>
            {#if cart.meta.taxaEntrega === 0}
            <span class="text-info">À calcular</span>
            {:else if cart.meta.taxaEntrega === undefined}
              Calculando...
            {:else}
            <span>{formatCurrency(cart.meta.taxaEntrega)}</span>
            {/if}
          </div>
          <div class="flex justify-between font-medium">
            <span>Total</span>
            <span>{formatCurrency(totalPrice.current)}</span>
          </div>
        </div>
        <Button class="w-full" onclick={()=>$isOpen=false} href={'/customer/finalizar'}>Concluir pedido</Button>
        <Button variant="outlinePrimary" class="w-full" onclick={()=>$isOpen=false}>Continue escolhendo</Button>
      </div>
    {/if}
  </Sheet.Content>
</Sheet.Root>
