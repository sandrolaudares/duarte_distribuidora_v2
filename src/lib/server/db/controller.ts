import { z } from 'zod'

export { product } from './schema/product/controller'

export { user } from './schema/user/controller'

export { image } from './schema/image/controller'

export { bugReport } from './schema/bug-report/controller'

export { customer } from './schema/customer/controller'

export { stock } from './schema/stock/controller'

export { distribuidora } from './schema/distribuidora/controller'

export { contasController } from './schema/contas/controller'

export const SKU_TRANSFERENCE_PARAMS = z.object({
  type: z.enum(['IN_TRANSFERENCE', 'OUT_TRANSFERENCE']),
  central_transference_id: z.number(),
  quantity: z.number().min(0),
})

export type SKU_TRANSFERENCE_POST_TYPE = z.infer<typeof SKU_TRANSFERENCE_PARAMS>
