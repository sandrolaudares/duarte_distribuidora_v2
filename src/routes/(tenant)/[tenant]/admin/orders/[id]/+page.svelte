<script lang="ts">
  import type { PageData } from './$types'
  import CardPayments from '$lib/components/cards/CardPayments.svelte'
  import PaymentFiado from '$lib/components/PaymentFiado.svelte'
  import { trpc } from '$trpc/client'
  import { page } from '$app/state'
  import { CircleAlert, Pencil, Plus, Printer, Trash2 } from 'lucide-svelte'
  import * as Tooltip from '$lib/components/ui/tooltip/index'

  import { createCartContext } from '$lib/state/contextEditOrder/cartContext.svelte'
  import DisplayCart from './DisplayCart.svelte'
  import CustomerDetails from './CustomerDetails.svelte'
  import { toast } from 'svelte-sonner'
  import { goto, invalidateAll } from '$app/navigation'
  import SenhaAdmin from '$lib/components/SenhaAdmin.svelte'
  import { formatCurrency } from '$lib/utils'
  import * as Alert from '$lib/components/ui/alert/index'
  import ModalPrint from '$lib/components/cashierComponents/ModalPrint.svelte'
  import LoadingBackground from '$lib/components/datatable/LoadingBackground.svelte'
  import { getPrinterContext } from '../allorders/printerContext.svelte'
  import { modal } from '$lib/components/modal'
  import AlertComponent from '$lib/components/modal/base/Alert.svelte'
  import CardapioCategory from '$lib/components/cashierComponents/CardapioCategory.svelte'

  let { data }: { data: PageData } = $props()

  const order = createCartContext(data.order_details)

  const prr = getPrinterContext()

  let { order_details } = $state(data)

  let isOpenModal: HTMLDialogElement | null = $state(null)
  let isOpenModalEdit: HTMLDialogElement | null = $state(null)
  let isOpenModalCancel: HTMLDialogElement | null = $state(null)

  let troco = $derived.by(()=>{
    return order_details?.payments?.reduce(
      (acc, payment) => acc + (payment.troco ?? 0),
      0,
    ) ?? 0
  })
    

  let amount_paid_order = $derived.by(() => {
    return (order_details?.amount_paid ?? 0) - troco
  })

  let cartTotal = $derived.by(() => {
    return (
      Object.values(order.cart).reduce(
        (acc, { meta, quantity, item }) =>
          acc +
          (meta.is_retail ? item.retail_price : item.wholesale_price) *
            quantity,
        0,
      ) + (order_details.taxa_entrega ?? 0)
    )
  })

  let isLoading = $state(false)

  function handleConfirmUpdate(){
    isOpenModalEdit?.close()
    modal.open(AlertComponent,{
      title:'Tem certeza que deseja atualizar o pedido?',
      text:'',
      confirmText:'Atualizar pedido',
      onConfirm() {
        handleUpdateOrder()
      },
    })
  }

  $inspect(data.order_details)

  async function handleUpdateOrder() {
      isLoading = true
      try {
        const toAdd = Object.values(order.cart).map(item => ({
          item_id: item.item.id,
          quantity: item.quantity,
          price: item.meta.is_retail
            ? item.item.retail_price
            : item.item.wholesale_price,
        }))

        console.log(cartTotal)

        await trpc(page).customer.updateOrder.mutate({
          order_id: order_details.id,
          data: { total: cartTotal },
          items: toAdd,
        })
        toast.success('Pedido atualizado com sucesso!')
        await invalidateAll()
        order_details = data.order_details
      } catch (error) {
        toast.error('Erro ao atualizar pedido!')
      } finally {
        isLoading = false
        isOpenModalEdit?.close()
      }
  }

  async function handleDeleteOrder() {
    try {
      await trpc(page).customer.cancelOrder.mutate(order_details.id)
      toast.success('Pedido cancelado com sucesso!')
      goto('/admin/orders')
    } catch (error) {
      toast.error('Erro ao cancelar pedido!')
      console.log(error)
    }
  }

  let isOpenModalPrint: HTMLDialogElement | null = $state(null)
  let loadingPrinters = $state(false)

  async function handleOpenModal() {
    loadingPrinters = true

    await prr.connect()

    if (prr.getPrinter() && prr.getPrinters().length === 0) {
      prr.addPrinter(prr.getPrinter())
    } else if (!prr.getPrinter()) {
      await prr.listPrinters()
    }

    isOpenModalPrint?.showModal()
    loadingPrinters = false
  }
