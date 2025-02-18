<script lang="ts">
  import { Clock, Package, PlusCircle, ArrowUpDown } from 'lucide-svelte'
  import StockStats from './StockStats.svelte'
  import RecentActivity from './RecentActivity.svelte'

  let { logs,totalItems,totalValue,pendingTransfers,qntLowStock } = $props()
</script>

<div class=" p-6">
  <header class="mb-6">
    <h1 class="text-3xl font-bold">Gerenciamento de estoque</h1>
  </header>
  <div class="mb-6 grid gap-6 md:grid-cols-2">
    <StockStats {totalItems} {totalValue} {pendingTransfers} {qntLowStock} />
    <RecentActivity {logs} />
  </div>
  <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
    <a href="/admin/stock/transferir" class="block">
      <div
        class="h-full rounded-lg bg-base-200 p-6 shadow-md transition-shadow hover:shadow-lg"
      >
        <div class="mb-2 flex items-center justify-between">
          <h2 class="text-sm font-medium">Transferências</h2>
          <ArrowUpDown class="h-4 w-4 " />
        </div>
        <p class="text-2xl font-bold">Solicite transferências de estoque</p>
      </div>
    </a>
    <a href="/admin/stock/solicitacoes" class="block">
      <div
        class="h-full rounded-lg bg-base-200 p-6 shadow-md transition-shadow hover:shadow-lg"
      >
        <div class="mb-2 flex items-center justify-between">
          <h2 class="text-sm font-medium">Solicitadas</h2>
          <Clock class="h-4 w-4 " />
        </div>
        <p class="text-2xl font-bold">Transferências solicitadas</p>
      </div>
    </a>
    <a href="/admin/stock/skus" class="block">
      <div
        class="h-full rounded-lg bg-base-200 p-6 shadow-md transition-shadow hover:shadow-lg"
      >
        <div class="mb-2 flex items-center justify-between">
          <h2 class="text-sm font-medium">Inventário</h2>
          <Package class="h-4 w-4 " />
        </div>
        <p class="text-2xl font-bold">Visualizar estoque atual</p>
      </div>
    </a>
    <a href="/admin/stock/entrada" class="block">
      <div
        class="h-full rounded-lg bg-base-200 p-6 shadow-md transition-shadow hover:shadow-lg"
      >
        <div class="mb-2 flex items-center justify-between">
          <h2 class="text-sm font-medium">Entrada</h2>
          <PlusCircle class="h-4 w-4 " />
        </div>
        <p class="text-2xl font-bold">Entrada de estoque</p>
      </div>
    </a>
  </div>

  
</div>
