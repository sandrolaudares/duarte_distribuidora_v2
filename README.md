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


## TODOs

- TELA CLIENTE TROCAR CARD POR TABLE DE PEDIDOS - ✅
- TELA RESUMO DE CADA MOTOBOY ENTREGAS
- ARREDONDAR VALOR DA TAXA DE ENTREGA ✅
- DIMENSÕES TELA CAIXA, CABER EM TELAS MENORES
- NOME MOTOBOY NO CARD TELA PEDIDOS ✅
- FILTRAR POR MOTOBOY NA TELA DE PEDIDOS ✅
- PODER EDITAR OS PEDIDOS/CANCELAR PEDIDOS
- ADICIONAR NO METADATA DO USUARIO UM CAIXA DESIGNADO A ELE
- TELA FIADO FILTRAR PAGAMENTOS ATRASADOS 
- EDITAR DATA VENCIMENTO (EXIPIRE_AT)
- MOSTRAR CRÉDITO DO CLIENTE NA TELA DO CAIXA ✅
- SALVAR LAT E LONG DA DISTRIBUIDORA NO DB
- REPASSE ESTOQUE ENTRE DISTRIBUIDORAS
- CADASTRAR MOTOBOY
- NO CAIXA FAZER ENDEREÇO/MOTOBOY/CLIENTE SELECIONADO VIRAREM STORE
- TRANSAÇÕES DO CAIXA (TELAS)
- Alerta de compra em excesso ex, bloqueio automático caso tenha notas em atraso. (Desbloqueio somente com senha de gerente). 
- SCORE DO CLIENTE/PONTUACAO. - Cliente pagou fiado em dia ganha 5 pontos, pagou atrasado perde 5 pontos. Esse score atualiza automaticamente toda vez que ele efetuar um pagamento. Pra auxiliar na tomada de decisões junto aos clientes pj que compram fiado.
- Opção de emissão de Nota Fiscal eletrônica e Cupom Fiscal (Opcionais). Emissão de .xml para enviar para contabilidade.
- Parte do cliente fazer pedido
- Adicionar campo de distancia na tabela endereço (calcular ao adicionar endereço talvez)
- CHECKBOX TABELA FIADO PRA MOSTRAR TOTAL APENAS DAS SELECIONADAS
- COMPONENTE PARA EDITAR DADOS NAS TABLES ✅
- APLICAR EDITABLECELL NAS TABLES EXISTENTES
- PODER PAGAR PARCIAL COM FIADO: EX: PAGAR APENAS PARTE DO PEDIDO E DEIXAR O RESTO FIADO
- TABLE FIADO PODER SELECIONAR E MOSTRAR TOTAL DOS SELECIONADOS
- CHECAR O SUM PAGINA CUSTOMER/ID
- REFATORAR ONDE MOSTRA AS INFOS DO CLINTE NA PAGINA DO CAIXA


# RELATORIOS:
- Vendas por período.
- Recebimentos por períodos, dia e semana, mês.
- Cliente inadimplentes.
- Vendas comparando dia atual com mesmo dia do mês passado, mês atual com mesmo mês do ano passado.
- Relatório de estoque crítico, baseado na venda.
- Relatório venda x recebimento por período.
- Relatório de delivery por motoboy por período.
- Relatório estoque preço de custo, e preço de venda

