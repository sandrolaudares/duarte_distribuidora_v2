<script lang="ts">
  import { Toaster } from 'svelte-sonner'
  import '../app.css'
  import type { LayoutData } from './$types'
  import PreLoadingIndicator from './PreLoadingIndicator.svelte'
  import { navigating } from '$app/stores'
  import type { Snippet } from 'svelte'

  let { data, children }: { data: LayoutData; children: Snippet } = $props()
</script>

{#if $navigating}
  <PreLoadingIndicator />
{/if}
<Toaster richColors closeButton expand={true} duration={10000} />

{@render children()}
