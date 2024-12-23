<script lang="ts">
  type textCard = {
    title: string
    text: string
    value: string
  }

  interface Props {
    textRecentSale: textCard[]
  }

  let {textRecentSale}: Props = $props();
</script>

<div class="space-y-8">
  {#each textRecentSale as t}
    <div class="flex items-center">
      <div class="space-y-1">
        <p class="text-sm font-medium leading-none">{t.title}</p>
        <p class="text-muted-foreground text-sm">{t.text}</p>
      </div>
      <div class="ml-auto font-medium">{t.value}</div>
    </div>
  {/each}
</div>