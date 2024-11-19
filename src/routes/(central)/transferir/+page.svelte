<script lang="ts">
  import type { PageData } from './$types'
  import * as Tabs from '$lib/components/ui/tabs/index.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import Separator from '$lib/components/ui/separator/separator.svelte'

  let { data }: { data: PageData } = $props()

  let solicitacoes = data.solicitacoes
  let distribuidoras = data.distribuidoras
</script>

<main class="container mx-auto mt-10">
  <Tabs.Root value={distribuidoras[0].subdomain} class="h-full space-y-6">
    <div class="justify-center flex items-center">
      <Tabs.List>
        {#each distribuidoras as distribuidora}
          <Tabs.Trigger value={distribuidora.subdomain} class="relative">
            {distribuidora.name}
          </Tabs.Trigger>
        {/each}
      </Tabs.List>
    </div>
    {#each distribuidoras as distribuidora}
    <Tabs.Content
    value={distribuidora.subdomain}
    class="border-none p-0 outline-none"
  >
    <h2 class="text-xl font-bold mb-4">{distribuidora.name}</h2>
    <ul class="space-y-2">
      {#each solicitacoes.filter(s => s.toTenantId === distribuidora.tenantId) as solicitacao}
        <li class="p-4 border rounded-md shadow-sm">
          <p><strong>ID:</strong> {solicitacao.id}</p>
          {solicitacao.sku_name} - {solicitacao.quantity}
        </li>
      {/each}
    </ul>
    {#if solicitacoes.filter(s => s.toTenantId === distribuidora.tenantId).length === 0}
      <p class="text-gray-500">No solicitations for this distribuidora.</p>
    {/if}
  </Tabs.Content>
    {/each}
  </Tabs.Root>
</main>
