<script lang="ts">
  import NavDashboard from '../NavDashboard.svelte'
  import * as Card from '$lib/components/ui/card'
  import { BarChart, PieChart } from 'layerchart'
  import type { PageData } from './$types'
  import { RecentSales } from '$lib/components/dashboard/admin'
  import SvChart from '../SvChart.svelte'

  let { data }: { data: PageData } = $props()
  const { corporateClientsSortedDelayOrder } = $derived(data)
</script>

<div class="flex flex-col gap-3 lg:flex-row">
  <Card.Root class="w-full lg:w-9/12 ">
    <Card.Header>
      <Card.Title>Gráficos</Card.Title>
    </Card.Header>
    <!-- <Card.Content class="flex flex-col md:flex-row gap-4"> -->
    <Card.Content class="flex flex-wrap">
      <div class="w-full pr-3">
        {#key corporateClientsSortedDelayOrder}
          <SvChart
            config={{
              type: 'bar',
              data: {
                labels: corporateClientsSortedDelayOrder.map(c => c.debtorName),
                datasets: [
                  {
                    label: 'Divida',
                    barThickness: 30,
                    data: corporateClientsSortedDelayOrder.map(
                      c => c.totalDebt / 100,
                    ),
                    backgroundColor: ['rgba(255, 0, 0)'],
                    order: 2,
                  },
                  {
                    label: 'Total pago',
                    barThickness: 30,
                    data: corporateClientsSortedDelayOrder.map(
                      c => c.totalPaid / 100,
                    ),
                    backgroundColor: ['rgba(0, 128, 0)'],
                    order: 1,
                  },
                ],
              },
              options: {
                plugins: {
                  tooltip: {
                    usePointStyle: true,
                    callbacks: {
                      label: function (context) {
                        return 'R$ ' + context.raw.toLocaleString('pt-BR')
                      },
                    },
                  },
                },
                indexAxis: 'y',
                scales: {
                  y: {
                    stacked: true,
                  },
                  x: {
                    ticks: {
                      callback: function (value) {
                        return 'R$ ' + value.toLocaleString('pt-BR')
                      },
                    },
                  },
                },
              },
            }}
            height={corporateClientsSortedDelayOrder.length * 60}
            title={'Relatorio recebimento atingido'}
          />
        {/key}
      </div>
      <div class="w-full">
        {#key corporateClientsSortedDelayOrder}
          <SvChart
            config={{
              type: 'bar',
              data: {
                labels: corporateClientsSortedDelayOrder
                  .map(c => c.debtorName)
                  .slice(0, 5),
                datasets: [
                  {
                    label: 'Dívida',
                    data: corporateClientsSortedDelayOrder
                      .map(c => c.totalDebt / 100)
                      .slice(0, 5),
                    backgroundColor: ['rgba(234, 203, 22, 1)'],
                    barThickness: 50,
                  },
                ],
              },
            }}
            height={180}
            title={'Maiores dívidas'}
          />
        {/key}
      </div>
    </Card.Content>
  </Card.Root>
  <Card.Root class="w-full lg:w-3/12">
    <Card.Header>
      <Card.Title>Clientes PJ com dívida</Card.Title>
    </Card.Header>
    <Card.Content>
      <RecentSales
        textRecentSale={corporateClientsSortedDelayOrder.map(c => {
          return {
            title: c.debtorName,
            value: 'R$' + (c.totalDebt ? c.totalDebt / 100 : 0).toLocaleString('pt-BR'),
            subTitle: c.totalOrders.toString(),
          }
        })}
      />
    </Card.Content>
  </Card.Root>
</div>
