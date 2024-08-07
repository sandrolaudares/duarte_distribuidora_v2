<script lang="ts">
  import type { CurrentOrders } from '$db/schema/customer/controller.ts'

  export let click_confirm = () => {}
  export let click_refuse = () => {}

  export let button_text = ''
  export let button_recusar = ''
  export let order: CurrentOrders[0]
</script>

<div class="m-2 overflow-hidden rounded bg-base-300 p-4 shadow-lg">
  <div class="mb-4 flex justify-between gap-1 text-center text-sm">
    <div class="flex flex-col items-start">
      <h3>
        Pedido <strong>#{order.id}</strong>
      </h3>
      <p>Data: {order.created_at}</p>
      <p>Status pagamento: {order.payment_status}</p>
    </div>
    <div class="flex flex-col items-end">
      <p>
        Pagamento em <strong>{order.payment_method}</strong>
      </p>
      <p>
        Total: <strong class="text-success">R${order.total}</strong>
      </p>
    </div>
  </div>
  <div class="mt-4">
    <h4 class="mb-2 text-lg font-semibold">Produtos pedidos:</h4>
    <div class="flex flex-col gap-2 sm:flex-row">
      {#each order.items as item}
        <div class="flex rounded-md bg-base-100 p-2 shadow-sm">
          <p class="text-base">
            {item.quantity}x - {item.product.name} -
            <span class="font-bold">${item.price}</span>
          </p>
        </div>
      {/each}
    </div>
  </div>

  <div
    class="mt-2 flex flex-col items-center justify-between gap-3 text-sm sm:flex-row"
  >
    <p>Observacoes: {order.observation ?? 'Nenhuma'}</p>
    <div>
      {#if button_recusar}
        <button class=" btn btn-error" on:click={() => click_refuse()}>
          {button_recusar}
        </button>
      {/if}
      {#if button_text}
        <button class="btn btn-primary" on:click={() => click_confirm()}>
          {button_text}
        </button>
      {/if}
    </div>
  </div>
</div>
