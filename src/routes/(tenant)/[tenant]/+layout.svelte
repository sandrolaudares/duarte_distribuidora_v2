<script lang="ts">
  // INLANG
  // DAISY THEMES
  import { themes, changeTheme } from '$lib'
  import { onMount, type Snippet } from 'svelte'
  // TOASTER
  import { Toaster, toast } from 'svelte-sonner'
  import NavBar from '$lib/components/navbar/NavBar.svelte'
  // STORE
  import { createUserContext } from '$lib/stores/user'
  // import { createCartContext } from '$lib/stores/cart'
  // COMPONENTS
  import { ModalContainer } from '$lib/components/modal'
  import DrawerContainer from '$lib/components/drawer/base/DrawerContainer.svelte'
  import Transition from '../../Transition.svelte'
  import type { LayoutData } from './$types'
  import PreLoadingIndicator from '../../PreLoadingIndicator.svelte'
  import { navigating } from '$app/stores'
  import SideBar from '$lib/components/sidebar/SideBar.svelte'
  import { createCartContext } from '$lib/state/contextCashier/cartContext.svelte'
  import { page } from '$app/state'
  import { createPrinterContext } from './admin/orders/allorders/printerContext.svelte'

  let { data, children }: { data: LayoutData; children: Snippet } = $props()

  const user = createUserContext(data.user)
  const prr = createPrinterContext()
  const cart = createCartContext()

  $effect.pre(() => {
    user.set(data.user)

    if(localStorage.getItem('selectedPrinter') !==null) {
      prr.setPrinter(localStorage.getItem('selectedPrinter') ?? '')
    }
  })

  // onMount(() => {
  //   function handleKeydown(e: KeyboardEvent) {
  //     if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
  //       e.preventDefault();
  //       window.location.href = `/admin/cashier/${$user?.meta.caixa_id}`;
  //     }
  //     if (e.key === "b" && (e.metaKey || e.ctrlKey)) {
  //       e.preventDefault();
  //       window.location.href = `/`;
  //     }
  //   }
 
  //   document.addEventListener("keydown", handleKeydown);
  //   return () => {
  //     document.removeEventListener("keydown", handleKeydown);
  //   };
  // });
</script>

<!-- <DrawerContainer> -->
<!-- <NavBar> -->
<SideBar activeTeam={data.tenant!}>
<ModalContainer />
<!-- <Transition key={data.transition_key}> -->
{@render children()}
<!-- </Transition> -->
</SideBar>
<!-- </NavBar> -->
<!-- </DrawerContainer> -->
