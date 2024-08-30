<script lang="ts">
  import type { PageData } from './$types'

  export let data: PageData

  let orders = data.pending_orders

  //TODO: Adicionar data de expiracao e fazer o bg mudar cor apos 5 dias e apos 7
</script>

<h1 class="text-center text-3xl">Pedidos com pagamento pendente:</h1>

<div class="grid grid-cols-3">
    {#each orders as order}
    <div
        class="m-2 overflow-hidden rounded bg-base-300 bg-opacity-90 p-2 shadow-lg"
    >
        <div class="mb-4 flex justify-between gap-1 text-center text-sm">
        <div class="flex flex-col items-start">
        <h3>
            Pedido <strong>#{order.id}</strong>
        </h3>
        <p>Data do pedido: {order.created_at}</p>
        <p>Status pagamento: {order.payment_status}</p>
        </div>
        <div class="flex flex-col items-end">
            <p>
                Pagamento em <strong>{order.payment_method}</strong>
            </p>
            <p>
                Total: <strong class="text-lg text-success">
                R${(order.total / 100).toFixed(2)}
            </strong>
            </p>
        </div>
        </div>
        <div class="flex flex-col gap-2">
        {#if order.customer}
            <p class="text-sm">
            <strong>Cliente:</strong>
            {order.customer?.name} - {order.customer?.cellphone ??
                'Telefone sem registro'} - {order.customer?.email}
            </p>
        {/if}
        </div>
    </div>
    {/each}
</div>
