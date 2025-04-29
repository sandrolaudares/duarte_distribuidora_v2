import { page } from "$app/state"
import type { SelectAddress } from "$lib/server/db/schema"
import { trpc } from "$trpc/client"
import { toast } from "svelte-sonner"

export async function geocodeAddress(address: string) {
  console.log('Geocodificando ' + address)
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURI(address)}&format=json&addressdetails=1`,
    )
    const result = await response.json()

    console.log('RESULT: ', result)

    return {
      lat: parseFloat(result[0].lat),
      lon: parseFloat(result[0].lon),
    }
  } catch (e) {
    console.error(e)
    console.warn(`Erro ao geocodificar o endereço: ${address}`)
    return { lat: 0, lon: 0 }
  }
}

export function getDistanceFromLatLonInKm(
  position1: { lat: number; lon: number },
  position2: { lat: number; lon: number },
) {
  const deg2rad = (deg: number) => {
      return deg * (Math.PI / 180)
    },
    R = 6371,
    dLat = deg2rad(position2.lat - position1.lat),
    dLng = deg2rad(position2.lon - position1.lon),
    a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(position1.lat)) *
        Math.cos(deg2rad(position1.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2),
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c * 1000
}

export async function getDistance(endereco:SelectAddress | undefined,fee:number) {
  let distance = 0
  let taxaEntrega = 0
    if (
      endereco?.distance != null &&
      endereco?.distance > 0
    ) {
      distance = endereco.distance
    } else if (endereco) {
      distance = await trpc(page).customer.calculateDistance.mutate({
        number: endereco.number,
        bairro: endereco.neighborhood,
        street: endereco.street,
        city: endereco.city,
        state: endereco.state,
        cep: endereco.cep,
        country: endereco.country,
      })
    }
    taxaEntrega = (distance / 1000) * (fee / 100)
    taxaEntrega *= 100
    taxaEntrega = Math.round(taxaEntrega / 100) * 100
    toast.success('Distancia: ' + (distance / 1000).toFixed(2) + 'km')

    return taxaEntrega
}

export function formatAddress(address?: SelectAddress, shortVersion: boolean = false) {
  if (!address) return 'Endereço não disponível'

  const parts: string[] = []

  parts.push(address.street)
  
  
  if (address.number) {
    parts.push(address.number)
  }

  if (address.complement) {
    parts.push(address.complement)
  }

  parts.push(address.neighborhood)

  const cityAndState = shortVersion ? `${address.city}` : `${address.city} - ${address.state}, ${address.cep}`

  parts.push(cityAndState)

  return parts.join(', ')
}