</script>

{#if loadingPrinters}
  <LoadingBackground />
{/if}

{#if isLoading}
  <LoadingBackground/>
{/if}

<dialog class="modal" bind:this={isOpenModalPrint}>
  <div class="modal-box max-w-2xl">
    <form method="dialog">
      <button class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">
        ✕
      </button>
    </form>
    
    <ModalPrint
      bind:loadingPrinters
      tenant={data.tenant!}
      selectedOrder={order_details.id}
      closeModal={() => {
        isOpenModalPrint?.close()
      }}
    />

  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

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
        <div class="flex gap-2">
        {#if (order_details.status === 'CONFIRMED' || order_details.status === 'PENDING') && order_details.amount_paid < order_details.total}
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
          <button
              class="btn btn-square btn-success text-white btn-sm"
              onclick={handleOpenModal}
            >
              <Printer />
            </button>
        </div>
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
              {formatCurrency(order_details.total - order_details.taxa_entrega)}
            </dd>
          </dl>

          <dl class="flex items-center justify-between gap-4 pt-2">
            <dt class="text-sm text-opacity-90">Taxa entrega:</dt>
            <dd class="text-md text-opacity-90">
              {formatCurrency(order_details.taxa_entrega)}
            </dd>
          </dl>
        {/if}

        <div class=" space-y-6">
          <dl class="flex items-center justify-between gap-4 pt-2">
            <dt class="text-lg font-bold text-opacity-90">Total:</dt>
            <dd class="text-xl font-bold text-success">
              {formatCurrency(order_details.total)}
            </dd>
          </dl>
          <hr />
          <div>
            <h1 class="mb-3 text-lg font-semibold">Pagamentos:</h1>
            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
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
                <!-- <h1 class="text-center font-bold">
                  O pagamento ainda está pendente <span class="text-error">
                    pendentes!
                  </span>
                  Ainda faltam
                  <span class="text-success">
                    {formatCurrency(order_details.total -(order_details.amount_paid - troco))}
                  </span>
                  para pagar
                </h1> -->
                <Alert.Root variant="destructive">
                  <CircleAlert class="size-4" />
                  <Alert.Title>Pagamento pendente</Alert.Title>
                  <Alert.Description>
                    O pagamento ainda está pendente e ainda faltam {formatCurrency(
                      order_details.total - (order_details.amount_paid - troco),
                    )}
                    pendentes!
                  </Alert.Description>
                </Alert.Root>
                <button
                  class="btn btn-primary"
                  onclick={() => isOpenModal?.showModal()}
                >
                  Realizar pagamento
                </button>
              </div>
            {/if}
            {#if order_details.amount_paid - troco >= order_details.total}
              <h1 class="my-2 flex gap-2 text-lg font-semibold text-success">
                <p>&#x2705;</p>
                 O pagamento já foi realizado para este pedido!
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
        closeFn={async() =>{
           isOpenModal?.close()
           }}
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
        <CardapioCategory products={data.products} cart={order} tipo_preco="retail_price"/>
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
                  {formatCurrency(cartTotal - order_details.taxa_entrega)}
                </dd>
              </dl>

              <dl class="flex items-center justify-between gap-4 pt-2">
                <dt class="text-sm text-opacity-90">Taxa entrega:</dt>
                <dd class="text-md text-opacity-90">
                  {formatCurrency(order_details.taxa_entrega)}
                </dd>
              </dl>
            {/if}
            <dl class="flex items-center justify-between gap-4 pt-2">
              <dt class="text-lg font-bold text-opacity-90">Total:</dt>
              <dd class="text-xl font-bold text-success">
                {formatCurrency(cartTotal)}
              </dd>
            </dl>
            <hr />
          </div>
          <div class="flex justify-end">
            <button
              class="btn btn-primary mt-4"
              onclick={handleConfirmUpdate}
              disabled={isLoading}
            >
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
