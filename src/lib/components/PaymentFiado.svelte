<script lang="ts">
  import { run } from 'svelte/legacy';

  import type {
    InsertOrderPayment,
    SelectOrderPayment,
  } from '$lib/server/db/schema'
  import { formatCurrency, icons } from '$lib/utils'
  import type { RouterOutputs } from '$trpc/router'
  import { toast } from 'svelte-sonner'
  import CardPayments from './cards/CardPayments.svelte'
  import CurrencyInput from './input/CurrencyInput.svelte'
  import PaymentCashier from './PaymentCashier.svelte'
  import { trpc } from '$trpc/client'
  import { page } from '$app/state'
  import { modal } from './modal'
  import { onMount } from 'svelte'
  import { CircleAlert } from 'lucide-svelte'
  import * as Alert from '$lib/components/ui/alert/index'
  import { Button } from '$lib/components/ui/button/index'
  import Separator from './ui/separator/separator.svelte'
  import Loading from './Loading.svelte'
  import { invalidateAll } from '$app/navigation'

  interface Props {
    order_id: number;
    closeFn: undefined | (() => void);
    total_pedido?: number;
    amount_paid_order: number;
  }

  let {
    order_id,
    closeFn,
    total_pedido = 0,
    amount_paid_order
  }: Props = $props();

  let isLoading = $state(false)

  async function save() {
    isLoading = true
    try {
      if (newPayments.length >= 1) {
        for (let newPayment of newPayments) {
          await trpc(page).customer.insertOrderPayment.mutate(newPayment)
        }
      }

      toast.success('Pedido atualizado com sucesso!')
      window.location.reload()
      closeFn?.()
      isLoading = false
    } catch (error) {
      console.error(error)
      toast.error('Erro ao atualizar pagamento')
      isLoading = false
    }
  }

  let newPayments: InsertOrderPayment[] = $state([])

  let total_paid_newPayments = $derived.by(() => {
    return(
      newPayments.reduce((acc, payment) => acc + payment.amount_paid, 0) -
      newPayments.reduce((acc, payment) => acc + (payment.troco ?? 0), 0)
    )
  });

  let valor_a_pagar = $state(0);

  $effect.pre(()=>{
    valor_a_pagar = total_pedido - total_paid_newPayments - amount_paid_order
  })

  let valor_recebido_dinheiro = $state(0)

  let troco = $derived(
    valor_recebido_dinheiro - valor_a_pagar
  );

  let metodo_pagamento: InsertOrderPayment['payment_method'] | null = $state(null)

  let isDiferent = $state(false)
  let isPago = $state(false)
  let isDinheiro = $state(false)
  let isFiado = $state(false)

  function divideValor(n: number) {
    valor_a_pagar = total_pedido - total_paid_newPayments - amount_paid_order
    valor_a_pagar = valor_a_pagar / n
  }

  function addPayment() {
    if (metodo_pagamento === null) {
      toast.error('Nenhum metodo de pagamento selecionado!')
      return
    }

    if (valor_a_pagar <= 0) {
      toast.error('O valor a pagar não pode ser zero ou negativo!')
      return
    }

    if (metodo_pagamento === 'dinheiro' && troco < 0) {
      toast.error('Valor não pode ser menor que o valor a pagar')
      return
    }

    if (metodo_pagamento === 'dinheiro' && valor_recebido_dinheiro <= 0) {
      toast.error('O valor recebido em dinheiro não pode ser zero ou negativo!')
      return
    }

    if (total_paid_newPayments >= total_pedido) {
      toast.error('O valor pago não pode exceder o valor do pedido!')
      return
    }

    newPayments.push({
      amount_paid: isDinheiro ? valor_recebido_dinheiro : valor_a_pagar,
      status: 'CONFIRMED',
      payment_method: metodo_pagamento,
      troco: isDinheiro ? troco : null,
      order_id: order_id,
    })
    isDinheiro = false
    isPago = false
    isDiferent = true
    isFiado = false
    metodo_pagamento = null
    newPayments = [...newPayments]
  }
</script>

