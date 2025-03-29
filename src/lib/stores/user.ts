import { writable, type Writable } from 'svelte/store'
import { getContext, setContext } from 'svelte'
import type { SelectUser } from '$lib/server/db/schema'

const USER_STORE_KEY = 'user'

function createUserStore(user: SelectUser | null = null) {
  const base = writable<SelectUser | null>(user)
  return base
}

export function createUserContext(user: SelectUser | null = null) {
  const store = createUserStore(user)
  return setContext(USER_STORE_KEY, store)
}

export function getUserContext(): Writable<SelectUser | null> {
  return getContext(USER_STORE_KEY)
}
