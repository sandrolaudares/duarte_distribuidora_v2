<script lang="ts">
  import { Chart } from 'chart.js/auto'
  import { type ChartConfiguration } from 'chart.js'
  import { icons } from '$lib/utils'

  type dataChart = {
    basePeriod : Array<{
      product_name: string
      total_quantity_ordered: number
      total_revenue: number
    }>,
    comparedPeriod? : Array<{
      product_name: string
      total_quantity_ordered: number
      total_revenue: number
    }> | undefined
  }

  interface Props {
    width?: number
    height?: number
    id?: string
    title: string
    dataProps : dataChart
  }

  let { width = 400, height = 300, id = '', title, dataProps }: Props = $props()

  let config : ChartConfiguration = {
    type: 'bubble',
    data: {
      datasets : [{
        backgroundColor : "#F4D002",
        label: "basePeriod",
        data : dataProps.basePeriod.map((d) => {
          return {
            x: d.total_quantity_ordered,
            y: d.total_revenue,
            r: Math.min(d.total_quantity_ordered, 15),
            ...d
          }
      })
      },
    {
      backgroundColor : "#003E7D",
      label: "comparedPeriod",
      data : dataProps.comparedPeriod?.map((d) => {
        return {
          x: d.total_quantity_ordered,
          y: d.total_revenue,
          r: Math.min(d.total_quantity_ordered, 15),
          ...d
        }
      }) ?? []
    }
  ]                  
  },
    options : {
      plugins :{
        tooltip: {
          usePointStyle: true,  
          callbacks: {
            // title(tooltipItems) {
            //   return ""
            // },
            label: function(context) {
              
              this.title = [context.raw.product_name]

              let label = `${context.dataset.label} => Total faturado: R$ ${context.raw.total_revenue.toLocaleString('pt-BR')} | Quant. produtos vendidos ${context.raw.total_quantity_ordered}
              `  
              || '';
              
              return label;
            }
          },
          
        },
        legend : {
          labels : {
            font: {
              size : 18,
              weight : "bolder",
            },
          }
        },
      },
      scales : {
        y : {
          title : {
            display : true,
            text : 'Total faturado',
            font : {
              size : 18,
              weight : "bolder",
            }
          },
          ticks : {
            callback : function(value, index, ticks){
              return 'R$ ' + value.toLocaleString('pt-BR')
            }
          },
        },
        x : {
          title : {
            display : true,
            text : 'Quantidade de p. vendidos',
            font : {
              size : 18,
              weight : "bolder",
            },
          },
        }
      }
  }}

  let chart: Chart | null = $state(null)

  function chartjs(node: HTMLCanvasElement) {
    const ctx = node.getContext('2d')
    if (!ctx) return
    chart = new Chart(ctx, config)
  }

  $effect(() => {
    if (chart && config) {
      chart.data.datasets = config.data.datasets
      chart.update()
    }
  })
</script>

<h2 class="text-center text-xl font-semibold">
  {title}
</h2>

{#if config.data.datasets[0].data.length > 0}
  <canvas use:chartjs {id} {width} {height}></canvas>
{:else}
  <div class="flex h-full items-center justify-center">
    <h1 class="mb-10">Sem dados nesse periodo, selecione outro periodo</h1>
  </div>
{/if}
