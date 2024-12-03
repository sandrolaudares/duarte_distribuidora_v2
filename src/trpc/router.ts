// lib/trpc/router.ts

import { t } from './t'

import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

// ROUTES
import { auth } from '$db/schema/user/router'
import { product } from '$db/schema/product/router'
import { customer } from '$db/schema/customer/router'
import { stock } from '$db/schema/stock/router'
import { distribuidora } from '$db/schema/distribuidora/router'
import { bugReporter } from '$db/schema/bug-report/router'
import { contas } from '$lib/server/db/schema/contas/router'

export const router = t.router({
  auth,
  stock,
  product,
  customer,
  distribuidora,
  bugReport: bugReporter,
  contas,
})

export type Router = typeof router
export type RouterInputs = inferRouterInputs<Router>
export type RouterOutputs = inferRouterOutputs<Router>
