<script lang="ts">
    import { trpc } from '$trpc/client'
    import { onMount } from 'svelte'
    import { page } from '$app/state'
    import { resolveHTTPResponse } from '@trpc/server/http'
    import { toast } from 'svelte-sonner'
    import { formatCurrency } from '$lib/utils'
    import type { SelectCustomer } from '$lib/server/db/schema'
  
  type Props = {
    customer:SelectCustomer
    max_credit:number
    getValue?: (value:number | null) => void
  }
  
  let {
    customer,
    max_credit,
    getValue
  }: Props = $props()
  
  let value: number | null = $state(0)
  let isLoading = $state(false)

    onMount(async () => {
      isLoading = true
      try {
        const resp = await trpc(page).customer.getCustomerUsedCredits.query(customer.id)
        console.log(resp)
        if (resp) {
          value = customer.max_credit - resp.used_credit
        }
        getValue?.(value)
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
  