<script lang="ts">
  import CardShowPedidos from './../orders/CardShowPedidos.svelte'
  import type { PageData } from './$types'
   import { trpc } from '$trpc/client'
  import { page } from '$app/stores'
  import type { RouterInputs } from '$trpc/router'
  import { toast } from 'svelte-sonner'


  export let data: PageData

  let ended = data.ended_orders

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
</script>

<h1 class="text-center text-4xl font-semibold">Pedidos finalizados:</h1>
{#each ended as pedido}
    <CardShowPedidos
      button_text="Finalizar"
      order={pedido}
      click_confirm={async () => {
        console.log('click aceitar')
        pedido.status = 'ENDED'
        await changeStatusPedido({
          order_id: pedido.id,
          status: 'ENDED',
        })
      }}
    />
{/each}
