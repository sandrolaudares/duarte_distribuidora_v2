<script lang="ts">
  import type { RouterOutputs } from '$trpc/router'

  let {
    order_details,
  }: {
    order_details: Exclude<RouterOutputs['customer']['getOrderById'], undefined>
  } = $props()
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
        </div>
      {/if}
    </div>
  </div>
{/if}
