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
  export let userRole: Role
  export let userName: string

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
    } catch (error: any) {
      isLoading = false
      toast.error('Falha ao editar permissões')
      console.error(error.message)
    }
  }
</script>

<div class="flex items-center gap-2">
  <label class="form-control my-3 w-full">
    <select class="select select-bordered" bind:value={selectedRole}>
      <!-- <option disabled selected>Escolha o cargo de {userName}</option> -->
      <option value={userRole}>{userRole}</option>
      {#each roleEnum as role}
        {#if role !== userRole}
          <option value={role}>{role}</option>
        {/if}
      {/each}
    </select>
  </label>

  <button
    class="btn btn-primary"
    disabled={(selectedRole === userRole) || isLoading}
    onclick={handleUpdateUserPermission}
  >
    Salvar
  </button>
</div>