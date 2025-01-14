<script lang="ts">
  import {
    Axis,
    BarChart,
    Bars,
    Chart,
    Pie,
    PieChart,
    Svg,
    Tooltip,
  } from 'layerchart'
  import type { PageData } from './$types'
  import NavDashboard from '$lib/components/dashboard/admin/NavDashboard.svelte'
  import * as Tabs from '$lib/components/ui/tabs/index'
  import * as Card from '$lib/components/ui/card/index'
  import { Overview, RecentSales } from '$lib/components/dashboard/admin'
  import { scaleBand } from 'd3-scale'
  import { format } from 'date-fns'
  import { icons } from '$lib/utils/icons'
  import { page } from '$app/stores'
  import { SSRFilters } from '$lib/components/datatable/filter.svelte'
  import SvChart from '../SvChart.svelte'
  import { type ChartConfiguration } from 'chart.js'

  let { data }: { data: PageData } = $props()

  const {
    revenueByMonth,
    topRevenueProducts,
    topSellingCategories,
    topCustomerOrders,
    topOrderedProducts,
    AvgOrderValue,
    quantOrders,
    topCustomers,
    financialSummary,
    mostPopularPaymentMethods,
  } = $derived(data)

  let topRevenueProductsC: ChartConfiguration = $derived({
    type: 'bar',
    data: {
      labels: topRevenueProducts.basePeriod.map(d => d.product_name),
      datasets: [
        {
          label: 'Receita',
          data: topRevenueProducts.basePeriod.map(d => d.total_revenue),
          backgroundColor: ['rgba(0, 85, 199)'],
          borderColor: ['rgb(255, 99, 132)'],
          borderWidth: 0,
          barThickness: 50,
        },
      ],
    },
  })

</script>

<pre>
  {#if revenueByMonth.comparedPeriod}
  {JSON.stringify(revenueByMonth.basePeriod[0].total_revenue, null, 2)}
    {JSON.stringify(revenueByMonth.comparedPeriod[0].total_revenue, null, 2)}
  {/if}
</pre>

<NavDashboard
  cardUm={{
    titleCard: 'Total',
    textCard:
      'R$ ' +
      (revenueByMonth.basePeriod[0].total_revenue / 100).toFixed(2).toString(),
    subTitle: revenueByMonth.comparedPeriod ? 'Periodo anterior: R$ ' + (revenueByMonth.comparedPeriod[0].total_revenue / 100).toString() : '',
  }}
  cardDois={{
    titleCard: 'Resumo',
    textCard:
      'R$ ' +
      (financialSummary.basePeriod[0].total_paid / 100).toFixed(2).toString(),
    subTitle: financialSummary.comparedPeriod ? 'Periodo anterior: R$ ' + (financialSummary.comparedPeriod[0].total_paid / 100).toFixed(2).toString() : '',
  }}
  cardTres={{
    titleCard: 'Ticket Médio',
    textCard:
      'R$ ' +
      (AvgOrderValue.basePeriod[0].average_order_value / 100)
        .toFixed(2)
        .toString(),
    subTitle: AvgOrderValue.comparedPeriod ? 'Periodo anterior: R$ ' + (AvgOrderValue.comparedPeriod[0].average_order_value / 100).toFixed(2).toString() : '',
  }}
  cardQuatro={{
    titleCard: 'Total pedidos',
    textCard: quantOrders.basePeriod[0].total_orders.toString(),
    subTitle: quantOrders.comparedPeriod ? 'Periodo anterior: ' + quantOrders.comparedPeriod[0].total_orders.toString() : '',
  }}
/>

<h1>Página de vendas</h1>

<div class="flex flex-col gap-3 lg:flex-row">
  <Card.Root class="w-full lg:w-9/12 ">
    <Card.Header>
      <Card.Title>Overview</Card.Title>
    </Card.Header>
    <Card.Content>
      <div class="flex flex-wrap">
        <div class="w-full">
          <!-- {#key topRevenueProducts} -->
          <SvChart
            config={topRevenueProductsC}
            height={220}
            title={'Principais produtos de receita'}
          />
          <!-- {/key} -->
        </div>
        <div class="w-full">
          {#key topOrderedProducts}
            <SvChart
              config={{
                type: 'bar',
                data: {
                  labels: topOrderedProducts.map(p => p.product_name),
                  datasets: [
                    {
                      label: 'Quantidade',
                      data: topOrderedProducts.map(
                        p => p.total_quantity_ordered,
                      ),
                      backgroundColor: ['rgba(255, 217, 0)'],
                    },
                    // Dataset de comparação vem aqui
                    {
                      label: 'Quantidade',
                      data: topOrderedProducts.map(
                        p => p.total_quantity_ordered,
                      ),
                      backgroundColor: ['rgba(255, 217, 0)'],
                    },
                  ],
                },
              }}
              height={200}
              title={'Produtos mais vendidos (Quantidade)'}
            />
          {/key}
        </div>
        <div class="w-1/2">
          {#key mostPopularPaymentMethods}
            <SvChart
              config={{
                type: 'pie',
                data: {
                  labels: mostPopularPaymentMethods.basePeriod.map(p => {
                    return p.payment_method
                  }),
                  datasets: [
                    {
                      label: 'Total: ',
                      data: mostPopularPaymentMethods.basePeriod.map(
                        p => p.usage_count,
                      ),
                    },
                    // Coloca aqui o dataset de comparação
                    {
                      label: 'Total: ',
                      data: mostPopularPaymentMethods.comparedPeriod.map(
                        p => p.usage_count,
                      ),
                    },
                  ],
                },
              }}
              title={'Metodos de pagamento'}
            />
          {/key}
        </div>
        <div class="w-1/2">
          {#key topCustomers}
            <SvChart
              config={{
                type: 'bar',
                data: {
                  labels: topCustomers.basePeriod.map(t => t.customer_name),
                  datasets: [
                    {
                      label: 'Total de pedidos',
                      data: topCustomers.basePeriod.map(t => t.pedidos),
                    },
                    {
                      label: 'Total Periodo anterior',
                      data: (topCustomers.comparedPeriod ?? []).map(
                        t => t.pedidos,
                      ),
                    },
                  ],
                },
              }}
              title={'Clientes que mais pediram'}
              height={400}
            />
          {/key}
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
      <RecentSales
        textRecentSale={[
          {
            title: 'Receita',
            text: 'teste',
            value: 'R$ 200,00',
          },
        ]}
      />
    </Card.Content>
  </Card.Root>
</div>
