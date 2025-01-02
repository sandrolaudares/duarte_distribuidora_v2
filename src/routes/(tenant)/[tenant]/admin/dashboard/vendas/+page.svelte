<script lang="ts">
  import { Axis, BarChart, Bars, Chart, Pie, PieChart, Svg, Tooltip } from 'layerchart'
  import type { PageData } from './$types';
  import NavDashboard from '$lib/components/dashboard/admin/NavDashboard.svelte'
  import * as Tabs from '$lib/components/ui/tabs/index';
  import * as Card from '$lib/components/ui/card/index'
  import { Overview, RecentSales } from '$lib/components/dashboard/admin'
  import { scaleBand } from 'd3-scale'
  import { format } from 'date-fns'
  import { icons } from '$lib/utils/icons'
  import { page } from '$app/stores'
  import { SSRFilters } from '$lib/components/datatable/filter.svelte'; 

  let { data }: { data: PageData } = $props();

  const { 
    revenueByMonth , topRevenueProducts, topSellingCategories, topCustomerOrders, 
    topOrderedProducts, AvgOrderValue, quantOrders, topCustomers, financialSummary
  } = data;

  let dadoComparar = [
    {
      product_name: "Brahma",
      total_revenue: 65,
      total_revenue_compare: 44,
      total_quantity_ordered: 2,
      initialDate: "18/02/2024",
      endDate: "28/02/2024"
    },
    {
      product_name: "Skol",
      total_revenue: 80,
      total_revenue_compare: 75,
      total_quantity_ordered: 5,
      initialDate: "01/01/2024",
      endDate: "10/03/2024"
    },
    { 
      product_name: "Heineken",
      total_revenue: 120,
      total_revenue_compare: 95,
      total_quantity_ordered: 8,
      initialDate: "15/03/2024",
      endDate: "25/03/2024"
    },
    {
      product_name: "Budweiser",
      total_revenue: 100,
      total_revenue_compare: 85,
      total_quantity_ordered: 6,
      initialDate: "01/04/2024",
      endDate: "10/04/2024"
    },
    {
      product_name: "Corona",
      total_revenue: 70,
      total_revenue_compare: 100,
      total_quantity_ordered: 3,
      initialDate: "15/04/2024",
      endDate: "25/04/2024"
    },
    {
      product_name: "Stella",
      total_revenue: 100,
      total_revenue_compare: 100,
      total_quantity_ordered: 3,
      initialDate: "15/04/2024",
      endDate: "25/04/2024"
    }
  ];

  let dadoCompararProdutoMaisVendido = [
    {

    },
    {

    }
  ]

  let calculaAumento = (initial : number, end : number) => {
    let calcula = parseFloat((100 - (end * 100 / initial)).toFixed(2));
    let htmlText = calcula > 0 ? icons.arrows.down_line() : icons.arrows.up_line()
    return `${htmlText} ${Math.abs(calcula)}%`
    // icons.arrows()
  }
    
  let carregaGrafico = false;

</script>

