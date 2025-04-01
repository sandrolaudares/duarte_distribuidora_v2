import type { Theme } from '$lib'
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { timestamps } from '../utils'
import type { SelectUser } from '../schema'
// import { timestamps } from '../utils'

type day = {
  start: number
  end: number
}

export type WorkSchedule = {
  segunda: day
  terca: day
  quarta: day
  quinta: day
  sexta: day
  sabado: day
  domingo: day
  feriado: day
};

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
  taxa_por_km: integer('taxa_por_km'),
  funcionamento : text('funcionamento', { mode: 'json' }).$type<WorkSchedule>().$default(()=>{
    return {
      segunda: { start: 0, end: 0 },
      terca: { start: 0, end: 0 },
      quarta: { start: 0, end: 0 },
      quinta: { start: 0, end: 0 },
      sexta: { start: 0, end: 0 },
      sabado: { start: 0, end: 0 },
      domingo: { start: 0, end: 0 },
      feriado: { start: 0, end: 0 },
    }
  }),
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

export const stockTransferenceStatus = [
  'REQUESTED',
  'ACCEPTED',

  'COMPLETED',
  'CANCELED',
] as const
type StockTransferenceStatus = (typeof stockTransferenceStatus)[number]

export type StockTransferenceMeta = {
  cost_price_cents?: number,
  created_by?: SelectUser['id'],
}
export const stockTransference = sqliteTable('stock_transference', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ...timestamps,
  status: text('status')
    .notNull()
    .default('new')
    .$type<StockTransferenceStatus>(),
  fromTenantId: integer('from_tenant_id').references(() => tenants.tenantId),
  toTenantId: integer('to_tenant_id')
    .notNull()
    .references(() => tenants.tenantId),
  sku_name: text('sku_name').notNull(),
  sku: text('sku').notNull(),
  quantity: integer('quantity').notNull(),
  meta_data: text('meta_data', {
    mode: 'json',
  })
    .notNull()
    .$type<StockTransferenceMeta>(),
})

export type InsertStockTransference = typeof stockTransference.$inferInsert
export type SelectStockTransference = typeof stockTransference.$inferSelect
