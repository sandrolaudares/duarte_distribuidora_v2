<script lang="ts">
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js'
  import * as Sidebar from '$lib/components/ui/sidebar/index.js'
  import { useSidebar } from '$lib/components/ui/sidebar/index.js'
  import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down'
  import Plus from 'lucide-svelte/icons/plus'
  import Beer from 'lucide-svelte/icons/beer'
  import type { SelectTenant } from '$lib/server/db/central/schema'
  import { PUBLIC_DOMAIN } from '$env/static/public'
  import { page } from '$app/state'
  import { dev } from '$app/environment'

  // This should be `Component` after lucide-svelte updates types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let {
    teams,
    activeTeam,
  }: { teams: SelectTenant[]; activeTeam: SelectTenant } = $props()
  const sidebar = useSidebar()

  // let activeTeam = $state(teams[0]);
  //TODO: SELECTED DISTRIBUIDORA

  const prefix = dev ? 'http' : 'https'
</script>

<Sidebar.Menu>
  <Sidebar.MenuItem>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Sidebar.MenuButton
            {...props}
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div
              class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
            >
              <Beer class="size-4" />
              <!-- <activeTeam.logo class="size-4" /> -->
            </div>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-semibold">
                {activeTeam.name}
              </span>
              <!-- <span class="truncate text-xs">{activeTeam.name}</span> -->
            </div>
            <ChevronsUpDown class="ml-auto" />
          </Sidebar.MenuButton>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        class="w-[--bits-dropdown-menu-anchor-width] min-w-56 rounded-lg"
        align="start"
        side={sidebar.isMobile ? 'bottom' : 'right'}
        sideOffset={4}
      >
        <DropdownMenu.Label class=" text-xs">Distribuidoras</DropdownMenu.Label>
        {#each teams as team, index}
          <a href="{prefix}://{team.subdomain}.{PUBLIC_DOMAIN.replace('/','')}{page.url.pathname}">
            <DropdownMenu.Item class="gap-2 p-2">
              <div
                class="flex size-6 items-center justify-center rounded-sm border"
              >
                <!-- <team.logo class="size-4 shrink-0" /> -->
                <Beer class="size-4" />
              </div>
              {team.name}
              <DropdownMenu.Shortcut>{index + 1}</DropdownMenu.Shortcut>
            </DropdownMenu.Item>
          </a>
        {/each}
        <DropdownMenu.Separator />
        <DropdownMenu.Item class="gap-2 p-2">
          <a class="font-medium text-foreground" href="/tenantprofile">
            Editar essa distribuidora
          </a>
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item class="gap-2 p-2">
          <a class="font-medium text-foreground" href="{prefix}://{PUBLIC_DOMAIN}">
            Voltar para central
          </a>
          <!--TODO: Arrumar o link-->
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </Sidebar.MenuItem>
</Sidebar.Menu>
