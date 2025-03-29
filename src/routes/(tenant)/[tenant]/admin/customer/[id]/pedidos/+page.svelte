<script lang="ts">
  import type { PageData } from './$types'
  import {
    Card,
    CardContent,
  } from '$lib/components/ui/card'
  import PedidoCliente from './PedidoCliente.svelte'
  import { TableHandler } from '@vincjo/datatables'
  import { DateFormatter } from '@internationalized/date'

  let { data }: { data: PageData } = $props()

  const table = new TableHandler(data.orders, {
    rowsPerPage: 100,
    i18n: {
      show: 'Mostrar',
      entries: 'entradas',
      previous: 'Anterior',
      next: 'Próximo',
      noRows: 'Nenhum encontrado',
      filter: 'Filtrar',
    },
  })

  const df = new DateFormatter('pt-BR', {
    dateStyle: 'medium',
  })

  const sum = $derived(table.createCalculation('total').sum())
</script>

<Card class="h-full overflow-hidden border-none shadow-none">
  <CardContent class="h-full p-0">
    <div>
      <PedidoCliente {df} {table} total={sum} />
    </div>
  </CardContent>
</Card>
