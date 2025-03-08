<script lang="ts">
  import type { PageData } from './$types'
  import { PUBLIC_DOMAIN } from '$env/static/public'
  import { dev } from '$app/environment'
  import { Input } from '$lib/components/ui/input/index.js'
  import { onMount } from 'svelte'
  import { getDistanceFromLatLonInKm } from '$lib/utils/distance'
  import DisplayTenants from './DisplayTenants.svelte'
  import {
    Search,
    ShoppingCart,
    User,
    Store,
    ArrowRight,
    Menu,
  } from 'lucide-svelte'
  import logo from '$lib/assets/home/logo-duarte.jpg'

  let { data }: { data: PageData } = $props()

  const prefix = dev ? 'http' : 'https'
</script>

<div class="h-screen bg-base-100">
  <div class=" mx-2 flex w-fit flex-col gap-3 sm:mx-auto">
    <section class="py-12">
      <div class="container mx-auto">
        <div class="flex justify-center">
          <img class="h-48 w-48 md:h-64 md:w-64" src={logo} alt="Logo" />
        </div>
        <h1
          class="mb-6 text-center text-3xl font-bold tracking-tight sm:text-3xl md:text-4xl"
        >
          Encontre a distribuidora mais próxima
        </h1>

        <p
          class="text-md mx-auto max-w-2xl text-center text-gray-400 sm:text-xl"
        >
          Escolha a distribuidora mais próxima de você para acessar as opções
          para pedir
        </p>

        <!-- <Input /> -->
      </div>
    </section>
  </div>
  <div class=" h-full bg-gray-100 px-2 pt-8 lg:px-8">
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
