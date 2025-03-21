<script lang="ts">
  import { goto } from '$app/navigation'
  import SEO, { getSEOProps } from '$lib/components/SEO/index.svelte'

  import type { PageData } from './$types'
  import { getUserContext } from '$lib/stores/user'

  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'
  const user = getUserContext()

  export let data: PageData

  const sessions = data.user_sessions

  import { onMount } from 'svelte'
  import UserSessions from './UserSessions.svelte'

  let nottifPermGranted: boolean | null = null
  let isSubscribed = false

  $: {
    if (!user) goto('/login')
  }
  onMount(async () => {
    console.log(Notification.permission)

    nottifPermGranted = Notification.permission === 'granted'

    if (nottifPermGranted) {
      isSubscribed = await checkSubscriptionStatus()

      console.log(isSubscribed)

      if (!isSubscribed) {
        await subscribeUser()
      }
    }
  })

  function requestNotificationPermission() {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification('You are now subscribed to notifications!')
      }
    })
  }

  async function sendSubscriptionToServer(subscription: PushSubscription) {
    // try {
    //   console.log(subscription)
    // const res = await trpc(
    //   $page,
    // ).pushNotification.addPushNotificationDevice.query({
    //   subscription,
    // })
    // if (!res.success) {
    //   console.error(`Error saving subscription on server ${res.error}`)
    // }
    // } catch (error) {
    //   console.error('Error saving subscription on server:', error)
    //   unsubscribe()
    // }
    // try {
    //   const res = await fetch('/api/addSubscription', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ subscription }),
    //   })
    //   if (!res.ok)
    //     throw new Error(
    //       `Error saving subscription on server: ${res.statusText} (${res.status})`,
    //     )
    // } catch (error) {
    //   console.error('Error saving subscription on server:', error)
    //   unsubscribe()
    // }
  }

  async function checkSubscriptionStatus() {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      console.log('Subscription:', subscription)
      const exists = subscription !== null
      if (exists) {
        // just to make sure the subscription is saved on the server
        sendSubscriptionToServer(subscription)
      }
      return exists
    }
    return false
  }

  async function subscribeUser() {
    if ('serviceWorker' in navigator) {
      try {
        const res = await fetch('/api/vapidPubKey')
        const { data } = await res.json()
        console.log(data)

        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: data,
        })
        isSubscribed = true
        console.log('Subscription:', JSON.stringify(subscription))
        sendSubscriptionToServer(subscription)
      } catch (err) {
        console.error('Error subscribing:', err)
      }
    }
  }

  async function unsubscribe() {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
        isSubscribed = false
      }
    }
  }

  // async function testNotification() {
  //   await trpc($page).pushNotification.sendTestNotification.query()
  // }

  let formattedDate = $user?.created_at
    ? new Intl.DateTimeFormat('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format($user.created_at)
    : 'Unknown'

  let initials = $user?.username
    ? $user.username.substring(0, 2).toUpperCase()
    : ''

    const emailIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  `;
  
  const checkIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" class="ml-1 h-4 w-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  `;
  
  const errorIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" class="ml-1 h-4 w-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>
  `;
</script>

<SEO
  {...getSEOProps({
    title: 'My Profile',
    description: 'Edit your profile',
  })}
/>

<main class="min-h-[91vh] bg-base-200">
  <div class="container mx-auto max-w-2xl px-4 py-8">
    <div class="rounded-lg border bg-base-100 shadow-sm">
      <div class="p-6">
        <div
          class="flex flex-col items-center gap-6 sm:flex-row sm:items-start"
        >
          <div
            class="relative h-20 w-20 overflow-hidden rounded-full bg-gray-100"
          >
            <!-- <img src="/placeholder.svg?height=80&width=80" alt="Profile picture" class="h-full w-full object-cover" /> -->
            <div
              class="absolute inset-0 flex items-center justify-center bg-gray-100 text-lg font-medium"
            >
              {initials}
            </div>
          </div>

          <div class="flex-1 space-y-1 text-center sm:text-left">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
              <h2 class="text-2xl font-bold">{$user.username}</h2>
              <div
                class="flex items-center justify-center gap-2 sm:justify-start"
              >
                <span
                  class={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${$user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                >
                  {$user.is_active ? 'Active' : 'Inactive'}
                </span>
                <span
                  class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium capitalize text-gray-800"
                >
                  {$user.role}
                </span>
              </div>
            </div>

            <div
              class="mt-2 flex items-center justify-center gap-1 sm:justify-start"
            >
            {@html emailIcon}
            <span class="text-sm">{$user.email}</span>
            {#if $user.emailVerified}
              {@html checkIcon}
            {:else}
              {@html errorIcon}
            {/if}
            </div>

            <div
              class="flex items-center justify-center gap-1 sm:justify-start"
            >
            {@html emailIcon}
              <span class="text-sm">Conta criada em {formattedDate}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="my-4 h-px bg-gray-200"></div>

      <div class="p-6">
        <div class="space-y-4">
          <div>
            <h3 class="mb-2 flex items-center gap-2 text-sm font-medium">
              {@html checkIcon}

              Permissões
            </h3>

            <div class="flex flex-wrap gap-2">
              {#if $user.meta.permissions && $user.meta.permissions.length > 0}
                {#each $user.meta.permissions as permission}
                  <span
                    class="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
                  >
                    {permission}
                  </span>
                {/each}
              {:else}
                <span class="text-sm text-gray-500">
                  Usuario não tem permissões
                </span>
              {/if}
            </div>
          </div>
          <div>
            <h3 class="mb-2 flex items-center gap-2 text-sm font-medium">
              {@html errorIcon}

              Status da conta
            </h3>

            <div class="grid md:grid-cols-2 gap-4">
              <div class="rounded-md bg-gray-100 p-3">
                <div class="text-sm font-medium">Verificação do email</div>
                <div class="mt-1 flex items-center gap-3">
                  {#if $user.emailVerified}
                    {@html checkIcon}
                    <span class="text-sm">Verificado</span>
                  {:else}
                    {@html errorIcon}
                    <span class="text-sm">Não verificado</span>
                  {/if}
                </div>
              </div>

              <div class="rounded-md bg-gray-100 p-3">
                <div class="text-sm font-medium">Status da conta</div>
                <div class="mt-1 flex items-center gap-3">
                  {#if $user.is_active}
                    {@html checkIcon}
                    <span class="text-sm">Ativa</span>
                  {:else}
                    {@html errorIcon}
                    <span class="text-sm">Inativo</span>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-6">
      <UserSessions userSessions={sessions} />
    </div>
  </div>

  <!-- <div
    class="mx-auto w-full max-w-md rounded-lg border border-primary bg-base-100 shadow-sm"
  >
    <div class="flex flex-col space-y-1.5 p-6">
      <h3
        class="whitespace-nowrap text-2xl font-semibold leading-none tracking-tight text-center mb-2"
      >
        Edit Profile
      </h3>
      <div class="space-y-6">
        <div class="flex flex-col items-center gap-4">
          <span
            class="relative flex h-24 w-24 overflow-hidden rounded-full border-4 border-primary shadow-lg"
          >
            <img
              class="aspect-square h-full w-full object-cover"
              src="https://generated.vusercontent.net/placeholder-$user.jpg"
              alt="profile"
            />
          </span>
          <p>
            {$user?.username}
          </p>
          <p>
            {$user?.email}
          </p>
          <p>
            {$user?.email_verified ? 'verified' : 'not verified'}
          </p>
          <p>
            {$user?.role}
          </p>
        </div>

        <div class="flex flex-col gap-3">
          <h1>Sessions:</h1>

          {#each sessions as s}
            <div class="rounded bg-base-200 p-2">
              <p>
                id: {s.id}
              </p>
              <p>
                expiration: {new Date(s.expiresAt)}
              </p>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <div class="px-5 pb-5">
      <h1 class="">Settings</h1>

      <div class="mt-4">
        <h2 class="">Push Notifications</h2>
        <p>Receive notifications when albums are updated.</p>
        <div class="mt-3 space-y-3">
          {#if nottifPermGranted === null}
            <p>Checking permissions...</p>
          {:else if nottifPermGranted === false}
            <button
              class="btn btn-outline"
              type="button"
              onclick={requestNotificationPermission}
            >
              Enable notifications
            </button>
          {:else}
            <p>
              Subscribed to push notifications: <b>{isSubscribed}</b>
            </p>
            {#if isSubscribed}
              <div class="pb-5">
                <button
                  class="btn btn-outline"
                  type="button"
                  onclick={unsubscribe}
                >
                  Unsubscribe
                </button>
                <button class="btn btn-outline" onclick={testNotification}>
                  Test Notification
                </button>
              </div>
            {/if}
          {/if}
        </div>
      </div>
    </div>
  </div> -->
</main>
