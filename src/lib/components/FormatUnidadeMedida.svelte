<script lang="ts">
  import type { AlimentType } from '$lib/utils/enums'

  type Props = {
    tipo: AlimentType
    unidade: number
  }

  let { tipo, unidade }: Props = $props()
</script>

{#if tipo === 'Alimento'}
  {(unidade / 1000).toFixed(2)} Kg
{:else if tipo === 'Bebida'}
  {#if unidade > 1000}
    {(unidade / 1000).toFixed(2)} L
  {:else}
    {unidade} ML
  {/if}
{:else}
  {unidade}
{/if}
