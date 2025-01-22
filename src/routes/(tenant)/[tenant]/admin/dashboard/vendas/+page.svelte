<script lang="ts">
  import type { PageData } from './$types'
  import NavDashboard from '../NavDashboard.svelte'
  import * as Card from '$lib/components/ui/card/index'
  import SvChart from '../SvChart.svelte'
  import { RecentSales } from '$lib/components/dashboard/admin'

  let { data }: { data: PageData } = $props()

  const {
    topRevenueProducts,
    topSellingCategories,
    topCustomerOrders,
    topOrderedProducts,
    AvgOrderValue,
    quantOrders,
    topCustomers,
    financialSummary,
    mostPopularPaymentMethods,
    clientesOciosos
  } = $derived(data)

  let cards = $derived([
    {
      titleCard : "Total de pedidos",
      textCard: financialSummary.basePeriod[0].total_paid ? (financialSummary.basePeriod[0].total_paid).toString() : "0",
      subTitle: financialSummary.comparedPeriod ? "Periodo comparado: " + financialSummary.comparedPeriod[0].total_paid.toString() : ""
    },
    {
      titleCard : "Valor médio do pedido",
      textCard: "R$ " + (AvgOrderValue.basePeriod ? ((AvgOrderValue.basePeriod[0].average_order_value / 100).toFixed(2)).toString() : ""),
      subTitle: AvgOrderValue.comparedPeriod ? "Periodo comparado: " + 
        (AvgOrderValue.comparedPeriod[0].average_order_value / 100).toFixed(2).toString() : ""
    },
    {
      titleCard : "Total de pedidos",
      textCard : quantOrders.basePeriod[0].total_orders.toString(),
      subTitle : quantOrders.comparedPeriod ? "Periodo comparado: " + quantOrders.comparedPeriod[0].total_orders.toString() : "",
    }
  ])

</script>

<NavDashboard {cards}/> 

<div class="flex flex-col gap-3 lg:flex-row">
  <Card.Root class="w-full lg:w-9/12 ">
    <Card.Header>
      <Card.Title>Gráficos</Card.Title>
    </Card.Header>
    <Card.Content>
      <div class="flex flex-wrap">
        <div class="w-full">
          {#key topRevenueProducts}
          <!-- Carrega duas barras, com o produto mais vendido de cada período -->
            <SvChart
              config={{
                type: 'bar',
                data: {
                  labels: topRevenueProducts.basePeriod.map((d, index) => {
                    return topRevenueProducts.comparedPeriod
                      ? d.product_name + ' | ' + topRevenueProducts.comparedPeriod[index].product_name
                      : d.product_name;
                  }),
                  datasets: 
                  [
                    {
                      label: 'Periodo base',
                      data: topRevenueProducts.basePeriod?.map(d => d.total_revenue) ?? [],
                      backgroundColor: ['rgba(0, 85, 199)'],
                      borderColor: ['rgb(255, 99, 132)'],
                      borderWidth: 0, 
                      barThickness: 30,
                    },
                    {
                      label: 'Periodo Comparado',
                      data: topRevenueProducts.comparedPeriod?.map(d => d.total_revenue) ?? [],
                      backgroundColor: ['rgba(132, 169, 71)'],
                      borderColor: ['rgb(132, 169, 71)'],
                      borderWidth: 0, 
                      barThickness: 30
                    }
                  ],
                },
              }}
              height={220}
              title={'Principais produtos de receita'}
            />
          {/key}
        </div>
        <div class="w-full">
          {#key topOrderedProducts}
            <SvChart
              config={{
                type: 'bar',
                data: {
                  labels: topOrderedProducts.map((p) => p.product_name),
                  datasets: [
                    {
                      label: 'Quantidade',
                      data: topOrderedProducts?.map(
                        p => p.total_quantity_ordered,
                      ) ?? [],
                      backgroundColor: ['rgba(255, 217, 0)'],
                      barThickness: 30
                    },
                  ],
                },
              }}
              height={200}
              title={'Produtos mais vendidos (Todo periodo selecionado)'}
            />
          {/key}
        </div>
        <div class="w-1/2">
          {#key mostPopularPaymentMethods}
               <SvChart
                 config={{
                   type: 'pie',
                   data: {
                     labels: mostPopularPaymentMethods.basePeriod.map((p, index) => {
                       return p.payment_method
                     }),
                     datasets: [
                       {
                         label: 'Total: ',
                         data: mostPopularPaymentMethods.basePeriod?.map(
                           p => p.usage_count,
                         ) ?? [],
                       },
                     ],
                   },
                 }}
                 title={'Metodos de pagamento'}
               />
          {/key}  
        </div>
        {#if mostPopularPaymentMethods.comparedPeriod}
        <div class="w-1/2">
          <SvChart
          config={{
            type: 'pie',
            data: {
              labels: mostPopularPaymentMethods.comparedPeriod.map((m) => {
                return m.payment_method
              }),
              datasets: [
                {
                  label: 'Total: ',
                  data: mostPopularPaymentMethods.comparedPeriod?.map(
                    p => p.usage_count,
                  ) ?? [],
                },
              ],
            },
          }}
          title={'Periodo Comparado'}/>
        </div>
        {/if}
        <div class="w-1/2">
          {#key topCustomers}
            <SvChart
              config={{
                type: 'bar',
                data: {
                  labels: topCustomers.basePeriod.map((t, index) => {
                    return topCustomers.comparedPeriod
                    ? t.customer_name + ' | ' + topCustomers.comparedPeriod[index].customer_name
                    : t.customer_name
                  }),
                  datasets: [
                    {
                      label: 'Total de pedidos',
                      data: topCustomers.basePeriod?.map(t => t.pedidos) ?? [],
                    },
                    {
                      label: 'Total Periodo anterior',
                      data: topCustomers.comparedPeriod?.map(
                        t => t.pedidos,
                      ) ?? [],
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
        textRecentSale={
          clientesOciosos.map((c) => {
            return {
              title: c.name,
              value: c.ultimaCompra,
            }
          })
        }
      />
    </Card.Content>
  </Card.Root>
</div>
