<script lang="ts">
	import AppSidebar from "$lib/components/simplebar/app-sidebar.svelte";
	import { Separator } from "$lib/components/ui/separator/index";
	import * as Sidebar from "$lib/components/ui/sidebar/index";
</script>
<!-- 
<Sidebar.Provider>
	<AppSidebar />
	<Sidebar.Inset>
		<header class="flex h-16 shrink-0 items-center gap-2 border-b">
			<div class="flex items-center gap-2 px-3">
				<Sidebar.Trigger />
				<Separator orientation="vertical" class="mr-2 h-4" />
				
			</div>
		</header> -->
		<main class="h-screen overflow-scroll">

			<slot></slot>
		</main>
	<!-- </Sidebar.Inset>
</Sidebar.Provider> -->
