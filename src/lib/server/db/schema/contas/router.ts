import { middleware } from '$trpc/middleware'
import { publicProcedure, router } from '$trpc/t'
import { insertContaSchema } from '.'
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
      return await contasController(tenantDb)
        .insertConta(input)
        .returning()
    }),
})
