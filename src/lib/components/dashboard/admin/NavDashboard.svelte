<script lang="ts">
  import Activity from 'lucide-svelte/icons/activity'
  import CreditCard from 'lucide-svelte/icons/credit-card'
  import DollarSign from 'lucide-svelte/icons/dollar-sign'
  import Download from 'lucide-svelte/icons/download'
  import Users from 'lucide-svelte/icons/users'
  import {
    // DashboardMainNav,  
    Overview,
    RecentSales,
    // Search,
    // TeamSwitcher,
    // UserNav,
  } from './index.js'
  import { Button } from '$lib/components/ui/button/index'
  import * as Card from '$lib/components/ui/card/index'
  import * as Tabs from '$lib/components/ui/tabs/index'
  import type { SelectTenant } from '$lib/server/db/central/schema.js'
  import DateFilter from '$lib/components/DateFilter.svelte'
  import { sub } from 'date-fns'

  type textCard = {
    titleCard : string,
    textCard : string,
    subTitle : string,
  }

  interface Props {
    cardUm : textCard,
    cardDois : textCard,
    cardTres : textCard | null,
    cardQuatro : textCard | null
  }

  let { cardUm, cardDois, cardTres, cardQuatro } : Props = $props();

</script>

<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  <Card.Root>
    <Card.Header
    class="flex flex-row items-center justify-between space-y-0 pb-2"
    >
    <Card.Title class="text-sm font-medium">{cardUm.titleCard}</Card.Title>
    <!-- <DollarSign class="text-muted-foreground h-4 w-4" /> -->
    </Card.Header>
    <Card.Content>
      <div class="text-2xl font-bold">{cardUm.textCard}</div>
      <p class="text-muted-foreground text-xs">{cardUm.subTitle}</p>
    </Card.Content>
  </Card.Root>
  <Card.Root>
    <Card.Header
    class="flex flex-row items-center justify-between space-y-0 pb-2"
    >
    <Card.Title class="text-sm font-medium">{cardDois.titleCard}</Card.Title>
    <!-- <Users class="text-muted-foreground h-4 w-4" /> -->
    </Card.Header>
    <Card.Content>
      <div class="text-2xl font-bold">{cardDois.textCard}</div>
      <p class="text-muted-foreground text-xs">{cardDois.subTitle}</p>
    </Card.Content>
  </Card.Root>
  <Card.Root class={cardTres ? '' : 'hidden'}>
    <Card.Header
    class="flex flex-row items-center justify-between space-y-0 pb-2"
    >
      <Card.Title class="text-sm font-medium">{cardTres?.titleCard}</Card.Title>
      <!-- <CreditCard class="text-muted-foreground h-4 w-4" /> -->
    </Card.Header>
    <Card.Content>
      <div class="text-2xl font-bold">{cardTres?.textCard}</div>
      <p class="text-muted-foreground text-xs">{cardTres?.subTitle}</p>
    </Card.Content>
  </Card.Root>
  <Card.Root class={cardQuatro ? '' : 'hidden'}>
    <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
      <Card.Title class="text-sm font-medium">{cardQuatro?.titleCard}</Card.Title>
      <!-- <Activity class="text-muted-foreground h-4 w-4" /> -->
    </Card.Header>
    <Card.Content>
      <div class="text-2xl font-bold">{cardQuatro?.textCard}</div>
      <p class="text-muted-foreground text-xs">{cardQuatro?.subTitle}</p>
    </Card.Content>
  </Card.Root>
</div>

