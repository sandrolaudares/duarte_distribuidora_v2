import { writable } from 'svelte/store'
import { setContext, getContext } from 'svelte'

const CONTEXT_KEY = 'table'

export type EditableTypes = 'text' | 'number' | 'select'

// export { default as EditRowButton } from './EditRowButton.svelte'
// export { default as EditRowInput } from './EditRowInput.svelte'
// export { default as RowActions } from './RowActions.svelte'
// export { default as EditRowCurrency } from './EditRowCurrency.svelte'

function createChangesStore<T>() {
  const { subscribe, set, update } = writable<{ [key: string]: T }>({})

  function setRow(key: string, value: T) {
    update(rows => {
      rows[key] = value
      return rows
    })
  }
  function removeRow(key: string) {
    update(rows => {
      delete rows[key]
      return rows
    })
  }

  return {
    subscribe,
    set,
    update,
    setRow,
    removeRow,
  }
}
// export const rowChanges = createChangesStore()

// type rowChangeStoreT = ReturnType<typeof createChangesStore>

export function createRowChanges<T>() {
  return setContext(CONTEXT_KEY, createChangesStore<T>())
}

export function getRowChanges<T>() {
  return getContext<ReturnType<typeof createChangesStore<T>>>(CONTEXT_KEY)
}
