<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import AppSidebar from "$lib/components/sidebar/app-sidebar.svelte";
    
    // let { children } = $props();
   </script>
    
    <Sidebar.Provider>
        <AppSidebar />
        <Sidebar.Inset>
            <header
                class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
            >
                <div class="flex items-center gap-2 px-4">
                    <Sidebar.Trigger class="-ml-1" />
                    
                </div>
            </header>
            <slot/>
        </Sidebar.Inset>
    </Sidebar.Provider>