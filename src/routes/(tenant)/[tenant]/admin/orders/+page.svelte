<script lang="ts">
  import { toast } from 'svelte-sonner'
  import type { PageData } from './$types'
  import CardShowPedidos from '$lib/components/cards/CardShowPedidos.svelte'
  import type { RouterInputs, RouterOutputs } from '$trpc/router'
  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'
  import { onDestroy, onMount } from 'svelte'
  import Loading from '$lib/components/Loading.svelte'
  import CardSimplePedidos from '$lib/components/cards/CardSimplePedidos.svelte'
  export let data: PageData

  let pedidos: RouterOutputs['customer']['getCurrentOrders'] = []

  let motoboys = data.motoboys

  let newPedidos = pedidos

  let pedidoSelecionado = 'all'

  let pedidosFiltrados = pedidos

  let isPendente = false

  let isLoading = true

  let isFetching = false

  $: pedidosAbertos = pedidosFiltrados.filter(
    pedido => pedido.status === 'PENDING',
  ) 
  let notification: HTMLAudioElement
  
  let unsub_getOrders: NodeJS.Timeout

  onMount(async () => {
    pedidos = await trpc($page).customer.getCurrentOrders.query()
    pedidosFiltrados  = pedidos
    unsub_getOrders = setInterval(async()=>{
      await getOrders()
  },5000)
    isLoading = false
  })

  onDestroy(()=>{
    clearInterval(unsub_getOrders)
  })

  async function getOrders() {
    isFetching = true
    try {
      newPedidos = await trpc($page).customer.getCurrentOrders.query()

      if(pedidos.length != newPedidos.length){
        toast.info("Novo pedido!")
        notification?.play()
      }

      pedidos = newPedidos
      isFetching = false
      return {pedidos}
    } catch (error) {
      console.error(error)
      return []
    }
  }

  // const pedidosPorStatus = () => {
  //   if (pedidoSelecionado === 'all') {
  //     return pedidos
  //   }

  //   return pedidos.filter(pedido => pedido.status === pedidoSelecionado)
  // }

  const motoboySelecionado = () =>{
    if(pedidoSelecionado === 'all'){
      return pedidos
    }

    return pedidos.filter(pedido => pedido.motoboy_id === pedidoSelecionado)
  }

  $: if (pedidoSelecionado) {
    pedidosFiltrados = motoboySelecionado()
  }

  function togglePendente() {
    isPendente = !isPendente
    pedidoSelecionado = 'all'
  }

  async function changeStatusPedido(
    input: RouterInputs['customer']['updateOrderStatus'],
  ) {
    try {
      await trpc($page).customer.updateOrderStatus.mutate(input)

      toast.success('Status mudou com sucesso!')
    } catch (error) {
      toast.error('Erro ao mudar status do pedido!')
    }
  }

  async function handleDeleteOrder(id:number) {
    try {
      await trpc($page).customer.cancelOrder.mutate(id)
      toast.success('Pedido cancelado com sucesso!')
      // goto('/admin/orders')
    } catch (error) {
      toast.error('Erro ao cancelar pedido!')
      console.log(error)
    }
  }
