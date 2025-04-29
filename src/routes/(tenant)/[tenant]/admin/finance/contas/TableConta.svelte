<script lang="ts">
  import { fade, slide, fly } from 'svelte/transition'
  import { trpc } from '$trpc/client'
  import { page } from '$app/state'

  import {
    type TableHandler,
    Datatable,
    ThSort,
    ThFilter,
    RowsPerPage,
    Th,
    Search,
    type State,
    Pagination,
  } from '@vincjo/datatables/server'
  import NoResults from '$lib/components/NoResults.svelte'
  import type {
    SelectCategoria,
    SelectConta,
    SelectSupplier,
  } from '$lib/server/db/schema'
  import { toast } from 'svelte-sonner'
  import { invalidate, invalidateAll } from '$app/navigation'
  import { DateFormatter } from '@internationalized/date'
  import type { PageData } from './$types'
  import LoadingBackground from '$lib/components/datatable/LoadingBackground.svelte'
  import { differenceInDays, getBgColor } from '$lib/utils/expire'
  import SelectFilter from '$lib/components/datatable/SelectFilter.svelte'
  import CustomThFilter from '$lib/components/datatable/CustomThFilter.svelte'
  import DateFilter from '$lib/components/DateFilter.svelte'
  import { SSRFilters } from '$lib/components/datatable/filter.svelte'
  import { formatCurrency } from '$lib/utils'
  import { Trash2 } from 'lucide-svelte'
  import SenhaAdmin from '$lib/components/SenhaAdmin.svelte'
  import ThDateFilter from '$lib/components/datatable/ThDateFilter.svelte'
  import type { SelectTenant } from '$lib/server/db/central/schema'

  let {
    table,
    totalSum,
    tenant
  }: {
    table: TableHandler<PageData['rows'][0]>
    totalSum:number
    tenant:SelectTenant
  } = $props()

  const filters = new SSRFilters()

  const df = new DateFormatter('pt-BR', {
    dateStyle: 'medium',
  })

  let isLoading = $state(false)
  let isOpenModalCancel : HTMLDialogElement | null = $state(null)

  async function pagar(id: number) {
    isLoading = true
    try {
      await trpc(page).contas.pagarConta.mutate(id)
      toast.success('Sucesso ao pagar conta')
      invalidateAll()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      isLoading = false
      // window.location.reload()
    }
  }
  async function deletar(id:number) {
    isLoading = true
    try {
      await trpc(page).contas.deletarConta.mutate(id)
      toast.success('Sucesso ao deletar conta')
      invalidateAll()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      isLoading = false
    }
  }

  let selectedId:number | null = $state(null)

  function deleteClick(contaId:number) {
    selectedId = contaId
    isOpenModalCancel?.showModal()
  }
  let value = $state({
    start: filters.getFilterValue('startDate'),
    end: filters.getFilterValue('endDate'),
  })

</script>

