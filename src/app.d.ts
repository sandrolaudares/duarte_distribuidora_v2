

import type { SelectUser, SelectSession } from '$lib/server/db/schema'
import type { SelectTenant } from '$lib/server/db/central/schema'

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      
      tenantDb: import('$lib/server/db/tenant').TenantDbType | null
      tenantInfo: SelectTenant | null
      tenantAuthManager:
        | import('$lib/server/auth/tenant/sessions').TenantAuthManagerType
        | null

      user: SelectUser | null
      session: SelectSession | null
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {}

// SVELTE DND ACTION
declare type Item = import('svelte-dnd-action').Item
declare type DndEvent<ItemType = Item> =
  import('svelte-dnd-action').DndEvent<ItemType>
declare namespace svelteHTML {
  interface HTMLAttributes<T> {
    'on:consider'?: (
      event: CustomEvent<DndEvent<ItemType>> & { target: EventTarget & T },
    ) => void
    'on:finalize'?: (
      event: CustomEvent<DndEvent<ItemType>> & { target: EventTarget & T },
    ) => void
  }
}
