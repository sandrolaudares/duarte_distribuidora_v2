<script lang="ts">
  import type { PageData } from './$types'
  import { page } from '$app/stores'
  import { format } from 'date-fns'
  export let data: PageData
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="mb-8 text-center text-4xl font-bold">Distribuidoras</h1>
  <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
    {#each data.tenats as tenant}
      <a href="http://{tenant.subdomain}.localhost:5173" class="group block">
        <div
          class="transform overflow-hidden rounded-xl bg-base-200 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div class="p-6">
            <h2
              class="mb-3 text-2xl font-semibold transition-colors duration-300 group-hover:text-primary"
            >
              {tenant.name}
            </h2>

            <p class="mb-2 flex items-center text-sm gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
              Subdomínio: <span class="font-semibold">{tenant.subdomain}</span> 
            </p>

            <p class="mb-2 flex items-center text-sm gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pinned"><path d="M18 8c0 3.613-3.869 7.429-5.393 8.795a1 1 0 0 1-1.214 0C9.87 15.429 6 11.613 6 8a6 6 0 0 1 12 0"/><circle cx="12" cy="8" r="2"/><path d="M8.714 14h-3.71a1 1 0 0 0-.948.683l-2.004 6A1 1 0 0 0 3 22h18a1 1 0 0 0 .948-1.316l-2-6a1 1 0 0 0-.949-.684h-3.712"/></svg>
              Endereço: <span class="font-semibold">{tenant.address ?? 'Não registrado'}</span> </p>
            <p class="mb-2 flex items-center text-sm gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-phone"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Telefone: <span class="font-semibold">{tenant.phone ?? 'Não registrado'}</span></p>
          </div>
        </div>
      </a>
    {/each}
  </div>
</div>
