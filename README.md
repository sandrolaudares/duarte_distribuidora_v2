## License Notice

This repository is intentionally unlicensed and adheres
to a [no-permission license](https://choosealicense.com/no-permission/), as
defined by [GitHub](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository#choosing-the-right-license).
By accessing this repository, you acknowledge and agree to the following terms:

- You are **not permitted to copy, distribute, or modify** any part of this repository.
- Access to this repository is provided **exclusively for personal use** on your local machine. Any other use, including use in commercial projects, is prohibited.
- Redistribution of any part of this repository or its contents, whether publicly or privately, is strictly prohibited.

Violation of these terms will result in revocation of access.


### Installation

Clone the repository and install the dependencies:

```bash
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

## PRONTOS

- TABLE FIADO PODER SELECIONAR E MOSTRAR TOTAL DOS SELECIONADOS ✅
- SALVAR LAT E LONG DA DISTRIBUIDORA NO DB ✅
- TELA CLIENTE TROCAR CARD POR TABLE DE PEDIDOS - ✅
- ARREDONDAR VALOR DA TAXA DE ENTREGA ✅
- NOME MOTOBOY NO CARD TELA PEDIDOS ✅
- COMPONENTE PARA EDITAR DADOS NAS TABLES ✅
- FILTRAR POR MOTOBOY NA TELA DE PEDIDOS ✅
- MOSTRAR CRÉDITO DO CLIENTE NA TELA DO CAIXA ✅
- COPIAR SIDE BAR SHADCN ✅
- CHECAR O SUM PAGINA CUSTOMER/ID ✅
- CHECKBOX TABELA FIADO PRA MOSTRAR TOTAL APENAS DAS SELECIONADAS ✅
- ADICIONAR NO METADATA DO USUARIO UM CAIXA DESIGNADO A ELE ✅ -- Falta
  adicionar a opcao na tela de permissoes ✅ -- Butao do caixa admin na navbar
  dar redirect direto pro caixa dele ✅
- CADASTRAR MOTOBOY ✅
- TELA FIADO FILTRAR PAGAMENTOS ATRASADOS ✅
- Preco km tabela distribuidora ✅ + infos tabela distribuidora ✅- Delete
  deliveryFee Table✅
- Verificar sidebar não mostra todos itens ao logar ✅
- Poder cancelar pedidos aceitos, pedir senha master✅
- CHECAR O SUM PAGINA CUSTOMER/ID✅
- EDITAR DATA VENCIMENTO (EXIPIRE_AT) ✅
- REFATORAR ONDE MOSTRA AS INFOS DO CLINTE NA PAGINA DO CAIXA✅
- REPASSE ESTOQUE ENTRE DISTRIBUIDORAS✅
- NO CAIXA FAZER ENDEREÇO/MOTOBOY/CLIENTE SELECIONADO VIRAREM STORE ✅
- PODER EDITAR OS PEDIDOS/CANCELAR PEDIDOS ✅
- 100 rows como padrao nas table✅

## PARCIAL PRONTOS OU APENAS REVISAR/AJUSTAR

- boolean pra esconder produtos do cardapio ✅
- Verificar name filter fiado ✅
- Editar motoboy pedidos aceitos
- PODER EDITAR INFOS DISTRIBUIDORA NO /TENANT - perfil da distribuidora ✅
- Contas a pagar, nova tabela (Preciso que inclua nas guias a esquerda contas a
  pagar. Essa guia deve ter a categoria da dívida, fornecedor (já cadastrado em
  fornecedores), descrição, data de vencimento e valor. A conta fica
  cadastradastra, financeiro realiza o pagamento na data correta, esse histórico
  precisa ficar registrado, pois em relatórios vamos precisar comparar vendas x
  despesas pra analisar o lucro mensal.) ✅
- AJustar form criar tenant erros de endereco ✅
- DIMENSÕES TELA CAIXA, CABER EM TELAS MENORES ✅
- Editar nome SKU ✅
- APLICAR EDITABLECELL NAS TABLES EXISTENTES ✅
- Limpar filtros✅

## IMPORTANTES


## FAZER AGORA

- Alterar join do caixa na tela da transacao do caixa
- TRANSAÇÕES DO CAIXA (TELAS)
- Unique name table de categoria
- Preco de custo nas transferencias e tela historico transafarencias tipo tela
  fiado com total e valor do preço de custo
- Parte do cliente fazer pedido 
- TELA RESUMO DE CADA MOTOBOY ENTREGAS
- Toggle tipo preço ao editar pedido
- loading login

## NAO TAO URGENTE

- Refazer setar cargo ao user, não ta funcionando legal
- Permissoes no trpc pra cada func
- Colunas na tabela dos logs/Refatorar tela/melhorar
- Excluir sku e setar produto como null pro sku
- Contas cadastrar forma de pagamento

- Alerta de compra em excesso ex, bloqueio automático caso tenha notas em
  atraso. (Desbloqueio somente com senha de gerente).
- Adicionar campo de distancia na tabela endereço (calcular ao adicionar
  endereço talvez) acho legal adicionar um butao de recalcular
- Responsividade site inteiro

## DEPOIS

- SCORE DO CLIENTE/PONTUACAO. - Cliente pagou fiado em dia ganha 5 pontos, pagou
  atrasado perde 5 pontos. Esse score atualiza automaticamente toda vez que ele
  efetuar um pagamento. Pra auxiliar na tomada de decisões junto aos clientes pj
  que compram fiado.
- Uma tela tipo um admin dashboard pro estoque, pra poder acessar transferencia,
  etc

# RELATORIOS:

- Vendas por período.
- Recebimentos por períodos, dia e semana, mês.
- Cliente inadimplentes.
- Vendas comparando dia atual com mesmo dia do mês passado, mês atual com mesmo
  mês do ano passado.
- Relatório de estoque crítico, baseado na venda.
- Relatório venda x recebimento por período.
- Relatório de delivery por motoboy por período.
- Relatório estoque preço de custo, e preço de venda

# SANDRO

- Opção de emissão de Nota Fiscal eletrônica e Cupom Fiscal (Opcionais). Emissão
  de .xml para enviar para contabilidade.



# MATHEUS 


- Consertar graficos
 1 - levar em considerao quando o dataset de comparacao nao existe
 2 - quando as labels sao diferente (exemplo produtos mais vendidos)

- Adicionar comparacao das outras queries no page.server de vendas