import type { RequestHandler } from './$types'
import { SKU_TRANSFERENCE_PARAMS, stock } from '$db/controller'
import { error, json } from '@sveltejs/kit'

// function

export const GET: RequestHandler = async ({ locals: { tenantDb }, params }) => {
  if (!tenantDb) return error(404, 'Tenant not found')

  try {
    const sku = params.sku
    const skuItem = await stock(tenantDb!).getSKUByID(sku)
    // return new Response(JSON.stringify(skuItem), {status: 200});
    return json(skuItem)
  } catch (e) {
    console.log(e)
    return error(404, 'Not found')
  }
}

export const POST: RequestHandler = async ({
  locals: { tenantDb },
  params,
  request,
}) => {
  if (!tenantDb) return error(404, 'Tenant not found')

  const sku = params.sku
  const skuItem = await stock(tenantDb).getSKUByID(sku)

  if (!skuItem) {
    return error(404, 'Not found')
  }

  try {
    const transaction = await request.json()

    const {
      success,
      data,
      error: err_parse,
    } = SKU_TRANSFERENCE_PARAMS.safeParse(transaction)

    if (!success) {
      return error(505, err_parse)
    }

    switch (data.type) {
      case 'IN_TRANSFERENCE':
        await stock(tenantDb).insertStockTransaction({
          type: 'Entrada',
          sku: params.sku,
          quantity: data.quantity,
          meta_data: {
            type: 'transference',
            central_transference_id: data.central_transference_id,
            transference_type: 'IN_TRANSFERENCE',
          },
        })

        break
      case 'OUT_TRANSFERENCE':
        if (skuItem.quantity < data.quantity) {
          return error(400, 'Sem estoque suficiente')
        }
        if(data.quantity >= 0){
          return error(400, 'Quantidade inválida')
        }

        await stock(tenantDb).insertStockTransaction({
          type: 'Saida',
          sku: params.sku,
          quantity: data.quantity,
          meta_data: {
            type: 'transference',
            central_transference_id: data.central_transference_id,
            transference_type: 'OUT_TRANSFERENCE',
          },
        })
        break

      default:
        break
    }
    return json({ success: true })
  } catch (e) {
    console.log(e)
    return error(404, 'Not found')
  }
}
