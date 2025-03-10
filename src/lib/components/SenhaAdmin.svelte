<script lang="ts">
  import { trpc } from '$trpc/client'
  import { page } from '$app/state'
  import { onMount } from 'svelte'
  import { toast } from 'svelte-sonner'
  import Loading from './Loading.svelte'

  let { reason, onSuccess }: { reason: string; onSuccess: () => void } =
    $props()

  let password = $state('')
  let isLoading = $state(false)
  async function validateAdmin() {
    isLoading = true
    try {
      const resp = await trpc(page).distribuidora.validateAdminPassword.query({
        reason,
        password,
        admin_id: selectedAdminId,
      })
      if (resp?.success) {
        toast.success(resp?.message)
        onSuccess()
        console.log('ue1')
      }
      console.log(resp.message)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      isLoading = false
    }
  }

  let selectedAdminId: string = $state('')
</script>

<div>
  {#await trpc(page).distribuidora.getAdmins.query()}
    <Loading />
  {:then admins}
  <h1>Valide senha de adiministrador</h1>
    <div class="flex flex-col gap-2">
      <select
        name=""
        id=""
        bind:value={selectedAdminId}
        class="select select-bordered w-full"
      >
        <option value="" disabled>
          Selecione o administrador que irá validar
        </option>
        {#each admins as admin}
          <option value={admin.id}>{admin.name}</option>
        {/each}
      </select>
      <input
        type="password"
        bind:value={password}
        class="input input-bordered w-full"
        placeholder="****"
      />
      <button
        onclick={validateAdmin}
        disabled={!selectedAdminId || !password || isLoading}
        class="btn btn-primary w-full"
      >
        {isLoading ? 'Validando...' : 'Validar'}
      </button>
    </div>
  {:catch e}
    {e}
  {/await}
</div>
