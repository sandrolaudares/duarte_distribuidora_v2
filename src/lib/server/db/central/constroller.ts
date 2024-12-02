/* eslint-disable @typescript-eslint/no-explicit-any */
import { centralDb as db } from '$db/central'
import { tenants, stockTransference } from './schema'
import type {
  SelectTenant,
  InsertStockTransference,
  SelectStockTransference,
} from './schema'

import { createClient } from '@tursodatabase/api'

import { user as userC, type SKU_TRANSFERENCE_POST_TYPE } from '$db/controller'
import { isValidEmail } from '$db/schema/user/controller'
import { subdomainRegex } from '$lib/utils'
import { and, eq } from 'drizzle-orm'

import {
  TURSO_GROUP_NAME,
  TURSO_ORGANIZATION_NAME,
  TURSO_PLATFORM_AUTH_TOKEN,
  TURSO_SCHEMA_DATABASE_NAME,
} from '$env/static/private'

import { PUBLIC_DOMAIN } from '$env/static/public'

import { hash } from '../schema/user/password'
import { getTenantDbClient } from '$lib/server/utils/init-db'
import { generateId } from '$lib/server/auth/utils'
import type { SelectSku } from '../schema'

export async function createTenant(newTenantInfo: {
  tenantName: unknown
  subdomain: unknown
  name: unknown
  email: unknown
  password: unknown
  phone: unknown
  address: unknown
  lat: unknown
  lon: unknown
}) {
  const {
    tenantName,
    subdomain,
    email,
    password,
    name,
    phone,
    address,
    lat,
    lon,
  } = newTenantInfo
  if (typeof tenantName !== 'string' || tenantName.length < 4) {
    return {
      success: false,
      message: 'Nome da filial deve conter ao menos 4 caracteres',
    }
  }

  if (
    typeof subdomain !== 'string' ||
    subdomain.length < 4 ||
    subdomainRegex.test(subdomain)
  ) {
    return {
      success: false,
      message:
        'subdomain contains only alphabetic characters, numbers, and hyphens (-), and cannot end with a hyphen and must be at least 4 characters long',
    }
  }

  if (typeof email !== 'string' || !isValidEmail(email)) {
    return {
      success: false,
      message: 'Email inválido',
    }
  }

  if (typeof phone !== 'string') {
    return {
      success: false,
      message: 'Telefone inválido',
    }
  }

  if (typeof address !== 'string') {
    return {
      success: false,
      message: 'Endereço inválido',
    }
  }

  if (typeof password !== 'string' || password.length < 8) {
    return {
      success: false,
      message: 'Senhas devem conter no minimo 8 digitos',
    }
  }

  if (typeof name !== 'string' || name.length < 4) {
    return {
      success: false,
      message: 'Nome deve possuir no minimo 4 caracteres',
    }
  }

  if (typeof lat !== 'number') {
    return {
      success: false,
      message: 'Latitude inválida',
    }
  }

  if (typeof lon !== 'number') {
    return {
      success: false,
      message: 'Latitude inválida',
    }
  }

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.subdomain, subdomain),
  })

  if (tenant) {
    return {
      success: false,
      message: 'Subdominio já existe',
    }
  }

  const tursoPlatform = createClient({
    org: TURSO_ORGANIZATION_NAME,
    token: TURSO_PLATFORM_AUTH_TOKEN,
  })

  const databaseName = `v1-${subdomain}`
  const data = await tursoPlatform.databases.create(databaseName, {
    group: TURSO_GROUP_NAME,
    schema: TURSO_SCHEMA_DATABASE_NAME,
  })

  console.log('new db:', data)
  const passwordHash = await hash(password)

  const companyData = await db
    .insert(tenants)
    .values({
      subdomain,
      name: tenantName,
      databaseName,
      phone,
      address,
      lat,
      lng: lon,
    })
    .returning()

  const tenantDb = getTenantDbClient(databaseName)

  const userData = await userC(tenantDb).insertUser({
    id: generateId(25),
    email,
    username: 'admin',

    role: 'admin',
    password_hash: passwordHash,
  })

  console.log('new user:', userData)
  console.log('new tenant:', companyData)
  return {
    success: true,
    data: {
      domain: `http://${subdomain}.${PUBLIC_DOMAIN}`,
    },
  }
}

export async function updateDistribuidora(
  id: SelectTenant['tenantId'],
  data: Partial<SelectTenant>,
) {
  return db.update(tenants).set(data).where(eq(tenants.tenantId, id))
}

export async function getDistribuidoraLatLong(id: SelectTenant['tenantId']) {
  return db
    .select({ lat: tenants.lat, lng: tenants.lng })
    .from(tenants)
    .where(eq(tenants.tenantId, id))
    .limit(1)
}

