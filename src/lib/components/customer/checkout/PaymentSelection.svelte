<script lang="ts">
	import * as RadioGroup from '$lib/components/ui/radio-group/index'
	import { Button } from "$lib/components/ui/button";
	import { Label } from "$lib/components/ui/label";
	import { CreditCardIcon, ArrowLeftIcon } from "lucide-svelte";
  	import { paymentMethodEnum, paymentMethodLabel } from "$lib/utils/permissions"
 	import type { SelectCustomer } from "$lib/server/db/schema"
  	import AvailableCredits from "$lib/components/AvailableCredits.svelte"
    import { getCartContext } from "../../../state/contextCustomerOrder/cartContext"

  	const cart = getCartContext();

	type Props = {
		onConfirm: () => void;
		onBack: () => void;
		cliente:SelectCustomer
	};

	let { onConfirm,onBack,cliente }:Props = $props();

	let valueAvailable:number | null = $state(0)

	let isDisabled = $derived((valueAvailable ?? 0) < cart.getTotal())

	$effect(()=>{
		if(isDisabled) {
			cart.meta.paymentMethodSelecionado = undefined
		}
	})

	$inspect(cart.getTotal())
</script>

<div class="space-y-6">
	<RadioGroup.Root value={cart.meta.paymentMethodSelecionado ?? undefined} onValueChange={(value) => {
		cart.meta.paymentMethodSelecionado = value as "credit_card" | "debit_card" | "pix" | "dinheiro" |'fiado' | undefined
	}}>
	<div class="grid grid-cols-1 xl:grid-cols-2 gap-3">
		{#each paymentMethodEnum as method}
			<div class="flex items-center space-x-4 rounded-lg border p-4">
				<RadioGroup.Item value={method} id={method} />
				<Label for={method} class="flex-1 cursor-pointer">
					<div class="flex items-center gap-2">
						<CreditCardIcon class="h-4 w-4" />
						<span class="font-medium">{paymentMethodLabel[method]}</span>
					</div>
					<p class="text-sm text-gray-600">Pagamento em {paymentMethodLabel[method]} na entrega</p>
				</Label>
			</div>
		{/each}
		<div class="flex items-center space-x-4 rounded-lg border p-4"
		class:opacity-50={isDisabled}
		class:cursor-not-allowed={isDisabled}
		>
			<RadioGroup.Item value="fiado" id="fiado" disabled={isDisabled}/>
			<Label for="fiado" class="flex-1 cursor-pointer">
				<div class="flex items-center gap-2">
					<CreditCardIcon class="h-4 w-4" />
					<span class="font-medium">Fiado</span>
				</div>
				<div class="text-sm text-gray-600">Créditos disponiveis:  
					<AvailableCredits
					customer={cliente}
					max_credit={cliente.max_credit}
					getValue={(value) => {
						valueAvailable = value
					}}
				  /></div>
			</Label>
		</div>
	</div>
	</RadioGroup.Root>

	<div class="flex items-center gap-4">
		<button onclick={onBack} class="flex items-center gap-2 btn btn-outline">
			<ArrowLeftIcon class="h-4 w-4" />
			Voltar
		</button>
		<button onclick={onConfirm} class=" flex-1 btn btn-primary" disabled={!cart.meta.paymentMethodSelecionado}>Continuar pedido</button>
	</div>
</div>
