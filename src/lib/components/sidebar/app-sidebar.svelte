<script lang="ts" module>
  import AudioWaveform from 'lucide-svelte/icons/audio-waveform'
  import beer from 'lucide-svelte/icons/beer'
  import ListOrdered from 'lucide-svelte/icons/list-ordered'
  import scroll from 'lucide-svelte/icons/scroll'
  import Command from 'lucide-svelte/icons/command'
  import Frame from 'lucide-svelte/icons/frame'
  import HandCoins from 'lucide-svelte/icons/hand-coins'
  import ShieldMap from 'lucide-svelte/icons/shield-check'
  import Settings2 from 'lucide-svelte/icons/settings-2'
  import User from 'lucide-svelte/icons/user'

  export let showDefaultItems = true

  const data = {
    teams: [
      {
        name: 'Acme Inc',
        logo: HandCoins,
        plan: 'Enterprise',
      },
      {
        name: 'Acme Corp.',
        logo: AudioWaveform,
        plan: 'Startup',
      },
      {
        name: 'Evil Corp.',
        logo: Command,
        plan: 'Free',
      },
    ],
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
        name: 'Caixas',
        url: '/admin/cashier',
        icon: HandCoins,
      },
    ],
  }
</script>

<script lang="ts">
  import NavMain from '$lib/components/sidebar/nav-main.svelte'
  import NavProjects from '$lib/components/sidebar/nav-projects.svelte'
  import NavUser from '$lib/components/sidebar/nav-user.svelte'
  import TeamSwitcher from '$lib/components/sidebar/team-switcher.svelte'
  import * as Sidebar from '$lib/components/ui/sidebar/index.js'
  import type { ComponentProps } from 'svelte'
  import { getUserContext } from '$lib/stores/user'
  

  const user = getUserContext()

  let {
    ref = $bindable(null),
    collapsible = 'icon',
    ...restProps
  }: ComponentProps<typeof Sidebar.Root> = $props()

  if ($user?.role === 'admin') {
    data.navMain.push(
      
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
          {
            title: 'Pedidos fiado',
            url: '/admin/finance',
          },
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
        ],
      },
    )
    data.projects.push(

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
    )
  }
</script>

<Sidebar.Root bind:ref {collapsible} {...restProps}>
  <Sidebar.Header>
    <TeamSwitcher teams={data.teams} />
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
					<a href="/login" {...props}>
						<User/>
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
