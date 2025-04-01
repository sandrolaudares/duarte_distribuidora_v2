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

  import {
    ChartArea,
    BadgeDollarSign,
    House,
    ShoppingCart,
  } from 'lucide-svelte/icons'
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
  import { page } from '$app/state'
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
    if (!$user || $user.is_active === false) return { navMain: [], projects: [] }
    const nav = {
      navMain: [
        {
          title: 'Área do cliente',
          url: '/admin',
          icon: ShoppingCart,
          isActive: true,
          allowedRoles: ['customer'] as Role[],
          items: [
            {
              allowedRoles: ['customer'] as Role[],
              title: 'Cardápio',
              url: '/customer/products',
            },
            {
              allowedRoles: ['customer'] as Role[],
              title: 'Carrinho',
              url: '/customer/carrinho',
            },
          ],
        },
        {
          title: 'Pessoas',
          url: '/admin',
          icon: User,
          isActive: true,
          allowedRoles: ['admin', 'caixa', 'financeiro','gerente'] as Role[],
          items: [
            {
              allowedRoles: ['admin','gerente'] as Role[],
              title: 'Usuários',
              url: '/admin/users',
            },
            {
              allowedRoles: ['admin', 'caixa', 'financeiro','gerente'] as Role[],
              title: 'Clientes',
              url: '/admin/customer',
            },
            {
              allowedRoles: ['admin', 'financeiro','gerente'] as Role[],
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
          allowedRoles: ['admin', 'caixa', 'financeiro','gerente'] as Role[],
          items: [
            {
              allowedRoles: ['admin','financeiro','gerente','caixa'] as Role[],
              title: 'Todos pedidos',
              url: '/admin/orders/allorders',
            },
            {
              allowedRoles: ['admin', 'caixa','financeiro','gerente'] as Role[],
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
          allowedRoles: ['admin','financeiro','gerente'] as Role[],
          items: [
            {
              allowedRoles: ['admin','financeiro','gerente'] as Role[],
              title: 'Produtos',
              url: '/admin/products',
            },
            {
              allowedRoles: ['admin','financeiro','gerente'] as Role[],
              title: 'Estoque',
              url: '/admin/stock',
            },
          ],
        },
        {
          allowedRoles: ['admin', 'financeiro','caixa','gerente'] as Role[],
          title: 'Financeiro',
          url: '/admin',
          icon: BadgeDollarSign,
          isActive: true,
          items: [
            {
              allowedRoles: ['admin', 'financeiro','caixa','gerente'] as Role[],
              title: 'Pedidos fiado',
              url: '/admin/finance',
            },
            {
              allowedRoles: ['admin', 'financeiro','gerente'] as Role[],
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
          allowedRoles: ['admin',`gerente`,`financeiro`] as Role[],
          name: 'Todos caixas',
          url: '/admin/cashier',
          icon: HandCoins,
        },
        {
          allowedRoles: ['admin',`gerente`,`financeiro`] as Role[],
          name: 'Transações dos caixas',
          url: '/admin/cashier/transactions',
          icon: Transactions,
        },
        {
          allowedRoles: ['admin',`gerente`,`financeiro`] as Role[],
          name: 'Solicitações para central',
          url: '/admin/solicitacoes',
          icon: House,
        },
        {
          allowedRoles: ['admin',`gerente`,`financeiro`] as Role[],
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
          allowedRoles: ['admin',`gerente`] as Role[],
          name: 'Dashboards',
          url: '/admin/dashboard',
          icon: ChartArea,
        },
      ].filter(project => {
        return project.allowedRoles.includes($user.role)
      }),
    }

    if (
      $user &&
      $user.meta.caixa_id &&
      ($user.role === 'caixa' || $user.role === 'admin')
    ) {
      nav.projects.push({
        allowedRoles: ['admin', 'caixa'] as Role[],
        name: 'Ir direto para caixa',
        url: `/admin/cashier/${$user.meta.caixa_id}`,
        icon: CircleDolar,
      })
    }

    return nav
  })
</script>

<Sidebar.Root bind:ref {collapsible} {...restProps}>
  <Sidebar.Header>
    <TeamSwitcher
      {activeTeam}
      delegateQuery={trpc(page).distribuidora.getDistribuidoras.query}
    />
  </Sidebar.Header>
  <Sidebar.Content>
    {#if data.navMain.length}
      <NavMain items={data.navMain} />
    {/if}
    {#if data.projects.length}
      <NavProjects projects={data.projects} />
    {/if}
    {#if $user && !data.navMain.length && !data.projects.length}
      <p class="mx-2 mt-4 text-center text-lg text-gray-700">
        Você não tem permissão para acessar nenhuma rota
      </p>
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
