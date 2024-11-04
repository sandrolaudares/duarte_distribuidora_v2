<script lang="ts">
    import { page } from '$app/stores'
    import Loading from '$lib/components/Loading.svelte'
    import { modal } from '$lib/components/modal'
    import type { DatabaseUser, SelectCashier, SelectUser } from '$lib/server/db/schema'
    import { roleEnum } from '$lib/utils/permissions'
    import type { Permission, Role } from '$lib/utils/permissions'
    import { trpc } from '$trpc/client'
  import { onMount } from 'svelte'
    import { toast } from 'svelte-sonner'
  
    export let userId: string
    export let userCashier: SelectUser
  
    let dialog: HTMLDialogElement
    let selectedCashier: SelectCashier['id']
  
    let isLoading = false
  
    async function handleUpdateCashier() {
    try {
      isLoading = true
      await trpc($page).auth.updateUserCashier.mutate({
        userId: userId,
        meta: { caixa_id: selectedCashier },
      })
      toast.success('Caixa atribuido!')
      isLoading = false
      window.location.reload()
    } catch (error: any) {
      isLoading = false
      toast.error('Falha')
      console.error(error.message)
    }
  }

  let caixas: SelectCashier[] = []
  onMount(async () => {
    try {
      caixas = await trpc($page).distribuidora.getCaixas.query()
    } catch (error: any) {
      toast.error(error.message)
    }
  })
  </script>
  
  <div class="flex items-center gap-2">
    <label class="form-control my-3 w-full">
      <select class="select select-bordered" bind:value={selectedCashier}>
        <!-- <option disabled selected>Escolha o cargo de {userName}</option> -->
        <option value={userCashier.meta.caixa_id}>{userCashier.meta.caixa_id}</option>
        <!--TODO: fix option {userCashier.meta.caixa_id}-->
        {#each caixas as caixa}
          {#if caixa.id !== userCashier.meta.caixa_id}
            <option value={caixa.id}>{caixa.name}</option>
          {/if}
        {/each}
      </select>
    </label>
    {#if selectedCashier != userCashier.meta.caixa_id}
    <button
      class="btn btn-primary"
      disabled={(selectedCashier === userCashier.meta.caixa_id) || isLoading}
      onclick={handleUpdateCashier}
    >
      Salvar
    </button>
    {/if}
  </div>