<div class="flex flex-col gap-2">
  <!-- <h1 class="text-center">
      Valor à pagar: <span class="font-bold text-success">
        R${(payment.amount_paid / 100).toFixed(2)}
      </span>
    </h1> -->
  <h1 class="mb-2 text-center">
    Valor à pagar: <span class="font-bold text-success">
      {formatCurrency(total_pedido - amount_paid_order)}
    </span>
  </h1>
  <div
    class="flex {total_pedido === total_paid_newPayments ||
    total_pedido < total_paid_newPayments
      ? 'flex-col-reverse'
      : 'flex-col'}"
  >
    {#if total_pedido <= amount_paid_order + total_paid_newPayments}
      <div class="mt-3 flex w-full flex-col items-center justify-center gap-2">
        <div class="badge badge-success gap-2">
          Valor total to pedido foi pago!
        </div>
        <button
          class="btn btn-secondary w-full"
          onclick={save}
          disabled={isLoading}
        >
          {isLoading
            ? 'Carregando...'
            : 'CLIQUE AQUI PARA CONFIRMAR O PAGAMENTO'}
        </button>
      </div>
    {:else}
      <div class="flex flex-col gap-3">
        {#if isDiferent || isPago || isDinheiro}
          <button
            class="btn btn-secondary"
            disabled={newPayments.length > 0}
            onclick={() => {
              isDiferent = false
              isPago = false
              isDinheiro = false
              metodo_pagamento = null
              valor_recebido_dinheiro = 0
              valor_a_pagar = total_pedido
            }}
          >
            {@html icons.back()}
            Voltar
          </button>
        {:else}
          <h1 class="text-center text-xl">Qual metodo de pagamento?</h1>
        {/if}
        {#if isDiferent}
          <label class="form-control w-full items-center">
            <div class="label">
              <span class="label-text">
                Digite aqui o valor para este pagamento
              </span>
            </div>

            <div>
              <CurrencyInput bind:value={valor_a_pagar} />
              <button class="btn mt-2" onclick={() => divideValor(4)}>
                25%
              </button>
              <button class="btn" onclick={() => divideValor(2)}>50%</button>
              <button class="btn" onclick={() => divideValor(1.25)}>
                75%
              </button>
              <button
                class="btn"
                onclick={() =>
                  (valor_a_pagar = total_pedido - total_paid_newPayments - amount_paid_order)}
              >
                100%
              </button>
              <!--TODO: Fix valor_a_pagar nao atualiza no currency input-->
            </div>
            <p>
              Valor restante do pedido:
              {formatCurrency(
                total_pedido - total_paid_newPayments - amount_paid_order,
              )}
            </p>
          </label>
        {/if}
        {#if isPago}
          <div class="label">
            <span class="label-text">
              Selecione o metodo utilizado para pagar:
            </span>
          </div>
          <select
            class="select select-bordered w-full"
            bind:value={metodo_pagamento}
          >
            <option disabled selected={true}>Qual foi o metodo?</option>
            <option value="credit_card">Cartão de crédito</option>
            <option value="debit_card">Cartão de debito</option>
            <option value="pix">Pix</option>
          </select>
        {:else if isDinheiro}
          <div class="flex w-full items-center justify-center gap-4">
            <label class="form-control w-full gap-2">
              <div class="label">
                <span class="label-text">Valor recebido:</span>
                <span class="label-text-alt">(Valor pago pelo cliente)</span>
              </div>
              <CurrencyInput bind:value={valor_recebido_dinheiro} />
            </label>
          </div>
          {#if valor_recebido_dinheiro && (valor_recebido_dinheiro >= total_pedido || valor_recebido_dinheiro >= valor_a_pagar) && troco > 0}
            <h1 class="font-lg">
              Troco do cliente: <span class="font-bold">
                {formatCurrency(troco)}
              </span>
            </h1>
          {/if}
        {:else}
          {#if !isDiferent}
            <button
              class="btn btn-primary"
              onclick={() => {
                isDiferent = !isDiferent
              }}
            >
              PAGAMENTO PARCIAL
              {@html icons.divide()}
            </button>
          {/if}
          <!-- {#if cliente_selecionado && !isDiferent}
            <button
              class="btn btn-primary w-full"
              on:click={() => {
                isFiado = true
              }}
            >
              FIADO
              {@html icons.fiado()}
            </button>
          {/if} -->
          <button
            class="btn btn-primary w-full"
            onclick={() => {
              isPago = true
              isDinheiro = false
              isFiado = false
            }}
          >
            PAGO
            {@html icons.paid()}
          </button>
          <button
            class="btn btn-primary w-full"
            onclick={() => {
              isDinheiro = true
              isPago = false
              isFiado = false
              metodo_pagamento = 'dinheiro'
            }}
          >
            DINHEIRO
            {@html icons.cashColor()}
          </button>
        {/if}
        {#if isDiferent || isPago || isDinheiro || isFiado}
          <hr />
          <button
            class="btn btn-primary w-full"
            onclick={addPayment}
            disabled={!(metodo_pagamento === 'dinheiro'
              ? valor_recebido_dinheiro >= valor_a_pagar
              : metodo_pagamento) || metodo_pagamento === null}
          >
            ADICIONAR PAGAMENTO
          </button>
        {/if}
      </div>
    {/if}
    {#if newPayments.length > 0}
      <div class="mt-5">
        <h3 class="mb-2 text-xl font-medium">Resumo dos pagamentos</h3>
        {#if total_paid_newPayments < total_pedido && total_paid_newPayments - amount_paid_order != 0}
          <Alert.Root
            variant="destructive"
            class="border-destructive/30 bg-destructive/10"
          >
            <CircleAlert class="h-4 w-4" />
            <Alert.Description class="flex flex-col gap-2">
              <p>
                Foi pago: {formatCurrency(total_paid_newPayments)} mas ainda faltam{' '}
                <span class="font-semibold text-destructive">
                  {formatCurrency(
                    total_pedido - total_paid_newPayments - amount_paid_order,
                  )}
                </span>
              </p>

              <div class="flex items-center gap-2">
                <p>
                  Deseja que o valor restante {formatCurrency(
                    total_pedido - total_paid_newPayments - amount_paid_order,
                  )} seja pago como fiado?
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  class="border-destructive text-destructive hover:bg-destructive/10"
                  onclick={save}
                  disabled={isLoading}
                >
                {#if isLoading}
                  <Loading/>
                {:else}
                Pagar depois
                {/if}
                </Button>
              </div>
            </Alert.Description>
          </Alert.Root>
        {/if}

        <h3 class="mb-2 mt-4 text-lg font-medium">Pagamentos feitos:</h3>
        {#each newPayments as payment, i}
          <div class="my-3 flex flex-col">
            <CardPayments {payment} {i} created_by='' />
          </div>
        {/each}
        <Separator class="my-2 bg-gray-200" />

        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <span>Total do pedido</span>
            <span>{formatCurrency(total_pedido)}</span>
          </div>
          <div class="flex items-center justify-between">
            <span>Total pago</span>
            <span>{formatCurrency(total_paid_newPayments + amount_paid_order)}</span>
          </div>
          <div class="flex items-center justify-between">
            <span>Restante</span>
            <span class="text-error">
              {formatCurrency(
                total_pedido - total_paid_newPayments - amount_paid_order,
              )}
            </span>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
