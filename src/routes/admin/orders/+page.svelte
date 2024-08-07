<script lang="ts">
  import { toast } from 'svelte-sonner'
  import type { PageData } from './$types'
  import CardShowPedidos from './CardShowPedidos.svelte'

  export let data: PageData

  let pedidos = data.last_orders

  let pedidoSelecionado = 'all'

  let pedidosFiltrados = pedidos

  let isPendente = false

  type changeStatus = {
    id: number
    status: string
  }

  $: pedidosAbertos = pedidosFiltrados.filter(
    pedido => pedido.status === 'PENDING',
  )

  function togglePendente() {
    isPendente = !isPendente
    pedidoSelecionado = 'all'
  }

  function changeStatusPedido({ id, status }: changeStatus) {
    toast.success('Status mudou com sucesso!')
  }
</script>

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
            <!--TODO: FIltro ainda falta ajustar-->
            <!--TODO: Adicionar filtro por distribuidora-->

            <!-- <label for="filtro">Filtrar pedidos:</label>
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
            </select> -->
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
              <button class="btn btn-primary" on:click={togglePendente}>
                Pedidos pendentes
              </button>
            </div>
          </div>
        </div>
      {:else}
        <div class="mt-2 p-2">
          <button class="btn btn-primary" on:click={togglePendente}>
            Pedidos aceitos
          </button>
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
              order={pedido}
              click_confirm={async () => {
                console.log('click aceitar')
                pedido.status = 'CONFIRMED'
                await changeStatusPedido({
                  id: pedido.id,
                  status: 'CONFIRMED',
                })
              }}
              click_refuse={async () => {
                console.log('click recusar')
                pedido.status = 'CANCELED'
                await changeStatusPedido({
                  id: pedido.id,
                  status: 'CANCELED',
                })
              }}
            />
          {/if}
        {/each}
      {:else}
        <p class="mt-10 text-center text-xl">Nenhum pedido pendente!</p>
      {/if}
    {:else if pedidoSelecionado != 'all' && pedidoSelecionado != 'varejo' && pedidoSelecionado != 'atacado'}
      {#each pedidosFiltrados as pedido}
        <CardShowPedidos order={pedido} />
      {/each}
    {:else if pedidoSelecionado === 'all' || pedidoSelecionado === 'varejo' || pedidoSelecionado === 'atacado'}
      <div class="grid grid-cols-1 gap-2 xl:grid-cols-3">
        <div class="max-h-[88vh] overflow-y-auto rounded-lg bg-error p-1">
          <h1 class="text-center text-black">Pedidos aceitos:</h1>
          {#each pedidosFiltrados as pedido}
            {#if pedido.status === 'CONFIRMED'}
              <CardShowPedidos
                button_text="A caminho"
                order={pedido}
                click_confirm={async () => {
                  console.log('click aceitar')
                  pedido.status = 'ON THE WAY'
                  await changeStatusPedido({
                    id: pedido.id,
                    status: 'ON THE WAY',
                  })
                }}
              />
            {/if}
          {/each}
        </div>
        <div class="max-h-[88vh] overflow-y-auto rounded-lg bg-warning p-1">
          <h1 class="text-center text-black">A caminho:</h1>
          {#each pedidosFiltrados as pedido}
            {#if pedido.status === 'ON THE WAY'}
              <CardShowPedidos
                button_text="Entregue"
                order={pedido}
                click_confirm={async () => {
                  console.log('click aceitar')
                  pedido.status = 'DELIVERED'
                  await changeStatusPedido({
                    id: pedido.id,
                    status: 'DELIVERED',
                  })
                }}
              />
            {/if}
          {/each}
        </div>
        <div class="max-h-[88vh] overflow-y-auto rounded-lg bg-success p-1">
          <h1 class="text-center text-black">Entregue:</h1>
          {#each pedidosFiltrados as pedido}
            {#if pedido.status === 'DELIVERED'}
              <CardShowPedidos
                button_text="Finalizar"
                order={pedido}
                click_confirm={async () => {
                  console.log('click aceitar')
                  pedido.status = 'ENDED'
                  await changeStatusPedido({
                    id: pedido.id,
                    status: 'ENDED',
                  })
                }}
              />
            {/if}
          {/each}
        </div>
      </div>
    {/if}
  </div>
</main>

<!-- <pre>
  {JSON.stringify(data.last_orders, null, 2)}
</pre> -->
