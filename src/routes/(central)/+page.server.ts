import type { PageServerLoad } from './$types'
import { centralDb as db } from '$db/central'
import type { Actions } from './$types'
import { getDistribuidoraLatLong } from '$lib/server/db/central/constroller'
import { getDistanceFromLatLonInKm } from '$lib/utils/distance'

export const load = (async () => {
  const tenats = await db.query.tenants.findMany({
    columns: {
      tenantId: true,
      name: true,
      subdomain: true,
      address: true,
      phone: true,
      lat: true,
      lng: true,
    },
  })
  return {
    tenats,
  }
}) satisfies PageServerLoad

export const actions = {
  calculateDistance: async ({ request }) => {
    const data = await request.formData()
    const id = Number(data.get('id'))
    const lat = Number(data.get('lat'))
    const lon = Number(data.get('lon'))

    const [distribuidora] = await getDistribuidoraLatLong(id)

    if (!distribuidora.lat || !distribuidora.lng) {
      throw new Error('Distribuidora não encontrada')
    }

    const distribuidoraLat = distribuidora.lat
    const distribuidoraLong = distribuidora.lng

    const distance = getDistanceFromLatLonInKm(
      { lat: distribuidoraLat, lon: distribuidoraLong },
      { lat: lat, lon: lon },
    )

    console.log((distance/1000).toFixed(2))

    return { distance }
  },
} satisfies Actions
