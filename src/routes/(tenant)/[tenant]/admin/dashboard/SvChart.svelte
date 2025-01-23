<script lang="ts">
  import { Chart } from 'chart.js/auto'
  import { type ChartConfiguration } from 'chart.js'
  import { icons } from '$lib/utils'

  interface Props {
    config: ChartConfiguration
    width?: number
    height?: number
    id?: string
    title: string
  }

  let { config, width = 400, height = 300, id = '', title }: Props = $props()

  let chart: Chart | null = $state(null)

  function chartjs(node: HTMLCanvasElement) {
    // Se não rodar, ver se importando o Chart de alguma dessas formas funciona
    // const { Chart } = await import('chart.js/auto');
    // import('chart.js')
    // .then(({Chart}) => {
    // })
    const ctx = node.getContext('2d')
    if (!ctx) return
    chart = new Chart(ctx, config)
  }

  let calculaAumento = (initial: number, end: number) => {
    let calcula = parseFloat((100 - (end * 100) / initial).toFixed(2))
    let htmlText =
      calcula > 0 ? icons.arrows.down_line() : icons.arrows.up_line()
    return `${htmlText} ${Math.abs(calcula)}%`
    // icons.arrows()
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
    <div class="h-full flex justify-center items-center ">
      <h1 class="mb-10">Sem dados nesse periodo, selecione outro periodo</h1>
    </div>
{/if}
