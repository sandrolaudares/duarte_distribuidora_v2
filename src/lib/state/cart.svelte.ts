export class Cart<Item extends { id: string | number }, ProductMeta, CartMeta> {
  cart: Record<
    string | number,
    {
      item: Item
      quantity: number
      meta: ProductMeta
    }
  > = $state({})

  meta: CartMeta = $state(<CartMeta>{})

  constructor(
    items?: { item: Item; quantity: number; meta: ProductMeta }[],
    meta?: CartMeta,
  ) {
    items?.forEach(p => {
      this.cart[p.item.id] = {
        item: p.item,
        quantity: p.quantity,
        meta: p.meta,
      }
    })
    this.meta = meta || ({} as CartMeta)
  }

  addItem(p: Item, meta?: ProductMeta) {
    if (this.cart[p.id]) {
      this.cart[p.id].quantity += 1
      return
    }

    this.cart[p.id] = {
      item: p,
      quantity: 1,
      meta: meta || ({} as ProductMeta),
    }
  }

  setItem(p: Item, quantity: number, meta?: ProductMeta) {
    this.cart[p.id] = {
      item: p,
      quantity,
      meta: meta || ({} as ProductMeta),
    }
  }
  removeItem(p: Item) {
    delete this.cart[p.id]
  }

  subtractItem(p: Item) {
    if (this.cart[p.id])
      if (this.cart[p.id].quantity <= 1) {
        this.removeItem(p)
        return
      }
    this.cart[p.id].quantity -= 1
  }
}
