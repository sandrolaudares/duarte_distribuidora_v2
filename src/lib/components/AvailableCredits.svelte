<script lang="ts">
    import { trpc } from '$trpc/client'
    import { onMount } from 'svelte'
    import { page } from '$app/stores'
    import { resolveHTTPResponse } from '@trpc/server/http'
    import { toast } from 'svelte-sonner'
  import { formatCurrency } from '$lib/utils'
  
    let value: number | null = 0
    export let id
    export let max_credit = 0
    let isLoading = false
    onMount(async () => {
      isLoading = true
      try {
        const resp = await trpc($page).customer.getCustomerUsedCredits.query(id)
        console.log(resp)
        if (resp) {
          value = resp.used_credit
        }
        isLoading = false
      } catch (error: any) {
        console.error(error.message)
        toast.error(error.message)
        isLoading = false
      }
    })
  </script>
  
  <span class="font-bold">
  {#if isLoading}
    Carregando...
  {:else if value !== null}

  {formatCurrency(max_credit)}
  {:else}
  R$ 0.00
  {/if}
</span>
  