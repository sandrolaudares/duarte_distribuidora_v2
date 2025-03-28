<script lang="ts">
  import AudioWaveform from 'lucide-svelte/icons/audio-waveform'
  import beer from 'lucide-svelte/icons/beer'
  import ListOrdered from 'lucide-svelte/icons/list-ordered'
  import CircleDolar from 'lucide-svelte/icons/dollar-sign'
  import scroll from 'lucide-svelte/icons/scroll'
  import Command from 'lucide-svelte/icons/command'
  import Frame from 'lucide-svelte/icons/frame'
  import HandCoins from 'lucide-svelte/icons/hand-coins'
  import ShieldMap from 'lucide-svelte/icons/shield-check'
  import Transactions from 'lucide-svelte/icons/arrow-left-right'

  import { ChartArea, BadgeDollarSign, House } from 'lucide-svelte/icons'
  import Settings2 from 'lucide-svelte/icons/settings-2'
  import User from 'lucide-svelte/icons/user'
  import NavMain from '$lib/components/sidebar/nav-main.svelte'
  import NavProjects from '$lib/components/sidebar/nav-projects.svelte'
  import NavUser from '$lib/components/sidebar/nav-user.svelte'
  import TeamSwitcher from '$lib/components/sidebar/team-switcher.svelte'
  import * as Sidebar from '$lib/components/ui/sidebar/index.js'
  import { onMount, type ComponentProps } from 'svelte'
  import { getUserContext } from '$lib/stores/user'
  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'
  import type { SelectTenant } from '$lib/server/db/central/schema'
  import { type Role } from '$lib/utils/permissions'

  const user = getUserContext()

  let {
    ref = $bindable(null),
    collapsible = 'icon',
    activeTeam,
    ...restProps
  }: ComponentProps<typeof Sidebar.Root> & {
    activeTeam: SelectTenant
  } = $props()

  const data = $derived.by(() => {
    if (!$user) return { navMain: [], projects: [] };
    const nav = {
      navMain: [
        {
          title: 'Pessoas',
          url: '/admin',
          icon: User,
          isActive: true,
          allowedRoles: ['admin', 'caixa', 'financeiro'] as Role[],
          items: [
            {
              allowedRoles: ['admin'] as Role[],
              title: 'Usuários',
              url: '/admin/users',
            },
            {
              allowedRoles: ['admin', 'caixa', 'financeiro'] as Role[],
              title: 'Clientes',
              url: '/admin/customer',
            },
            {
              allowedRoles: ['admin', 'caixa'] as Role[],
              title: 'Fornecedores',
              url: '/admin/supplier',
            },
          ],
        },
        {
          title: 'Pedidos',
          url: '/admin/orders',
          icon: ListOrdered,
          isActive: true,
          allowedRoles: ['admin', 'caixa', 'financeiro'] as Role[],
          items: [
            {
              allowedRoles: ['admin'] as Role[],
              title: 'Todos pedidos',
              url: '/admin/orders/allorders',
            },
            {
              allowedRoles: ['admin', 'caixa'] as Role[],
              title: 'Pedidos em aberto',
              url: '/admin/orders',
            },
          ],
        },
        {
          title: 'Produtos',
          url: "/admin/products'",
          icon: beer,
          isActive: true,
          allowedRoles: ['admin'] as Role[],
          items: [
            {
              allowedRoles: ['admin'] as Role[],
              title: 'Produtos',
              url: '/admin/products',
            },
            {
              allowedRoles: ['admin'] as Role[],
              title: 'Estoque',
              url: '/admin/stock',
            },
          ],
        },
        {
          allowedRoles: ['admin'] as Role[],
          title: 'Financeiro',
          url: '/admin',
          icon: BadgeDollarSign,
          isActive: true,
          items: [
            {
              allowedRoles: ['admin'] as Role[],
              title: 'Pedidos fiado',
              url: '/admin/finance',
            },
            {
              allowedRoles: ['admin'] as Role[],
              title: 'Contas',
              url: '/admin/finance/contas',
            },
          ],
        },
      ]
        .filter(main => main.allowedRoles.includes($user.role))
        .map(subItem => ({
          ...subItem,
          items: subItem.items.filter(item =>
            item.allowedRoles.includes($user.role),
          ),
        })),
      projects: [
        {
          allowedRoles: ['admin'] as Role[],
          name: 'Todos caixas',
          url: '/admin/cashier',
          icon: HandCoins,
        },
        {
          allowedRoles: ['admin'] as Role[],
          name: 'Transações dos caixas',
          url: '/admin/cashier/transactions',
          icon: Transactions,
        },
        {
          allowedRoles: ['admin'] as Role[],
          name: 'Solicitações para central',
          url: '/admin/solicitacoes',
          icon: House,
        },
        {
          allowedRoles: ['admin'] as Role[],
          name: 'Logs',
          url: '/admin/logs',
          icon: scroll,
        },
        // {
        //   allowedRoles: ['admin'] as Role[],
        //   name: 'Admin',
        //   url: '/admin',
        //   icon: ShieldMap,
        // },
        {
          allowedRoles: ['admin'] as Role[],
          name: 'Dashboards',
          url: '/admin/dashboard',
          icon: ChartArea,
        },
      ].filter(project => {
        return project.allowedRoles.includes($user.role)
      }),
    }

    if ($user?.meta.caixa_id) {
      nav.projects.push({
        allowedRoles: ['admin', 'caixa'] as Role[],
        name: 'Ir direto para caixa',
        url: `/admin/cashier/${$user.meta.caixa_id}`,
        icon: CircleDolar,
      })
    }

    return nav
  })

  let tenats: SelectTenant[] = $state([])

  onMount(async () => {
    try {
      tenats = await trpc($page).distribuidora.getDistribuidoras.query()
      if (!tenats) {
        return
      }
    } catch (error: any) {
      console.error(error.message)
    }
  })
</script>

<Sidebar.Root bind:ref {collapsible} {...restProps}>
  <Sidebar.Header>
    <TeamSwitcher teams={tenats} {activeTeam} />
  </Sidebar.Header>
  <Sidebar.Content>
    {#if data.navMain.length && data.projects.length}
      <NavMain items={data.navMain} />
      <NavProjects projects={data.projects} />
    {/if}
    {#if !$user}
      <Sidebar.Group class="group-data-[collapsible=icon]:hidden">
        <Sidebar.Menu>
          <Sidebar.MenuButton>
            {#snippet child({ props })}
              <a href="/login/password" {...props}>
                <User />
                <span>Login</span>
              </a>
            {/snippet}
          </Sidebar.MenuButton>
        </Sidebar.Menu>
      </Sidebar.Group>
    {/if}
  </Sidebar.Content>
  <Sidebar.Footer>
    <NavUser />
  </Sidebar.Footer>
  <Sidebar.Rail />
</Sidebar.Root>
