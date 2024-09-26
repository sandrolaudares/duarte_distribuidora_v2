<script lang="ts">
  import Loading from '$lib/components/Loading.svelte'
  import { modal, Modal } from '$lib/components/modal'
  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'
  import { onMount } from 'svelte'
  import { toast } from 'svelte-sonner'
  import type { RouterOutputs } from '$trpc/router'

  type Motoboy = RouterOutputs['auth']['getMotoboys']

  export let motoboys: Motoboy = []

  let isLoading = false

  onMount(async () => {
    try {
      isLoading = true
      motoboys = await trpc($page).auth.getMotoboys.query()
      console.log(motoboys)
      isLoading = false
    } catch (error: any) {
      console.error(error.message)
      toast.error(error.message)
      isLoading = false
    }
  })

  export let selectedMotoboy: (motoboy: Motoboy[0]) => void
</script>

<Modal title="Motoboys">
  <div class="my-4 flex flex-col gap-4">
    {#if isLoading}
    <div class="flex justify-center items-center">
      <Loading/>
    </div>
    {/if}
    {#each motoboys as motoboy}
      <div class="flex flex-col gap-3 rounded-box bg-base-200 p-4 text-center">
        {motoboy.username} - {motoboy.email}
        <button
          class="btn btn-primary"
          on:click={() => {
            selectedMotoboy(motoboy)
            modal.close()
          }}
        >
          selecione
        </button>
      </div>
    {/each}
  </div>
</Modal>
