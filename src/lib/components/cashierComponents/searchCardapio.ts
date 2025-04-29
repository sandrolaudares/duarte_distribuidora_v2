import type { SearchStoreModel } from "$lib/stores/search"
import type { RouterOutputs } from "$trpc/router"
import { writable } from "svelte/store"

type ProductCategory = RouterOutputs['product']['queryCategorysWithProductItems'][0]

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
        const filteredSubProducts = product.products.map((subProduct) => {
          const filteredItems = subProduct.items.filter((item) =>
            `${product.name} ${subProduct.name} ${item.name}`
              .toLowerCase()
              .includes(searchTerm)
          )
          return { ...subProduct, items: filteredItems }
        })
  
        return {
          ...product,
          products: filteredSubProducts.filter((sp) => sp.items.length > 0)
        }
      })
      .filter((product) => product.products.length > 0)
  }
  