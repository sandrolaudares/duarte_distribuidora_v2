<script lang="ts">
  import type { PageData } from './$types'

  import StockDashboard from './StockDashboard.svelte'

  let { data }: { data: PageData } = $props()
</script>

<StockDashboard
  logs={data.logs}
  totalItems={data.totalItemsStock.totalQuantity}
  totalValue={data.totalValueInStock.totalValue}
  pendingTransfers={data.totalPendingOrders.orders}
  qntLowStock={data.qntLowStock.qnt}
/>

