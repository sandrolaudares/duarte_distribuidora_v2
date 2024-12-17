import { getDistribuidoras } from '$lib/server/db/central/constroller';
import type { PageServerLoad } from './$types';

export const load = (async () => {
    try {
        const distribuidoras = await getDistribuidoras()
    
        return { distribuidoras }
      } catch (error) {
        console.error(error)
        return { distribuidoras: [] }
      }
}) satisfies PageServerLoad;