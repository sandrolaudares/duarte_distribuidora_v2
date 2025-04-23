import { customerTable } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'
import type { PageServerLoad } from './$types'
import { customer } from '$lib/server/db/controller'

export const load = (async ({ locals: { tenantDb, user } }) => {
  if (!user) {
    return { cliente: null, enderecos: [] }
  }

  let [cliente] = await tenantDb!
    .select()
    .from(customerTable)
    .where(eq(customerTable.email, user.email))
    .limit(1)

  if (!cliente) {
    ;[cliente] = await tenantDb!
      .insert(customerTable)
      .values({
        email: user.email,
        name: user.username,
        is_retail: true,
      })
      .returning()
  }

  const enderecos = cliente
    ? await customer(tenantDb!).getCustomerAddress(cliente.id)
    : []
    
    console.log(enderecos[0])

  return { cliente, enderecos }
}) satisfies PageServerLoad
