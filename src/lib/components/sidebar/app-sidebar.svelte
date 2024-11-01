<script lang="ts" module>
	import AudioWaveform from "lucide-svelte/icons/audio-waveform";
	import BookOpen from "lucide-svelte/icons/book-open";
	import Bot from "lucide-svelte/icons/bot";
	import ChartPie from "lucide-svelte/icons/chart-pie";
	import Command from "lucide-svelte/icons/command";
	import Frame from "lucide-svelte/icons/frame";
	import GalleryVerticalEnd from "lucide-svelte/icons/gallery-vertical-end";
	import Map from "lucide-svelte/icons/map";
	import Settings2 from "lucide-svelte/icons/settings-2";
	import SquareTerminal from "lucide-svelte/icons/square-terminal";

	// This is sample data.
	const data = {
		user: {
			name: "todo",
			email: "m@example.com",
			avatar: "/avatars/shadcn.jpg",
		},
		// teams: [
		// 	{
		// 		name: "Acme Inc",
		// 		logo: GalleryVerticalEnd,
		// 		plan: "Enterprise",
		// 	},
		// 	{
		// 		name: "Acme Corp.",
		// 		logo: AudioWaveform,
		// 		plan: "Startup",
		// 	},
		// 	{
		// 		name: "Evil Corp.",
		// 		logo: Command,
		// 		plan: "Free",
		// 	},
		// ],
		navMain: [
			{
				title: "Pessoas",
				url: "/admin",
				icon: SquareTerminal,
				isActive: true,
				items: [
					{
						title: "Usuários",
						url: "/admin/users",
					},
					{
						title: "Clientes",
						url: "/admin/customer",
					},
					{
						title: "Fornecedores",
						url: "/admin/supplier",
					},
				],
			},
			{
				title: "Pedidos",
				url: "#",
				icon: Bot,
				items: [
					{
						title: "Todos pedidos",
						url: "/admin/orders/allorders",
					},
					{
						title: "Pedidos em aberto",
						url: "/admin/orders",
					},
					{
						title: "Pedidos fiado",
						url: "/admin/finance",
					},
					// {
					// 	title: "Pedidos delivery",
					// 	url: "/admin/orders/delivery",
					// },
				],
			},
			{
				title: "Produtos",
				url: "/admin/products'",
				icon: BookOpen,
				items: [
					{
						title: "Produtos",
						url: "/admin/products'",
					},
					{
						title: "Estoque",
						url: "/admin/stock",
					},
				],
			},
			// {
			// 	title: "Caixa",
			// 	url: "/admin/cashier",
			// 	icon: Settings2,
			// 	items: [
			// 		{
			// 			title: "General",
			// 			url: "#",
			// 		},
			// 		{
			// 			title: "Team",
			// 			url: "#",
			// 		},
			// 		{
			// 			title: "Billing",
			// 			url: "#",
			// 		},
			// 		{
			// 			title: "Limits",
			// 			url: "#",
			// 		},
			// 	],
			// },
		],
		projects: [
			{
				name: "Caixas",
				url: "/admin/cashier",
				icon: Frame,
			},
			{
				name: "Logs",
				url: "/admin/logs",
				icon: ChartPie,
			},
			{
				name: "Admin",
				url: "/admin",
				icon: Map,
			},
		],
	};
</script>

<script lang="ts">
	import NavMain from "$lib/components/sidebar/nav-main.svelte";
	import NavProjects from "$lib/components/sidebar/nav-projects.svelte";
	import NavUser from "$lib/components/sidebar/nav-user.svelte";
	// import TeamSwitcher from "$lib/registry/new-york/block/sidebar-07/components/team-switcher.svelte";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import type { ComponentProps } from "svelte";

	let {
		ref = $bindable(null),
		collapsible = "icon",
		...restProps
	}: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root bind:ref {collapsible} {...restProps}>
	<Sidebar.Header>
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={data.navMain} />
		<NavProjects projects={data.projects} />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser user={data.user} />
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>