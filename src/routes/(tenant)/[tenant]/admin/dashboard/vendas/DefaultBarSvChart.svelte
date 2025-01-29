<script lang="ts">
  import { Chart } from 'chart.js/auto'
  import { type ChartConfiguration } from 'chart.js'
  import { icons } from '$lib/utils'

  interface Props {
    width?: number
    height?: number
    id?: string
    title: string
    color: string
    fnLabel : Array<string>
    fnData : Array<number>
  }

  let { width = 400, height = 300, id = '', title, color, fnLabel, fnData }: Props = $props()

  let config : ChartConfiguration = {
    type: 'bar',
    data: {
      labels : fnLabel,
      datasets : [
        {
          label: "basePeriod",
          backgroundColor : color,
          data : fnData,
          barThickness : 50
        },
      ]                  
    },
  }

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
