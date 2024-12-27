<script lang="ts">
  import NavDashboard from '$lib/components/dashboard/admin/NavDashboard.svelte'
  import * as Card from '$lib/components/ui/card'
  import { BarChart, PieChart } from 'layerchart'
  import type { PageData } from './$types';
  import { RecentSales } from '$lib/components/dashboard/admin'

  let { data }: { data: PageData } = $props();
  console.log(data);
</script>

<NavDashboard 
  cardUm={{
    titleCard : "Total de entregas", 
    textCard : "ddd",
    subTitle : ""
  }}
  cardDois={{
    titleCard : "Crescimento", 
    textCard : "",
    subTitle : ""
  }}
  cardTres={{
    titleCard : "Maior produto", 
    textCard : "",
    subTitle : ""
  }}
  cardQuatro={{
    titleCard : "Maior categoria", 
    textCard : "",
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
        <h2>Principais produtos de receita</h2>
        <div class="h-[300px] p-4 border rounded">
          
        </div>
      </div>
      <div class="w-full">
        <h2>Produtos mais vendidos (quantidade)</h2>
        <div class="h-[300px] p-4 border rounded">
          
        </div>
      </div>
      <div class="w-full lg:w-1/2 lg:pr-3">
        <h2>Metodos de pagamento</h2>
        <div class="h-[300px] p-4 border rounded">
          
        </div>
      </div>
      <div class="w-full lg:w-1/2">
        <h2>Maiores que mais pediram</h2>
        <div class="h-[300px] p-4 border rounded">
          
        </div>
      </div>
    </Card.Content>
  </Card.Root>
  <Card.Root class="w-full lg:w-3/12">
    <Card.Header>
      <Card.Title>Vendas recentes</Card.Title>
      <Card.Description>Pensar no que colocar aqui</Card.Description>
    </Card.Header>
    <Card.Content>
      <!-- TODO: Mudar o recent sales -->
      <RecentSales textRecentSale={[
        {
          title : "Receita",
          text : "teste",
          value : "R$ 200,00"
        }
      ]}/>
    </Card.Content>
  </Card.Root>
</div>