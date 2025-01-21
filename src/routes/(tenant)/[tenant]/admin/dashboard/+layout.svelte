<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { LayoutData } from './$types'
  import { SSRFilters } from '$lib/components/datatable/filter.svelte'

  import Activity from 'lucide-svelte/icons/activity'
  import CreditCard from 'lucide-svelte/icons/credit-card'
  import DollarSign from 'lucide-svelte/icons/dollar-sign'
  import Download from 'lucide-svelte/icons/download'
  import Users from 'lucide-svelte/icons/users'
  import { Button } from '$lib/components/ui/button/index'
  import * as Card from '$lib/components/ui/card/index'
  import * as Tabs from '$lib/components/ui/tabs/index'
  import type { SelectTenant } from '$lib/server/db/central/schema.js'
  import DateFilter from '$lib/components/DateFilter.svelte'
  import DateFilter2 from '$lib/components/DateFilter2.svelte'

  import { hr, ur } from '@faker-js/faker'

  import { writable } from 'svelte/store'

  import { page } from '$app/state'

  type Distribuidora = {
    name: string
    subdomain: string
  }

  interface Props {
    distribuidoras: Distribuidora[]
  }

  let categorias = [
    {
      label: 'Vendas',
      href: '/admin/dashboard/vendas',
    },
    {
      label: 'Delivery',
      href: '/admin/dashboard/delivery',
    },
    {
      label: 'Fiado',
      href: '/admin/dashboard/fiado',
    },
    {
      label: 'Estoque',
      href: '/admin/dashboard/estoque',
    },
  ]

  const filters = new SSRFilters()

  let checkbox = $state(false)

  let { data, children }: { data: LayoutData; children: Snippet } = $props()
</script>

<div class="flex-col md:flex">
  <div class="flex-1 space-y-4 p-8 pt-6">
    <h2 class="text-3xl font-bold tracking-tight">Dashboard distribuidoras</h2>
    <Tabs.Root value={page.url.pathname} class="w-full space-y-4">
      <div class="flex items-center justify-between">
        <Tabs.List>
          {#each categorias as cat}
            <a href={cat.href}>
              <Tabs.Trigger value={cat.href}>
                {cat.label}
              </Tabs.Trigger>
            </a>
          {/each}
        </Tabs.List>
        <div class="flex items-center">
          {#if page.url.pathname === '/admin/dashboard/vendas'}
            <div class="flex items-center space-x-2">
              <span class="label-text">Comparar</span>
              <input type="checkbox" class="checkbox" bind:checked={checkbox} />
            </div>
            {#if checkbox}
              <div class="mr-5">
                <DateFilter2 />
                <!-- <DateFilter
                  startDate={filters.get('compareStartDate')
                    ? new Date(Number(filters.get('compareStartDate')!))
                    : null}
                  endDate={filters.get('compareEndDate')
                    ? new Date(Number(filters.get('compareEndDate')!))
                    : null}
                  alignP={'right'}
                  onchange={(startDate, endDate) => {
                    if (!startDate || !endDate) return
                    // TODO: Bug searchParams subscrevendo
                    filters.update({
                      compareStartDate: startDate.toString(),
                      compareEndDate: endDate.toString(),
                    })
                  }}
                /> -->
              </div>
              <h1 class="mx-3">Periodo Base: </h1>
            {/if}
          {/if}
          <DateFilter2
            onChange={(startDate, endDate) => {
              if (!startDate || !endDate) return

              filters.update({
                startDate: String(startDate),
                endDate: String(endDate),
              })
            }}
          />
          <!-- <DateFilter
            startDate={filters.get('startDate')
              ? new Date(Number(filters.get('startDate')!))
              : null}
            endDate={filters.get('endDate')
              ? new Date(Number(filters.get('endDate')!))
              : null}
            alignP={'right'}
            onchange={(startDate, endDate) => {
              if (!startDate || !endDate) return

              filters.update({
                startDate: String(startDate),
                endDate: String(endDate),
              })
            }}
          /> -->
          {#if checkbox}
            <button
              class="btn btn-warning"
              onclick={() => {
                filters.clear(
                  'compareStartDate',
                  'compareEndDate',
                  'startDate',
                  'endDate',
                )
              }}
            >
              Limpar
            </button>
          {/if}
          <div class="flex items-center space-x-2">
            <!-- <DateFilter onchange={(startDate, endDate) => { 
            if (!startDate || !endDate) return 
            filters.update({startDate : startDate.toString(), endDate : endDate.toString()}) 
            }}/> -->
          </div>
        </div>
      </div>
      <Tabs.Root class="space-y-4">
        {@render children()}
      </Tabs.Root>
    </Tabs.Root>
  </div>
</div>
