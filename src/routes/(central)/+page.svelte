<script lang="ts">
  import type { PageData } from './$types'
  import { page } from '$app/stores'
  import { format } from 'date-fns'
  export let data: PageData
</script>


<div class="container mx-auto px-4 py-8">
  <h1 class="text-4xl font-bold mb-8 text-center ">Distribuidoras</h1>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
    {#each data.tenats as tenant}
      <a 
        href="http://{tenant.subdomain}.localhost:5173"
        class="block group"
      >
        <div class="bg-base-200 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          
          <div class="p-6">
            <h2 class="text-2xl font-semibold mb-3  group-hover:text-primary transition-colors duration-300">
              {tenant.name}
            </h2>
            <p class="text-sm  mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Subdomínio: {tenant.subdomain}
            </p>
          </div>
        </div>
      </a>
    {/each}
  </div>
</div>

