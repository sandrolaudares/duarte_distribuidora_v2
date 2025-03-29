<script lang="ts">
  import { page } from '$app/stores'
  import Loading from '$lib/components/Loading.svelte'
  import { modal } from '$lib/components/modal'
  import type {
    DatabaseUser,
    SelectCashier,
    SelectUser,
  } from '$lib/server/db/schema'
  import { trpc } from '$trpc/client'
  import { onMount } from 'svelte'
  import { toast } from 'svelte-sonner'
  import * as Select from '$lib/components/ui/select/index'
  import { invalidateAll } from '$app/navigation'

  let { userId, userCashier }: { userId: string; userCashier: SelectUser } =
    $props()

  let selectedCashier: string | undefined = $state(
    userCashier.meta.caixa_id
      ? userCashier.meta.caixa_id.toString()
      : undefined,
  )
  let isLoading = $state(false)
  let caixas: SelectCashier[] = $state([])

  async function handleUpdateCashier() {
    if (!selectedCashier) return
    try {
      isLoading = true
      await trpc($page).auth.updateUserCashier.mutate({
        userId: userId,
        meta: { caixa_id: Number(selectedCashier) },
      })
      toast.success('Caixa atribuído!')
      invalidateAll()

      isLoading = false
    } catch (error: any) {
      isLoading = false
      toast.error('Falha')
      console.error(error.message)
    }
  }

  onMount(async () => {
    try {
      caixas = await trpc($page).distribuidora.getCaixas.query()
    } catch (error: any) {
      toast.error(error.message)
    }
  })
</script>

<div class="mt-1 flex items-center gap-2">
  <Select.Root type="single" bind:value={selectedCashier}>
    <Select.Trigger class="w-[180px]">
      {selectedCashier
        ? (caixas.find(c => c.id.toString() === selectedCashier)?.name ??
          'Carregando...')
        : 'Selecione um caixa'}
    </Select.Trigger>
    <Select.Content>
      {#each caixas as caixa}
        <Select.Item value={caixa.id.toString()}>{caixa.name}</Select.Item>
      {/each}
    </Select.Content>
  </Select.Root>

  {#if selectedCashier && Number(selectedCashier) !== userCashier.meta.caixa_id}
    <button
      class="btn btn-primary"
      disabled={isLoading}
      onclick={handleUpdateCashier}
    >
      Salvar
    </button>
  {/if}
</div>
