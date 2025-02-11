<script lang="ts">
  import SuperSelect from '$lib/components/input/Select.svelte'
  import { icons } from '$lib/utils/icons'
  import { modal, FormModal } from '$components/modal'
  import type { PageData } from './$types'

  import type { RouterInputs } from '$trpc/router'

  
  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'
  
  import { toast } from 'svelte-sonner'
  import AddressModal from '$lib/components/modal/AddressModal.svelte'
  import CardShowPedidos from '$lib/components/cards/CardShowPedidos.svelte'
  import { onMount } from 'svelte'
  import DateFilter from '$lib/components/DateFilter.svelte'
  import {
    TableHandler,
    Datatable,
    ThSort,
    ThFilter,
    Th,
    RowsPerPage,
    Pagination,
  } from '@vincjo/datatables'
  import NoResults from '$lib/components/NoResults.svelte'
  import ThCalendar from './ThCalendar.svelte'
  import InfoCliente from './InfoCliente.svelte'
  import PedidoCliente from './PedidoCliente.svelte'
  
  // export let data: PageData
  let { data }: { data: PageData } = $props()

  let { customer, orders } = data

  // let filtered = orders
  const table = new TableHandler(orders, { rowsPerPage: 100 })


  // $: sum = table.createCalculation('total').sum()

  const sum = $derived(table.createCalculation('total').sum())
  //TODO: SOMA apenas rows renderizadas, não todas

</script>

<main class=" mt-20 h-full max-h-[calc(100vh-35vh)]">
  <InfoCliente {customer} />
  <hr class="mx-10 my-3">
<h1 class="text-xl m-3 font-medium">
  Pedidos de {customer.name}:
</h1>
  <PedidoCliente {table} total={sum}/>
</main>
