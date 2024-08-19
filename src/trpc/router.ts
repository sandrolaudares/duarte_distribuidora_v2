// lib/trpc/router.ts

import { t } from './t'

import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

// ROUTES
import { auth } from '$db/schema/user/router'
import { product } from '$db/schema/product/router'
import { pushNotification } from '$db/schema/push-notification/router'
import { customer } from '$db/schema/customer/router'
import { stock } from '$db/schema/stock/router'
import { distribuidora } from '$db/schema/distribuidora/router'
import { bugReporter } from '$db/schema/bug-report/router'

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
