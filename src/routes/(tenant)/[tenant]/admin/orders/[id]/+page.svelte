<script lang="ts">
  import PaymentCashier from '$lib/components/PaymentCashier.svelte'
  import type { PageData } from './$types'
  import { getImagePath } from '$utils/image'
  import CardPayments from '$lib/components/cards/CardPayments.svelte'
  import PaymentFiado from '$lib/components/PaymentFiado.svelte'
  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'
  import { onMount } from 'svelte'
  import type { SelectOrderPayment } from '$lib/server/db/schema'
  import { Pencil,Plus,Trash2 } from 'lucide-svelte'
  import * as Tooltip from '$lib/components/ui/tooltip/index'
  import EditOrder from './EditOrder.svelte'
  import CardapioCaixa from '../../cashier/[id]/CardapioCaixa.svelte'
  import CaixaColumn from '../../cashier/[id]/CaixaColumn.svelte'
  import EditCart from './EditCart.svelte'

  let { data }: { data: PageData } = $props()

  let order_details = data.order_details

  let isOpenModal: HTMLDialogElement | null = $state(null)
  let isOpenModalEdit: HTMLDialogElement | null = $state(null)
  let isOpenModalAdd: HTMLDialogElement | null = $state(null)


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
</script>

{#if order_details}
  <section
    class="container mx-auto flex flex-col-reverse gap-5 pb-3 pt-8 antialiased md:pt-16 lg:flex-row"
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
          <button class="btn btn-square btn-primary btn-sm" onclick={()=>isOpenModalEdit?.showModal()}>
            <Pencil />
          </button>
          <button class="btn btn-square btn-error btn-sm">
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
                  O pedido já está a caminho, foi entregue ou já foi pago, não é possivel
                  editar
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
              {#each order_details.items as item}
                <tr>
                  <td class="whitespace-nowrap py-4 md:w-[384px]">
                    <div class="flex items-center gap-4">
                      <div
                        class="flex aspect-square h-14 w-14 shrink-0 items-center"
                      >
                        <img
                          class="h-auto max-h-full w-full rounded-md"
                          src={getImagePath(item.product.image)}
                          alt="product"
                        />
                      </div>
                      <h1>{item.product.name}</h1>
                    </div>
                  </td>

                  <td
                    class="p-4 text-right text-base font-normal text-opacity-90"
                  >
                    {item.quantity}x R${(item.price / 100).toFixed(2)}
                  </td>

                  <td
                    class="p-4 text-right text-base font-bold text-opacity-90"
                  >
                    R${((item.price * item.quantity) / 100).toFixed(2)}
                  </td>
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

    {#if order_details.customer}
      <div class="px-4 lg:w-1/3 2xl:px-0">
        <h2 class="text-2xl font-semibold text-opacity-90">
          Detalhes do Cliente
        </h2>
        <div class="mt-6 space-y-6 border-t border-base-200 py-6">
          <dl class="space-y-4">
            <div class="flex justify-between">
              <dt class="text-lg font-semibold text-opacity-90">Nome:</dt>
              <dd class="text-base font-normal text-opacity-50">
                {order_details.customer.name}
              </dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-lg font-semibold text-opacity-90">Email:</dt>
              <dd class="text-base font-normal text-opacity-50">
                {order_details.customer.email}
              </dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-lg font-semibold text-opacity-90">Telefone:</dt>
              <dd class="text-base font-normal text-opacity-50">
                {order_details.customer.phone ?? 'Telefone não registrado!'}
              </dd>
            </div>
          </dl>

          {#if order_details.address}
            <div class="mt-6 space-y-4 border-t border-base-200 py-6">
              <h4 class="text-lg font-semibold text-opacity-90">
                Endereço do Cliente
              </h4>
              <dl>
                <dd class="mt-1 text-base font-normal text-opacity-50">
                  {order_details.address.street}, {order_details.address.number}
                  {order_details.address.complement}, {order_details.address
                    .neighborhood}, {order_details.address.city} - {order_details
                    .address.state}, CEP: {order_details.address.cep}
                </dd>
              </dl>
              <!-- <div class="flex justify-end">
                <button class="btn btn-link">Mudar endereço</button>
              </div> -->
              <!--TODO: mudar endereco e se !endereco colocar pra vincular se pedido ainda nao estiver pronto-->
            </div>
          {/if}
        </div>
      </div>
    {/if}
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
  <div class="modal-box max-w-2xl">
    <EditOrder order={order_details}/>
  </div>

  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
{/if}

{#if data.products}
<dialog class="modal" bind:this={isOpenModalAdd}>
  <div class="modal-box max-w-7xl">
    <CardapioCaixa products={data.products}/>
    <hr>
    <EditCart bind:taxaEntrega bind:isDelivery />
  </div>

  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
{/if}