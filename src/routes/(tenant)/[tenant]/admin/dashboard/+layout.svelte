<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';
  import { SSRFilters } from '$lib/components/datatable/filter.svelte'; 
  
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
  import { hr } from '@faker-js/faker'
  
  import {page} from '$app/stores';
  
  type Distribuidora = 
  {
    name : string,
    subdomain: string
  }  
  
  interface Props {
    distribuidoras : Distribuidora[]
  }
  
  let categorias = 
  [
    {
      label : "Vendas",
      href : "/admin/dashboard/vendas"
    },
    {
      label : "Delivery",
      href : "/admin/dashboard/delivery"
    },
    {
      label : "Recebimentos",
      href : "/admin/dashboard/recebimentos"
    },
    {
      label : "Fiado",
      href : "/admin/dashboard/fiado"
    },
    {
      label : "Estoque",
      href : "/admin/dashboard/estoque"
    },
  ]
  
  const filters = new SSRFilters();
  
  let { data, children }: { data: LayoutData, children: Snippet } = $props();
</script>

<div class="flex-col md:flex">
  <div class="flex-1 space-y-4 p-8 pt-6">
    <div class="flex items-center justify-between space-y-2">
      <h2 class="text-3xl font-bold tracking-tight">
        Dashboard distribuidoras
      </h2>
      <DateFilter onchange={(startDate, endDate) => { 
        if (!startDate || !endDate) return 
        filters.update({startDate : startDate.toString(), endDate : endDate.toString()}) 
      }}/>
      <div class="flex items-center space-x-2">
        <!-- <DateFilter onchange={(startDate, endDate) => { 
        if (!startDate || !endDate) return 
        filters.update({startDate : startDate.toString(), endDate : endDate.toString()}) 
        }}/> -->
      </div>
    </div>
    <Tabs.Root value={$page.url.pathname} class="w-full space-y-4">
      <Tabs.List>
        {#each categorias as cat}
        <a href="{cat.href}">
          <Tabs.Trigger value={cat.href}>
            {cat.label}
          </Tabs.Trigger>
        </a>
        {/each}
      </Tabs.List>
      <Tabs.Root class="space-y-4">
        {@render children()}
      </Tabs.Root>
    </Tabs.Root>
  </div>
</div>