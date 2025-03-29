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
  import { PlusIcon } from 'lucide-svelte'
  import { getUserContext } from '$lib/stores/user'
  import { toast } from 'svelte-sonner'
  import Loading from '../Loading.svelte'

  let {
    activeTeam,
    delegateQuery,
  }: {
    activeTeam: SelectTenant
    delegateQuery: () => Promise<SelectTenant[]>
  } = $props()
  
  const sidebar = useSidebar()
  const user = getUserContext()

  let teams: SelectTenant[] = $state([])

  let isLoading = $state(true)

  async function loadOptions() {
    try {
      if (teams.length === 0) {
        teams = await delegateQuery()
      }
    } catch (error: any) {
      console.error(error.message)
      toast.error('Erro ao carregar distribuidoras')
    } finally {
      isLoading = false
    }
  }

  const prefix = dev ? 'http' : 'https'
</script>

<Sidebar.Menu>
  <Sidebar.MenuItem>
    <DropdownMenu.Root onOpenChange={loadOptions}>
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
              <span class="truncate text-xs">{activeTeam.subdomain}</span>
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
        {#if isLoading}
          <div class="flex items-center justify-center">
            <Loading />
          </div>
        {:else}
          {#each teams.filter(team => team.subdomain != activeTeam.subdomain) as team, index}
            <a
              href="{prefix}://{team.subdomain}.{PUBLIC_DOMAIN.replace(
                '/',
                '',
              )}{page.url.pathname}"
            >
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
        {/if}
        {#if $user && $user.role === 'admin'}
          <a href="/admin/criarDistribuidora">
            <DropdownMenu.Item class="gap-2 p-2">
              <div
                class="flex size-6 items-center justify-center rounded-sm border"
              >
                <!-- <team.logo class="size-4 shrink-0" /> -->
                <PlusIcon class="size-4" />
              </div>
              Criar nova distribuidora
            </DropdownMenu.Item>
          </a>
          <DropdownMenu.Separator />
          <DropdownMenu.Item class="gap-2 p-2">
            <a class="font-medium text-foreground" href="/tenantprofile">
              Editar essa distribuidora
            </a>
          </DropdownMenu.Item>
        {/if}
        <DropdownMenu.Separator />
        <DropdownMenu.Item class="gap-2 p-2">
          <a
            class="font-medium text-foreground"
            href="{prefix}://{PUBLIC_DOMAIN}"
          >
            Voltar para central
          </a>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </Sidebar.MenuItem>
</Sidebar.Menu>
