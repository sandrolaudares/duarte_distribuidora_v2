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

<div class="h-full max-h-[68vh] p-0 m-0">
  <Datatable {table} >
    <table class="w-full table table-xs">
      <thead class="bgg">
        <tr class="text-left">
          <Th>Titulo</Th>
          <Th>Observações</Th>
          <Th>Fornecedor</Th>
          <Th>Categoria</Th>
          <Th>Data vencimento</Th>
          <Th>Pago com</Th>
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
            <td>{conta.titulo}</td>
            <td class="p-2 {conta.descricao ? '' : 'text-error'}">
              {conta.descricao ? conta.descricao : 'Não possui'}
            </td>
            <td>{conta.supName}</td>
            <td>{conta.catName ?? 'Não cadastrado'}</td>
            <td>{df.format(conta.expire_at!)}</td>
            <td>{conta.pagName ?? "Não cadastrado"}</td>
            <td>
              {conta.paid_at
                ? df.format(conta.paid_at)
                : 'Ainda não foi paga'}
            </td> 
            <td class="p-2 font-bold">R${(conta.valor_conta / 100).toFixed(2)}</td>
            <td class="p-0">
              <span
                class="badge text-xs"
                class:bg-green-200={conta.isPaid}
                class:text-green-800={conta.isPaid}
                class:bg-red-200={!conta.isPaid}
                class:text-red-800={!conta.isPaid}
              >
                {conta.isPaid ? 'Pago' : 'Não pago'}
              </span>
            </td>
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
      background-color: oklch(var(--b1)) !important;
    }
  </style>
  