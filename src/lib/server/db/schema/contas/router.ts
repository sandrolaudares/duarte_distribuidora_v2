import { middleware } from '$trpc/middleware'
import { publicProcedure, router } from '$trpc/t'
import { z } from 'zod'
import { categoriaConta, insertCategoriaSchema, insertContaSchema, tipoPagamentoConta } from '.'
import { contasController } from './controller'

export const contas = router({
  insertConta: publicProcedure
    .meta({
      routeName: 'Cadastrar conta',
      permission: 'editar_clientes',
      //EDIT PERMISSION
    })
    .use(middleware.auth)
    .use(middleware.logged)
    .input(insertContaSchema)
    .mutation(async ({ input, ctx: { tenantDb } }) => {
      return await contasController(tenantDb).insertConta(input).returning()
    }),

  insertCategoria: publicProcedure
    .meta({
      routeName: 'Cadastrar categoria',
      permission: 'editar_clientes',
      //EDIT PERMISSION
    })
    .use(middleware.auth)
    .use(middleware.logged)
    .input(insertCategoriaSchema)
    .mutation(async ({ input, ctx: { tenantDb } }) => {
      return await contasController(tenantDb).insertCategoria(input).returning()
    }),

    insertTipoPagamento: publicProcedure
    .meta({
      routeName: 'Cadastrar tipo de pagamento',
      permission: 'editar_clientes',
      //EDIT PERMISSION
    })
    .use(middleware.auth)
    .use(middleware.logged)
    .input(insertCategoriaSchema)
    .mutation(async ({ input, ctx: { tenantDb } }) => {
      return await contasController(tenantDb).insertTipoPagamento(input).returning()
    }),

    pagarConta:publicProcedure
    .meta({
      routeName: 'Pagar conta',
      permission: 'editar_clientes',
      //EDIT PERMISSION
    })
    .use(middleware.auth)
    .use(middleware.logged)
    .input(
      z.number()
    )
    .mutation(async ({ input, ctx: { tenantDb } }) => {
      return await contasController(tenantDb).pagarConta(input).returning()
    }),

    deletarConta:publicProcedure
    .meta({
      routeName: 'Excluir conta',
      permission: 'editar_clientes',
      //EDIT PERMISSION
    })
    .use(middleware.auth)
    .use(middleware.logged)
    .input(
      z.number()
    )
    .mutation(async ({ input, ctx: { tenantDb } }) => {
      return await contasController(tenantDb).deletarConta(input).returning()
    }),

    getCategorias: publicProcedure.query(({ctx:{tenantDb}}) => {
        return tenantDb!.select().from(categoriaConta)
      }),
      getTipoPagamento: publicProcedure.query(({ctx:{tenantDb}}) => {
        return tenantDb!.select().from(tipoPagamentoConta)
      }),
})
