// lib/trpc/router.ts

import { t } from './t'

import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

// ROUTES
import { auth } from './routes/auth'
import { product } from './routes/product'
import { pushNotification } from './routes/push-notification'
import { customer } from './routes/customer'
import { stock } from './routes/stock'
import { distribuidora } from './routes/distribuidora'
import { bugReporter } from './routes/bugReporter'

export const router = t.router({
  auth,
  stock,
  product,
  customer,
  distribuidora,
  pushNotification,
  bugReport: bugReporter,
})

export type Router = typeof router
export type RouterInputs = inferRouterInputs<Router>
export type RouterOutputs = inferRouterOutputs<Router>
