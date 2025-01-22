<script lang="ts">
  import * as Card from '$lib/components/ui/card/index'

  type textCard = {
    titleCard : string | undefined,
    textCard : string | undefined,
    subTitle : string | undefined,
  }

  interface Props {
    cards : textCard[],
  }

  let { cards } : Props = $props();

</script>

<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {#each cards as c}
    <Card.Root class={c ? '' : 'hidden'}>
      <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
        <Card.Title class="text-sm font-medium">{c?.titleCard}</Card.Title>
        <!-- <Activity class="text-muted-foreground h-4 w-4" /> -->
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold">{c?.textCard}</div>
        <p class="text-muted-foreground text-xs">{c?.subTitle}</p>
      </Card.Content>
    </Card.Root>
  {/each}
</div>