export async function solicitarTransference(data: InsertStockTransference) {
  const existing = await db
    .select()
    .from(stockTransference)
    .where(
      and(
        eq(stockTransference.status, 'REQUESTED'),
        eq(stockTransference.sku, data.sku),
      ),
    )

  console.log(existing)

  if (existing.length > 0) {
    console.log('já existe')
    const ext = existing[0]
    return await db
      .update(stockTransference)
      .set({
        quantity: ext.quantity + data.quantity,
      })
      .where(eq(stockTransference.id, ext.id))
      .returning()
  } else {
    return await db.insert(stockTransference).values(data).returning()
  }
}

export async function refuseTransference(id: SelectStockTransference['id']) {
  return await db
    .update(stockTransference)
    .set({
      status: 'CANCELED',
    })
    .where(eq(stockTransference.id, id))
    .returning()
}

export async function getCurrentTransfers() {
  return await db
    .select()
    .from(stockTransference)
    .where(eq(stockTransference.status, 'REQUESTED'))
}

export async function getReceivedTransfers(
  fromTenantId: SelectStockTransference['fromTenantId'],
) {
  if (fromTenantId === null) {
    throw new Error('Id não pode ser nulo')
  }
  return await db
    .select()
    .from(stockTransference)
    .where(
      and(
        eq(stockTransference.status, 'ACCEPTED'),
        eq(stockTransference.fromTenantId, fromTenantId),
      ),
    )
}

export async function acceptTransference(
  stockTransferenceId: SelectStockTransference['id'],
) {
  const transference = await db.query.stockTransference.findFirst({
    where: eq(stockTransference.id, stockTransferenceId),
  })
  //TODO: validate quantidade do from
  try {
    const skyFrom: SelectSku = await fetch(
      `https://${transference?.fromTenantId}.${PUBLIC_DOMAIN}/api/stock/${transference?.sku}`,
    ).then(res => res.json())

    if (transference?.quantity && skyFrom.quantity < transference?.quantity) {
      return {
        success: false,
        message: 'Quantidade insuficiente na filial de origem',
      }
    }
  } catch (error: any) {
    console.error(error)
    return {
      success: false,
      message: 'Erro ao buscar SKU de origem',
    }
  }

  if (transference?.status !== 'REQUESTED') {
    return {
      success: false,
      message: 'Status invalido',
    }
  }

  if (!transference.fromTenantId) {
    return {
      success: false,
      message: 'Adicione uma filial de origem para aceitar a transferência',
    }
  }
  try {
    await db
      .update(stockTransference)
      .set({
        status: 'ACCEPTED',
      })
      .where(eq(stockTransference.id, stockTransferenceId))
    return {
      success: true,
      message: 'Bem sucedido',
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    }
  }
}

export async function completeTransference(
  stockTransferenceId: SelectStockTransference['id'],
) {
  const transference = await db.query.stockTransference.findFirst({
    where: eq(stockTransference.id, stockTransferenceId),
  })
  if (!transference?.fromTenantId) {
    return {
      success: false,
      message: 'Adicione uma filial de origem para aceitar a transferência',
    }
  }
  if (
    // TODO: better errror message

    transference?.status !== 'ACCEPTED'
  ) {
    return {
      success: false,
      message: 'Primeiro aceite a transferência',
    }
  }

  const fromTenant = await db.query.tenants.findFirst({
    where: eq(tenants.tenantId, transference.fromTenantId),
  })

  const toTenant = await db.query.tenants.findFirst({
    where: eq(tenants.tenantId, transference.toTenantId),
  })

  if (!fromTenant || !toTenant) {
    return {
      success: false,
      message: 'Tenant not found',
    }
  }

  try {
    const fromTransfer = await fetch(
      `http://${fromTenant.subdomain}.${PUBLIC_DOMAIN}/api/stock/${transference.sku}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(<SKU_TRANSFERENCE_POST_TYPE>{
          quantity: transference.quantity,
          type: 'OUT_TRANSFERENCE',
          central_transference_id: transference.id,
        }),
      },
    ).then(res => res.json())

    if (!fromTransfer.success) {
      return fromTransfer
    }
  } catch (error: any) {
    console.error(error)
    return {
      success: false,
      message:
        error.message ??
        'Erro desconhecido, entre em contato com o desenvolvedor',
    }
  }

  try {
    const toTransfer = await fetch(
      `http://${toTenant.subdomain}.${PUBLIC_DOMAIN}/api/stock/${transference.sku}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(<SKU_TRANSFERENCE_POST_TYPE>{
          quantity: transference.quantity,
          type: 'IN_TRANSFERENCE',
          central_transference_id: transference.id,
        }),
      },
    )

    console.log('toTransfer:', toTransfer)
  } catch (error: any) {
    console.error(error)

    return {
      success: false,
      message:
        error.message ??
        'Erro desconhecido, entre em contato com o desenvolvedor, esse erro pode causar inconsistências no estoque',
    }
  }

  await db
    .update(stockTransference)
    .set({
      status: 'COMPLETED',
    })
    .where(eq(stockTransference.id, stockTransferenceId))

  return {
    success: true,
    message: `Transferência de ${transference.quantity} unidades do SKU ${transference.sku} - ${transference.sku_name} completada`,
  }
}

export async function getDistribuidoras() {
  return db.select().from(tenants)
}
