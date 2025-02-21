<script lang="ts">
  import { MapPin, MapPinned, Phone } from 'lucide-svelte'
  import { getImagePath } from '$utils/image'
  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'
  import { onMount } from 'svelte'
  import { toast } from 'svelte-sonner'
  import { getDistanceFromLatLonInKm } from '$lib/utils/distance'

  type Props = {
    title: string
    address: string
    telefone: string
    href: string
    image: number
    id: number
    distLat: number
    distLon: number
  }
  let {
    title = 'Store Name',
    address = 'Endereco distribuidora',
    telefone = '32131231',
    href = '',
    image = 0,
    id,
    distLat,
    distLon,
  }: Props = $props()

  let Addrr: GeolocationCoordinates | null = $state(null)
  let error = $state('')
  let distance: number | undefined = $state(undefined)
  let isLoading = $state(false)

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
      if (!id) {
        throw new Error('Tenant não encontrado!')
      }
      if (!Addrr) {
        throw new Error('Erro ao pegar localização')
      }
      if (distLat === 0 || distLon === 0) {
        throw new Error('Erro ao pegar localização da distribuidora')
      }

      distance = Number(
        (
          getDistanceFromLatLonInKm(
            { lat: distLat, lon: distLon },
            { lat: Addrr.latitude, lon: Addrr.longitude },
          ) / 1000
        ).toFixed(1),
      )
    } catch (error) {
      console.error('Erro:', error)
      error = error
    } finally {
      isLoading = false
    }
  })

  const phoneMask = (value: string) => {
    if (!value) return ''
    value = value.replace(/\D/g, '')
    value = value.replace(/(\d{2})(\d)/, '($1) $2')
    value = value.replace(/(\d)(\d{4})$/, '$1-$2')
    return value
  }
</script>

<a
  {href}
  class="relative z-0 rounded-lg bg-base-100 shadow-lg transition-all duration-200 hover:scale-105"
>
  <div>
    <div>
      <img
        src={getImagePath(image)}
        alt=""
        class="h-full max-h-60 w-full rounded-t-lg object-cover"
      />
    </div>
    <div class="p-4 lg:p-6">
      <div class="mb-5 flex flex-col items-center justify-between lg:flex-row">
        <h2 class=" text-xl font-semibold lg:text-2xl">{title}</h2>
        <p class="text-sm">
          {#if isLoading || distance === undefined}
            <span class="animate-pulse">Calculando distancia...</span>
          {:else}
            <span class="">
              {error == '' ? distance + 'km de você' : 'Erro ao calcular'}
            </span>
          {/if}
        </p>
      </div>
      <div class="flex flex-col gap-2">
        <p class="lg:text-md flex items-center gap-2 text-xs">
          <MapPin class="min-h-6 min-w-6" />
          {address}
        </p>
        <p class="lg:text-md flex items-center gap-2 text-xs">
          <Phone class="min-h-6 min-w-6" />
          {phoneMask(telefone)}
        </p>
      </div>
    </div>
  </div>
</a>
