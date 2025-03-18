<script>
  import {  fly } from 'svelte/transition'
  import { cubicIn, cubicOut } from 'svelte/easing'

  import {  navigating } from '$app/stores'
  import { onNavigate } from '$app/navigation'
  import PreLoadingIndicator from './PreLoadingIndicator.svelte'

  export let key

</script>

{#if $navigating}
  <PreLoadingIndicator />
{/if}

{#key key}
  <div
    in:fly={{
      duration: 300,
      x: 0,
      y: 240,
      easing: cubicOut,
      delay: 300,
    }}
    out:fly={{ duration: 300, x: 0, y: -240, easing: cubicIn }}
    class="h-full overflow-x-auto"
  >
    <slot />
  </div>
{/key}
