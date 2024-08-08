<script lang="ts">
  import type { PageData } from './$types'

  export let data: PageData

  const { estoque } = data
</script>

<!-- TODO: frontend, mas ainda nao faz que vou precisar fazer um refactor pra gente colocar as transacoes em uma table -->
<h1>
  {estoque.name}
</h1>

<h2>Estoques</h2>
<div class="flex">
  {#each estoque.product_stock as stock}
    <h3>
      {stock.distribuidora.name}
    </h3>

    <div class=" space-x-1 space-y-1">
      {#each stock.transactions as item}
        <div class="bg-base-200">
          {JSON.stringify(item)}
        </div>
      {/each}
    </div>
  {/each}
</div>
