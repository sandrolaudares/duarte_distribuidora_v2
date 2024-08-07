<script lang="ts">

	export let click_button = () => {}

	export let button_text = ''
	export let button_recusar = ''

	async function clickButton(id_pedido: number) {
		// tirar estoque

		click_button()
	}
</script>

<div class=" mt-2 rounded-lg border bg-gray-100 p-2 shadow-sm">
	<div class="mb-4 flex justify-between gap-1 text-center text-sm">
		<div class="flex flex-col items-start">
			<h3>Pedido <strong>#{pedido.id}</strong></h3>
			<p>Data: {pedido.created_at}</p>
			<p>Tipo: {pedido.meta_data?.tipo_pessoa ?? 'Nenhum'}</p>
		</div>
		<div class="flex flex-col items-end">
			<p>Pagamento em <strong>{pedido.tipo}</strong></p>
			<p>
				Total: <strong class="text-green-500"
					>R${formatM(pedido.total_in_cents)}</strong
				>
			</p>
		</div>
	</div>
	<div>
		<h4 class="mb-2 text-lg font-semibold">Produtos pedidos:</h4>
		<div class="flex flex-col gap-2 sm:flex-row">
			{#each pedido.produto_pedido as produto}
				<div class="flex rounded-md bg-white p-2 shadow-sm">
					<p class="text-gray-800">
						{produto.quantidade}x -
						{produto.var_produto?.produto?.nome}
						{produto.var_produto?.categoria?.nome} -
						<span class="font-bold">
							R${produto.total_in_cents}
						</span>
					</p>
				</div>
			{/each}
		</div>
	</div>
	<div
		class="mt-2 flex flex-col items-center justify-between gap-3 text-sm sm:flex-row"
	>
		<p>Observacoes: {pedido.observacao ?? 'Nenhuma'}</p>

		<div>
			{#if button_recusar}
				<button class="bg-red-600 text-white hover:text-black">
					{button_recusar}
				</button>
			{/if}
			{#if button_text}
				<button on:click={() => clickButton(pedido.id)}>
					{button_text}
				</button>
			{/if}
		</div>
	</div>
</div>
