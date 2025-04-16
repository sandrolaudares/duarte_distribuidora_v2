import { getContext, setContext } from "svelte"
import { PrintingOrder } from "$lib/state/printer.svelte"

const PRINTER_STORE_KEY = Symbol('printerC')

export function createPrinterContext() {
  const store = new PrintingOrder()

  // console.log($state.snapshot(store.cart))
  return setContext(PRINTER_STORE_KEY, store)
}

export function getPrinterContext(): PrintingOrder {
  return getContext(PRINTER_STORE_KEY)
}
