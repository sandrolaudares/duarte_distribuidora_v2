# Deds Template

My opinionated template for creating fast marketing websites that can have some
more flavour if you put in the work

### Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/andre-brandao/template

cd deds-template

npm install
# or
pnpm install
# or
yarn install
# or
bun install
```

## Libraries docs

- [DaisyUI](https://daisyui.com/components/) component library
- [SvelteAnimations](https://animation-svelte.vercel.app/) component library
- [Tailwind](https://tailwindcomponents.com/cheatsheet/) css classes but simple
  sometimes too simple
- [Drizzle](https://orm.drizzle.team/) sql orm
- [Lucia Auth](https://lucia-auth.com/) auth helper for sessions
- [TRPC](https://trpc.io/docs) typesafe api
- [TRPC SvelteKit](https://icflorescu.github.io/trpc-sveltekit/) trpc svelte
  adapter
- [Zod](https://zod.dev/) Type Validations
- [LayerCHart](https://www.layerchart.com/) Beutiful Charts

- [Svelte5](https://svelte-5-preview.vercel.app/docs/introduction)
- [SvelteKit](https://kit.svelte.dev/docs/introduction)
- [Svelte Tutorial](https://learn.svelte.dev/tutorial/introducing-sveltekit)

## Project Structure

Briefly explain the main directories and files in your project:

- src/: Source code for your application.
- src/routes/: SvelteKit routes.
- src/lib/: Reusable modules and components.
- src/lib/components: UI Components.
- src/lib/paraglide: Translations for the app (in gitignore).
- src/lib/stores: Aplication stores (global state).
- src/lib/utils: Utils for many things
- src/lib/server/db/: Database-related scripts and schema.
- src/assets: Static Assets
- src/trpc: Server side trpc routes
- messages: translation definition
- migrations: sql migrations

## Developing

Once you've cloned the project and installed dependencies with `npm install` (or
`pnpm install`, `yarn` or `bun`), start a development server:

```bash
npm run dev
```

## Building

To create a production version of your app:

```bash
npm run build
```

## Testing

TODO

## Drizzle

Drizzle ORM Commands The following commands help manage the database schema and
migrations, refer to [Commands Docs](https://orm.drizzle.team/kit-docs/commands)

Push changes to the development database:

```bash
npm run db:push
```

Apply database migrations:

```bash
npm run db:migrate --name <migration name>
```

Open Drizzle Studio:

```bash
npm run db:studio
```

Seed the database using faker.js:

```bash
npm run db:seed
```

Generate database types:

```bash
npm run db:generate
```

Drop the database:

```bash
npm run db:drop
```

Bring the database up (alias for db:push and db:migrate):

```bash
npm run db:up
```

Check the database schema:

```bash
npm run db:check
```

# Contributing

Feel free to submit issues or pull requests. Contributions are welcome!


## AGORA
- TABLE FIADO PODER SELECIONAR E MOSTRAR TOTAL DOS SELECIONADOS ✅
- SALVAR LAT E LONG DA DISTRIBUIDORA NO DB  ✅
- TELA CLIENTE TROCAR CARD POR TABLE DE PEDIDOS - ✅
- ARREDONDAR VALOR DA TAXA DE ENTREGA ✅
- NOME MOTOBOY NO CARD TELA PEDIDOS ✅
- COMPONENTE PARA EDITAR DADOS NAS TABLES ✅
- FILTRAR POR MOTOBOY NA TELA DE PEDIDOS ✅
- MOSTRAR CRÉDITO DO CLIENTE NA TELA DO CAIXA ✅
- COPIAR SIDE BAR SHADCN ✅
- CHECAR O SUM PAGINA CUSTOMER/ID ✅
- CHECKBOX TABELA FIADO PRA MOSTRAR TOTAL APENAS DAS SELECIONADAS ✅
- ADICIONAR NO METADATA DO USUARIO UM CAIXA DESIGNADO A ELE ✅
  -- Falta adicionar a opcao na tela de permissoes ✅
  -- Butao do caixa admin na navbar dar redirect direto pro caixa dele ✅

- boolean pra esconder produtos do cardapio


- Preco km tabela distribuidora ✅ + infos tabela distribuidora - Delete deliveryFee Table
- Contas a pagar, nova tabela (Preciso que inclua nas guias a esquerda contas a pagar. Essa guia deve ter a categoria da dívida, fornecedor (já cadastrado em fornecedores), descrição, data de vencimento e valor. A conta fica cadastradastra, financeiro realiza o pagamento na data correta, esse histórico precisa ficar registrado, pois em relatórios vamos precisar comparar vendas x despesas pra analisar o lucro mensal.)
- Permissoes no trpc pra cada func
- Colunas na tabela dos logs
- AJustar form criar tenant erros de endereco
- PODER EDITAR INFOS DISTRIBUIDORA NO /TENANT - perfil da distribuidora
- REFATORAR ONDE MOSTRA AS INFOS DO CLINTE NA PAGINA DO CAIXA
- DIMENSÕES TELA CAIXA, CABER EM TELAS MENORES
- PODER EDITAR OS PEDIDOS/CANCELAR PEDIDOS
- CADASTRAR MOTOBOY ✅
- CHECAR O SUM PAGINA CUSTOMER/ID 
- TELA FIADO FILTRAR PAGAMENTOS ATRASADOS 
- EDITAR DATA VENCIMENTO (EXIPIRE_AT)
- NO CAIXA FAZER ENDEREÇO/MOTOBOY/CLIENTE SELECIONADO VIRAREM STORE
- APLICAR EDITABLECELL NAS TABLES EXISTENTES

- TRANSAÇÕES DO CAIXA (TELAS)

- Alerta de compra em excesso ex, bloqueio automático caso tenha notas em atraso. (Desbloqueio somente com senha de gerente). 
- REPASSE ESTOQUE ENTRE DISTRIBUIDORAS
- Adicionar campo de distancia na tabela endereço (calcular ao adicionar endereço talvez) acho legal adicionar um butao de recalcular



- Parte do cliente fazer pedido
- TELA RESUMO DE CADA MOTOBOY ENTREGAS

## DEPOIS
- SCORE DO CLIENTE/PONTUACAO. - Cliente pagou fiado em dia ganha 5 pontos, pagou atrasado perde 5 pontos. Esse score atualiza automaticamente toda vez que ele efetuar um pagamento. Pra auxiliar na tomada de decisões junto aos clientes pj que compram fiado.


# RELATORIOS:
- Vendas por período.
- Recebimentos por períodos, dia e semana, mês.
- Cliente inadimplentes.
- Vendas comparando dia atual com mesmo dia do mês passado, mês atual com mesmo mês do ano passado.
- Relatório de estoque crítico, baseado na venda.
- Relatório venda x recebimento por período.
- Relatório de delivery por motoboy por período.
- Relatório estoque preço de custo, e preço de venda

# SANDRO
- Opção de emissão de Nota Fiscal eletrônica e Cupom Fiscal (Opcionais). Emissão de .xml para enviar para contabilidade.

