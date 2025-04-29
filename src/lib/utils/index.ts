import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export * from './image'
export * from './icons'
export * from './device'
export * from './entities'

export * from './monad'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: number | undefined

  return (...args: Parameters<T>): void => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = window.setTimeout(() => func(...args), delay)
  }
}

import { PUBLIC_DOMAIN } from '$env/static/public'

export const subdomainRegex = new RegExp(
  // eslint-disable-next-line no-useless-escape
  `(.*)\.${PUBLIC_DOMAIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
)

interface Domain {
  domain: string
  type: 'subdomain' | 'customDomain' | 'appDomain'
}

export function getDomainAndType(host: string): Domain {
  if (host === PUBLIC_DOMAIN) return { domain: host, type: 'appDomain' }

  const domain = host.match(subdomainRegex)?.[1]
  if (domain) {
    return { domain, type: 'subdomain' }
  }

  return { domain: host, type: 'customDomain' }
}



export function formatCurrency (value:number) {
  const valueInBRL = value /100
  return valueInBRL.toLocaleString('pt-BR',{
    style:'currency',
    currency:'BRL'
  })
}

export function secondsToTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function timeToSeconds(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 3600 + minutes * 60;
}