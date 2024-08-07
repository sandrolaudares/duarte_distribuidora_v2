<script lang="ts">
  export let click_confirm = () => {}
  export let click_refuse = () => {}

  export let button_text = ''
  export let button_recusar = ''
  export let order
</script>

<div class="m-4 max-w-sm overflow-hidden rounded bg-white p-4 shadow-lg">
  <div class="px-6 py-4">
    <div class="mb-2 text-xl font-bold">ID: {order.id}</div>
    <p class=" text-base">Metodo pagamento: {order.payment_method}</p>
    <p class=" text-base">Status pagamento: {order.payment_status}</p>
    <p class=" text-base">Total: ${order.total}</p>
    <p class=" text-base">Status: {order.status}</p>
    <p class=" text-base">Criado: {order.created_at}</p>
    {#if order.items && order.items.length > 0}
      <div class="mt-4">
        <div class="mb-2 text-lg font-bold">Items:</div>
        {#each order.items as item}
          <div class="border-t border-gray-200 pt-2">
            <p class=" text-base">Item pedido: {item.product.name}</p>
            <p class=" text-base">Quantidade: {item.quantity}</p>
            <p class=" text-base">Preco: ${item.price}</p>
          </div>
        {/each}
      </div>
    {/if}
    <div>
      {#if button_recusar}
        <button class=" btn btn-error" on:click={() => click_refuse(order.id)}>
          {button_recusar}
        </button>
      {/if}
      {#if button_text}
        <button
          class="btn btn-primary"
          on:click={() => click_confirm(order.id)}
        >
          {button_text}
        </button>
      {/if}
    </div>
  </div>
</div>
