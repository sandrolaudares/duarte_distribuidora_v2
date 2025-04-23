<script lang="ts">
  import { getCartContext } from '$lib/state/contextCustomerOrder/cartContext'
  import type { PageData } from './$types'
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '$lib/components/ui/card'
  import { Separator } from '$lib/components/ui/separator'
  import { fade } from 'svelte/transition'
  import ReviewOrder from '$lib/components/customer/checkout/ReviewOrder.svelte'
  import AddressSelection from '$lib/components/customer/checkout/AddressSelection.svelte'
  import OrderSummary from '$lib/components/customer/checkout/OrderSummary.svelte'
  import PaymentSelection from '$lib/components/customer/checkout/PaymentSelection.svelte'
  import { LogIn, ShoppingCart } from 'lucide-svelte'

  let { data }: { data: PageData } = $props()

  const cart = getCartContext()

  const { user, cliente, tenant, enderecos } = data

  let currentStep = $state(1)
  let progress = $derived(currentStep * 33.33)

  const onOrderSubmit = () => {
    console.log('SUCCESS: TODO')
  }

  $inspect(cart.meta.enderecoSelecionado)
</script>

{#if !user || !cliente}
  <div class="py-12 text-center">
    <div
      class="bg-primary-100 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
    >
      <LogIn size={24} class="text-primary" />
    </div>
    <h2 class="mb-2 text-2xl font-semibold text-gray-900">
      Faça login para continuar
    </h2>
    <p class="mb-6 text-gray-500">
      Você precisa estar logado para finalizar seu pedido
    </p>
    <a href="/login" class="btn btn-primary">
      <LogIn size={18} class="mr-2" />
      Fazer Login
    </a>
  </div>
{:else if Object.values(cart.cart).length < 1}
  <div class="py-12 text-center">
    <div
      class="bg-primary-100 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
    >
      <ShoppingCart size={24} class="text-primary" />
    </div>
    <h2 class="mb-2 text-2xl font-semibold text-gray-900">
      Seu carrinho está vazio
    </h2>
    <p class="mb-6 text-gray-500">Adicione alguns itens ao seu carrinho</p>
    <a href="/customer/products" class="btn btn-primary">Ver Cardápio</a>
  </div>
{:else}
  <div class="flex flex-col bg-background text-foreground antialiased">
    <div class="flex-1 px-4 py-6 md:px-6 md:py-8" in:fade>
      <div class=" grid gap-8 lg:grid-cols-[1fr,380px]">
        <Card>
          <CardHeader>
            <CardTitle>Finalizar compra</CardTitle>
            <CardDescription class="text-gray-600">
              Finalize seu pedido seguindo os seguintes passos:
            </CardDescription>
            <!-- <Progress value={progress} class="h-2" /> -->
          </CardHeader>
          <CardContent>
            {#if currentStep === 1}
              <AddressSelection
                tenant={tenant!}
                onConfirm={() => (currentStep = 2)}
                addresses={enderecos}
                customer_id={cliente.id}
              />
            {:else if currentStep === 2}
              <PaymentSelection
                {cliente}
                onConfirm={() => (currentStep = 3)}
                onBack={() => (currentStep = 1)}
              />
            {:else if currentStep === 3}
              <ReviewOrder
                onConfirm={onOrderSubmit}
                onBack={() => (currentStep = 2)}
              />
            {/if}
          </CardContent>
        </Card>

        <div class="hidden lg:block">
          <div class="sticky top-20">
            <OrderSummary showActions={false} tenant={tenant!} />
          </div>
        </div>

        <div class="lg:hidden">
          <OrderSummary showActions={false} tenant={tenant!} />
        </div>
      </div>
    </div>
  </div>
{/if}
