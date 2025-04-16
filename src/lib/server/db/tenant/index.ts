import * as tenantSchema from '../schema'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'

export const tenantTSchema = { ...tenantSchema }

export type TenantDbType = LibSQLDatabase<typeof tenantTSchema>

export type Transaction = Parameters<Parameters<TenantDbType['transaction']>[0]>[0];
