<script lang="ts">
  import { enhance } from '$app/forms'
  // import Info from '$lib/client/components/Info.svelte'

  import { website } from '$lib/config'
  import { icons } from '$lib/utils'
  import type { PageData, ActionData } from './$types'

  export let data: PageData

  export let form: ActionData
</script>

<div class="min-h-[80vh] bg-base-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold">
        Criar nova distribuidora
      </h2>
      <p class="mt-2 text-center text-sm text-base-600">
        {form?.data?.domain ? '':'Digite os dados necessarios abaixo:'}
      </p>
    </div>
    
    {#if form?.data?.domain}
    <div class="rounded-md bg-success bg-opacity-20 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-green-800">
            Distribuidora criada com sucesso!
          </h3>
          <div class="mt-2 text-sm text-green-700">
            <p>Nova distribuidora disponivel em:</p>
            <a href={form.data.domain} target="_blank" rel="noopener noreferrer" class="font-medium underline">
              {form.data.domain}
            </a>
          </div>
        </div>
      </div>
    </div>
    {:else}
      <form
        method="POST"
        action="?/create_tenant"
        use:enhance
        class="mt-8 space-y-6"
      >
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="tenantName" class="sr-only">Nome da filial</label>
            <input
              id="tenantName"
              name="tenantName"
              type="text"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-base-300 placeholder-opacity-50 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              placeholder="Nome da filial"
              value={form?.form?.tenantName ?? ''}
            />
          </div>
          <div>
            <label for="subdomain" class="sr-only">Subdominio</label>
            <input
              id="subdomain"
              name="subdomain"
              type="text"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-base-300 placeholder-opacity-50 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              placeholder="Subdominio"
              value={form?.form?.subdomain ?? ''}
            />
          </div>
          <div>
            <label for="name" class="sr-only">Seu nome</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-base-300 placeholder-opacity-50 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              placeholder="Seu nome"
              value={form?.form?.name ?? ''}
            />
          </div>
          <div>
            <label for="email" class="sr-only">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-base-300 placeholder-opacity-50 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              placeholder="Email"
              value={form?.form?.email ?? ''}
            />
          </div>
          <div>
            <label for="password" class="sr-only">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              autocomplete="new-password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-base-300 placeholder-opacity-50 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              placeholder="Senha"
            />
          </div>
          <div>
            <label for="confirmPassword" class="sr-only">Confirmar senha</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autocomplete="new-password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-base-300 placeholder-opacity-50 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              placeholder="Confirmar senha"
            />
          </div>
          {#if form?.message}
          <div class="rounded-md bg-error bg-opacity-20 p-4 mt-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-error" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  Error
                </h3>
                <div class="mt-2 text-sm text-red-700">
                  <p>{form.message}</p>
                </div>
              </div>
            </div>
          </div>
          {/if}
        </div>


        <div>
          <button
            type="submit"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md bg-primary hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Criar distribuidora
          </button>
        </div>
      </form>
    {/if}
  </div>
</div>