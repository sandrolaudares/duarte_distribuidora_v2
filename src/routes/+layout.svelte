<script lang="ts">
  import { Toaster } from 'svelte-sonner'
  import '../app.css'
  import type { LayoutData } from './$types'
  import PreLoadingIndicator from './PreLoadingIndicator.svelte'
  import { navigating } from '$app/stores'

  export let data: LayoutData
</script>

{#if $navigating}
  <PreLoadingIndicator />
{/if}
<Toaster richColors closeButton />

<slot></slot>
