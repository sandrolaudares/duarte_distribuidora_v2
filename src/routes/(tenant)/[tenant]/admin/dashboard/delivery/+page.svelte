<script lang="ts">
  import NavDashboard from '../NavDashboard.svelte'
  import * as Card from '$lib/components/ui/card'
  import {
    Axis,
    BarChart,
    Bars,
    Chart,
    Labels,
    PieChart,
    Rule,
    Svg,
  } from 'layerchart'
  import type { PageData } from './$types'
  import { RecentSales } from '$lib/components/dashboard/admin'
  import { scaleBand } from 'd3-scale'
  import SvChart from '../SvChart.svelte'
  import { convertIndexToString } from 'drizzle-orm/mysql-core'
  import { text } from '@sveltejs/kit'

  let { data }: { data: PageData } = $props()

  const {
    totalDeliveredCompleted,
    TotalDeliveryFees,
    cancelingOrders,
    bestProduct,
    couriersHighestNumberDeliveries,
    last10Deliveries,
  } = $derived(data)

  // TODO: Olhar pq aque em que ser derived ao inves de state
  const cards = $derived([
    {
      titleCard: 'Total de entregas',
        textCard: totalDeliveredCompleted.toString()
        ? totalDeliveredCompleted.toString()
        : '0',
      subTitle: '',
    },
    {
      titleCard: 'Total taxas de entrega',
      textCard: 'R$' + (TotalDeliveryFees ? TotalDeliveryFees / 100 : 0 ).toFixed(2).toString(),
      subTitle: '',
    },
    {
      titleCard: 'Pedidos cancelados',
      textCard: cancelingOrders.toString(),
      subTitle: '',
    },
    {
      titleCard: 'Melhor produto',
      textCard: bestProduct,
      subTitle: '',
    },
  ])
</script>

<NavDashboard {cards}/>

<div class="flex flex-col gap-3 lg:flex-row">
  <Card.Root class="w-full lg:w-9/12 ">
    <Card.Header>
      <Card.Title>Gráficos</Card.Title>
    </Card.Header>
    <!-- <Card.Content class="flex flex-col md:flex-row gap-4"> -->
    <Card.Content class="flex flex-wrap">
      <div class="w-full pr-3">
        <SvChart
          config={{
            type: 'bar',
            data: {
              labels: couriersHighestNumberDeliveries.map(d => d.name),
              datasets: [
                {
                  label: 'Relatorio Motoboy',
                  data: couriersHighestNumberDeliveries.map(
                    d =>
                      parseFloat(d.numberDeliveries.toString()) +
                      d.totalAmountDeliveryFees,
                  ),
                  backgroundColor: ['rgba(255, 217, 0)'],
                  barThickness: 30,
                },
              ],
            },
            options: {
              plugins : {
                tooltip : {
                  usePointStyle: true,
                  callbacks: {
                    label: function(context){
                      return 'R$ ' + (context.raw).toLocaleString('pt-BR')
                    }
                  }
                }
              },
              indexAxis: 'y',
              scales: {
                x : {
                  ticks: {
                    callback : function(value) {
                      return 'R$ ' + value.toLocaleString('pt-BR')
                    }
                  }
                }
              }
            },
          }}
          height={couriersHighestNumberDeliveries.length * 60}
          title={'Relatório Motoboy'}
        />
        <!-- Axis = Heixo -->
        <!-- placement = localização -->
        <!-- Scalable Vector Graphics -->
      </div>
    </Card.Content>
  </Card.Root>
  <Card.Root class="w-full lg:w-3/12">
    <Card.Header>
      <Card.Title>Ultimas entregas</Card.Title>
    </Card.Header>
    <Card.Content>
      <RecentSales
        textRecentSale={last10Deliveries.map(c => {
          return {
            title: c.motoboyName,
            text: 'Total Ped: R$ ' + (c.totalPedido ? c.totalPedido / 100 : 0).toString(),
            value: 'Taxa: R$ ' + (c.taxaEntrega ? c.taxaEntrega / 100 : 0).toString(),
          }
        })}
      />
    </Card.Content>
  </Card.Root>
</div>
