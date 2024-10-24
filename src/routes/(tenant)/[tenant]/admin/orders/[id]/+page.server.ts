import { customer } from '$lib/server/db/controller';
import type { PageServerLoad } from './$types';

export const load = (async ({params,locals:{tenantDb}}) => {
    const orderID = Number(params.id)

    const order_details = await customer(tenantDb!).getOrderByID(orderID)

    if (!order_details) {
        return {
            status: 404,
            error: new Error('Order not found')
        };
    }

    return {
        order_details
    };
}) satisfies PageServerLoad;