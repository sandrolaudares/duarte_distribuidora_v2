<script lang="ts">
 
  // INLANG
  // DAISY THEMES
  import { themes, changeTheme } from '$lib'
  import { onMount } from 'svelte'
  // TOASTER
  import { Toaster, toast } from 'svelte-sonner'
  import NavBar from '$lib/components/navbar/NavBar.svelte'
  // STORE
  import { createUserContext } from '$lib/stores/user'
  import { createCartContext } from '$lib/stores/cart'
  // COMPONENTS
  import { ModalContainer } from '$lib/components/modal'
  import DrawerContainer from '$lib/components/drawer/base/DrawerContainer.svelte'
  import Transition from '../../Transition.svelte'
  import type { LayoutData } from './$types'
  import PreLoadingIndicator from '../../PreLoadingIndicator.svelte'
  import { navigating } from '$app/stores'
  import SideBar from '$lib/components/sidebar/SideBar.svelte'

  export let data: LayoutData

  const user = createUserContext(data.user)
  // $: user.set(data.user)
  const cart = createCartContext()


</script>

  {#if $navigating}
    <PreLoadingIndicator />
  {/if}
  <Toaster richColors closeButton />
  <!-- <DrawerContainer> -->
  <!-- <NavBar> -->
   <SideBar activeTeam={data.tenant}>
     <ModalContainer />
     <Transition key={data.transition_key}>
       <slot />
     </Transition>
   </SideBar>
  <!-- </NavBar> -->
  <!-- </DrawerContainer> -->
