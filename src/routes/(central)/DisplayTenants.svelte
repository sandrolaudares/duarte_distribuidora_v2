<script lang="ts">
  import { Clock, MapPin, MapPinned, Phone } from 'lucide-svelte'
  import { getImagePath } from '$utils/image'
  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'
  import { onMount } from 'svelte'
  import { toast } from 'svelte-sonner'
  import { getDistanceFromLatLonInKm } from '$lib/utils/distance'
  import type {
    SelectTenant,
    WorkSchedule,
  } from '$lib/server/db/central/schema'
  import { dev } from '$app/environment'
  import { PUBLIC_DOMAIN } from '$env/static/public'
  import { Skeleton } from '$lib/components/ui/skeleton/index'
  import CardSkeletonTenants from '$lib/components/cards/CardSkeletonTenants.svelte'
  import { flip } from 'svelte/animate'
  import { cubicInOut } from 'svelte/easing'
  import { secondsToTime } from '$lib/utils'

  const prefix = dev ? 'http' : 'https'

  let { tenants }: { tenants: SelectTenant[] } = $props()

  let error = $state('')
  let distances: Record<string, number> = $state({})
  let isLoading = $state(true)

  onMount(() => {
    isLoading = true
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords: Addrr }) => {
          tenants.forEach(tenant => {
            if (!tenant.lat || !tenant.lng) {
              console.warn(`Erro ao calcular: ${tenant.name}.`)
              return
            }

            if (!Addrr) {
              throw new Error('Erro ao pegar localização')
            }

            const tenantDistance =
              getDistanceFromLatLonInKm(
                { lat: tenant.lat, lon: tenant.lng },
                { lat: Addrr.latitude, lon: Addrr.longitude },
              ) / 1000

            distances[tenant.tenantId] = Number(tenantDistance.toFixed(1))
          })

          tenants.sort((a, b) => {
            if (
              distances[a.tenantId] === undefined ||
              distances[b.tenantId] === undefined
            )
              return 0

            return distances[a.tenantId] - distances[b.tenantId]
          })
          tenants = [...tenants]
          isLoading = false
        },
        reject => {
          console.error('Erro:', reject)
          error = reject.message
          isLoading = false
        },
      )
    }
  })

  const phoneMask = (value: string) => {
    if (!value) return 'Não cadastrado'
    value = value.replace(/\D/g, '')
    value = value.replace(/(\d{2})(\d)/, '($1) $2')
    value = value.replace(/(\d)(\d{4})$/, '$1-$2')
    return value
  }

  const weekdays: (keyof WorkSchedule)[] = [
    'segunda',
    'terca',
    'quarta',
    'quinta',
    'sexta',
    'sabado',
    'domingo',
  ]
  const hoje = weekdays[(new Date().getDay() + 6) % 7]

  const currentTime =$derived(
    new Date().getHours() * 3600 +
    new Date().getMinutes() * 60 +
    new Date().getSeconds()
  )

  let isOpenModal: HTMLDialogElement| null =$state(null)
  let clickedDist = $state(tenants[0])
</script>

<!-- {#if isLoading}
  {#each {length: tenants.length}}
   <CardSkeletonTenants />
  {/each}
{:else} -->
{#each tenants as tenant (tenant.tenantId)}
  {@const isClosed =
    tenant.funcionamento &&
    (currentTime < tenant.funcionamento[hoje].start ||
      currentTime > tenant.funcionamento[hoje].end)}
      
  <button
    animate:flip={{ duration: 900, delay: 100, easing: cubicInOut }}
    class="relative z-0 rounded-lg bg-base-100 shadow-lg transition-all duration-200 hover:scale-105"
    onclick={()=>{
      if(isClosed) {
        clickedDist=tenant
        isOpenModal?.showModal()
      } else {
        window.location.href = `${prefix}://${tenant.subdomain}.${PUBLIC_DOMAIN}`
      }
    }}
  >
    <div class="h-full">
      <div>
        <img
          src={getImagePath(0)}
          alt=""
          class="h-full max-h-60 w-full rounded-t-lg object-cover"
        />
      </div>
      <div class="p-4 lg:p-6">
        <div
          class="mb-5 flex flex-col items-center justify-between lg:flex-row"
        >
          <h2 class=" text-lg font-semibold lg:text-xl">{tenant.name}</h2>
          <p class="text-sm">
            {#if isLoading || distances[tenant.tenantId] === undefined}
              <!-- <span class="animate-pulse">Calculando distancia...</span> -->
            {:else}
              <span class="">
                {error == ''
                  ? distances[tenant.tenantId] + 'km de você'
                  : 'Erro ao calcular'}
              </span>
            {/if}
          </p>
        </div>
        <div class="flex flex-col gap-2">
          <div class="lg:text-md flex items-center gap-2 text-xs">
            <MapPin class="min-h-6 min-w-6" />
            {tenant.address}
          </div>
          <p class="lg:text-md flex items-center gap-2 text-xs">
            <Phone class="min-h-6 min-w-6" />
            {phoneMask(tenant.phone ?? '')}
          </p>
          {#if tenant.funcionamento}
            <div
              class="lg:text-md flex items-center justify-between gap-2 text-xs"
            >
              <div class="flex items-center gap-2">
                <Clock class="min-h-6 min-w-6" />
                Hoje: {secondsToTime(tenant.funcionamento[hoje].start)} - {secondsToTime(
                  tenant.funcionamento[hoje].end,
                )}
              </div>
              {#if isClosed}
                <span
                  class=" badge border-error/40 bg-error/20 font-semibold text-error"
                >
                  Fechado
                </span>
              {:else}
                <span
                  class="badge border-success/40 bg-success/20 font-semibold text-success"
                >
                  Aberto
                </span>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    </div>
  </button>
{/each}
<!-- {/if} -->
<dialog class="modal" bind:this={isOpenModal}>
  <div class="modal-box max-w-2xl">
    <div class="flex flex-col md:flex-row items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-error">Distribuidora Fechada</h2>
      <a class="btn btn-primary" href={`${prefix}://${clickedDist.subdomain}.${PUBLIC_DOMAIN}`}>Ir para distribuidora</a>
    </div>

    <p class="mt-2 text-gray-600">
      A distribuidora está fechada no momento. Confira o horário de funcionamento antes de visitar.
    </p>
    {#if clickedDist.funcionamento}
    <div class="mt-4">
      <h3 class="text-md font-semibold">Horário de Funcionamento:</h3>
      <ul class="mt-2 text-gray-700">
        {#each weekdays as week}
          <li>
            <strong class="capitalize">{week}:</strong> 
              {secondsToTime(clickedDist.funcionamento[week].start)} - {secondsToTime(clickedDist.funcionamento[week].end)}
          </li>
        {/each}
      </ul>
    </div>
    {/if}
  </div>

  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>