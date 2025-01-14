<script lang="ts">
  import NavDashboard from '$lib/components/dashboard/admin/NavDashboard.svelte'
  import * as Card from '$lib/components/ui/card'
  import { Axis, BarChart, Bars, Chart, Labels, PieChart, Rule, Svg } from 'layerchart'
  import type { PageData } from './$types';
  import { RecentSales } from '$lib/components/dashboard/admin'
  import { scaleBand } from 'd3-scale'
  import SvChart from '../SvChart.svelte'
  import { convertIndexToString } from 'drizzle-orm/mysql-core'
  import { text } from '@sveltejs/kit'
  
  let { data }: { data: PageData } = $props();

  const { totalDeliveredCompleted, TotalDeliveryFees, cancelingOrders, bestProduct, couriersHighestNumberDeliveries } = data;
</script>

<NavDashboard 
cardUm={{
  titleCard : "Total de entregas", 
  textCard : totalDeliveredCompleted.toString() ? totalDeliveredCompleted.toString() : "0",
  subTitle : ""
}}
cardDois={{
  titleCard : "Total taxas de entrega", 
  textCard : "R$" + ((TotalDeliveryFees / 100).toFixed(2)).toString(),
  subTitle : ""
}}
cardTres={{
  titleCard : "Pedidos cancelados", 
  textCard : cancelingOrders.toString(),
  subTitle : ""
}}
cardQuatro={{
  titleCard : "Melhor produto", 
  textCard : bestProduct,
  subTitle : ""
}}
/>

<h1>Página de vendas</h1>

<div class="flex flex-col lg:flex-row gap-3">
  <Card.Root class="w-full lg:w-9/12 ">
    <Card.Header>
      <Card.Title>Overview</Card.Title>
    </Card.Header>
    <!-- <Card.Content class="flex flex-col md:flex-row gap-4"> -->
    <Card.Content class="flex flex-wrap">
      <div class="w-full pr-3">
        <SvChart 
        config={{
          type : "bar", 
          data : {
            labels : couriersHighestNumberDeliveries.map((d) => d.name),
            datasets:
            [
              {
                label : "Relatorio Motoboy",
                data : couriersHighestNumberDeliveries.map((d) => parseFloat(d.numberDeliveries.toString()) + d.totalAmountDeliveryFees),
                backgroundColor : 
                [
                  'rgba(255, 217, 0)'
                ],
                barThickness : 30,
              }
            ]
          },
          options: {
            indexAxis: 'y',
          }
        }}
        height={couriersHighestNumberDeliveries.length * 60}
        title={"Relatório Motoboy (Soma a quantidade de entrega e o valor total das taxas de entrega) - vai ter que ser um gráfico em pé, mostrando todos os motoboys e a altura vai variar conforme a quantidade de motoboys naquela distribuidora"}
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
    <RecentSales textRecentSale={
    couriersHighestNumberDeliveries.map((c) => {
      return {
        title : c.name,
        text : "Número de corridas: " + c.numberDeliveries.toString(),
        value : "R$ " + (c.totalAmountDeliveryFees).toString()
      }
    })}/>
  </Card.Content>
</Card.Root>
</div>