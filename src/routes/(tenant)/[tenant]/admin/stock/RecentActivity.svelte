<script lang="ts">
  import type { SelectBugReport, SelectLogs, SelectStockTransaction } from '$lib/server/db/schema'
  import type { RouterOutputs } from '$trpc/router'

  let { logs }: { logs: SelectStockTransaction[] } = $props()
</script>

<div class="rounded-lg bg-base-200 p-6 shadow-md">
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-lg font-semibold">Atividade recente</h2>
    <a href="/admin/stock/skus" class="text-sm badge badge-primary">Ver tudo</a>
  </div>
  <ul class="space-y-4">
    {#each logs as log}
    <li class="flex items-center space-x-4">
      <div
        class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
        class:bg-primary={log.transacao_estoque.type === 'Entrada'}
        class:bg-error={log.transacao_estoque.type === 'Saida'}
      >
        <span class="font-bold text-white">{log.transacao_estoque.type[0]}</span>
      </div>
      <div class="flex-grow">
        <p class="text-sm font-medium">{log.estoque.name} ({log.transacao_estoque.type})</p>
        <p class="text-xs opacity-50">
          Quantidade: {log.transacao_estoque.quantity}
          <!-- {#if log.transacao_estoque.supplier_id}
            - Pedido: {log.pedidos.id}
          {/if}
          {#if log.transacao_estoque.order_id}
            - Pedido: {log.transacao_estoque.order_id}
          {/if} -->
          {#if log.transacao_estoque.created_at}
            - Criado em: {new Date(log.transacao_estoque.created_at).toLocaleString()}
          {/if}
        </p>
      </div>
    </li>
  {/each}
  </ul>
</div>
