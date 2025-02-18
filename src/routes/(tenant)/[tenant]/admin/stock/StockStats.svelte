<script lang="ts">
  let {
    totalItems = 0,
    lowStockItems = 0,
    pendingTransfers = 0,
    totalValue = 0,
    qntLowStock = 0,
  } = $props()
</script>

<div class="rounded-lg bg-base-200 p-6 shadow-md">
  <h2 class="mb-4 text-lg font-semibold">Status do estoque</h2>
  <dl class="grid grid-cols-2 gap-4">
    <div>
      <dt class="text-sm font-medium opacity-50">
        Quantidade total em estoque
      </dt>
      <dd class="text-2xl">
        <span class="font-bold">{totalItems}</span>
        itens
      </dd>
    </div>
    <div>
        <dt class="text-sm font-medium opacity-50">Produtos com baixa quantidade em estoque</dt>
        <dd class="text-2xl font-bold flex items-center gap-2" class:text-error={qntLowStock === 0}  class:text-sm={qntLowStock === 0} class:font-normal={qntLowStock === 0}>
          {qntLowStock === 0
            ? 'Nenhum pedido com menos de 15 em estoque'
            : qntLowStock}
        </dd>
      </div>
    <div>
      <dt class="text-sm font-medium opacity-50">Transferencias pendentes</dt>
      <dd class="text-2xl font-bold flex items-center gap-2" class:text-error={pendingTransfers === 0}>
        {pendingTransfers === 0
          ? 'Nenhum pedido de transferência'
          : pendingTransfers}
          <a class="text-sm badge badge-primary" href="/admin/stock/solicitacoes">visualizar</a>
      </dd>
    </div>
    <div>
      <dt class="text-sm font-medium opacity-50">Valor total em estoque</dt>
      <dd class="text-2xl">
        R$ <span class=" font-bold">{(totalValue / 100).toFixed(2)}</span>
      </dd>
    </div>
  </dl>
</div>
