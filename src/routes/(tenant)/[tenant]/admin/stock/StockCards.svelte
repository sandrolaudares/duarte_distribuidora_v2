<script lang="ts">
  type Item = {
    href: string
    title: string
    description: string
    icon: unknown
  }

  let { items } : { items: Item[] } = $props()
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
  {#each items as { href, title, description, icon }}
    <a {href} class="block">
      <div
        class="h-full rounded-lg bg-base-200 p-6 shadow-md transition-shadow hover:shadow-lg"
      >
        <div class="mb-2 flex items-center justify-between">
          <h2 class="text-sm font-medium">{title}</h2>
          {@html icon}
        </div>
        <p class="text-2xl font-bold">{description}</p>
      </div>
    </a>
  {/each}
</div>
