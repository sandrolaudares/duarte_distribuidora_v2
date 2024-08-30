<script lang="ts">
    import type { PageData } from './$types';
    
    export let data: PageData;

    let orders = data.pending_orders
</script>

{#each orders as order}
    
    {order.payment_status}
{/each}