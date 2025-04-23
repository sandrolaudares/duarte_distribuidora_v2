<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { LayoutData } from './$types';
    import { createCartContext } from '../../../../lib/state/contextCustomerOrder/cartContext'
    import CartDrawer from '$lib/components/customer/CartDrawer.svelte'


    let { data, children }: { data: LayoutData, children: Snippet } = $props();

    let cart = createCartContext()
</script>

{@render children()}

<div class="fixed bottom-8 right-8">
    <CartDrawer />
</div>