import { publicProcedure, router } from '$trpc/t'

import { z } from 'zod'

import { product as productController } from '$db/controller'

import {
  insertProductCategorySchema,
  insertProductItemSchema,
  insertProductSchema,
} from '$db/schema'

// import { tableHelper } from '$db/utils'
import { middleware } from '$trpc/middleware'

export const product = router({
  // paginatedProducts: publicProcedure
  //   .input(paramsSchema)
  //   .query(async ({ input }) => {
  //     return await tableHelper(
  //       productController.getProducts().$dynamic(),
  //       productController.tables.productTable,
  //       'name',
  //       input,
  //     )
  //   }),
  // paginatedProductItems: publicProcedure
  //   .input(paramsSchema)
  //   .query(async ({ input }) => {
  //     return await tableHelper(
  //       productController.getProductItems().$dynamic(),
  //       productController.tables.productItemTable,
  //       'name',
  //       input,
  //     )
  //   }),

  insertProduct: publicProcedure
    .input(insertProductSchema)
    .use(middleware.logged)
    .use(middleware.auth)
    //.use(middleware.allowPermissions(['admin', 'user']))

    .mutation(async ({ input, ctx: {tenantDb} }) => {
      return await productController(tenantDb).insertProduct(input).returning()
    }),
  updateProduct: publicProcedure
    .use(middleware.logged)
    .use(middleware.auth)

    .input(
      z.object({
        id: z.number(),
        prod: z.object({
          name: z.string().optional(),
          description: z.string().optional(),
          image: z.number().optional(),
        }),
      }),
    )
    .mutation(async ({ input, ctx: {tenantDb} }) => {
      const { id, prod } = input

      return await productController(tenantDb).updateProduct(id, prod).returning()
    }),
  deleteProduct: publicProcedure
    .use(middleware.logged)
    .use(middleware.auth)

    .input(z.number())
    .mutation(async ({ input , ctx: {tenantDb}}) => {
      return await productController(tenantDb).deleteProduct(input)
    }),

  insertProductItem: publicProcedure
    .use(middleware.logged)
    .use(middleware.auth)

    .input(insertProductItemSchema)
    .mutation(async ({ input, ctx: {tenantDb} }) => {
      return await productController(tenantDb).insertProductItem(input)
    }),
  updateProductItem: publicProcedure
    .use(middleware.logged)
    .use(middleware.auth)

    .input(
      z.object({
        id: z.number(),
        prod: z.object({
          name: z.string().optional(),
          sku: z.string().optional(),
          quantity: z.number().optional(),
          wholesale_price: z.number().optional(),
          retail_price: z.number().optional(),
          image: z.number().optional(),
        }),
      }),
    )
    .mutation(async ({ input , ctx: {tenantDb}}) => {
      const { id, prod } = input
      return await productController(tenantDb).updateProductItem(id, prod).returning()
    }),
  deleteProductItem: publicProcedure
    .use(middleware.logged)
    .use(middleware.auth)

    .input(z.number())
    .mutation(async ({ input , ctx: {tenantDb}}) => {
      return await productController(tenantDb).deleteProductItem(input)
    }),

  insertProductCategory: publicProcedure
    .use(middleware.logged)
    .use(middleware.auth)

    .input(insertProductCategorySchema)
    .mutation(async ({ input, ctx: {tenantDb} }) => {
      return await productController(tenantDb).insertProductCategory(input).returning()
    }),
  updateProductCategory: publicProcedure
    .use(middleware.logged)
    .use(middleware.auth)

    .input(
      z.object({
        id: z.number(),
        prod: z.object({
          name: z.string(),
        }),
      }),
    )
    .mutation(async ({ input, ctx: {tenantDb} }) => {
      const { id, prod } = input
      return await productController(tenantDb).updateProductCategory(id, prod)
    }),
  deleteProductCategory: publicProcedure
    .use(middleware.logged)
    .use(middleware.auth)

    .input(z.number())
    .mutation(async ({ input, ctx: {tenantDb} }) => {
      return await productController(tenantDb).deleteProductCategory(input)
    }),
})
