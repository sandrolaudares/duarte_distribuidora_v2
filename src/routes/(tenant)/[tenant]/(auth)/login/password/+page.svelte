<script lang="ts">
  import SEO, { getSEOProps } from '$lib/components/SEO/index.svelte'
  import { enhance } from '$app/forms'

  import type { ActionData } from './$types'

  let { form }: { form: ActionData } = $props()

  let isLoading = $state(false)
</script>

<SEO
  {...getSEOProps({
    title: 'sign in',
    description: 'Sign in using password',
  })}
/>

<main class="flex min-h-[90vh] items-center justify-center bg-base-200">
  <div class="w-full max-w-sm rounded-lg bg-base-100 p-8 shadow-lg">
    <h1 class="text-center text-2xl font-semibold">Login com senha</h1>
    <form
      method="post"
      use:enhance={() => {
        isLoading = true

        return async ({ update }) => {
          await update()
          isLoading = false
        }
      }}
      class="mt-6 flex flex-col gap-4"
    >
      <div>
        <label for="email" class="block text-sm font-medium">Email</label>
        <input
          class="input input-bordered mt-1 w-full"
          name="email"
          id="email"
          type="email"
        />
      </div>
      <div>
        <label for="password" class="block text-sm font-medium">Senha</label>
        <input
          class="input input-bordered mt-1 w-full"
          type="password"
          name="password"
          id="password"
        />
      </div>
      <button class="btn btn-primary mt-4 w-full" disabled={isLoading}>
        {#if isLoading}
          Carregando...
        {:else}
          Continuar
        {/if}
      </button>
      <p class=" mt-2 text-center text-sm">{form?.message ?? ''}</p>
    </form>
    <p class="mt-4 text-center text-sm">
      Não tem uma conta?
      <a href="/signup" class="text-primary hover:underline">Crie agora!</a>
    </p>

    {#if form?.message}
      <p class="mt-2 text-center text-sm">
        Esqueceu sua senha?

        <a href="/reset-password" class="link">Reinicie aqui!</a>
      </p>
    {/if}
  </div>
</main>
