/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

import { website } from './lib/config'

try {
  self.addEventListener('fetch', function () {
    return
  })
  self.addEventListener('install', () => {
    console.log(`installing service worker`)
  })

  self.addEventListener('activate', () => {
    console.log(`activating service worker`)
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  self.addEventListener('push', function (event: any) {
    const payload = event.data?.text() ?? 'no payload'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registration = (self as any).registration as ServiceWorkerRegistration
    event.waitUntil(
      registration.showNotification(website.siteTitle, {
        body: payload,
      }),
    )
  } as EventListener)
} catch (error) {
  console.error(error)
}
