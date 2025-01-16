import type { PageServerLoad } from './$types';

import * as s from '$db/schema'
import { eq, sql, and, gt, count, desc } from 'drizzle-orm'
import { subDays } from 'date-fns';
import { withinDate2 } from '$lib/server/db/utils';

export const load = (async ({ locals: { tenantDb: db }, url }) => {
    const searchParams = url.searchParams

    const sp_start_date = searchParams.get('startDate')
    const sp_end_date = searchParams.get('endDate')

    const startDate =
        typeof sp_start_date === 'string'
            ? new Date(Number(sp_start_date))
            : subDays(new Date(), 7)

    const endDate =
        typeof sp_end_date === 'string' ? new Date(Number(sp_end_date)) : new Date()


    const getTotalDelivered = db!.select({
        total: count(s.customerOrderTable.id)
    })
        .from(s.customerOrderTable)
        .where(
            and(
                eq(s.customerOrderTable.status, 'DELIVERED'),
                gt(s.customerOrderTable.taxa_entrega, 0),

            )
        )
        .$dynamic()

    const getTotalDeliveryFees = db!.select({
        total: sql`SUM(${s.customerOrderTable.taxa_entrega})`
    })
        .from(s.customerOrderTable)
        .where(
            and(
                eq(s.customerOrderTable.status, 'DELIVERED'),
                gt(s.customerOrderTable.taxa_entrega, 0),

            )
        )
        .$dynamic()

    const getTotalCancelados = db!.select({
        total: count(s.customerOrderTable.id)
    })
        .from(s.customerOrderTable)
        .where(
            and(
                eq(s.customerOrderTable.status, 'CANCELED'),
            )
        )
        .$dynamic()


    const getMotoboyOverview = db!.select({
        name: s.userTable.username,
        numberDeliveries: count(s.customerOrderTable.id),
        totalAmountDeliveryFees: sql<number>`SUM(${s.customerOrderTable.taxa_entrega})`
    })
        .from(s.customerOrderTable)
        .innerJoin(s.userTable, eq(s.customerOrderTable.motoboy_id, s.userTable.id))
        .where(
            and(
                eq(s.customerOrderTable.status, 'DELIVERED'),
                gt(s.customerOrderTable.taxa_entrega, 0),
            )
        )
        .groupBy(s.userTable.id)
        .orderBy(desc(sql<number>`SUM(${s.customerOrderTable.taxa_entrega})`))
        .$dynamic()

    const getLast10Deliveries = db!.select({
        motoboyName: s.userTable.username,
        // distance: s.customerOrderTable,
        taxaEntrega: s.customerOrderTable.taxa_entrega,
        totalPedido: s.customerOrderTable.total
    })
        .from(s.customerOrderTable)
        .innerJoin(s.userTable, eq(s.customerOrderTable.motoboy_id, s.userTable.id))
        .where(
            and(
                eq(s.customerOrderTable.status, 'DELIVERED'),
                gt(s.customerOrderTable.taxa_entrega, 0),
            )
        )
        .orderBy(desc(s.customerOrderTable.created_at))
        .limit(10)
        .$dynamic()

    const withinSearchDate = withinDate2(startDate, endDate)
    const [
        totalDeliveredCompleted,
        totalDeliveryFees,
        totalCancelados,
        motoboyOverview,
        last10Deliveries
    ] = await Promise.all([
        withinSearchDate(getTotalDelivered, s.customerOrderTable.created_at),
        withinSearchDate(getTotalDeliveryFees, s.customerOrderTable.created_at),
        withinSearchDate(getTotalCancelados, s.customerOrderTable.created_at),
        withinSearchDate(getMotoboyOverview, s.customerOrderTable.created_at),
        getLast10Deliveries
    ])
    console.log(last10Deliveries)
    return {
        // TODO: Total de corridas completas
        totalDeliveredCompleted: totalDeliveredCompleted[0].total,

        // TODO: Distância total de corridas
        TotalDeliveryFees: totalDeliveryFees[0].total,

        // TODO: Pedidos deliveris cancelados
        cancelingOrders: totalCancelados[0].total,

        // TODO: Produtos que mais foram vendidos na modalidade delivery
        bestProduct: "Brahma Latão",

        // TODO: Relatório Motoboy (Soma a quantidade de entrega e o valor total das taxas de entrega) -> Solicitado pelo Marlon
        // Texto que ele mandou: Relatório de entregas por motoboy, por período. Somando a quantidade de entregas e valor total das taxas de entregas. (Não faz muito sentido, mas foi o que ele pediu)
        couriersHighestNumberDeliveries: motoboyOverview,

        // TODO: Ultimas dez corridas
        lastTenDeliveries: [
            {
                name: "Vitor",
                distance: 2.8,
                value: 200.54
            },
            {
                name: "Gustavo",
                distance: 1.8,
                value: 123.00
            },
            {
                name: "Pedro",
                distance: 3.6,
                value: 123.00
            },
        ],

        startDate,
        endDate,
    };
}) satisfies PageServerLoad;
