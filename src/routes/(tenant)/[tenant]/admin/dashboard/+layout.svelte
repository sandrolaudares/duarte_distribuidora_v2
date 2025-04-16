<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { LayoutData } from './$types'
  

  import Activity from 'lucide-svelte/icons/activity'
  import CreditCard from 'lucide-svelte/icons/credit-card'
  import DollarSign from 'lucide-svelte/icons/dollar-sign'
  import Download from 'lucide-svelte/icons/download'
  import Users from 'lucide-svelte/icons/users'
  import { Button } from '$lib/components/ui/button/index'
  import * as Card from '$lib/components/ui/card/index'
  import * as Tabs from '$lib/components/ui/tabs/index'
  import type { SelectTenant } from '$lib/server/db/central/schema.js'
  // import DateFilter from '$lib/components/DateFilter.svelte'

  import { hr, ur } from '@faker-js/faker'

  import { writable } from 'svelte/store'

  import { page } from '$app/state'
  import DateFilterCompared from './DateFilterCompared.svelte'

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
    {
      label: 'Analíticos',
      href: '/admin/dashboard/analitics',
    }
  ]

  

  let checkbox = $state(false)

  let { children }: {children:Snippet} = $props()

</script>

<div class="flex-col md:flex">
  <div class="flex-1  p-3">
    <!-- <h2 class="text-3xl font-bold tracking-tight">Dashboard distribuidoras</h2> -->
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
        {#if page.url.pathname != '/admin/dashboard/analitics' }
        <div class="flex items-center">
          <DateFilterCompared />
        </div>
        {/if}
      </div>
      <Tabs.Root class="space-y-4">
        {@render children()}
      </Tabs.Root>
    </Tabs.Root>
  </div>
</div>
