<script lang="ts">
  import type { PageData } from './$types'
  import { PUBLIC_DOMAIN } from '$env/static/public'
  import CurrencyInput from '$lib/components/input/CurrencyInput.svelte'
  import { trpc } from '$trpc/client'
  import { page } from '$app/state'
  import { toast } from 'svelte-sonner'
  import type { SelectTenant, WorkSchedule } from '$lib/server/db/central/schema'
  import { secondsToTime, timeToSeconds } from '$lib/utils'
  import ImageInput from '$lib/components/input/ImageInput.svelte'
  import { MapLibre, Marker, Popup } from 'svelte-maplibre-gl';
  import { MapPinHouse } from 'lucide-svelte'
  import Loading from '$lib/components/Loading.svelte'

  let { data }: { data: PageData } = $props()

  let newDistribuidora: SelectTenant = $state(data.tenant!)

  let lnglat = $state({ lng: newDistribuidora.lng ?? 0, lat: newDistribuidora.lat ?? 0 });
  let lngLatText = $derived(`(${lnglat.lat.toFixed(4)}, ${lnglat.lng.toFixed(4)})`);
  let offset = $state(24);

  let offsets: maplibregl.Offset = $derived({
    top: [0, offset],
    bottom: [0, -offset],
    left: [offset + 12, 0],
    right: [-offset - 12, 0],
    center: [0, 0],
    'top-left': [offset, offset],
    'top-right': [-offset, offset],
    'bottom-left': [offset, -offset],
    'bottom-right': [-offset, -offset]
  });

  let schedule:SelectTenant['funcionamento'] = $derived.by(()=>{
    if(newDistribuidora.funcionamento) return newDistribuidora.funcionamento
    else return {
      segunda: { start: 0, end: 0 },
      terca: { start: 0, end: 0 },
      quarta: { start: 0, end: 0 },
      quinta: { start: 0, end: 0 },
      sexta: { start: 0, end: 0 },
      sabado: { start: 0, end: 0 },
      domingo: { start: 0, end: 0 },
      feriado: { start: 0, end: 0 },
    }
  })

  const weekdays: (keyof WorkSchedule)[] = [
    "segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"
  ];

  let isLoading = $state(false)

  async function updateDistribuidora() {
    isLoading = true
    if (!data.tenant) {
      throw new Error('Tenant not found')
    }
    try {
      const response = await trpc(page).distribuidora.updateDistribuidora.mutate({
        id: data.tenant.tenantId,
        data: {
          name: newDistribuidora.name,
          address: newDistribuidora.address ?? undefined,
          lat: lnglat.lat ?? undefined,
          lng: lnglat.lng ?? undefined,
          taxa_por_km: newDistribuidora.taxa_por_km ?? undefined,
          subdomain: newDistribuidora.subdomain,
          funcionamento : schedule ?? undefined,
          phone: newDistribuidora.phone ?? undefined,
          // image: newDistribuidora.image ?? undefined,
        },
      })
      console.log('Response', response)
      toast.success('Distribuidora atualizada com sucesso')
    } catch (error) {
      console.error('Failed to update distribuidora:', error)
      toast.error('Erro ao atualizar distribuidora')
    } finally {
      isLoading = false
    }
  }

</script>

<div class="h-full bg-gradient-to-br from-gray-100 to-gray-50">
  <div class="flex">
    <main class="ml-16 flex-1 p-6">
      <div class="mx-auto max-w-5xl rounded-box bg-base-100 p-8 shadow-lg">
        <header class="mb-8 flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-semibold">
              Bem vindo ao {newDistribuidora.name}
            </h1>
            <p class="text-gray-500">
              {newDistribuidora.subdomain}.{PUBLIC_DOMAIN}
            </p>
          </div>
          <div class="flex items-center gap-4">
            <button
              class="btn btn-primary min-w-44"
              onclick={updateDistribuidora}
              disabled={isLoading}
            >
            {#if isLoading}
              <Loading/>
            {:else}
              Salvar
            {/if}
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
              <span class="">Telefone</span>
              <input
                type="text"
                bind:value={newDistribuidora.phone}
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
                bind:value={newDistribuidora.taxa_por_km as number}
              />
            </label>

           
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {#each weekdays as day (day)}
            <div class="border rounded-lg p-4 shadow-sm hover:shadow-md transition duration-200">
              <h3 class="font-semibold text-lg mb-2 capitalize">{day}</h3>
                <label class="block mb-2">
                  <span class="">Abertura</span>
                  <input
                    type="time"
                    value={secondsToTime(schedule[day].start)}
                    class="input input-bordered w-full"
                    oninput={(e) => {
                      if (e.target) {
                          schedule[day].start = timeToSeconds((e.target as HTMLInputElement).value);
                      }
                    }}
                  />
                </label>
              
                <label class="block">
                  <span class="">Fechamento</span>
                  <input
                    type="time"
                    value={secondsToTime(schedule[day].end)}
                    class="input input-bordered w-full"
                    oninput={(e) => {
                      if (e.target) {
                          schedule[day].end = timeToSeconds((e.target as HTMLInputElement).value); 
                      }
                    }}
                  />
                </label>
              </div>
          {/each}
          <!-- <ImageInput
              image_id={newDistribuidora.image}
              name={newDistribuidora.name}
              save={(image_id) => {
                newDistribuidora.image = image_id
              }}
            /> -->
        </div>
        

        <div class="mt-8">
          <div class="flex gap-2">
            <label class="block w-full">
              <span class="">Latitude</span>
              <input
                bind:value={lnglat.lat}
                placeholder="Your First Name"
                class="input input-bordered w-full"
              />
            </label>
            <label class="block w-full">
              <span class="">Longitude</span>
              <input
                bind:value={lnglat.lng}
                placeholder="Your First Name"
                class="input input-bordered w-full"
              />
            </label>
          </div>
          {#if data.tenant?.lat && data.tenant?.lng}
            <div class="mt-4">
              <h2 class="mb-4 text-2xl font-semibold">Localização</h2>
              
              <MapLibre
                style="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
                class="h-[40vh] min-h-[300px] rounded-box"
                zoom={16}
                center={[ data.tenant.lng!,  data.tenant.lat!]}
                maxPitch={85}
                attributionControl={false}
              >
              
              <Marker bind:lnglat draggable>
                {#snippet content()}
                <div class="text-center leading-none">
                  <div class="text-3xl flex justify-center items-center text-success">
                    <MapPinHouse />
                  </div>
                  <div class="font-bold text-black drop-shadow-xs">{newDistribuidora.name}</div>
                </div>
                {/snippet}
                <Popup class="text-black" offset={offsets} open={true} closeButton={false}>
                  <span class="text-lg">{lngLatText}</span>
                </Popup>
              </Marker>
            </MapLibre>
            </div>
          {/if}
        </div>
      </div>
    </main>
  </div>
</div>
