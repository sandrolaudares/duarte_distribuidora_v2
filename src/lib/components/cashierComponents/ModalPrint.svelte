<script lang="ts">
  import type { SelectTenant } from '$lib/server/db/central/schema'
  import type { SelectCustomerOrder } from '$lib/server/db/schema'
  import { printOrderReusable } from '$lib/utils/printOrder'
  import { trpc } from '$trpc/client'
  import { getPrinterContext } from '../../../routes/(tenant)/[tenant]/admin/orders/allorders/printerContext.svelte'
  import { page } from '$app/state'
  import { toast } from 'svelte-sonner'
  import Loading from '../Loading.svelte'

  const prr = getPrinterContext()

  type Props = {
    loadingPrinters: boolean
    selectedOrder: number | null
    tenant: SelectTenant
    closeModal?: () => void
  }
  let {
    loadingPrinters = $bindable(false),
    selectedOrder = $bindable(null),
    tenant,
    closeModal,
  }: Props = $props()

  let isLoading = $state(false)

  function handleSelectedPrinter(e: Event) {
    const target = e.target as HTMLSelectElement
    localStorage.setItem('selectedPrinter', target.value)
    prr.setPrinter(target.value)
  }

  $inspect(selectedOrder)

  async function printOrder() {
    isLoading = true

    try {
      if (selectedOrder === null) {
        toast.error('Erro ao encontar o pedido')
        return
      }
      const order = await trpc(page).customer.getOrderById.query(selectedOrder)

      const infoToPrint = await printOrderReusable(tenant, order)

      if (!infoToPrint) {
        console.error('Erro ao gerar o pedido para impressão')
        return
      }

      await prr.print(infoToPrint)

      closeModal?.()
    } catch (error) {
      console.log(error)
      toast.error('Erro! Verifique se a impressora está conectada')
    } finally {
      isLoading = false
      selectedOrder = null
    }
  }
</script>

<h2 class="text-lg font-bold">Imprimir pedido</h2>
<div class="flex items-center justify-between">
  <p class="py-4">Selecione a impressora e clique em imprimir</p>
  <button
    class="badge badge-primary"
    onclick={async () => {
      loadingPrinters = true
      const newPr = await prr.listPrinters()
      if (newPr) {
        prr.setPrinters(newPr)
      }
      loadingPrinters = false
    }}
  >
    Procurar impressoras
  </button>
</div>
<div class="flex flex-col gap-4">
  <div class="flex items-end gap-2">
    <label class="form-control w-full">
      <div class="label">
        <span class="label-text">Impressoras:</span>
      </div>
      <select
        bind:value={prr.printer}
        class="select select-bordered w-full"
        onchange={handleSelectedPrinter}
        disabled={loadingPrinters}
      >
        {#if prr.printers && typeof prr.printers === 'object'}
          {#each prr.printers as printer}
            <option value={printer} selected={printer === prr.printer}>
              {printer}
            </option>
          {/each}
        {:else if prr.printers && prr.printers.length > 0}
          {prr.printer}
        {/if}
      </select>
    </label>
    <label class="form-control w-32">
      <div class="label">
        <span class="label-text">Nº Cópias</span>
      </div>
      <input
        type="number"
        class="input input-bordered w-full"
        min="1"
        bind:value={prr.copiesNum}
      />
    </label>
  </div>
  <button
    class="btn btn-primary"
    disabled={isLoading || loadingPrinters}
    onclick={printOrder}
  >
    {#if isLoading || loadingPrinters}
      <Loading />
    {:else}
      Imprimir
    {/if}
  </button>
</div>
