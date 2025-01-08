<script lang="ts">
  import NavDashboard from '$lib/components/dashboard/admin/NavDashboard.svelte'
  import * as Card from '$lib/components/ui/card'
  import { BarChart, PieChart } from 'layerchart'
  import type { PageData } from './$types';
  import { RecentSales } from '$lib/components/dashboard/admin'
  import SvChart from '../SvChart.svelte'
  import { map } from '@trpc/server/observable'

  let { data }: { data: PageData } = $props();

  const { totalItemsStock, quantSaida, quantEntrada, skuLowStock } = data;
</script>

<NavDashboard 
  cardUm={{
    titleCard : "Total de SKUs no estoque", 
    textCard : totalItemsStock[0].count.toString(),
    subTitle : ""
  }}
  cardDois={{
    titleCard : "Entradas - Saídas", 
    textCard : (quantEntrada - quantSaida).toString(),
    subTitle : `Entrada: ${quantEntrada} Saida: ${quantSaida}`
  }}
  cardTres={null}
  cardQuatro={null}
/>

<h1>Página de vendas</h1>

<div class="flex flex-col lg:flex-row gap-3">
  <Card.Root class="w-full lg:w-9/12 ">
    <Card.Header>
      <Card.Title>Overview</Card.Title>
    </Card.Header>
    <!-- <Card.Content class="flex flex-col md:flex-row gap-4"> -->
    <Card.Content class="flex flex-wrap">
      <div class="w-full">
        <SvChart 
        config={{
          type : "line",
          data : {
            labels: skuLowStock.map((d) => d.sku),
            datasets : [
              {
                type: "line",
                label: "Estoque mínimo",
                data: skuLowStock.map((d) => d.quantity + 50),
                pointStyle : "circle",
                pointRadius: 5,
                pointHoverRadius: 15,
                backgroundColor: "rgb(0, 64, 128)", 
                borderColor: "rgb(0, 64, 128)"
              },
              {
                type: "bar",
                label: "Estoque atual",
                data: skuLowStock.map((d) => d.quantity),
                backgroundColor: "rgb(0, 64, 128, 0.7)"
              }
            ]
          } 
        }}
        height={300}
        title={"Estoque abaixo do mínimo"}
        />
      </div>
    </Card.Content>
  </Card.Root>
  <Card.Root class="w-full lg:w-3/12">
    <Card.Header>
      <Card.Title>Produtos com menor quantidade de estoque</Card.Title>
    </Card.Header>
    <Card.Content>
      <!-- TODO: Mudar o recent sales -->
      <RecentSales textRecentSale={
        skuLowStock.map((d) => ({
          title: d.name,
          text: d.sku.toString(),
          value: d.quantity.toString(),
        }))
      } />
    </Card.Content>
  </Card.Root>
</div>