<NavDashboard 
  cardUm = {{
    titleCard : "Total", 
    textCard : "R$ " + (revenueByMonth[0].total_revenue / 100).toFixed(2).toString(),
    subTitle : "",
  }}
  cardDois = {{
    titleCard : "Resumo",
    textCard : "R$ " + (financialSummary / 100).toFixed(2).toString(),
    subTitle : ""
  }}
  cardTres = {{
    titleCard : "Ticket Médio",
    textCard : "R$ " + (AvgOrderValue[0].average_order_value / 100).toFixed(2).toString(),
    subTitle : ""
  }}
  cardQuatro = {{
    titleCard : "Total pedidos",
    textCard : quantOrders[0].total_orders.toString(),
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
      {#if carregaGrafico}
          <div class="w-full pr-3">
            <h2>Principais produtos de receita</h2>
            <div class="h-[300px] p-4 border rounded">
              <BarChart data={topRevenueProducts}
              x="product_name"
              y="total_revenue"
              props={{bars : {class: "fill-primary stroke-primary"}}} />
            </div>
          </div>
          <div class="w-full">
            <h2>Produtos mais vendidos (quantidade)</h2>
            <div class="h-[300px] p-4 border rounded">
              <BarChart data={topOrderedProducts} 
              x="product_name" 
              y="total_quantity_ordered"
              props={{bars : {class: "fill-red-400 stroke-red-400"}}}
              />
            </div>
          </div>
          <div class="w-full lg:w-1/2 lg:pr-3">
            <h2>Metodos de pagamento</h2>
            <div class="h-[300px] p-4 border rounded">
              <PieChart
              data={mostPopularPaymentMethodsWithColor}
              key="payment_method"
              value="usage_count"
              innerRadius={-20}
              cornerRadius={5}
              padAngle={0.02}
              c="color"
              cRange={mostPopularPaymentMethodsWithColor.map((d) => d.color)}
              />
            </div>
          </div>
          <div class="w-full lg:w-1/2">
            <h2>Clientes que mais pediram</h2>
            <div class="h-[300px] p-4 border rounded">
              <BarChart data={topCustomers} x="customer_name" y="pedidos" />
            </div>
          </div>
        {:else}
          <div class="w-full pr-3">
            <h2>Principais produtos de receita</h2>
            <div class="h-[300px] p-4 border rounded">
              <Chart
                data={dadoComparar}
                x="product_name"
                xScale={scaleBand().padding(0.6)}
                y={["total_revenue", "total_revenue_compare"]}
                yDomain={[0, null]}
                yNice={4}
                padding={{ left: 30, bottom: 10 }}
                tooltip={{ mode: "bisect-x" }}>
                <Svg>
                  <Axis placement="left" grid rule />
                  <Axis
                    placement="bottom"
                    format={(d) => d.toString()}
                    rule
                  />
                  <Bars y="total_revenue" class="fill-primary" />
                  <Bars y="total_revenue_compare"  class="fill-blue-600/80" />
                  <!-- <Highlight area /> -->
                </Svg>
                <!-- TODO: Consertar bug valores legenda -->
                <Tooltip.Root let:data={dadoComparar}>
                  <Tooltip.Header> 
                    {@html calculaAumento(dadoComparar.total_revenue, dadoComparar.total_revenue_compare)}
                  </Tooltip.Header>
                  <Tooltip.List>
                    <Tooltip.Item label={dadoComparar.initialDate} value={dadoComparar.total_revenue} />
                    <Tooltip.Item label={dadoComparar.endDate} value={dadoComparar.total_revenue_compare} />
                  </Tooltip.List> 
                </Tooltip.Root>
              </Chart>
            </div>        
          </div>
          <div class="w-full pr-3">
            <h2>Produtos mais vendidos (Quantidade)</h2>
            <div class="h-[300px] p-4 border rounded">
              <BarChart data={topOrderedProducts} 
                x="product_name" 
                y="total_quantity_ordered"
                props={{bars : {class: "fill-red-400 stroke-red-400"}}}
              />
            </div>
          </div>
          <div class="w-full lg:w-1/2 lg:pr-3">
            <h2>Metodos de pagamento</h2>
            <div class="h-[300px] p-4 border rounded">
              <Chart 
              data={mostPopularPaymentMethodsWithColor} x="usage_count" c="payment_method" cRange={mostPopularPaymentMethodsWithColor.map((c)=>c.color)}>
                <Svg center>
                  <Pie innerRadius={100} data={mostPopularPaymentMethodsWithColor} />
                  <Pie outerRadius={90} data={mostPopularPaymentMethodsWithColor} />
                </Svg>
              </Chart>
            </div>        
          </div>
          <div class="w-full lg:w-1/2">
            <h2>Clientes que mais pediram</h2>
            <div class="h-[300px] p-4 border rounded">
              <BarChart data={topCustomers} x="customer_name" y="pedidos" />
            </div>
          </div>
      {/if}      
    </Card.Content>
  </Card.Root>
  <Card.Root class="w-full lg:w-3/12">
    <Card.Header>
      <Card.Title>Clientes ociosos</Card.Title>
      <Card.Description>Não compra a 2 semanas ou mais</Card.Description>
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

<pre>
  {JSON.stringify(data.teste, null, 2)}
  {#each dadoComparar as item}
    {JSON.stringify(item, null, 2)}
  {/each}
</pre>
