import type { SelectProductItem } from '$lib/server/db/schema'

export class editOrder {
  item: SelectProductItem | undefined = $state(undefined)
  quantity = $state(0)
  total = $derived(this.item?.quantity || 0 * this.quantity);

  constructor(item: SelectProductItem, quantity: number) {
    this.item = item
    this.quantity = quantity
  }

  addItem() {
     if(this.item){
       this.quantity += 1
     }
  }
  setItem(){

  }
  removeItem(){
    if (this.quantity > 0) {
        this.quantity--;
      }
  }
  toggleTipoPreco() {
 
  
  }
}
