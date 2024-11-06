import type { Theme } from '$lib'
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
// import { timestamps } from '../utils'

export const tenants = sqliteTable('tenants', {
  // ...timestamps,
  tenantId: integer('tenant_id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  subdomain: text('subdomain').notNull().unique(),
  databaseName: text('database_name').notNull().unique(),
  theme: text('theme').notNull().$type<Theme>().default('winter'),
  address: text('address'),
  phone: text('phone'),
  lat: real('lat'),
  lng: real('lng'),
  taxa_por_km: integer('taxa_por_km')
})

export type SelectTenant = typeof tenants.$inferSelect
export type InsertTenant = typeof tenants.$inferInsert

// export const customDomains = sqliteTable("custom_domains", {
//   customDomainId: integer("custom_domain_id").primaryKey({
//     autoIncrement: true,
//   }),
//   customDomain: text("custom_domain").unique().notNull(),
//   verified: integer("verified", { mode: "boolean" }).notNull().default(false),
//   cloudflareHostnameId: text("cloudflare_hostname_id"),
//   tenantId: integer("tenant_id")
//     .notNull()
//     .references(() => tenants.tenantId),
//   createdAt: text("created_at")
//     .notNull()
//     .default(sql`current_timestamp`),
// });
