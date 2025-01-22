<script lang="ts">
  import NavDashboard from '../NavDashboard.svelte'
  import * as Card from '$lib/components/ui/card'
  import { BarChart, PieChart } from 'layerchart'
  import type { PageData } from './$types';
  import { RecentSales } from '$lib/components/dashboard/admin'
  import SvChart from '../SvChart.svelte'
  import { map } from '@trpc/server/observable'

  let { data }: { data: PageData } = $props();

  const { totalItemsStock, quantSaida, quantEntrada, skuLowStock } = $derived(data);

  const cards = $derived([
    {
      titleCard : "Total de SKUs criados no período", 
      textCard : totalItemsStock[0].count.toString(),
      subTitle : ""
    },
    {
      titleCard : "Entradas - Saídas", 
      textCard : (quantEntrada - quantSaida).toString(),
      subTitle : `Entrada: ${quantEntrada} Saida: ${quantSaida}`
    }
  ])
</script>

<NavDashboard {cards} />

<div class="flex flex-col lg:flex-row gap-3">
  <Card.Root class="w-full lg:w-9/12 ">
    <Card.Header>
      <Card.Title>Gráficos</Card.Title>
    </Card.Header>
    <Card.Content class="flex flex-wrap">
      <div class="w-full">
        {#key skuLowStock}
          <SvChart 
          config={{
          type : "line",
          options: {
            indexAxis: 'y',
          },
          data : {
            labels: skuLowStock.map((d) => d.sku),
            datasets : [
              {
                type: "line",
                label: "Estoque mínimo",
                // TODO: Carregar o estoque mínimo aqui
                data: skuLowStock.map((d) => d.quantity + 50).slice(0, 10),
                pointStyle : "circle",
                pointRadius: 5,
                pointHoverRadius: 15,
                backgroundColor: "rgba(255, 0, 0, 1)", 
                borderColor: "rgba(255, 0, 0, 0.3)",
              },
              {
                type: "bar",
                label: "Estoque atual",
                data: skuLowStock.map((d) => d.quantity).slice(0 , 10),
                barThickness : 30,
                backgroundColor: "rgb(0, 64, 128, 0.8)",
              }
            ]
          } 
          }}
          height={skuLowStock.length * 40}
          title={"Estoque abaixo do mínimo"}
          />
        {/key}
      </div>
      <!-- {#if skuLowStock.length > 0}
        <div class="w-full flex justify-center">
          <a href="#" class="btn btn-primary">Ver todos</a>
        </div>
      {/if} -->
    </Card.Content>
  </Card.Root>
  <Card.Root class="w-full lg:w-3/12">
    <Card.Header>
      <Card.Title>Produtos com menor quantidade de estoque</Card.Title>
    </Card.Header>
    <Card.Content>
      <RecentSales textRecentSale={
        skuLowStock.map((d) => ({
          title: d.name,
          text: "SKU: " + d.sku.toString(),
          value: d.quantity.toString(),
        })).slice(0, 10)
      } />
    </Card.Content>
  </Card.Root>
</div>