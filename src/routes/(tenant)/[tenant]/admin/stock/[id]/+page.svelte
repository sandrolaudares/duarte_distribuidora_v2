<script lang="ts">
  import { navigating } from '$app/stores'
  import { SSRFilters } from '$lib/components/datatable/filter.svelte'
  import { modal, FormModal } from '$lib/components/modal'
  import DateFilter from '$lib/components/DateFilter.svelte'
  import { page } from '$app/stores'
  import { scaleBand, scaleTime } from 'd3-scale'
  import {
    Chart,
    Svg,
    Axis,
    Bars,
    Area,
    Tooltip,
    // TooltipItem,
  } from 'layerchart'

  import {
    TableHandler,
    Datatable,
    ThSort,
    ThFilter,
    Pagination,
    RowsPerPage,
    Th,
    Search,
    type State,
  } from '@vincjo/datatables/server'

  import type { PageData } from './$types'
  import { toast } from 'svelte-sonner'
  import { trpc } from '$trpc/client'
  import NoResults from '$lib/components/NoResults.svelte'
  import { goto } from '$app/navigation'
  import { icons } from '$lib/utils'
  import { pageConfig } from '$lib/config'
  import { DateFormatter } from '@internationalized/date'

  let { data }: { data: PageData } = $props()
  const filters = new SSRFilters()

  let estoque = data.sku

  const table = new TableHandler(data.rows, {
    rowsPerPage: pageConfig.rowPages,
    totalRows: data.count,
    i18n: {
      show: 'Mostrar',
      entries: 'entradas',
      previous: 'Anterior',
      next: 'Próximo',
      noRows: 'Nenhum encontrado',
      filter: 'Filtrar',
    },
  })

  table.setPage(Number(filters.get('page')) || 1)
  table.load(async s => {
    try {
      console.log(s)
      filters.fromState(s)
      await $navigating?.complete
    } catch (error) {
      console.error(error)
    }
    return data.rows
  })

  const df = new DateFormatter('pt-BR', {
    dateStyle: 'medium',
  })

  let chartData = $derived.by(() => {
    return data.rows.map(t => ({
      ...t,
      created_at: new Date(t.created_at ?? ''),
    }))
  })

  async function handleDeleteStockItem(sku: string) {
    try {
      await trpc($page).stock.deleteItemStock.mutate(sku)
      toast.success('Deletado com sucesso!')
      window.location.href = './'
    } catch (error) {
      toast.error('Ocorreu um erro ao deletar!')
    }
  }
  const calculateYDomain = (data: typeof chartData) => {
    const minNegative = Math.min(
      ...data.map(d => (d.quantity < 0 ? d.quantity : 100)),
    )
    const maxPositive = Math.max(...data.map(d => d.total_log))
    return [minNegative, maxPositive]
  }
</script>

<div class="">
  <div class="container mx-auto flex flex-col gap-5">
    <div class="flex items-center justify-center gap-3">
      <div class="stats bg-base-200 shadow">
        <div class="stat flex items-center">
          <div class="stat-figure text-secondary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              class="inline-block h-8 w-8 stroke-current"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <div class="stat-value">{estoque.name}</div>
        </div>

        <div class="stat">
          <div class="stat-figure text-secondary">
            {@html icons.box()}
          </div>
          <div class="stat-title">Quantidade em Estoque</div>
          <div class="stat-value flex justify-center">{estoque.quantity}</div>
        </div>
      </div>
      <button
        class="btn btn-circle btn-error h-20 w-20"
        onclick={() => {
          if (confirm('Tem certeza que deseja deletar?') === true) {
            handleDeleteStockItem(estoque.sku)
          } else {
            toast.info('Cancelado')
          }
        }}
      >
        {@html icons.trash()}
      </button>
    </div>
    <div class="mb-5 flex gap-2">
      <div class=" h-[70vh] w-full max-w-[50%] overflow-x-auto">
        <Datatable {table} headless>
          <!-- {#snippet header()}
          <Search {table} />
         
        {/snippet} -->
          <!-- svelte-ignore component_name_lowercase -->
          <table class="table table-zebra rounded-sm border">
            <thead>
              <tr>
                <Th>Data</Th>
                <Th>Tipo</Th>
                <Th>Quantidade</Th>
                <Th>Preço de custo</Th>
              </tr>
            </thead>
            <tbody>
              {#each data.rows as row}
                <tr>
                  <td>
                    {df.format(new Date(row.created_at || ''))}
                  </td>
                  <td>{row.type}</td>
                  <td>{row.quantity}</td>
                  <td>
                    R${row.cost_price ? (row.cost_price / 100).toFixed(2) : 0.0}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
          {#if data.rows.length === 0}
            <NoResults />
          {/if}
          {#snippet footer()}
            <RowsPerPage {table} />
            <div></div>
            <Pagination {table} />
          {/snippet}
        </Datatable>
      </div>

      <div class="w-full max-w-[50%] rounded-sm border p-3">
        <div class="h-[calc(100%-5vh)] rounded p-4">
          <Chart
            data={chartData}
            x="created_at"
            xScale={scaleBand().padding(0.2)}
            y={['total_log', 'quantity']}
            yDomain={calculateYDomain(chartData)}
            yNice={4}
            padding={{ left: 16, bottom: 4 }}
            tooltip={{ mode: 'band' }}
            debug
          >
            <Svg>
              <Axis placement="left" grid rule />
              <Axis
                placement="bottom"
                format={d => df.format(d)}
                rule
                tickLabelProps={{
                  rotate: 290,
                  textAnchor: 'end',
                  class: ' font-semibold',
                }}
              />
              <Bars y="quantity" radius={2} class="fill-primary" />
              <Area
                y1="total_log"
                class="fill-secondary/20"
                line={{ class: 'stroke-secondary' }}
              />
            </Svg>

            <Tooltip.Root let:data>
              <Tooltip.Header>
                {df.format(data.created_at)}
              </Tooltip.Header>
              <Tooltip.List>
                <Tooltip.Item
                  label="Quantidade Transacao"
                  value={data.quantity}
                />
                <Tooltip.Item
                  label="Total em estoque no momento"
                  value={data.total_log}
                />
              </Tooltip.List>
            </Tooltip.Root>
            <!-- <Tooltip header={chartData => chartData.created_at} let:data>
              <TooltipItem label="Quantidade Transacao" value={chartData.quantity} />
              <TooltipItem label="Total em estoque no momento" value={chartData.total_log} />
            </Tooltip> -->
          </Chart>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  thead {
    background-color: oklch(var(--b1)) !important;
  }
</style>
