<script lang="ts">
  import NavDashboard from '$lib/components/dashboard/admin/NavDashboard.svelte'
  import * as Card from '$lib/components/ui/card'
  import { BarChart, PieChart } from 'layerchart'
  import type { PageData } from './$types';
  import { RecentSales } from '$lib/components/dashboard/admin'
  import SvChart from '../SvChart.svelte'

  let { data }: { data: PageData } = $props();
  const {corporateClientsSortedDelayOrder} = data

  let DebtorsNumber = 4;
</script>

<h1>Fiados</h1>

<div class="flex flex-col lg:flex-row gap-3">
  <Card.Root class="w-full lg:w-9/12 ">
    <Card.Header>
      <Card.Title>Overview</Card.Title>
    </Card.Header>
    <!-- <Card.Content class="flex flex-col md:flex-row gap-4"> -->
    <Card.Content class="flex flex-wrap">
      <div class="w-full pr-3">
        <SvChart 
        config={{
          type: "bar",
          data:{
            labels : corporateClientsSortedDelayOrder.map((c) => c.debtorName),
            datasets : [
              {
                label: "Divida",
                barThickness : 30,
                data: corporateClientsSortedDelayOrder.map((c) => c.totalDebt),
                backgroundColor: [
                  'rgba(255, 0, 0)'
                ],
                  order: 2
                },
                {
                  label: "Total pago",
                  barThickness : 30,
                  data: corporateClientsSortedDelayOrder.map((c) => c.totalPaid),
                  backgroundColor: [
                  'rgba(0, 128, 0)'
                ],
                order: 1  
              }
            ]
          },
          options:{
            scales:{
              y: {
                stacked : true
              }
            },
            indexAxis : "y"
          }
        }}
        height={corporateClientsSortedDelayOrder.length * 60}
        title={"Relatorio recebimento atingido"}
        />
      </div>
      <div class="w-full">
        <SvChart 
        config={{
          type: "bar",
          data:{
            labels : corporateClientsSortedDelayOrder.map((c) => c.debtorName),
            datasets:[
              {
                label: "Dívidas",
                data: corporateClientsSortedDelayOrder.map((c) => c.totalDebt),
                backgroundColor:
                [
                  "rgba(234, 203, 22, 1)"
                ],
                barThickness : 50,
              }
            ]
          }
        }}
        height={180}
        title={"Maiores dívidas (Vai usar a msm query de clientes PJ com dívida)"}
        />
      </div>
    </Card.Content>
  </Card.Root>
  <Card.Root class="w-full lg:w-3/12">
    <Card.Header>
      <Card.Title>Clientes PJ com dívida</Card.Title>
    </Card.Header>
    <Card.Content>
      <!-- TODO: Mudar o recent sales -->
      <RecentSales textRecentSale={[
        {
          title : "Drinking Partner",
          value : "R$ 200,00"
        }
      ]}/>
    </Card.Content>
  </Card.Root>
</div>