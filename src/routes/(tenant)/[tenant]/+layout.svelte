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
  import { createCartContext } from './admin/cashier/[id]/cartContext.svelte'
  import { page } from '$app/state'

  // export let data: LayoutData

  let { data, children }: { data: LayoutData; children: Snippet } = $props()

  const user = createUserContext(data.user)

  $effect.pre(() => {
    user.set(data.user)
  })
  const cart = createCartContext()

  const noTransitionPaths = [
    /^\/admin\/customer\/\d+\/enderecos$/,
    /^\/admin\/customer\/\d+\/pedidos$/,
  ]

  let disableTransition = $derived(
    noTransitionPaths.some(pattern => pattern.test(page.url.pathname)),
  )
</script>

<!-- <DrawerContainer> -->
<!-- <NavBar> -->
<SideBar activeTeam={data.tenant!}>
  <ModalContainer />
  {#if !disableTransition}
    <Transition key={data.transition_key}>
      {@render children()}
    </Transition>
  {:else}
    {@render children()}
  {/if}
</SideBar>
<!-- </NavBar> -->
<!-- </DrawerContainer> -->
