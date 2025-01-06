<script lang="ts">
  import type { PageData } from './$types'
  import { PUBLIC_DOMAIN } from '$env/static/public'
  import CurrencyInput from '$lib/components/input/CurrencyInput.svelte'
  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'
  import { toast } from 'svelte-sonner'

  let { data }: { data: PageData } = $props()

  let newDistribuidora = data.tenant!

  async function updateDistribuidora() {
    if (!data.tenant) {
      throw new Error('Tenant not found')
    }
    try {
      const response = await trpc($page).distribuidora.updateDistribuidora.mutate({
        id: data.tenant.tenantId,
        data: {
          name: newDistribuidora.name,
          address: newDistribuidora.address,
          lat: Number(newDistribuidora.lat),
          lng: Number(newDistribuidora.lng),
          taxa_por_km: newDistribuidora.taxa_por_km,
        },
      })
      console.log('Response',response)
      toast.success('Distribuidora atualizada com sucesso')
    } catch (error) {
      console.error('Failed to update distribuidora:', error)
      toast.error('Erro ao atualizar distribuidora')
    }
  }
</script>

<div class="min-h-[93vh] bg-gradient-to-br from-gray-100 to-gray-50">
  <div class="flex">
    <main class="ml-16 flex-1 p-6">
      <div class="mx-auto max-w-5xl rounded-box bg-base-100 p-8 shadow-lg">
        <header class="mb-8 flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-semibold">
              Bem vindo ao {data.tenant?.name}
            </h1>
            <p class="text-gray-500">
              {data.tenant?.subdomain}.{PUBLIC_DOMAIN}
            </p>
          </div>
          <div class="flex items-center gap-4">
            <button
              class="btn btn-primary min-w-44"
              onclick={updateDistribuidora}
            >
              Salvar
            </button>
          </div>
        </header>
        <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div class="space-y-4">
            <label class="block">
              <span class="">Nome</span>
              <input
                type="text"
                bind:value={newDistribuidora.name}
                placeholder="Your First Name"
                class="input input-bordered w-full"
              />
            </label>

            <label class="block">
              <span class="">Endereço</span>
              <input
                type="text"
                bind:value={newDistribuidora.address}
                placeholder="Your First Name"
                class="input input-bordered w-full"
              />
            </label>

            <label class="block">
              <span class="">Latitude</span>
              <input
                type="text"
                bind:value={newDistribuidora.lat}
                placeholder="Your First Name"
                class="input input-bordered w-full"
              />
            </label>
          </div>

          <div class="space-y-4">
            <label class="block">
              <span class="">Subdominio</span>
              <label class="input input-bordered flex items-center gap-2">
                <input
                  type="text"
                  class="grow"
                  bind:value={newDistribuidora.subdomain}
                />
                .{PUBLIC_DOMAIN}
              </label>
            </label>

            <label class="block">
              <span class="">Taxa por kilometro</span>
              <CurrencyInput
                value={newDistribuidora.taxa_por_km}  
                on:input={e => (newDistribuidora.taxa_por_km = e.detail.value)}
              />
            </label>

            <label class="block">
              <span class="">Longitude</span>
              <input
                type="text"
                bind:value={newDistribuidora.lng}
                placeholder="Your First Name"
                class="input input-bordered w-full"
              />
            </label>
          </div>
        </div>
        <div class="mt-8">
          {#if data.tenant?.lat && data.tenant?.lng}
            <div class="mt-10">
              <h2 class="mb-4 text-2xl font-semibold">Localização</h2>
              <div class="aspect-w-16 aspect-h-9">
                <iframe
                  title="Tenant Location"
                  width="100%"
                  height="290"
                  frameborder="0"
                  scrolling="no"
                  marginheight="0"
                  marginwidth="0"
                  class="rounded-md shadow"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${data.tenant?.lng - 0.02},${data.tenant?.lat - 0.02},${data.tenant?.lng + 0.02},${data.tenant?.lat + 0.02}&layer=mapnik&marker=${data.tenant?.lat},${data.tenant?.lng}`}
                ></iframe>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </main>
  </div>
</div>