</script>
{#if isLoading}
<div class="flex justify-center items-center m-32">
  <Loading/>
</div>
{:else}
  <main class="p-2">
    {#if pedidosAbertos.length > 0}
      <div role="alert" class="alert alert-info">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          class="h-6 w-6 shrink-0 stroke-current"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <span>Existem pedidos pendentes não aceitos.</span>
      </div>
    {/if}
  
    <div>
      <div class="mb-4 flex items-center justify-between">
        <div class="flex gap-5">
          {#if pedidoSelecionado === 'all'}
          <h1 class="text-3xl font-bold">Pedidos:</h1>
          {:else}
          <h1 class="text-3xl font-bold">Pedidos:</h1>
          {/if}
          {#if isFetching}
          <div class="flex items-center gap-3">
            <span class="loading loading-spinner loading-xs"></span> Carregando pedidos ...
          </div>
          {/if}
        </div>
  
        <div class="mt-2 flex items-center">
          <div>
            <!--TODO: FIltro ainda falta ajustar para atacado, varejo-->
  
            <label for="filtro">Filtrar pedidos:</label>
            <select
              name="filtro"
              id="filtro"
              class="rounded-lg border bg-white p-2"
              bind:value={pedidoSelecionado}
            >
              <option value="all">Todos motoboys</option>
              <!--<option value="varejo">Varejo</option>
              <option value="atacado">Atacado</option> -->
              <hr />
              {#each motoboys as motoboy}
              <option value={motoboy.id}>{motoboy.username}</option>
              {/each}
              <!-- <option value="CONFIRMED">Pedidos aceitos</option>
              <option value="ON THE WAY">A caminho</option> -->
            </select>
          </div>
        </div>
      </div>
  
      <!-- {#if pedidoSelecionado != 'all' && pedidoSelecionado != 'varejo' && pedidoSelecionado != 'atacado'}
        {#each pedidosFiltrados as pedido}
          <CardSimplePedidos order={pedido} motoboy={pedido.motoboy?.username}/>
        {/each} -->
        <div class="grid grid-cols-1 gap-2 xl:grid-cols-3">
          <div
            class={`overflow-y-auto rounded-lg bg-error p-1 ${pedidosAbertos.length > 0 ? 'max-h-[71vh]' : 'max-h-[78vh]'}`}
          >
            <h1 class="text-center text-black">Pedidos Pendentes:</h1>
            <div class="flex-col flex gap-2">

              {#each pedidosFiltrados as pedido}
                {#if pedido.status === 'PENDING'}
                  <CardSimplePedidos
                    button_text="Aceitar pedido"
                    button_recusar="Recusar pedido"
                    order={pedido}
                    click_confirm={async () => {
                      console.log('click aceitar')
                      pedido.status = 'CONFIRMED'
                      await changeStatusPedido({
                        order_id: pedido.id,
                        status: 'CONFIRMED',
                      })
                    }}
                    click_refuse={async () => {
                      console.log('click recusar')
                      pedido.status = 'CANCELED'
                      await changeStatusPedido({
                        order_id: pedido.id,
                        status: 'CANCELED',
                      })
                    }}
                  />
                {/if}
              {/each}
            </div>
          </div>
  
          <div
            class={`overflow-y-auto rounded-lg bg-warning p-1 ${pedidosAbertos.length > 0 ? 'max-h-[71vh]' : 'max-h-[78vh]'}`}
          >
            <h1 class="text-center text-black">Pedidos aceitos:</h1>
            <div class="flex-col flex gap-2">

              {#each pedidosFiltrados as pedido}
                {#if pedido.status === 'CONFIRMED'}
                  <CardSimplePedidos
                    button_text="A caminho"
                    order={pedido}
                    click_confirm={async () => {
                      console.log('click aceitar')
                      pedido.status = 'ON THE WAY'
                      await changeStatusPedido({
                        order_id: pedido.id,
                        status: 'ON THE WAY',
                      })
                    }}
                    cancel_order={async ()=>{
                      pedido.status = 'CANCELED'
                      await handleDeleteOrder(pedido.id)
                    }}
                  />
                {/if}
              {/each}
            </div>
          </div>
          <div
            class={`overflow-y-auto rounded-lg bg-success p-1 ${pedidosAbertos.length > 0 ? 'max-h-[71vh]' : 'max-h-[78vh]'}`}
          >
            <h1 class="text-center text-black">A caminho:</h1>
            <div class="flex-col flex gap-2">

              {#each pedidosFiltrados as pedido}
                {#if pedido.status === 'ON THE WAY'}
                  <CardSimplePedidos
                    button_text="Entregue"
                    order={pedido}
                    click_confirm={async () => {
                      console.log('click aceitar')
                      pedido.status = 'DELIVERED'
                      await changeStatusPedido({
                        order_id: pedido.id,
                        status: 'DELIVERED',
                      })
                    }}
                  />
                {/if}
              {/each}
            </div>
          </div>
        </div>
    </div>
  </main>
{/if}

<audio src="/mixkit-positive-notification-951.wav" class="hidden" bind:this={notification}></audio>