<div class="overflow-hidden h-[76vh]">
  <Datatable {table}>
    {#if table.isLoading}
      <LoadingBackground />
    {/if}
    <table class="table table-xs w-full">
      <thead class="bgg">
        <tr class="text-left">
          <Th>Titulo</Th>
          <Th>Observações</Th>
          <Th>Fornecedor</Th>
          <Th>Categoria</Th>
          <Th>Pago com</Th>
          <Th>Pago em</Th>
          <Th>Vence em</Th>
          <ThSort {table} field="valor_conta">Valor</ThSort>
          <Th></Th>
          <Th/>
        </tr>
        <tr>
          <ThFilter {table} field="titulo" />
          <Th />
            <SelectFilter
            {table}
              filterKey="supName"
              placeholder="o fornecedor"
              delegateQuery={trpc(page).stock.getSupplier.query}
              config={{ value: c => c.id, label: c => c.name }}
            />
            <SelectFilter
            {table}
              filterKey="catName"
              placeholder="a categoria"
              delegateQuery={trpc(page).contas.getCategorias.query}
              config={{ value: c => c.id, label: c => c.nome }}
            />
          <Th />
          <ThDateFilter {table} {filters} bind:value tenant={tenant}/>
          <Th />
          <Th />
          <Th />
          <Th/>
        </tr>
      </thead>

      <tbody>
        {#each table.rows as conta (conta.id)}
          <tr
            transition:fade|local
            class="border-t border-gray-200 transition-colors hover:bg-gray-50"
            class:opacity-50={conta.isPaid}
          >
            <td>
              <span class="tooltip tooltip-right" data-tip={conta.titulo}>
                <p class="max-w-[140px] truncate">
                  {conta.titulo}
                </p>
              </span>
            </td>
            <td class="{conta.descricao ? '' : 'text-error'}">
              <span class="tooltip tooltip-right" data-tip={conta.descricao}>
                <p class="max-w-[140px] truncate">
                  {conta.descricao ? conta.descricao : 'Não possui'}
                </p>
              </span>
            </td>
            <td>{conta.supName}</td>
            <td>{conta.catName ?? 'Não cadastrado'}</td>
            <td>{conta.pagName ?? 'Não cadastrado'}</td>
            <td>
              {conta.paid_at ? df.format(conta.paid_at) : 'Ainda não foi paga'}
            </td>
            <td>
              <span
                class=" text-sm {conta.expire_at && !conta.isPaid
                  ? getBgColor(conta.expire_at)
                  : ''} text-center"
              >
                {#if conta.expire_at}
                  {#if differenceInDays(conta.expire_at) < 0 && !conta.isPaid}
                    VENCIDO!
                  {:else if differenceInDays(conta.expire_at) === 0 && !conta.isPaid}
                    Vence hoje!
                  {:else if !conta.isPaid}
                    {differenceInDays(conta.expire_at) + ' dias'}
                  {:else}
                    ----
                  {/if}
                {/if}
              </span>
            </td>
            <td class="p-2 font-bold">
              {formatCurrency(conta.valor_conta)}
            </td>
            <!-- <td class="p-0">
              <span
                class="badge text-xs"
                class:bg-green-200={conta.isPaid}
                class:text-green-800={conta.isPaid}
                class:bg-red-200={!conta.isPaid}
                class:text-red-800={!conta.isPaid}
              >
                {conta.isPaid ? 'Pago' : 'Não pago'}
              </span>
            </td> -->
            <td>
              <button
                onclick={() => pagar(conta.id)}
                class="btn btn-sm text-xs"
                class:btn-success={!conta.isPaid}
                class:text-success-content={!conta.isPaid}
                disabled={isLoading || conta.isPaid}
              >
                {conta.isPaid ? 'PAGO' : 'Pagar'}
              </button>
            </td>
            <td>
              {#if !conta.isPaid}
              <button onclick={()=>deleteClick(conta.id)}>
                <Trash2 />
              </button>
              {/if}
            </td>
          </tr>
          
        {/each}
        <tr class="sticky bottom-0 bg-colorr">
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td class="text-xl font-bold">
            Total: <span class="text-secondary">
              {formatCurrency(totalSum)}
                
            </span>
          </td>
          <td></td>

          <td></td>
          <td></td>
        </tr>
      </tbody>
    </table>
    {#if table.rows.length === 0}
      <NoResults />
    {/if}
    {#snippet footer()}
      <RowsPerPage {table} />
      <div></div>
      <Pagination {table} />
    {/snippet}
  </Datatable>
</div>

<dialog class="modal" bind:this={isOpenModalCancel}>
  <div class="modal-box max-w-2xl">
    <SenhaAdmin
      reason="Cancelar pedido"
      onSuccess={() => {
        isOpenModalCancel?.close()
        if(selectedId !== null) {
          deletar(selectedId)
        } else {
          toast.error('Erro ao deletar conta')
        }
      }}
    />
  </div>

  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>


<style>
  .bgg {
    background-color: oklch(var(--b1)) !important;
  }

  td {
    max-width: 150px;
    padding: 3px 10px !important;
    margin: 0 !important; 
  }
  .bg-colorr {
    background-color: oklch(var(--b1)) !important;
  }
</style>
