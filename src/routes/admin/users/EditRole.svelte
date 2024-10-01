<script lang="ts">
  import { page } from '$app/stores'
  import Loading from '$lib/components/Loading.svelte'
  import { modal } from '$lib/components/modal'
  import type { DatabaseUser } from '$lib/server/db/schema'
  import { roleEnum } from '$lib/utils/permissions'
  import type { Permission, Role } from '$lib/utils/permissions'
  import { trpc } from '$trpc/client'
  import { toast } from 'svelte-sonner'

  export let userId: string
  export let userRole:Role
  export let userName:string

  let dialog: HTMLDialogElement
  let selectedRole: Role

  let isLoading = false

  async function handleUpdateUserPermission() {
    isLoading = true
    try {
      await trpc($page).auth.updateUserRole.mutate({
        userId: userId,
        role: selectedRole,
      })
      toast.success('Permissões editadas com sucesso!')
      setTimeout(() => {
        dialog.close()
        window.location.reload()
      }, 1000)
    } catch (error:any) {
      isLoading = false
      toast.error('Falha ao editar permissões')
      console.error(error.message)
    }
  }
</script>

<button class="btn btn-primary" onclick={() => dialog.showModal()}>
  {userRole}
</button>

<dialog bind:this={dialog} id="my_modal_2" class="modal">
  <div class="modal-box">
    <form method="dialog">
      <button class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">
        ✕
      </button>
    </form>
    <h3 class="text-lg font-bold">Edite o cargo de {userName}</h3>
    {#if isLoading}
      <div class="my-10 flex items-center justify-center">
        <Loading />
      </div>
    {:else}
      <label class="form-control my-3 w-full">
        <select class="select select-bordered" bind:value={selectedRole}>
          <option disabled selected>Escolha o cargo de {userName}</option>
          {#each roleEnum as role}
            <option value={role}>{role}</option>
          {/each}
        </select>
        <!-- {#if permissions.redirect}
          <select class="select select-bordered"></select>
        {/if} -->
      </label>
    {/if}
    <div class="flex justify-end">
      <button
        class="btn btn-primary"
        disabled={isLoading || (selectedRole ? !roleEnum.includes(selectedRole) : true)}
        onclick={handleUpdateUserPermission}
      >
        Salvar cargo
      </button>
    </div>
  </div>

  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
