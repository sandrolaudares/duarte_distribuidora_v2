<script lang="ts">
  import { MapPin, MapPinned, Phone } from 'lucide-svelte'
  import { getImagePath } from '$utils/image'
  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'
  import { onMount } from 'svelte'
  import { toast } from 'svelte-sonner'
  import { getDistanceFromLatLonInKm } from '$lib/utils/distance'
  import type { SelectTenant } from '$lib/server/db/central/schema'
  import { dev } from '$app/environment'
  import { PUBLIC_DOMAIN } from '$env/static/public'
  import { Skeleton } from '$lib/components/ui/skeleton/index'
  import CardSkeletonTenants from '$lib/components/cards/CardSkeletonTenants.svelte'
  import { flip } from 'svelte/animate'
  import { cubicInOut } from 'svelte/easing'

  const prefix = dev ? 'http' : 'https'

  let { tenants }: { tenants: SelectTenant[] } = $props()

  let Addrr: GeolocationCoordinates | null = $state(null)
  let error = $state('')
  let distances: Record<string, number> = $state({})
  let isLoading = $state(true)

  onMount(async () => {
    isLoading = true
    try {
      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject)
          },
        )
        Addrr = position.coords
        console.log(Addrr)
      }
      if (!Addrr) {
        throw new Error('Erro ao pegar localização')
      }
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
        if (distances[a.tenantId] === undefined || distances[b.tenantId] === undefined) return 0

        return distances[a.tenantId] - distances[b.tenantId]
      })
      tenants = [...tenants]
    } catch (error) {
      console.error('Erro:', error)
      error = error
    } finally {
      isLoading = false
    }
  })

  const phoneMask = (value: string) => {
    if (!value) return 'Não cadastrado'
    value = value.replace(/\D/g, '')
    value = value.replace(/(\d{2})(\d)/, '($1) $2')
    value = value.replace(/(\d)(\d{4})$/, '$1-$2')
    return value
  }
</script>

<!-- {#if isLoading}
  {#each {length: tenants.length}}
   <CardSkeletonTenants />
  {/each}
{:else} -->
{#each tenants as tenant (tenant.tenantId)}
  <a
    animate:flip={{ duration: 900, delay: 100, easing: cubicInOut }}
    href={`${prefix}://${tenant.subdomain}.${PUBLIC_DOMAIN}`}
    class="relative z-0 rounded-lg bg-base-100 shadow-lg transition-all duration-200 hover:scale-105"
  >
    <div>
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
          <p class="lg:text-md flex items-center gap-2 text-xs">
            <MapPin class="min-h-6 min-w-6" />
            {tenant.address}
          </p>
          <p class="lg:text-md flex items-center gap-2 text-xs">
            <Phone class="min-h-6 min-w-6" />
            {phoneMask(tenant.phone ?? '')}
          </p>
        </div>
      </div>
    </div>
  </a>
{/each}
<!-- {/if} -->
