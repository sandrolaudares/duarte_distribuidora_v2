<script lang="ts">
  import * as Card from '$lib/components/ui/card/index'
  import { Activity,  type Icon as IconType } from 'lucide-svelte'
  import type { ComponentType } from 'svelte'

  type textCard = {
    titleCard?: string,
    textCard?: string,
    subTitle?: string,
    icon?: typeof IconType
  }

  interface Props {
    cards : textCard[],
  }

  let { cards } : Props = $props();

</script>

<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-{cards.length}">
  {#each cards as c}
  {@const Icon = c.icon}
    <Card.Root class={c ? '' : 'hidden'}>
      <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
        <Card.Title class="text-sm font-medium">{c?.titleCard}</Card.Title>
        <!-- <Activity class="text-muted-foreground h-4 w-4" /> -->
        {#if Icon}
          <Icon class="text-gray-600 h-4 w-4"/>
        {/if}
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold">{c?.textCard}</div>
        <p class="text-gray-600 text-sm">{c?.subTitle}</p>
      </Card.Content>
    </Card.Root>
  {/each}
</div>

