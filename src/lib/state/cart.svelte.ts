export class Cart<Item extends { id: string | number,retail_price?:number }, ProductMeta, CartMeta extends { taxaEntrega?:number }> {
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

  addItem(p: Item, meta?: ProductMeta,quantity?:number) {
    let qnt = 1

    if(quantity) {
      qnt = quantity
    }

    if (this.cart[p.id]) {
      this.cart[p.id].quantity += qnt
      return
    }

    this.cart[p.id] = {
      item: p,
      quantity: qnt,
      meta: meta || ({} as ProductMeta),
    }
  }

  setItem(p: Item, quantity: number, meta?: ProductMeta) {
    if(quantity <= 0) {
      this.removeItem(p)
      quantity = 0
      return
    }
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

  clear() {
    this.cart = {}
    this.meta = {} as CartMeta
  }

  clearMeta() {
    this.meta = {} as CartMeta
  }

  getTotal() {
    const itemsTotal = Object.values(this.cart).reduce((acc, { item, quantity }) => {
      const price = item.retail_price ?? 0
      return acc + price * quantity
    }, 0)
    const fee = this.meta.taxaEntrega || 0
  
    return itemsTotal + fee
  }

}

