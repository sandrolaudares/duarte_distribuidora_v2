import { getContext, setContext } from 'svelte'

import type { RouterOutputs } from '$trpc/router'
import { Cart } from '$lib/state/cart.svelte'
import type { SelectProductItem } from '$lib/server/db/schema/product'

type Item = SelectProductItem

type CartProductMeta = {
  is_retail: boolean
}
type CartMeta = {
  clienteSelecionado: RouterOutputs['customer']['getCustomers'][0] | null,
  motoboySelecionado: RouterOutputs['auth']['getMotoboys'][0] | null,
  enderecoSelecionado: RouterOutputs['customer']['getCustomers'][0]['adresses'][0] | null,
  isDelivery : boolean,
  taxaEntrega: number,
}

const CART_STORE_KEY = Symbol('cartCaixa')

export function createCartContext() {
  const store = new Cart<Item, CartProductMeta, CartMeta>()

  // console.log($state.snapshot(store.cart))
  return setContext(CART_STORE_KEY, store)
}

export function getCartContext(): Cart<Item, CartProductMeta, CartMeta> {
  return getContext(CART_STORE_KEY)
}
