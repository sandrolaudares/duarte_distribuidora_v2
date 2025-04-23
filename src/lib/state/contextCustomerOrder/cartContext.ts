import { getContext, setContext } from 'svelte'

import type { RouterOutputs } from '$trpc/router'
import { Cart } from '$lib/state/cart.svelte'
import type { SelectProductItem } from '$lib/server/db/schema/product'
import type { paymentMethodEnum } from '$lib/utils/permissions'

type Item = SelectProductItem

type CartProductMeta = {
  is_retail: boolean
}

type CartMeta = {
  taxaEntrega: number | undefined,
  enderecoSelecionado:RouterOutputs['customer']['getCustomers']['customers'][0]['adresses'][0] | undefined
  paymentMethodSelecionado: typeof paymentMethodEnum[number] | 'fiado' | undefined
}

const CART_STORE_KEY = Symbol('cartCustomer')

export function createCartContext() {
  const store = new Cart<Item, CartProductMeta, CartMeta>()

  // console.log($state.snapshot(store.cart))
  return setContext(CART_STORE_KEY, store)
}

export function getCartContext(): Cart<Item, CartProductMeta, CartMeta> {
  return getContext(CART_STORE_KEY)
}
