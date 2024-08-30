<script lang="ts">
	import { toast } from 'svelte-sonner';
  import { trpc } from '$trpc/client'
  import type { PageData } from './$types'
  import { page } from '$app/stores'

  export let data: PageData

  let orders = data.pending_orders

  function calculateDaysDiff(createdAt: string): number {
    const createdDate = new Date(createdAt)
    const today = new Date()
    const diffTime = today.getTime() - createdDate.getTime()
    return Math.floor(diffTime / (1000 * 60 * 60 * 24))
  }

  function getExpirationDate(createdAt: string): string {
    const createdDate = new Date(createdAt)
    const expirationDate = new Date(createdDate)
    expirationDate.setDate(createdDate.getDate() + 7)
    return expirationDate.toLocaleDateString()
  }

  function getDaysToExpiry(createdAt: string): number {
    const createdDate = new Date(createdAt)
    const expirationDate = new Date(createdDate)
    expirationDate.setDate(createdDate.getDate() + 7)
    const today = new Date()
    const diffTime = expirationDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  function getBgColor(createdAt: string): string {
    const daysDiff = calculateDaysDiff(createdAt)

    if (daysDiff >= 7) {
      return 'bg-error text-error-content'
    } else if (daysDiff >= 5) {
      return 'bg-warning text-warning-content'
    } else {
      return 'bg-base-200'
    }
  }

  //TODO: fix errors
</script>

<h1 class="my-3 text-center text-3xl">Pedidos com pagamento pendente:</h1>

<div class="overflow-x-auto">
  <table class="table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Data do Pedido</th>
        <th>Data de Expiração</th>
        <th>Dias para Expiração</th>
        <th>Status Pagamento</th>
        <th>Pagamento em</th>
        <th>Total</th>
        <th>Cliente</th>
        <th>Pagamento recebido</th>
      </tr>
    </thead>
    <tbody>
      {#each orders as order}
        <tr class={getBgColor(order.created_at)}>
          <td>{order.id}</td>
          <td>{order.created_at}</td>
          <td>{getExpirationDate(order.created_at)}</td>
          <td>
            {#if getDaysToExpiry(order.created_at) >= 0}
              {getDaysToExpiry(order.created_at)} dias
            {:else}
              Expirado
            {/if}
          </td>
          <td>PENDENTE</td>
          <td>{order.payment_method}</td>
          <td>R${(order.total / 100).toFixed(2)}</td>
          <td>
            {order.customer?.name} - {order.customer?.cellphone ??
              'Telefone sem registro'} - {order.customer?.email}
          </td>
          <td>
            <button
              class="btn btn-primary"
              on:click={async () => {
                await trpc($page).customer.updateOrderPaymentStatus.mutate({
                  order_id: order.id,
                  payment_status: 'CONFIRMED'
                })
                toast.success('Pedido finalizado!')
                window.location.reload()
              }}
            >
              PEDIDO PAGO
            </button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
