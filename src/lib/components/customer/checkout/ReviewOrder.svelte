<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  import type { SelectAddress } from "$lib/server/db/schema"
  import { getCartContext } from "$lib/state/contextCustomerOrder/cartContext"
	import { ArrowLeftIcon, BlindsIcon, Car, CreditCardIcon, ShoppingBagIcon } from "lucide-svelte";
  	import { paymentMethodEnum, paymentMethodLabel } from "$lib/utils/permissions"
  import { formatCurrency, getImagePath } from "$lib/utils"

	const cart = getCartContext()

	type Props = {
		onConfirm: () => void;
		onBack: () => void;
	};

	let { onConfirm, onBack }:Props = $props();

	function formatAddress(address:SelectAddress) {
	return [
	  address.cep ? `${address.cep}` : '',
	  address.city,
	  address.neighborhood,
	  address.street,
	  address.number,
	  address.state,
	]
	  .filter(Boolean)
	  .join(', ')
  }
</script>

<div class="space-y-6">
	<div class="grid gap-6 md:grid-cols-2">
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center gap-2 text-base">
					<BlindsIcon class="h-4 w-4" />
					Endereço de entrega
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="font-medium">Endereço:</p>
				<p class="text-sm text-gray-600">{cart.meta.enderecoSelecionado ? formatAddress(cart.meta.enderecoSelecionado) : 'Endereço não selecionado'}</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle class="flex items-center gap-2 text-base">
					<CreditCardIcon class="h-4 w-4" />
					Método de pagamento
				</CardTitle>
			</CardHeader>
			{#if cart.meta.paymentMethodSelecionado}
			<CardContent>
				<p class="font-medium">{cart.meta.paymentMethodSelecionado !=='fiado'?paymentMethodLabel[cart.meta.paymentMethodSelecionado] : 'É um pedido fiado'}</p>
				<p class="text-sm text-gray-600">
					{#if cart.meta.paymentMethodSelecionado === 'fiado'}
					  Pagamento será realizado posteriormente!
					{:else}
					Pagar em {paymentMethodLabel[cart.meta.paymentMethodSelecionado]} na entrega!
					{/if}
				</p>
			</CardContent>
			{/if}
		</Card>

		<Card class="md:col-span-2">
			<CardHeader>
				<CardTitle class="flex items-center gap-2 text-base">
					<ShoppingBagIcon class="h-4 w-4" />
					Items 
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="space-y-4">
					{#each Object.values(cart.cart) as item}
						<div class="flex items-center gap-4">
							<img src={getImagePath(item.item.image)} alt={item.item.name} class="h-16 w-16 rounded-lg object-cover" />
							<div class="flex-1">
								<h3 class="font-medium">{item.item.name}</h3>
								<p class="text-sm text-gray-600">Quantity: {item.quantity}</p>
							</div>
							<p class="font-medium">
								{formatCurrency(item.item.retail_price * item.quantity)}
							</p>
						</div>
					{/each}
				</div>
			</CardContent>
		</Card>
	</div>

	<div class="flex items-center gap-4">
		<button onclick={onBack} class="flex items-center gap-2 btn-outline btn">
			<ArrowLeftIcon class="h-4 w-4" />
			Voltar
		</button>
		<button onclick={onConfirm} class="flex-1 btn btn-primary" disabled={!cart.meta.enderecoSelecionado || !cart.meta.paymentMethodSelecionado}>Realizar pedido!</button>
	</div>
</div>
