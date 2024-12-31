import { getContext, setContext } from 'svelte'

import type { RouterOutputs } from '$trpc/router'
import { Cart } from '$lib/state/cart.svelte'
import type { SelectProductItem } from '$lib/server/db/schema/product'

type OrderDetailsNotUndefined = Exclude<
  RouterOutputs['customer']['getOrderById'],
  undefined
>
type Item = SelectProductItem

type CartProductMeta = {
  price: number,
  is_retail: boolean
}
type CartMeta = {
  test: string
}

const CART_STORE_KEY = Symbol('cartGetOrderById')

export function createCartContext(order_details: OrderDetailsNotUndefined) {
  const store = new Cart<Item, CartProductMeta, CartMeta>(
    order_details.items.map(item => ({
      item: item.product,
      quantity: item.quantity ?? 0,
      meta: {
        is_retail:false,
        price: item.price,
      },
    })),
  )

  console.log($state.snapshot(store.cart))
  return setContext(CART_STORE_KEY, store)
}

export function getCartContext(): Cart<Item, CartProductMeta, CartMeta> {
  return getContext(CART_STORE_KEY)
}
