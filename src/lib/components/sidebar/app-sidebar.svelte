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

import {ChartArea,BadgeDollarSign} from 'lucide-svelte/icons'
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
    const nav = {
      navMain: [
        {
          title: 'Pessoas',
          url: '/admin',
          icon: User,
          isActive: true,
          items: [
            {
              title: 'Usuários',
              url: '/admin/users',
            },
            {
              title: 'Clientes',
              url: '/admin/customer',
            },
            {
              title: 'Fornecedores',
              url: '/admin/supplier',
            },
          ],
        },
      ],
      projects: [
        {
          name: 'Todos caixas',
          url: '/admin/cashier',
          icon: HandCoins,
        },
      ],
    }

    if ($user?.meta.caixa_id) {
      nav.projects.push({
        name: 'Ir direto para caixa',
        url: `/admin/cashier/${$user.meta.caixa_id}`,
        icon: CircleDolar,
      })
    }

    if ($user?.role === 'admin') {
      nav.navMain.push(
        {
          title: 'Pedidos',
          url: '/admin/orders',
          icon: ListOrdered,
          isActive: true,
          items: [
            {
              title: 'Todos pedidos',
              url: '/admin/orders/allorders',
            },
            {
              title: 'Pedidos em aberto',
              url: '/admin/orders',
            },
              // {
              //   title: 'Pedidos fiado',
              //   url: '/admin/finance',
              // },
            // {
            // 	title: "Pedidos delivery",
            // 	url: "/admin/orders/delivery",
            // },
          ],
        },
        {
          title: 'Produtos',
          url: "/admin/products'",
          icon: beer,
          isActive: true,
          items: [
            {
              title: 'Produtos',
              url: '/admin/products',
            },
            {
              title: 'Estoque',
              url: '/admin/stock',
            },
            // {
            //   title: 'Transferir estoque',
            //   url: '/admin/stock/transferir',
            // },
            // {
            //   title: 'Transferencias',
            //   url: '/admin/stock/solicitacoes',
            // },
            // {
            //   title: 'Historico transferencias',
            //   url: '/admin/stock/solicitacoes/historico',
            // },
          ],
        },
      )
      nav.projects.push(
        {
          name: 'Transações dos caixas',
          url: '/admin/cashier/transactions',
          icon: Transactions,
        },
        {
          name: 'Solicitações para central',
          url: '/admin/solicitacoes',
          icon: House,
        },
        {
          name: 'Logs',
          url: '/admin/logs',
          icon: scroll,
        },
        {
          name: 'Admin',
          url: '/admin',
          icon: ShieldMap,
        },
        {
          name: 'Dashboards',
          url: '/admin/dashboard',
          icon: ChartArea,
        },
      )
      nav.navMain.push(
        {
          title: 'Financeiro',
          url: '/admin',
          icon: BadgeDollarSign,
          isActive: true,
          items: [
            {
              title: 'Pedidos fiado',
              url: '/admin/finance',
            },
            {
              title: 'Contas',
              url: '/admin/finance/contas',
            },
          ],
        },
      )
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
    {#if data.navMain && data.projects && $user?.role === 'admin'}
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
