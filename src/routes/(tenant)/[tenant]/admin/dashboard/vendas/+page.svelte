<script lang="ts">
  import { BarChart, PieChart } from 'layerchart'
  import type { PageData } from './$types';
  import NavDashboard from '$lib/components/dashboard/admin/NavDashboard.svelte'
  import * as Tabs from '$lib/components/ui/tabs/index';
  import * as Card from '$lib/components/ui/card/index'
  import { Overview, RecentSales } from '$lib/components/dashboard/admin'

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
    revenueByMonth , topCustomers , topRevenueProducts, topSellingCategories, topCustomerOrders, 
    topOrderedProducts, AvgOrderValue, quantOrders
  } = data

  console.log(data);

  let card = {
    titleCard : "Teste leo",
    textCard : "R$100.00",
    subTitle : "Aumentou 10%"
  }
</script>

<NavDashboard 
  cardUm = {{
    titleCard : "Total", 
    textCard : "R$ " + revenueByMonth[0].total_revenue.toLocaleString('pt-BR'),
    subTitle : ""
  }}
  cardDois = {{
    titleCard : "Resumo",
    textCard : "",
    subTitle : ""
  }}
  cardTres = {{
    titleCard : "Ticket Médio",
    textCard : "R$ " + AvgOrderValue[0].average_order_value.toLocaleString('pt-BR'),
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
          <BarChart data={topCustomers} x="name" y="pedidos" />
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

