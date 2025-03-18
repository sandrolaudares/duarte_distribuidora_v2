<script lang="ts">
  import type {
    InsertOrderPayment,
    SelectOrderPayment,
  } from '$lib/server/db/schema'
  import { formatCurrency } from '$lib/utils'
  import { DateFormatter } from '@internationalized/date'

  type Props = {
    payment: Omit<InsertOrderPayment, 'order_id'>
    created_by: string | undefined
    i: number
  }

  let { payment, created_by, i }: Props = $props()

  const df = new DateFormatter('pt-BR', {
    dateStyle: 'medium',
  })
</script>

<div class="rounded-md border p-4">
  <div class="flex items-center justify-between">
    <span>
      Pagamento #{i + 1}
      {#if payment.created_at}
        - {df.format(payment.created_at)}
      {/if}
    </span>
    <div>
      Pago:
      <span class="text-md font-semibold">
        {formatCurrency(payment.amount_paid)}
      </span>
    </div>
  </div>
  <div class="flex items-center justify-between">
    <div>
      Metódo de pagamento:
      <span class="capitalize">{payment.payment_method}</span>
    </div>
    {#if payment.payment_method === 'dinheiro'}
      <p class="text-md bg-opacity-60">
        Troco:
        <span class="font-semibold">
          {payment.troco ? formatCurrency(payment.troco) : null}
        </span>
      </p>
    {/if}
  </div>
  {#if created_by}
    <p>Criado por: {created_by}</p>
  {/if}
</div>
