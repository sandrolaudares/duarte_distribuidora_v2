<script lang="ts">
  import type { PageData } from './$types'
  import CardShowPedidos from './CardShowPedidos.svelte'

  export let data: PageData

  let pedidos = data.last_orders

  let pedidoSelecionado = 'all'

  let pedidosFiltrados = pedidos

  let isPendente = false

  $: pedidosAbertos = pedidosFiltrados.filter(
    pedido => pedido.status === 'PENDING',
  )

  function togglePendente() {
    isPendente = !isPendente
    pedidoSelecionado = 'all'
  }
</script>

<!-- TODO: frontend -->
<pre>
  {JSON.stringify(data.last_orders, null, 2)}
</pre>

<main class="p-2">
  {#if pedidosAbertos.length > 0}
    <div
      class="flex items-center bg-primary px-4 py-3 text-sm font-bold text-black"
      role="alert"
    >
      <svg
        class="mr-2 h-4 w-4 fill-current"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
      >
        <path
          d="M12.432 0c1.34 0 2.01.912 2.01 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-.75-1.974-1.99C9.789 1.436 10.67 0 12.432 0zM8.309 20c-1.058 0-1.833-.652-1.093-3.524l1.214-5.092c.211-.814.246-1.141 0-1.141-.317 0-1.689.562-2.502 1.117l-.528-.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273.705 3.23l-1.391 5.352c-.246.945-.141 1.271.106 1.271.317 0 1.357-.392 2.379-1.207l.6.814C12.098 19.02 9.365 20 8.309 20z"
        />
      </svg>
      <p>Existem pedidos pendentes não aceitos.</p>
    </div>
  {/if}

  <div>
    <div class="mb-4 flex items-center justify-between">
      {#if pedidoSelecionado === 'all'}
        <h1 class="text-3xl font-bold">Pedidos:</h1>
      {:else}
        <h1 class="text-3xl font-bold">Pedidos {pedidoSelecionado}:</h1>
      {/if}

      {#if isPendente}
        <div class="mt-2 flex items-center">
          <div>
            <label for="filtro">Filtrar pedidos:</label>
            <select
              name="filtro"
              id="filtro"
              class="rounded-lg border bg-white p-2"
              bind:value={pedidoSelecionado}
            >
              <option value="all">Todos pedidos</option>
              <option value="varejo">Varejo</option>
              <option value="atacado">Atacado</option>
              <hr />
              <option value="CONFIRMED">Pedidos aceitos</option>
              <option value="ON THE WAY">A caminho</option>
              <option value="DELIVERED">Entregue</option>
            </select>
          </div>
          <div class="relative">
            {#if pedidosAbertos.length > 0}
              <div class="absolute right-0 top-0 rounded-full bg-red-500">
                <span class="p-2 text-center text-sm font-bold text-white">
                  {pedidosAbertos.length}
                </span>
              </div>
            {/if}
            <div class="p-2">
              <button class="btn btn-primary" on:click={togglePendente}>Pedidos pendentes</button>
            </div>
          </div>
        </div>
      {:else}
        <div class="mt-2 p-2">
          <button class="btn btn-primary" on:click={togglePendente}>Pedidos aceitos</button>
        </div>
      {/if}
    </div>
    {#if !isPendente}
      <h1 class="text-center text-3xl font-bold">Pedidos pendentes</h1>
      <p class="text-center">
        (Lista de todos pedidos pendentes aguardando aprovacão)
      </p>
      {#if pedidosAbertos.length > 0}
        {#each pedidosFiltrados as pedido}
          {#if pedido.status === 'PENDING'}
            <CardShowPedidos
              button_text="Aceitar pedido"
              button_recusar="Recusar pedido"
              click_button={async () => {
                console.log('click aceitar')
                pedido.status = 'CONFIRMED'
                // const { error } = await updateStatusPedido(supabase, {
                //   id: pedido.id,
                //   status: 'CONFIRMED',
                // })
                // if (error) {
                //   pedido.status = 'CONFIRMED'
                // }
              }}
            />
            PENDENTES
          {/if}
        {/each}
      {:else}
        <p class="mt-10 text-center text-xl">Nenhum pedido pendente!</p>
      {/if}
    {:else if pedidoSelecionado != 'all' && pedidoSelecionado != 'varejo' && pedidoSelecionado != 'atacado'}
      {#each pedidosFiltrados as pedido}
        <!-- <CardShowPedidos {pedido} {supabase} /> -->
      {/each}
    {:else if pedidoSelecionado === 'all' || pedidoSelecionado === 'varejo' || pedidoSelecionado === 'atacado'}
      <div class="grid grid-cols-1 gap-2 xl:grid-cols-3">
        <div class="max-h-[88vh] overflow-y-auto rounded-lg bg-red-100 p-2">
          <h1 class="text-center">Pedidos aceitos:</h1>
          {#each pedidosFiltrados as pedido}
            {#if pedido.status === 'CONFIRMED'}
              <!-- <CardShowPedidos
                {pedido}
                {supabase}
                button_text="Saiu Pra Entrega"
                click_button={async () => {
                  console.log('click aberto')
                  pedido.status = 'a_caminho'
                  const { error } = await updateStatusPedido(supabase, {
                    id: pedido.id,
                    status: 'a_caminho',
                  })
                  if (error) {
                    pedido.status = 'aberto'
                  }
                }}
              /> -->
            {/if}
          {/each}
        </div>
        <div class="max-h-[88vh] overflow-y-auto rounded-lg bg-yellow-100 p-2">
          <h1 class="text-center">A caminho:</h1>
          {#each pedidosFiltrados as pedido}
            {#if pedido.status === 'ON THE WAY'}
              <!-- <CardShowPedidos
                {pedido}
                {supabase}
                button_text="Chegou"
                click_button={async () => {
                  console.log('click caminho')
                  pedido.status = 'entregue'
                  const { error } = await updateStatusPedido(supabase, {
                    id: pedido.id,
                    status: 'entregue',
                  })
                  if (error) {
                    pedido.status = 'aberto'
                  }
                }}
              /> -->
            {/if}
          {/each}
        </div>
        <div class="max-h-[88vh] overflow-y-auto rounded-lg bg-green-100 p-2">
          <h1 class="text-center">Entregue:</h1>
          {#each pedidosFiltrados as pedido}
            {#if pedido.status === 'DELIVERED'}
              <!-- <CardShowPedidos
                {pedido}
                {supabase}
                button_text="Confirmar Entrega"
                click_button={async () => {
                  console.log('click entregue')
                  pedido.status = 'finalizado'
                  const { error } = await updateStatusPedido(supabase, {
                    id: pedido.id,
                    status: 'finalizado',
                  })
                  if (error) {
                    pedido.status = 'entregue'
                  }
                }}
              /> -->
            {/if}
          {/each}
        </div>
      </div>
    {/if}
  </div>
</main>
