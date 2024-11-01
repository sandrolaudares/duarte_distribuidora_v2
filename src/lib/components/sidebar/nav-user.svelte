<script lang="ts">
  // import * as Avatar from "$lib/registry/new-york/ui/avatar/index.js";
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js'
  import * as Sidebar from '$lib/components/ui/sidebar/index.js'
  import { useSidebar } from '$lib/components/ui/sidebar/index.js'
  import BadgeCheck from 'lucide-svelte/icons/badge-check'
  import Bell from 'lucide-svelte/icons/bell'
  import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down'
  import CreditCard from 'lucide-svelte/icons/credit-card'
  import LogOut from 'lucide-svelte/icons/log-out'
  import User from 'lucide-svelte/icons/user'
  import { trpc } from '$trpc/client'
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import { getUserContext } from '$lib/stores/user'

  const user = getUserContext()
  const sidebar = useSidebar()

  async function logout() {
    user.set(null)
    await trpc($page).auth.logOut.query()
    goto('/')
  }
</script>

<Sidebar.Menu>
  <Sidebar.MenuItem>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          {#if $user}
            <Sidebar.MenuButton
              size="lg"
              class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              {...props}
            >
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">{$user.username}</span>
                <span class="truncate text-xs">{$user.email}</span>
              </div>
              <ChevronsUpDown class="ml-auto size-4" />
            </Sidebar.MenuButton>
          {/if}
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        class="w-[--bits-dropdown-menu-anchor-width] min-w-56 rounded-lg"
        side={sidebar.isMobile ? 'bottom' : 'right'}
        align="end"
        sideOffset={4}
      >
        <DropdownMenu.Label class="p-0 font-normal">
          <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <div class="grid flex-1 text-left text-sm leading-tight">
              {#if $user}
                <span class="truncate font-semibold">{$user.username}</span>
                <span class="truncate text-xs">{$user.email}</span>
              {/if}
            </div>
          </div>
        </DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.Group>
          <a href="/myprofile">
            <DropdownMenu.Item>
              <User />
              Meu perfil
            </DropdownMenu.Item>
          </a>
        </DropdownMenu.Group>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onclick={logout}>
          <LogOut />
          Log out
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </Sidebar.MenuItem>
</Sidebar.Menu>
