<script lang="ts">
  import type { PageData } from './$types'
  import NavDashboard from '../NavDashboard.svelte'
  import * as Card from '$lib/components/ui/card/index'
  import SvChart from '../SvChart.svelte'
  import { RecentSales } from '$lib/components/dashboard/admin'
  import TopRevenueSvChart from './TopRevenueSvChart.svelte'
  import DefaultBarSvChart from './DefaultBarSvChart.svelte'

  let { data }: { data: PageData } = $props()

  const {
    topRevenueProducts,
    topSellingCategories,
    topCustomerOrders,
    topOrderedProducts,
    AvgOrderValue,
    quantOrders,
    financialSummary,
    mostPopularPaymentMethods,
    clientesOciosos,
  } = $derived(data)

  let cards = $derived([
    {
      titleCard: 'Total de pedidos',
      textCard: financialSummary.basePeriod[0].total_paid
        ? 'R$ ' +
          ((financialSummary.basePeriod[0].total_paid / 100)
            .toFixed(2))
            .toString()

        : '0',
      subTitle: financialSummary.comparedPeriod
        ? 'Periodo comparado: ' +
          (financialSummary.comparedPeriod[0].total_paid / 100)
            .toFixed(2)
            .toString()
        : '',
    },
    {
      titleCard: 'Valor médio do pedido',
      textCard:
        'R$ ' +
        (AvgOrderValue.basePeriod
          ? (AvgOrderValue.basePeriod[0].average_order_value / 100)
              .toFixed(2)
              .toString()
          : ''),
      subTitle: AvgOrderValue.comparedPeriod
        ? 'Periodo comparado: ' +
          (AvgOrderValue.comparedPeriod[0].average_order_value / 100)
            .toFixed(2)
            .toString()
        : '',
    },
    {
      titleCard: 'Total de pedidos',
      textCard: quantOrders.basePeriod[0].total_orders.toString(),
      subTitle: quantOrders.comparedPeriod
        ? 'Periodo comparado: ' +
          quantOrders.comparedPeriod[0].total_orders.toString()
        : '',
    },
  ])
</script>

<NavDashboard {cards} />

