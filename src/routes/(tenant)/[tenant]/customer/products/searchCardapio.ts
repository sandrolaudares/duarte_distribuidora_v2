import type { SearchStoreModel } from "$lib/stores/search"
import type { RouterOutputs } from "$trpc/router"
import { writable } from "svelte/store"

type ProductCategory = RouterOutputs['product']['queryCategorysWithProducts'][0]

export const createSearchStore = (
    data: ProductCategory[],
) => {
    const { subscribe, set, update } = writable<SearchStoreModel<ProductCategory>>({
        data: data,
        filtered: data,
        search: "",
    })

    return {
        subscribe,
        set,
        update,
    }
}

export const searchHandler = (store: SearchStoreModel<ProductCategory>) => {
    const searchTerm = store.search.toLowerCase().trim()
  
    store.filtered = store.data
      .map((product) => {
        const filteredSubProducts = product.products.filter((subProduct) =>
          `${product.name} ${subProduct.name}`.toLowerCase().includes(searchTerm)
        )
  
        return {
          ...product,
          products: filteredSubProducts
        }
      })
      .filter((product) => product.products.length > 0)
  }
  