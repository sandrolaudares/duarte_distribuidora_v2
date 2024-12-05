<script lang="ts">
  import { CreditCard, MapPin, Truck, DollarSign } from 'lucide-svelte'
  import CurrencyInput from '../input/CurrencyInput.svelte'
  import type { SelectCustomer } from '$lib/server/db/schema'

  export let desvincular: () => void

  export let customer: SelectCustomer
  export let address: string
  export let distance: number
  export let deliveryFee: number
  export let isLoading: boolean
</script>

<div class="w-full max-w-md overflow-hidden rounded-lg bg-base-200 shadow-lg">
  <div class="px-6 py-4">
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center">
        <h2 class="text-xl font-bold">{customer.name}</h2>
        <h2>{customer.email}</h2>
      </div>
      <button class="btn btn-primary btn-sm" on:click={desvincular}>
        Desvincular
      </button>
    </div>
    <div class="space-y-4">
      <div class="flex items-center space-x-4 text-sm">
        <CreditCard class="h-4 w-4" />
        <span class="font-medium">Créditos disponiveis:</span>
        <!-- <span>{credits}</span> -->
        <slot></slot>
      </div>
      {#if address}
      <div class="flex items-start space-x-4 text-sm">
        <MapPin class="mt-0.5 h-4 w-4" />
          <div class="">
            <span class="font-medium">Endereço:</span>
            <p class="">{address}</p>
          </div>
        </div>
        {/if}
      {#if distance}
        <div class="flex items-center space-x-4 text-sm">
          <Truck class="h-4 w-4" />
          <span class="font-medium">Distancia:</span>
          <span>{(distance / 1000).toFixed(2)}Km</span>
        </div>
      {/if}
      {#if isLoading === true}
        Taxa de entrega carregando...
      {:else if deliveryFee !== null}
        <div class="flex items-center space-x-4 text-sm">
          <DollarSign class="h-4 w-4" />
          <span class="font-medium">Taxa de entrega:</span>
          <span>R${(deliveryFee / 100).toFixed(2)}</span>
        </div>
        <div class="space-y-2">
          <label for="manual-fee" class="block text-sm font-medium">
            Ajuste a taxa de entrega
          </label>
          <CurrencyInput bind:value={deliveryFee} />
        </div>
      {/if}
    </div>
  </div>
</div>
