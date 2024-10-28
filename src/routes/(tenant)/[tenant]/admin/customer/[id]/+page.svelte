<script lang="ts">
  import SuperSelect from '$lib/components/input/Select.svelte'
  import { icons } from '$lib/utils/icons'
  import { modal, FormModal } from '$components/modal'
  import type { PageData } from './$types'

  import type { RouterInputs } from '$trpc/router'

  export let data: PageData

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
  import { format } from 'date-fns'
  import ThCalendar from './ThCalendar.svelte'
  import InfoCliente from './InfoCliente.svelte'
  import PedidoCliente from './PedidoCliente.svelte'

  let { customer, orders } = data

  // let filtered = orders
  const table = new TableHandler(orders, { rowsPerPage: 7 })

  // let filteredOrders = (start: number, end: number) => {
  //   return orders.filter(order => {
  //     return (
  //       order.created_at.getTime() >= start && order.created_at.getTime() <= end
  //     )
  //   })
  // }

</script>

<main class=" mt-20 h-full max-h-[calc(100vh-35vh)]">
  <InfoCliente {customer} />

  <PedidoCliente {table}/>
</main>
