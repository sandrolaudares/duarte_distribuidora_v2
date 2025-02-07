<script lang="ts">
  import { invalidateAll } from '$app/navigation'
  import { page } from '$app/stores'
  import Loading from '$lib/components/Loading.svelte'
  import { modal } from '$lib/components/modal'
  import type { DatabaseUser } from '$lib/server/db/schema'
  import { roleEnum, roleLabels } from '$lib/utils/permissions'
  import type { Permission, Role } from '$lib/utils/permissions'
  import { trpc } from '$trpc/client'
  import { toast } from 'svelte-sonner'
  import * as Select from '$lib/components/ui/select/index'

  let { userId, userRole }: { userId: string; userRole: Role } = $props()

  // export let userName: string

  let selectedRole: Role = $state(userRole)

  let isLoading = $state(false)

  async function handleUpdateUserRole() {
    isLoading = true
    try {
      const [response] = await trpc($page).auth.updateUserRole.mutate({
        userId: userId,
        role: selectedRole,
      })
      toast.success('Cargo editado com sucesso!')

      await invalidateAll()
      userRole = response.role
      selectedRole = response.role
    } catch (error: any) {
      toast.error('Falha ao editar cargo')
      console.error(error.message)
    } finally {
      isLoading = false
    }
  }
</script>

<div class="flex items-center gap-2">
  <Select.Root type="single" bind:value={selectedRole}>
    <Select.Trigger
      class="w-[180px] data-[placeholder]:text-primary-foreground "
    >
      {roleLabels[selectedRole]}
    </Select.Trigger>
    <Select.Content>
      {#each roleEnum as role}
        <Select.Item value={role}>{roleLabels[role]}</Select.Item>
      {/each}
    </Select.Content>
  </Select.Root>

  <button
    class="btn btn-primary"
    disabled={selectedRole === userRole || isLoading}
    onclick={handleUpdateUserRole}
  >
    Salvar
  </button>
</div>
