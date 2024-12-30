<script lang="ts">
  import { Axis, BarChart, Bars, Chart, PieChart, Svg, Tooltip } from 'layerchart'
  import type { PageData } from './$types';
  import NavDashboard from '$lib/components/dashboard/admin/NavDashboard.svelte'
  import * as Tabs from '$lib/components/ui/tabs/index';
  import * as Card from '$lib/components/ui/card/index'
  import { Overview, RecentSales } from '$lib/components/dashboard/admin'
  import { scaleBand } from 'd3-scale'
  import { format } from 'date-fns'

  let { data }: { data: PageData } = $props();

  let colorPaymentMethods = {
    pix: '#3CB371',
    credit_card: '#1E90FF',
    debit_card: '#87CEEB',
    dinheiro: '#006400'
  }

  const mostPopularPaymentMethodsWithColor = $derived.by(() => data.mostPopularPaymentMethods.map((method) => ({
    ...method,
    color: method.payment_method in colorPaymentMethods ? colorPaymentMethods[method.payment_method] : 'gray'
  })))

  const { 
    revenueByMonth , topRevenueProducts, topSellingCategories, topCustomerOrders, 
    topOrderedProducts, AvgOrderValue, quantOrders, topCustomers, financialSummary
  } = data;

  let testData = [
  {
    "date": new Date('2024-12-01T03:00:00.000Z'),
    "value": 47,
    "baseline": 64
  },
  {
    "date": new Date('2024-12-02T03:00:00.000Z'),
    "value": 83,
    "baseline": 97
  },
  {
    "date": new Date('2024-12-03T03:00:00.000Z'),
    "value": 39,
    "baseline": 56
  },
  {
    "date": new Date('2024-12-04T03:00:00.000Z'),
    "value": 48,
    "baseline": 95
  },
  {
    "date": new Date('2024-12-05T03:00:00.000Z'),
    "value": 84,
    "baseline": 36
  },
  {
    "date": new Date('2024-12-06T03:00:00.000Z'),
    "value": 30,
    "baseline": 41
  },
  {
    "date": new Date('2024-12-07T03:00:00.000Z'),
    "value": 39,
    "baseline": 49
  },
  {
    "date": new Date('2024-12-08T03:00:00.000Z'),
    "value": 59,
    "baseline": 76
  },
  {
    "date": new Date('2024-12-09T03:00:00.000Z'),
    "value": 72,
    "baseline": 99
  },
  {
    "date": new Date('2024-12-10T03:00:00.000Z'),
    "value": 54,
    "baseline": 78
  },
  {
    "date": new Date('2024-12-11T03:00:00.000Z'),
    "value": 32,
    "baseline": 99
  },
  {
    "date": new Date('2024-12-12T03:00:00.000Z'),
    "value": 52,
    "baseline": 72
  },
  {
    "date": new Date('2024-12-13T03:00:00.000Z'),
    "value": 73,
    "baseline": 61
  },
  {
    "date": new Date('2024-12-14T03:00:00.000Z'),
    "value": 21,
    "baseline": 69
  },
  {
    "date": new Date('2024-12-15T03:00:00.000Z'),
    "value": 91,
    "baseline": 92
  },
  {
    "date": new Date('2024-12-16T03:00:00.000Z'),
    "value": 46,
    "baseline": 49
  },
  {
    "date": new Date('2024-12-17T03:00:00.000Z'),
    "value": 90,
    "baseline": 74
  },
  {
    "date": new Date('2024-12-18T03:00:00.000Z'),
    "value": 75,
    "baseline": 99
  },
  {
    "date": new Date('2024-12-19T03:00:00.000Z'),
    "value": 80,
    "baseline": 23
  },
  {
    "date": new Date('2024-12-20T03:00:00.000Z'),
    "value": 100,
    "baseline": 48
  },
  {
    "date": new Date('2024-12-21T03:00:00.000Z'),
    "value": 87,
    "baseline": 65
  },
  {
    "date": new Date('2024-12-22T03:00:00.000Z'),
    "value": 62,
    "baseline": 96
  },
  {
    "date": new Date('2024-12-23T03:00:00.000Z'),
    "value": 69,
    "baseline": 68
  },
  {
    "date": new Date('2024-12-24T03:00:00.000Z'),
    "value": 32,
    "baseline": 81
  },
  {
    "date": new Date('2024-12-25T03:00:00.000Z'),
    "value": 25,
    "baseline": 52
  },
  {
    "date": new Date('2024-12-26T03:00:00.000Z'),
    "value": 54,
    "baseline": 37
  },
  {
    "date": new Date('2024-12-27T03:00:00.000Z'),
    "value": 100,
    "baseline": 37
  },
  {
    "date": new Date('2024-12-28T03:00:00.000Z'),
    "value": 56,
    "baseline": 75
  },
  {
    "date": new Date('2024-12-29T03:00:00.000Z'),
    "value": 75,
    "baseline": 80
  },
  {
    "date": new Date('2024-12-30T03:00:00.000Z'),
    "value": 32,
    "baseline": 38
  }]

  
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
      <div class="w-full pr-3">
        <h2>Principais produtos de receita</h2>
        <div class="h-[300px] p-4 border rounded">
          <BarChart data={topRevenueProducts}
          x="product_name"
          y="total_revenue"
          props={{bars : {class: "fill-primary stroke-primary"}}} />
        </div>
      </div>
      <div class="w-full pr-3">
        <div class="h-[300px] p-4 border rounded">
          <Chart
            data={testData}
            x="date"
            xScale={scaleBand().padding(0.4)}
            y={["value", "baseline"]}
            yDomain={[0, null]}
            yNice={4}
            padding={{ left: 16, bottom: 24 }}
            tooltip={{ mode: "bisect-x" }}
          >
            <Svg>
              <Axis placement="left" grid rule />
              <Axis
                placement="bottom"
                format={(d) => d.toString()}
                rule
              />
              <Bars y="baseline" strokeWidth={1} class="fill-surface-content/20" />
              <Bars y="value" strokeWidth={1} inset={8} class="fill-primary" />
            </Svg>
          </Chart>
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
        <h2>Maiores que mais pediram</h2>
        <div class="h-[300px] p-4 border rounded">
          <BarChart data={topCustomers} x="customer_name" y="pedidos" />
        </div>
      </div>
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
 
</pre>