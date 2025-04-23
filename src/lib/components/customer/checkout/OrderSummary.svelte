<script lang="ts">
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Separator } from "$lib/components/ui/separator";
    import { formatCurrency, getImagePath } from "$lib/utils"
    import { getCartContext } from "../../../state/contextCustomerOrder/cartContext"
    import type { SelectTenant } from "$lib/server/db/central/schema"

    const cart = getCartContext()

	type Props = {
		showActions?: boolean;
        tenant:SelectTenant
	};

	let { showActions = true,tenant }:Props = $props();
</script>

<Card>
	<CardHeader>
		<CardTitle>Resumo do pedido</CardTitle>
	</CardHeader>
	<CardContent class="space-y-4">
		<div class="space-y-4">
			{#each Object.values(cart.cart) as carrinho}
				<div class="flex gap-4">
					<img src={getImagePath(carrinho.item.image)} alt={carrinho.item.name} class="h-16 w-16 rounded-lg object-cover" />
					<div class="flex flex-1 flex-col justify-between">
						<div>
							<h3 class="font-medium">{carrinho.item.name}</h3>
							<p class="text-sm text-gray-600">Quantidade: {carrinho.quantity}</p>
						</div>
						<p class="font-medium">{formatCurrency(carrinho.item.retail_price * carrinho.quantity)}</p>
					</div>
				</div>
				<Separator />
			{/each}
		</div>

		<div class="space-y-2">
			<div class="flex justify-between text-sm">
				<span>Subtotal</span>
				{#if cart.getTotal()}
					<span>{formatCurrency(cart.getTotal() - (cart.meta.taxaEntrega ?? 0))}</span>
				{/if}
			</div>
			<div class="flex justify-between text-sm">
				<span>Taxa de entrega</span>
				{#if cart.meta.taxaEntrega === 0}
				 <span class="text-error">Erro ao calcular</span>
				{:else if cart.meta.taxaEntrega === undefined}
					Calculando...
				{:else}
				<span>{formatCurrency(cart.meta.taxaEntrega)}</span>
				{/if}
			</div>
			<Separator />
			<div class="flex justify-between font-medium">
				<span>Total</span>
				<span>{formatCurrency(cart.getTotal())}</span>
			</div>
		</div>
	</CardContent>
	{#if showActions}
		<CardFooter>
			<Button class="w-full">Checkout Now</Button>
		</CardFooter>
	{/if}
</Card>
