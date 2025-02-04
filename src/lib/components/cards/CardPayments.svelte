<script lang="ts">
  import type { InsertOrderPayment, SelectOrderPayment } from "$lib/server/db/schema"
  import { DateFormatter } from "@internationalized/date"

  export let payment:Omit<InsertOrderPayment,'order_id'>
  export let created_by = ''
  export let i

  const df = new DateFormatter('pt-BR', {
    dateStyle: 'medium',
  })
</script>

<div
  class="rounded-lg bg-base-200 p-4 shadow-sm"
>
  Pagamento #{i + 1}
  {#if payment.created_at}
  - {df.format(payment.created_at)}
  {/if}
  <p class="bg-opacity-60">
    <span class="font-semibold">Quantidade paga:</span>
    R${(payment.amount_paid / 100).toFixed(2)}
  </p>
  {#if payment.payment_method === 'dinheiro'}
    <p class="bg-opacity-60">
      <span class="font-semibold">Troco:</span>
      R${payment.troco ? (payment?.troco / 100).toFixed(2) : null}
    </p>
  {/if}
  <p class="bg-opacity-60">
    <span class="font-semibold">Método de pagamento:</span>
    {payment.payment_method}
  </p>
  {#if created_by}
    <p>Criado por: {created_by}</p>
  {/if}
</div>
