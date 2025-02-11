<script lang="ts">
  import type { PageData } from './$types'
  import CardPayments from '$lib/components/cards/CardPayments.svelte'
  import PaymentFiado from '$lib/components/PaymentFiado.svelte'
  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'
  import { Pencil, Plus, Trash2 } from 'lucide-svelte'
  import * as Tooltip from '$lib/components/ui/tooltip/index'

  import { createCartContext } from './cartContext.svelte'
  import EditOrderMenu from './EditOrderMenu.svelte'
  import DisplayCart from './DisplayCart.svelte'
  import CustomerDetails from './CustomerDetails.svelte'
  import { toast } from 'svelte-sonner'
  import { goto, invalidateAll } from '$app/navigation'
  import SenhaAdmin from '$lib/components/SenhaAdmin.svelte'
  let { data }: { data: PageData } = $props()

  const order = createCartContext(data.order_details)

  let order_details = data.order_details

  let isOpenModal: HTMLDialogElement | null = $state(null)
  let isOpenModalEdit: HTMLDialogElement | null = $state(null)
  let isOpenModalCancel: HTMLDialogElement | null = $state(null)

  let troco = $state(0)
  let taxaEntrega = 0
  let isDelivery = false

  troco =
    order_details?.payments?.reduce(
      (acc, payment) => acc + (payment.troco ?? 0),
      0,
    ) ?? 0

  let amount_paid_order = $derived.by(() => {
    return (order_details?.amount_paid ?? 0) - troco
  })

  let cartTotal = $derived.by(() => {
    return (
      Object.values(order.cart).reduce(
        (acc, { meta, quantity,item }) => acc + (meta.is_retail ? item.retail_price:item.wholesale_price) * quantity,
        0,
      ) + (order_details.taxa_entrega ?? 0)
    )
  })

  let isLoading = $state(false)

  async function handleUpdateOrder() {
    const confirmed = confirm('Você tem certeza que deseja atualizar o pedido?')
    if (confirmed) {
      isLoading = true
      try {
        const toAdd = Object.values(order.cart).map(item => ({
          item_id: item.item.id,
          quantity: item.quantity,
          price: item.meta.is_retail ? item.item.retail_price : item.item.wholesale_price,
        }))

        console.log(cartTotal)

        await trpc($page).customer.updateOrder.mutate({
          order_id: order_details.id,
          data: { total: cartTotal },
          items: toAdd,
        })
        toast.success('Pedido atualizado com sucesso!')
        invalidateAll()
      } catch (error) {
        toast.error('Erro ao atualizar pedido!')
      } finally {
        isLoading = false
        isOpenModalEdit?.close()
      }
    } else {
      toast.error('Pedido não atualizado!')
    }
  }

  async function handleDeleteOrder() {
    try {
      await trpc($page).customer.cancelOrder.mutate(order_details.id)
      toast.success('Pedido cancelado com sucesso!')
      goto('/admin/orders')
    } catch (error) {
      toast.error('Erro ao cancelar pedido!')
      console.log(error)
    }
  }
</script>

