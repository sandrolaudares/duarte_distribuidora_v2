import type { paymentMethodEnum } from "$lib/server/db/schema"

export const permissionsEnum = [
  'receber_fiado',
  'editar_produtos',
  'editar_estoque',
  'ver_relatorios',
  'customer',
  'motoboy',
  'editar_caixas',
  'editar_clientes',
  'atualizar_pedidos'
] as const

type FormatedPermissions = {
  [key in Permission]: string
}

export const formated_Permissions: FormatedPermissions = {
  ver_relatorios: 'Ver Relatórios',
  customer: 'Cliente',
  motoboy: 'Motoboy',
  editar_caixas: 'Editar Caixas',
  editar_clientes: 'Editar Clientes',
  editar_estoque: 'Editar Estoque',
  editar_produtos: 'Editar Produtos',
  receber_fiado: 'Receber Fiado',
    atualizar_pedidos: 'Atualizar Pedidos',
}
export const roleEnum = [
  'admin',
  'customer',
  'motoboy',
  'caixa',
  'financeiro',
  'gerente'
] as const

export const roleLabels: Record<typeof roleEnum[number], string> = {
  admin: 'Administrator',
  customer: 'Cliente',
  motoboy: 'Motoboy',
  caixa: 'Caixa',
  financeiro: 'Financeiro',
  gerente : 'Gerente'
}

export const paymentMethodLabel: Record<typeof paymentMethodEnum[number], string> = {
  credit_card: 'Cartão de crédito',
  debit_card: 'Cartão de débito',
  pix: 'Pix',
  dinheiro: 'Dinheiro',
}



export type Role = (typeof roleEnum)[number]
export type Permission = (typeof permissionsEnum)[number]

export const cashierTransactionEnum = [
  'Abertura',
  'Fechamento',
  'Pagamento',
  'Sangria',
  "Deposito",
] as const

export type CashierTransactionType = (typeof cashierTransactionEnum)[number]