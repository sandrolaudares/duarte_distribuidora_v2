export class Cart<Item extends { id: string | number }, T> {
  cart: Record<
    string | number,
    {
      item: Item
      quantity: number
      meta: T
    }
  > = $state({})

  constructor(items?: { item: Item; quantity: number; meta: T }[]) {
    items?.forEach(p => {
      this.cart[p.item.id] = {
        item: p.item,
        quantity: p.quantity,
        meta: p.meta,
      }
    })
  }

  addItem(p: Item, meta?: T) {
    if (this.cart[p.id]) {
      this.cart[p.id].quantity += 1
    }

    this.cart[p.id] = {
      item: p,
      quantity: 1,
      meta: meta || ({} as T),
    }
  }

  setItem(p: Item, quantity: number, meta?: T) {
    this.cart[p.id] = {
      item: p,
      quantity,
      meta: meta || ({} as T),
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