{#if order_details}
  <section
    class="mx-4 flex flex-col-reverse gap-5 pb-3 pt-8 antialiased md:pt-16 lg:flex-row"
  >
    <div
      class=" px-4 {order_details.address ? 'lg:w-2/3' : 'w-full'}  2xl:px-0"
    >
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-opacity-90 sm:text-2xl">
          Detalhes do pedido
        </h2>
        {#if (order_details.status === 'CONFIRMED' || order_details.status === 'PENDING') && order_details.amount_paid < order_details.total}
          <div class="flex gap-2">
            <!-- <button class="btn btn-square btn-primary btn-sm" onclick={()=>isOpenModalAdd?.showModal()}>
            <Plus />
          </button> -->
            <button
              class="btn btn-square btn-primary btn-sm"
              onclick={() => isOpenModalEdit?.showModal()}
            >
              <Pencil />
            </button>
            <button
              class="btn btn-square btn-error btn-sm"
              onclick={() => isOpenModalCancel?.showModal()}
            >
              <Trash2 />
            </button>
          </div>
        {:else}
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger class="btn btn-square btn-sm">
                <Pencil class="opacity-50" />
              </Tooltip.Trigger>
              <Tooltip.Content>
                <p>
                  O pedido já está a caminho, foi entregue ou já foi pago, não é
                  possivel editar
                </p>
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        {/if}
      </div>

      <div class="mt-6 sm:mt-8">
        <div class="relative w-full overflow-x-auto border-b border-base-200">
          <table
            class="w-full text-left font-medium text-opacity-90 md:table-fixed"
          >
            <tbody class="divide-y divide-base-200">
              {#each data.order_details.items as item}
                <tr>
                  <DisplayCart
                    image={item.product.image ?? 0}
                    price={item.price}
                    quantity={item.quantity}
                    name={item.product.name}
                  />
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        {#if order_details.taxa_entrega}
          <dl class="flex items-center justify-between gap-4 pt-2">
            <dt class="text-md text-opacity-90">Subtotal:</dt>
            <dd class="text-lg text-opacity-90">
              R${(
                (order_details.total - order_details.taxa_entrega) /
                100
              ).toFixed(2)}
            </dd>
          </dl>

          <dl class="flex items-center justify-between gap-4 pt-2">
            <dt class="text-sm text-opacity-90">Taxa entrega:</dt>
            <dd class="text-md text-opacity-90">
              R${(order_details.taxa_entrega / 100).toFixed(2)}
            </dd>
          </dl>
        {/if}

        <div class=" space-y-6">
          <dl class="flex items-center justify-between gap-4 pt-2">
            <dt class="text-lg font-bold text-opacity-90">Total:</dt>
            <dd class="text-xl font-bold text-success">
              R${(order_details.total / 100).toFixed(2)}
            </dd>
          </dl>
          <hr />
          <div>
            <h1 class="mb-3 text-lg font-semibold">Pagamentos:</h1>
            <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
              {#each order_details.payments as payment, i}
                <CardPayments
                  {payment}
                  {i}
                  created_by={payment.created_by?.email}
                />
              {/each}
            </div>
            {#if order_details.amount_paid - troco < order_details.total}
              <div class="mt-5 flex flex-col gap-5">
                <h1 class="text-center font-bold">
                  O pagamento ainda está pendente <span class="text-error">
                    pendentes!
                  </span>
                  Ainda faltam
                  <span class="text-success">
                    R${(
                      (order_details.total -
                        (order_details.amount_paid - troco)) /
                      100
                    ).toFixed(2)}
                  </span>
                  para pagar
                </h1>
                <button
                  class="btn btn-primary"
                  onclick={() => isOpenModal?.showModal()}
                >
                  Realizar pagamento
                </button>
              </div>
            {/if}
            {#if order_details.amount_paid - troco >= order_details.total}
              <h1 class="my-2 text-lg font-semibold text-success">
                &#128079; O pagamento já foi realizado para este pedido!
              </h1>
            {/if}
          </div>
        </div>
      </div>
    </div>

    <CustomerDetails {order_details} />
  </section>
{/if}

{#if order_details && order_details.amount_paid - troco < order_details.total}
  <dialog class="modal" bind:this={isOpenModal}>
    <div class="modal-box max-w-2xl">
      <PaymentFiado
        closeFn={() => isOpenModal?.close()}
        total_pedido={order_details.total}
        order_id={order_details.id}
        {amount_paid_order}
      />
    </div>

    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
{/if}

{#if order_details}
  <dialog class="modal" bind:this={isOpenModalEdit}>
    <div class="modal-box flex max-w-fit flex-col gap-5 xl:flex-row">
      <div class="max-h-[100vh] max-w-4xl overflow-y-auto pr-5">
        <EditOrderMenu products={data.products} />
      </div>
      <div class="max-h-[100vh] max-w-2xl overflow-y-auto pr-5">
        <h1 class="text-2xl font-semibold">Carrinho:</h1>
        <table
          class="w-full text-left font-medium text-opacity-90 md:table-fixed"
        >
          <tbody class="divide-y divide-base-200">
            {#each Object.entries(order.cart) as [key, { item }]}
              {@const cartItem = order.cart[item.id]}
              <tr>
                <DisplayCart
                  name={item.name}
                  image={item.image ?? 0}
                  price={cartItem.meta.is_retail
                    ? cartItem.item.retail_price
                    : cartItem.item.wholesale_price}
                  quantity={cartItem.quantity}
                  bind:is_retail={cartItem.meta.is_retail}
                  isEditable={true}
                />
                <td class="w-12">
                  <button
                    class="btn btn-circle btn-error"
                    onclick={() => order.removeItem(item)}
                  >
                    <Trash2 />
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>

        {#if Object.values(order.cart).length > 0}
          <div class="flex flex-col">
            {#if order_details.taxa_entrega}
              <dl class="flex items-center justify-between gap-4 pt-2">
                <dt class="text-md text-opacity-90">Subtotal:</dt>
                <dd class="text-lg text-opacity-90">
                  R${((cartTotal - order_details.taxa_entrega) / 100).toFixed(
                    2,
                  )}
                </dd>
              </dl>

              <dl class="flex items-center justify-between gap-4 pt-2">
                <dt class="text-sm text-opacity-90">Taxa entrega:</dt>
                <dd class="text-md text-opacity-90">
                  R${(order_details.taxa_entrega / 100).toFixed(2)}
                </dd>
              </dl>
            {/if}
            <dl class="flex items-center justify-between gap-4 pt-2">
              <dt class="text-lg font-bold text-opacity-90">Total:</dt>
              <dd class="text-xl font-bold text-success">
                R${(cartTotal / 100).toFixed(2)}
              </dd>
            </dl>
            <hr />
          </div>
          <div class="flex justify-end">
            <button class="btn btn-primary mt-4" onclick={handleUpdateOrder} disabled={isLoading}>
              {#if isLoading}
                Atualizando pedido...
              {:else}
                Atualizar pedido!
              {/if}
            </button>
          </div>
        {:else}
          <h1 class="mt-20 text-center text-lg font-semibold">
            Carrinho vazio
          </h1>
        {/if}
      </div>
    </div>

    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
{/if}

<dialog class="modal" bind:this={isOpenModalCancel}>
  <div class="modal-box max-w-2xl">
    <SenhaAdmin
      reason="Cancelar pedido"
      onSuccess={() => {
        handleDeleteOrder()
        isOpenModalCancel?.close()
      }}
    />
  </div>

  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
