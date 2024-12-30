<script lang="ts">
  import NavDashboard from '$lib/components/dashboard/admin/NavDashboard.svelte'
  import * as Card from '$lib/components/ui/card'
  import { Axis, BarChart, Bars, Chart, Labels, PieChart, Rule, Svg } from 'layerchart'
  import type { PageData } from './$types';
  import { RecentSales } from '$lib/components/dashboard/admin'
  import { scaleBand } from 'd3-scale'
  
  let { data }: { data: PageData } = $props();
  let dataCard = 
  [
    {
      "NomeMotoboy": 'Gustavo',
      "valueRelatorio": 68,
      "baseline": 90
    },
    {
      "NomeMotoboy": 'Vitor',
      "valueRelatorio": 38,
      "baseline": 45
    },
    {
      "NomeMotoboy": 'Pedro',
      "valueRelatorio": 38,
      "baseline": 45
    },
    {
      "NomeMotoboy": 'Jose',
      "valueRelatorio": 38,
      "baseline": 45
    },
    {
      "NomeMotoboy": 'Joadsfdse',
      "valueRelatorio": 38,
      "baseline": 45
    },
  ]

  let larguraGrafico = "height:" + dataCard.length * 60+"px;";
</script>

<NavDashboard 
cardUm={{
  titleCard : "Total de entregas", 
  textCard : data.totalDelivered.toString(),
  subTitle : ""
}}
cardDois={{
  titleCard : "Total taxas de entrega", 
  textCard : "",
  subTitle : ""
}}
cardTres={{
  titleCard : "Pedidos cancelados", 
  textCard : "",
  subTitle : ""
}}
cardQuatro={{
  titleCard : "Melhor produto", 
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
        <h2>
          Relatório Motoboy (Soma a quantidade de entrega e o valor total das taxas de entrega) - vai ter que ser um gráfico em pé, mostrando todos os motoboys e a altura vai variar conforme a quantidade de motoboys naquela distribuidora
        </h2>
        <!-- Axis = Heixo -->
        <!-- placement = localização -->
        <!-- Scalable Vector Graphics -->
        <div class="{larguraGrafico} p-4 border rounded" style="{larguraGrafico}">
          <Chart
            data={dataCard}
            x="valueRelatorio"
            xNice
            xPadding={[20, 20]}
            y="NomeMotoboy"
            yScale={scaleBand().padding(0.4)}
            padding={{ left: 16, bottom: 24 }}
          >
            <Svg>
              <Axis placement="bottom" grid rule />
              <Axis
                placement="left"
                rule
              />
              <Rule x={0} />
              <Bars strokeWidth={1} class="fill-primary"/>
              <Labels format="integer" />
            </Svg>
          </Chart>
        </div>                
    </div>
    <!-- <div class="w-full pr-3">
      <h2>Motoboys com maior número de entregas</h2>
      <div class="h-[300px] p-4 border rounded">
        
      </div>
    </div> -->
    <!-- <div class="w-full">
      <h2>Tempo médio de entrega (Vai mostrar o dia, por padrão 1 semana e dps a data que a pessoa selecionar, tem que ter limite )</h2>
      <div class="h-[300px] p-4 border rounded">
        
      </div>
    </div> -->
    <!-- <div class="w-full">
      <h2>Area com maior número de entregas</h2>
      <div class="h-[300px] p-4 border rounded">
        
      </div>
    </div> -->
  </Card.Content>
</Card.Root>
<Card.Root class="w-full lg:w-3/12">
  <Card.Header>
    <Card.Title>Ultimas entregas</Card.Title>
  </Card.Header>
  <Card.Content>
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