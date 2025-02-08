<script lang="ts">

  import { fade, slide, fly } from 'svelte/transition'
  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'

  import {
    TableHandler,
    Datatable,
    ThSort,
    ThFilter,
    Pagination,
    RowsPerPage,
    Th,
    Search,
    type State,
  } from '@vincjo/datatables/server'
  import NoResults from '$lib/components/NoResults.svelte'
  import type { SelectConta, SelectSupplier } from '$lib/server/db/schema'
  import { toast } from 'svelte-sonner'
  import { invalidate, invalidateAll } from '$app/navigation'
  import { DateFormatter } from '@internationalized/date'
  import SelectSearch from './selectSearch.svelte'

    let { table }= $props()

    const df = new DateFormatter('pt-BR', {
    dateStyle: 'medium',
  })

  let isLoading = $state(false)

  async function pagar(id: number) {
    isLoading = true
    try {
      await trpc($page).contas.pagarConta.mutate(id)
      await invalidateAll()
      toast.success('Sucesso ao pagar conta')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      isLoading = false
      window.location.reload()
    }
  }
</script>


<div class="bg-base overflow-x-auto rounded-lg shadow">
    <Datatable {table} headless>
      <table class="w-full">
        <thead>
          <tr class="bgg bg-base-200 text-left">
            <Th>Titulo</Th>
            <Th>Observações</Th>
            <Th>Fornecedor</Th>
            <Th>Categoria</Th>
            <Th>Data vencimento</Th>
            <Th>Pago em</Th>
            <ThSort {table} field="valor_conta">Valor</ThSort>
            <Th></Th>
            <Th></Th>
          </tr>
          <tr>
            <ThFilter {table} field="titulo" />
            <Th />
            <ThFilter {table} field="supName" />
            <!-- <ThFilter {table} field="catName" /> -->
            <Th />
            <Th />
            <Th>
              <!-- <DateFilter
              onchange={(start, end) => {
                if (start != null && end != null) {
                  let startDate = start.toString()
                  let endDate = end.toString()
                  filters.update({ startDate, endDate })
                }
              }}
            /> -->
            </Th>
            <Th />
            <Th />
            <Th />
          </tr>
        </thead>

        <tbody>
          {#each table.rows as conta}
            <tr
              transition:fade|local
              class="border-t border-gray-200 transition-colors hover:bg-gray-50"
              class:opacity-50={conta.isPaid}
            >
              <td class="p-3">{conta.titulo}</td>
              <td class="p-3 {conta.descricao ? '' : 'text-error'}">
                {conta.descricao ? conta.descricao : 'Não possui'}
              </td>
              <td class="p-3">{conta.supName}</td>
              <td class="p-3">{conta.catName ?? 'Não cadastrado'}</td>
              <td class="p-3">{df.format(conta.expire_at!)}</td>

              <td class="p-3">
                {conta.paid_at
                  ? df.format(conta.paid_at)
                  : 'Ainda não foi paga'}
              </td>
              <td class="p-3">R${(conta.valor_conta / 100).toFixed(2)}</td>
              <td class="p-3">
                <span
                  class="rounded px-2 py-1 text-sm font-semibold"
                  class:bg-green-200={conta.isPaid}
                  class:text-green-800={conta.isPaid}
                  class:bg-red-200={!conta.isPaid}
                  class:text-red-800={!conta.isPaid}
                >
                  {conta.isPaid ? 'Pago' : 'Não pago'}
                </span>
              </td>
              <td class="p-3">
                <button
                  onclick={() => pagar(conta.id)}
                  class="btn btn-sm"
                  class:btn-success={!conta.isPaid}
                  class:text-success-content={!conta.isPaid}
                  disabled={isLoading || conta.isPaid}
                >
                  {conta.isPaid ? 'PAGO' : 'Pagar'}
                </button>
              </td>
            </tr>
          {/each}
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

  <style>
    .bgg {
      background-color: oklch(var(--b2)) !important;
    }
  </style>
  