<div class="flex flex-col gap-3 lg:flex-row">
  <Card.Root class="w-full lg:w-9/12 ">
    <Card.Header>
      <Card.Title>Gráficos</Card.Title>
    </Card.Header>
    <Card.Content>
      <div class="flex flex-wrap">
        <div class="w-full">
          {#key topRevenueProducts}
            <TopRevenueSvChart
              dataProps={topRevenueProducts}
              height={220}
              title={'Principais produtos de receita'}
            />
          {/key}
          <div class="divider"></div>
        </div>
        <div class="w-full">
          {#key topOrderedProducts}
            <DefaultBarSvChart
              fnLabel={topOrderedProducts.basePeriod.map(p => p.product_name)}
              fnData={topOrderedProducts.basePeriod.map(
                p => p.total_quantity_ordered,
              )}
              height={200}
              title={'Produtos mais vendidos - Periodo base'}
              color={'#F4D002'}
              tipoPeriodo={'Periodo base'}
              tipoDadoEixoY={'Quant. de produtos vendidos'}
            />
          {/key}
        </div>
        <div class="w-full">
          {#if topOrderedProducts.comparedPeriod}
            {#key topOrderedProducts}
              <DefaultBarSvChart
                fnLabel={topOrderedProducts.comparedPeriod.map(
                  p => p.product_name,
                )}
                fnData={topOrderedProducts.comparedPeriod.map(
                  p => p.total_quantity_ordered,
                )}
                height={200}
                title={'Produtos mais vendidos - Periodo comparado'}
                color={'#003E7D'}
                tipoPeriodo={'Periodo comparado'}
                tipoDadoEixoY={'Quant. de produtos vendidos'}
              />
            {/key}
          {/if}
        </div>
        <div class="w-full"><div class="divider"></div></div>
        {#key mostPopularPaymentMethods.basePeriod}
          <div class="w-1/2">
            <SvChart
              config={{
                type: 'pie',
                data: {
                  labels: mostPopularPaymentMethods.basePeriod.map(
                    (p, index) => {
                      return p.payment_method
                    },
                  ),
                  datasets: [
                    {
                      label: 'Total de pagamentos',
                      data:
                        mostPopularPaymentMethods.basePeriod?.map(
                          p => p.usage_count,
                        ) ?? [],
                    },
                  ],
                },
              }}
              title={'Metodos de pagamento - Per. base'}
            />
          </div>
        {/key}
        {#key mostPopularPaymentMethods.comparedPeriod}
          {#if mostPopularPaymentMethods.comparedPeriod}
            <div class="w-1/2">
              <SvChart
                config={{
                  type: 'pie',
                  data: {
                    labels: mostPopularPaymentMethods.comparedPeriod.map(m => {
                      return m.payment_method
                    }),
                    datasets: [
                      {
                        label: 'Total de pagamentos',
                        data:
                          mostPopularPaymentMethods.comparedPeriod?.map(
                            p => p.usage_count,
                          ) ?? [],
                      },
                    ],
                  },
                }}
                title={'Metodos de pagamento - P. Comp.'}
              />
            </div>
          {/if}
        {/key}

        <div class="w-full">
          <div class="divider"></div>
        </div>
      </div>

      <div class="w-full">
        {#key topCustomerOrders.basePeriod}
          <DefaultBarSvChart
            fnLabel={topCustomerOrders.basePeriod.map(c => c.customer_name)}
            fnData={topCustomerOrders.basePeriod.map(c => c.total_orders)}
            height={200}
            title={'Clientes com maior número de pedidos - Periodo Base'}
            color={'#F4D002'}
            tipoPeriodo={'Periodo base'}
            tipoDadoEixoY={'Quantidade de pedidos'}
          />
        {/key}
      </div>
      {#if topCustomerOrders.comparedPeriod}
        <div class="w-full">
          {#key topCustomerOrders.comparedPeriod}
            <DefaultBarSvChart
              fnLabel={topCustomerOrders.comparedPeriod.map(
                c => c.customer_name,
              )}
              fnData={topCustomerOrders.comparedPeriod.map(c => c.total_orders)}
              height={200}
              title={'Clientes com maior número de pedidos - Periodo Comparado'}
              color={'#003E7D'}
              tipoPeriodo={'Periodo comparado'}
              tipoDadoEixoY={'Quantidade de pedidos'}
            />
          {/key}
        </div>
      {/if}

      <div class="w-full">
        <div class="divider"></div>
      </div>
      <div class="w-full">
        {#key topSellingCategories.basePeriod}
          <DefaultBarSvChart
            fnLabel={topSellingCategories.basePeriod.map(c => c.category_name)}
            fnData={topSellingCategories.basePeriod.map(c => c.total_revenue)}
            height={200}
            title={'Categorias de produtos mais vendidas - Periodo Base'}
            color={'#F4D002'}
            tipoPeriodo={'Periodo base'}
            tipoDadoEixoY={'Total faturado'}
          />
        {/key}
      </div>

      <div class="w-full">
        {#key topSellingCategories.comparedPeriod}
          {#if topSellingCategories.comparedPeriod}
            <DefaultBarSvChart
              fnLabel={topSellingCategories.comparedPeriod.map(
                c => c.category_name,
              )}
              fnData={topSellingCategories.comparedPeriod.map(
                c => c.total_revenue,
              )}
              height={200}
              title={'Categorias de produtos mais vendidas - Periodo Comparado'}
              color={'#003E7D'}
              tipoPeriodo={'Periodo comparado'}
              tipoDadoEixoY={'Total faturado'}
            />
          {/if}
        {/key}
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
        textRecentSale={clientesOciosos.map(c => {
          return {
            title: c.name,
            value: c.ultimaCompra,
          }
        })}
      />
    </Card.Content>
  </Card.Root>
</div>
