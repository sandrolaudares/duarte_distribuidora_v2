<script lang="ts">
  import TransactionsModal from './TransactionsModal.svelte'
  import CurrencyInput from '$lib/components/input/CurrencyInput.svelte'
  import type { PageData } from './$types'
  import { icons } from '$lib/utils/icons'
  import { toast } from 'svelte-sonner'

  import { trpc } from '$trpc/client'
  import { page } from '$app/state'

  import { modal } from '$components/modal'
  import CaixaColumn from './CaixaColumn.svelte'
  import type { InsertOrderPayment } from '$lib/server/db/schema'
  import PaymentCashier from '$lib/components/PaymentCashier.svelte'
  import CardapioCaixa from './CardapioCaixa.svelte'
  import CaixaLeftColumn from './CaixaLeftColumn.svelte'
  import { getCartContext } from '$lib/state/contextCashier/cartContext.svelte'
  import AlertaFechar from './AlertaFechar.svelte'
  import { goto, invalidate, invalidateAll } from '$app/navigation'
  import Alert from '$lib/components/modal/base/Alert.svelte'
  import Loading from '$lib/components/Loading.svelte'
  import HandleFecharCaixa from './HandleFecharCaixa.svelte'
  import type { RouterOutputs } from '$trpc/router'
  import LoadingBackground from '$lib/components/datatable/LoadingBackground.svelte'
  import { getPrinterContext } from '../../orders/allorders/printerContext.svelte'
  import ModalPrint from '$lib/components/cashierComponents/ModalPrint.svelte'
  import ModalSangria from '$lib/components/cashierComponents/ModalSangria.svelte'

  const cart = getCartContext()
  const prr = getPrinterContext()

  let { data }: { data: PageData } = $props()

  let { caixa, user, products } = $state(data)

  let filteredProducts = products

  let isOpenModal: HTMLDialogElement | null = null

  let tipo_preco: 'retail_price' | 'wholesale_price' = $state('retail_price')

  let observacao: string = $state('')

  let isPrintOrder = $state(true)

  async function createOrder(payments: Omit<InsertOrderPayment, 'order_id'>[]) {
    let total = Object.values(cart.cart).reduce((acc, item) => {
      return (
        acc +
        item.item[item.meta.is_retail ? 'retail_price' : 'wholesale_price'] *
          item.quantity
      )
    }, 0)
    if (cart.meta.isDelivery && !cart.meta.motoboySelecionado) {
      toast.error('Selecione um motoboy para pedidos delivery')
      return
    }
    try {
      console.log(cart.meta.enderecoSelecionado)
      const resp = await trpc(page).customer.order.insetPaidOrder.mutate({
        order_info: {
          customer_id: cart.meta.clienteSelecionado?.id,
          address_id: cart.meta.enderecoSelecionado?.id,
          total: total,
          observation: observacao,
          motoboy_id: cart.meta.isDelivery
            ? cart.meta.motoboySelecionado?.id
            : undefined,
          type: 'ATACADO',
          //TODO: Type
          cashier_id: caixa.id,
          payment_info: payments,
          taxa_entrega: cart.meta.isDelivery ? cart.meta.taxaEntrega : 0,
        },
        order_items: Object.values(cart.cart).map(item => ({
          product_id: item.item.id,
          quantity: item.quantity,
          price:
            item.item[item.meta.is_retail ? 'retail_price' : 'wholesale_price'],
        })),
      })
      if (!resp) {
        toast.error('Erro ao criar pedido')
        return
      }
      selectedOrder = resp.order.id

      if (isPrintOrder) {
        await handleOpenModal()
      }

      toast.success('Pedido realizado com sucesso!')

      reset()
      await invalidateAll()
      caixa = data.caixa
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  function reset() {
    setTimeout(() => {
      modal.close()
      cart.meta.clienteSelecionado = null
      cart.meta.enderecoSelecionado = null
      cart.meta.motoboySelecionado = null
      cart.meta.isDelivery = false
      cart.clear()
    }, 300)
  }

  async function orderWaiting() {
    let total = Object.values(cart.cart).reduce((acc, item) => {
      return (
        acc +
        item.item[item.meta.is_retail ? 'retail_price' : 'wholesale_price'] *
          item.quantity
      )
    }, 0)
    if (cart.meta.isDelivery && !cart.meta.motoboySelecionado) {
      toast.error('Selecione um motoboy para pedidos delivery')
      return
    }
    try {
      const resp = await trpc(page).customer.order.insertOrderWaiting.mutate({
        order_info: {
          customer_id: cart.meta.clienteSelecionado?.id || 0,
          address_id: cart.meta.enderecoSelecionado?.id || 0,
          total: total,
          observation: observacao,
          motoboy_id: cart.meta.motoboySelecionado?.id || '0',
          type: 'ATACADO',
          //TODO: Type
          cachier_id: caixa.id,
          taxa_entrega: cart.meta.isDelivery ? cart.meta.taxaEntrega : 0,
        },
        order_items: Object.values(cart.cart).map(item => ({
          product_id: item.item.id,
          quantity: item.quantity,
          price:
            item.item[item.meta.is_retail ? 'retail_price' : 'wholesale_price'],
        })),
      })
      if (!resp) {
        toast.error('Erro ao criar pedido')
        return
      }

      selectedOrder = resp.order.id
      if (isPrintOrder) {
        await handleOpenModal()
      }

      toast.success('Pedido realizado com sucesso!')
      reset()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  let dinheiro_caixa = $state(0)

  let loadingAbrir = $state(false)

  async function handleAbrirCaixa() {
    loadingAbrir = true
    try {
      await trpc(page).distribuidora.abrirCaixa.mutate({
        id: caixa.id,
        data: {
          amount: dinheiro_caixa,
          status: caixa.status,
        },
      })
      toast.success('Caixa aberto com sucesso!')
      await invalidateAll()
      caixa = data.caixa
      user = data.user
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      loadingAbrir = false
    }
  }

  async function closeCashierModal() {
    await loadTransactions()
    if(transactions) {
      modal.open(HandleFecharCaixa, {
        caixa: caixa,
        transactions: transactions
      })
    } else {

    }
  }

  async function handleModalSangria() {
    modal.open(ModalSangria, {
      caixa_id: caixa.id,
      handleInvalidate: async () => {
        await invalidateAll()
        caixa = data.caixa
      },
    })
  }

  let isOpenModalTransactions: HTMLDialogElement | null = $state(null)

  async function pagamentoModal() {
    let total = Object.values(cart.cart).reduce((acc, item) => {
      return (
        acc +
        item.item[item.meta.is_retail ? 'retail_price' : 'wholesale_price'] *
          item.quantity
      )
    }, 0)
    modal.open(PaymentCashier, {
      total_pedido: cart.meta.isDelivery
        ? total + cart.meta.taxaEntrega
        : total,
      payments: [],
      cashier_id: caixa.id,
      observacao,
      save: payments => {
        createOrder(payments)
      },
      nulla: () => {
        reset()
      },
    })
  }

  let transactions:
    | RouterOutputs['stock']['getRecentTransaoEstoque']
    | undefined = $state()

  let loadingTransactions = $state(true)

  async function loadTransactions() {
    try {
      transactions = await trpc(page).stock.getRecentTransaoEstoque.query(
        caixa.id,
      )
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      loadingTransactions = false
    }
  }

  let isOpenModalPrint: HTMLDialogElement | null = $state(null)
  let loadingPrinters = $state(false)
  let selectedOrder: number | null = $state(null)

  async function handleOpenModal() {
    loadingPrinters = true

    await prr.connect()

    if (prr.getPrinter() && prr.getPrinters().length === 0) {
      prr.addPrinter(prr.getPrinter())
    } else if (!prr.getPrinter()) {
      await prr.listPrinters()
    }

    isOpenModalPrint?.showModal()
    loadingPrinters = false
  }
</script>

{#if loadingPrinters}
  <LoadingBackground />
{/if}

<dialog class="modal" bind:this={isOpenModalPrint}>
  <div class="modal-box max-w-2xl">
    <form method="dialog">
      <button class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">
        ✕
      </button>
    </form>

    <ModalPrint
      bind:loadingPrinters
      tenant={data.tenant!}
      bind:selectedOrder
      closeModal={() => {
        isOpenModalPrint?.close()
      }}
    />
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

{#if caixa.status === 'Fechado' && user && user.meta.caixa_id === undefined}
  <div class="flex flex-col items-center justify-center">
    <h1 class="font-semibold">Abrir o {caixa.name}</h1>
    <label class="form-control w-full max-w-xs gap-2">
      <div class="label justify-center">
        <span class="label-text">Digite o valor no caixa!</span>
      </div>
      <CurrencyInput bind:value={dinheiro_caixa} />
      <button
        class="btn btn-primary"
        disabled={loadingAbrir}
        onclick={handleAbrirCaixa}
      >
        Abrir caixa
      </button>
    </label>
  </div>
{:else if user && (user.meta.caixa_id === caixa.id || user.role != 'caixa')}
  <AlertaFechar cashier={caixa} tenant={data.tenant!} />
  <div class="mb-3 flex justify-center gap-2">
    <button
      class="btn btn-primary"
      onclick={() => {
        loadTransactions()
        isOpenModalTransactions?.showModal()
      }}
    >
      Ver transacoes do dia
    </button>
    <button class="btn btn-secondary" onclick={handleModalSangria}>
      Retirar dinheiro (Sangria/retirada)
    </button>
    <button class="btn btn-error" onclick={closeCashierModal}>
      Fechar caixa
    </button>
  </div>
  <div class="mt-15 m-4 flex flex-col justify-center gap-4 lg:flex-row">
    <CaixaLeftColumn
      {user}
      fee={data.tenant?.taxa_por_km ?? 0}
      bind:tipo_preco
    />
    <div
      class="col-auto rounded-lg border-4 border-secondary border-opacity-50 p-3 lg:w-1/3"
    >
      <CaixaColumn />
    </div>

    <div class="col-auto flex h-auto flex-col justify-between gap-2">
      <div>
        <button
          class="btn btn-primary w-full"
          onclick={() => isOpenModal?.showModal()}
        >
          ACESSAR PRODUTOS {@html icons.basket()}
        </button>
        <p class="mb-2 mt-4">Observações sobre compra:</p>
        <textarea
          bind:value={observacao}
          placeholder="Anotar observacões..."
          class="textarea textarea-bordered textarea-lg mb-5 w-full"
        ></textarea>
      </div>
      <div class="flex flex-col gap-2">
        <label class="fieldset-label flex items-center justify-center gap-2">
          Imprimir notinha?
          <input type="checkbox" class="checkbox" bind:checked={isPrintOrder} />
        </label>
        <button
          class="btn btn-secondary w-full disabled:bg-opacity-50"
          disabled={Object.values(cart.cart).length === 0 ||
            !cart.meta.motoboySelecionado}
          onclick={orderWaiting}
        >
          <span class="mr-1">PREPARAR PARA ENTREGA</span>
        </button>
        <!-- <button class="btn btn-primary w-full disabled:bg-opacity-50">
          <span class="mr-1">IMPRIMIR</span>
          {@html icons.print()}
        </button> -->
        <button
          class="btn btn-primary w-full disabled:bg-opacity-50"
          disabled={Object.values(cart.cart).length === 0}
          onclick={pagamentoModal}
        >
          <span class="mr-1">PAGAMENTO</span>
          {@html icons.dolar()}
        </button>
      </div>
    </div>
  </div>
{:else if user && user.meta.caixa_id != caixa.id}
  <div
    class="container my-auto flex items-center justify-center gap-3 text-center text-xl"
  >
    Você já está em um caixa ou o caixa foi aberto por outra pessoa!
  </div>
{/if}

<dialog class="modal" bind:this={isOpenModal}>
  <div class="modal-box max-w-4xl">
    <CardapioCaixa products={filteredProducts} {tipo_preco} />
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<dialog class="modal" bind:this={isOpenModalTransactions}>
  <div class="modal-box max-w-4xl text-center">
    <form method="dialog">
      <button class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">
        ✕
      </button>
    </form>
    <TransactionsModal
      {caixa}
      {transactions}
      bind:isLoading={loadingTransactions}
    />
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
