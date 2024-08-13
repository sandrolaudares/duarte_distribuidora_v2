<script lang="ts">
  import { toast } from 'svelte-sonner'
  import { onMount } from 'svelte'
  import { page } from '$app/stores'
  import { trpc } from '$trpc/client'

  import type { RouterOutputs } from '$trpc/router'

  let transactions: RouterOutputs['stock']['getAllTransaoCaixa']

  onMount(async () => {
    try {
      transactions = await trpc($page).stock.getAllTransaoCaixa.query()
    } catch (error: any) {
      toast.error(error.message)
    }
  })
  
</script>

<main>
  {#each transactions as transaction}
    {transaction.type}
  {/each}
</main>
