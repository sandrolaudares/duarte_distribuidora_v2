// file initialized by the Paraglide-SvelteKit CLI - Feel free to edit it


// export const reroute = i18n.reroute()

import { getDomainAndType } from '$lib/utils'
import type { Reroute } from '@sveltejs/kit'

export const reroute: Reroute = ({ url }) => {
  const pathname = url.pathname

  const domain = getDomainAndType(url.host)

  if (domain.type === 'appDomain') {
    return pathname
  } else {
    const tenantDomain = domain.domain
    return `/${tenantDomain}${pathname}`
  }
}
