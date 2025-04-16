<script lang="ts">
  import type { RouterOutputs } from '$trpc/router'
  import * as Tooltip from '$lib/components/ui/tooltip/index'
  import ModalMotoboy from '$lib/components/cashierComponents/ModalMotoboy.svelte'
  import { modal } from '$lib/components/modal'
  import { trpc } from '$trpc/client'
  import { page } from '$app/state'
  import { toast } from 'svelte-sonner'
  import { invalidateAll } from '$app/navigation'

  let {
    order_details,
  }: {
    order_details: Exclude<RouterOutputs['customer']['getOrderById'], undefined>
  } = $props()

  let isLoading = $state(false)

  function handleSelectMotoboy() {
    modal.open(ModalMotoboy, {
      selectedMotoboy: async (motoboy) => {
        isLoading = true
        try {
          await trpc(page).customer.updateMotoboyOrder.mutate({
            order_id: order_details.id,
            data: { motoboy_id: motoboy.id },
          })
          toast.success('Motoboy atualizado com sucesso!')
          order_details.motoboy = motoboy
        } catch (error) {
          console.error(error)
          toast.error('Erro ao atualizar motoboy')
        } finally {
          isLoading = false
        }
      },
    })
  }
</script>

{#if order_details.customer}
  <div class="px-4 lg:w-1/3 2xl:px-0">
    <h2 class="text-2xl font-semibold text-opacity-90">Detalhes do Cliente</h2>
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
        <div class="mt-6 space-y-4 border-y border-base-200 py-6">
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
        </div>
      {/if}

      {#if order_details.motoboy}
        <div class="flex items-center justify-between">
          <h1 class="flex gap-2">
            Motoboy: <span class="font-bold">
              {isLoading ? 'Carregando...': order_details.motoboy.username}
            </span>
          </h1>
          {#if (order_details.status === 'CONFIRMED' || order_details.status === 'PENDING') && order_details.amount_paid < order_details.total}
            <button
              onclick={handleSelectMotoboy}
              class="btn btn-primary btn-sm"
            >
              Trocar motoboy
            </button>
          {:else}
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger class="btn btn-sm text-opacity-50">
                  Trocar motoboy
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <p>
                    O pedido já está a caminho, foi entregue ou já foi pago, não
                    é possivel editar
                  </p>
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}
