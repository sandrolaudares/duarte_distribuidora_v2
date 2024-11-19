<script lang="ts">
  import { onMount } from 'svelte'
  import { fade, fly } from 'svelte/transition'
  import { CheckCircle } from 'lucide-svelte'
  import type {
    SelectStockTransference,
    SelectTenant,
  } from '$lib/server/db/central/schema'
  import { format } from 'date-fns'

  export let transferDetails: SelectStockTransference

  export let tenant: SelectTenant
  let showDetails = false

  onMount(() => {
    setTimeout(() => {
      showDetails = true
    }, 500)
  })
</script>

<div
  class="w-full max-w-md space-y-8 rounded-xl bg-white p-6 shadow-md"
  in:fade={{ duration: 300 }}
>
  <div class="text-center">
    <CheckCircle class="mx-auto h-12 w-12 text-green-500" />
    <h2 class="mt-6 text-3xl font-extrabold ">
      Solicitado com sucesso!
    </h2>
    <p class="mt-2 text-sm text-gray-600">
      Sua solicitação de transferencia foi realizada!
    </p>
  </div>

  {#if showDetails}
    <div class="mt-8 space-y-6" in:fly={{ y: 20, duration: 300 }}>
      <div class="rounded-md bg-base-200 p-4">
        <dl class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt class="font-medium opacity-50">Status:</dt>
          <dd class="">Solicitado</dd>
          <dt class="font-medium opacity-50">Saindo de:</dt>
          <dd class="">A decidir</dd>
          <dt class="font-medium opacity-50">Entrando em:</dt>
          <dd class="">{tenant.name}</dd>
          <dt class="font-medium opacity-50">Pedido realizado em:</dt>
          <dd class="">
            {transferDetails.created_at
              ? format(
                  new Date(transferDetails.created_at),
                  'dd/MM/yyyy - hh:m',
                )
              : ''}
          </dd>
        </dl>
      </div>

      <div
        class="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0"
      >
        <a
          href="/transferencias"
          class="btn"
        >
          Ver todas solicitações
        </a>
        <button
          on:click={() => {
            window.location.reload()
          }}
          class="btn btn-primary"
        >
          Criar nova solicitação
        </button>
      </div>
    </div>
  {/if}
</div>
