<script lang="ts">
  import type { PageData } from './$types'
  import { PUBLIC_DOMAIN } from '$env/static/public'
  import { dev } from '$app/environment'
  import { Input } from '$lib/components/ui/input/index.js'
  import { onMount } from 'svelte'
  import { getDistanceFromLatLonInKm } from '$lib/utils/distance'
  import DisplayTenants from './DisplayTenants.svelte'

  let { data }: { data: PageData } = $props()

  const prefix = dev ? 'http' : 'https'

</script>

<div class="h-full bg-base-100 py-8">
  <h1 class="mb-8 text-center text-2xl lg:text-3xl font-medium">
    Encontre a distribuidora mais próxima
  </h1>
  <!-- <Input /> -->
  <div class="mt-6 h-full bg-gray-100 px-2 pt-8 lg:px-8">
    {#if data.tenants.length > 0}
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <DisplayTenants tenants={data.tenants} />
      </div>
    {:else}
      <h1 class="my-10 text-center text-xl">
        Nenhuma distribuidora criada, <a
          href="/create"
          class="text-info underline"
        >
          clique aqui
        </a>
        para criar
      </h1>
    {/if}
  </div>
</div>
