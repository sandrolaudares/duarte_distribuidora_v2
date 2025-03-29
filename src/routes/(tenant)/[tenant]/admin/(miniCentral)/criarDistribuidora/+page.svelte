<script lang="ts">
  // import { applyAction, enhance } from '$app/forms'
  import ProgressBar from '$lib/components/ProgressBar.svelte'
  // import Info from '$lib/client/components/Info.svelte'

  import { website } from '$lib/config'
  import { getDomainAndType, icons } from '$lib/utils'
  import { getEnderecoFromCEP } from '$lib/utils/cep'
  import { toast } from 'svelte-sonner'
  import { superForm,type FormResult  } from 'sveltekit-superforms'
  import SuperDebug from 'sveltekit-superforms'
  import { zod } from 'sveltekit-superforms/adapters'
  import { schemaStep1, schemaStep2 } from './schema'
  import { page } from '$app/stores'
  import type { PageData, ActionData } from './$types';
  import { dev } from '$app/environment'

  import { PUBLIC_DOMAIN } from '$env/static/public'

  let { data,form }: { data: PageData; form:ActionData } = $props()

  const prefix = dev ? 'http' : 'https'

  let success = $state(false)
  let domain = $state({
    href: '',
    text: ''
  })
  let err = $state('')

  const { form: formData, errors, message, enhance, delayed, allErrors } =
    superForm(data.form, {
      dataType: 'json',
      onError: error => {
        success = false
        console.log(error)
        err = form?.message ?? 'Erro ao criar distribuidora'
        toast.error(error.result.error.message)
      },
      onUpdated: ({ form:formData }) => {
        if (formData.valid) {
          success = true
          if(form?.result?.domain){
            domain.text = form?.result?.domain
            domain.href = form?.result?.domain
          } else {
            domain.text = 'Erro ao criar link, volte a central'
            domain.href = `${prefix}://${PUBLIC_DOMAIN}`
          }
        }
        if (formData.message && formData.valid) {
          toast.success(formData.message)
        }
      },
      applyAction: true,
      resetForm: true,
      invalidateAll: true || 'force',
    })

  let steps = $state([
    { title: 'Insira os dados', status: 'Pendente', schema: zod(schemaStep1) },
    {
      title: 'Informações adicionais',
      status: 'Pendente',
      schema: zod(schemaStep2),
    },
  ])

  $effect(() => {
    if ($formData) {
      if (
        $formData.tenantName &&
        $formData.subdomain &&
        $formData.name &&
        $formData.email &&
        $formData.password &&
        $formData.confirmPassword &&
        $formData.password === $formData.confirmPassword
      ) {
        steps[0].status = 'Concluido'
      }
      if (
        $formData.phone &&
        $formData.cep &&
        $formData.street &&
        $formData.neighborhood &&
        $formData.city &&
        $formData.number
      ) {
        steps[1].status = 'Concluido'
      }
    }
  })

  let currentActive: number = $state(1)
  let stepAtivo = $derived(steps[currentActive - 1])
  let progressBar: { handleProgress: (stepIncrement: number) => void } = $state(
    { handleProgress: () => {} },
  )

  const handleProgress = (stepIncrement: number) => {
    currentActive += stepIncrement
  }

  async function handleCep(cep: string) {
    const responseapi = await getEnderecoFromCEP(cep)
    if (responseapi.bairro) {
      $formData.neighborhood = responseapi.bairro
    }
    if (responseapi.logradouro) {
      $formData.street = responseapi.logradouro
    }
    if (responseapi.uf) {
      $formData.state = responseapi.uf
    }
    if (responseapi.localidade) {
      $formData.city = responseapi.localidade
    }
    console.log(responseapi)
  }
</script>
<!-- 
{#if $message}
  <div
    class="status"
    class:error={$page.status >= 400}
    class:success={$page.status == 200}
  >
    {$message}
  </div>
{/if} -->

<div
  class="bg-base-50 flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8"
>
  <div class="w-full max-w-lg space-y-8">
    {#if success == false}
      <ProgressBar {steps} bind:currentActive bind:this={progressBar} />
    {/if}
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold">
        Criar nova distribuidora
      </h2>
      <p class="text-base-600 mt-2 text-center text-sm">
        {success == true ? '' : 'Digite os dados necessarios abaixo:'}
      </p>
    </div>

    {#if success == true}
      <div class="rounded-md bg-success bg-opacity-20 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg
              class="h-5 w-5 text-green-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-green-800">
              Distribuidora criada com sucesso!
            </h3>
            <div class="mt-2 text-sm text-green-700">
              <p>Nova distribuidora disponivel em:</p>
              <a
                href={domain.href}
                target="_blank"
                rel="noopener noreferrer"
                class="font-medium underline"
              >
                {domain.text}
              </a>
            </div>
          </div>
        </div>
      </div>
    {:else}
      <form
        method="POST"
        action="?/create_tenant"
        class="mt-8 space-y-6"
        use:enhance
      >
        {#if stepAtivo.title === 'Insira os dados'}
          <div class="-space-y-px rounded-md shadow-sm">
            <div>
              <label for="tenantName" class="sr-only">Nome da filial</label>
              <input
                id="tenantName"
                name="tenantName"
                type="text"
                required
                class="relative block w-full appearance-none rounded-none rounded-t-md border border-base-300 px-3 py-2 placeholder-opacity-50 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                placeholder="Nome da filial"
                bind:value={$formData.tenantName}
              />
            </div>
            <div>
              <label for="subdomain" class="sr-only">Subdominio</label>
              <input
                id="subdomain"
                name="subdomain"
                type="text"
                required
                class="relative block w-full appearance-none rounded-none border border-base-300 px-3 py-2 placeholder-opacity-50 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                placeholder="Subdominio"
                bind:value={$formData.subdomain}
              />
            </div>
            <div>
              <label for="name" class="sr-only">Seu nome</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                class="relative block w-full appearance-none rounded-none border border-base-300 px-3 py-2 placeholder-opacity-50 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                placeholder="Seu nome"
                bind:value={$formData.name}
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
                class="relative block w-full appearance-none rounded-none border border-base-300 px-3 py-2 placeholder-opacity-50 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                placeholder="Email"
                bind:value={$formData.email}
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
                class="relative block w-full appearance-none rounded-none border border-base-300 px-3 py-2 placeholder-opacity-50 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                placeholder="Senha"
                bind:value={$formData.password}
              />
            </div>
            <div>
              <label for="confirmPassword" class="sr-only">
                Confirmar senha
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autocomplete="new-password"
                required
                class="relative block w-full appearance-none rounded-none rounded-b-md border border-base-300 px-3 py-2 placeholder-opacity-50 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                placeholder="Confirmar senha"
                bind:value={$formData.confirmPassword}
              />
            </div>
          </div>
          <button
            onclick={() => handleProgress(+1)}
            type="button"
            disabled={steps[0].status !== 'Concluido'}
            class="group relative flex w-full items-center justify-center gap-2 rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-base-300"
          >
            Proximo passo
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-arrow-right"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        {/if}
        {#if stepAtivo.title === 'Informações adicionais'}
          <div class="-space-y-px rounded-md shadow-sm">
            <div>
              <label for="phone" class="sr-only">Telefone</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                class="relative block w-full appearance-none rounded-none rounded-t-md border border-base-300 px-3 py-2 placeholder-opacity-50 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                placeholder="Telefone"
                bind:value={$formData.phone}
              />
            </div>
            <div>
              <label for="cep" class="sr-only">CEP</label>
              <input
                id="cep"
                name="cep"
                type="text"
                class="relative block w-full appearance-none rounded-none border border-base-300 px-3 py-2 placeholder-opacity-50 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                placeholder="CEP"
                bind:value={$formData.cep}
                onchange={async e => {
                  const target = e.target as HTMLInputElement
                  const value = target.value
                  if (value.length === 8) {
                    await handleCep(value)
                  }
                  console.log(value)
                }}
              />
            </div>
            <div>
              <label for="street" class="sr-only">Rua</label>
              <input
                id="street"
                name="street"
                type="text"
                class="relative block w-full appearance-none rounded-none border border-base-300 px-3 py-2 placeholder-opacity-50 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                placeholder="Rua"
                bind:value={$formData.street}
              />
            </div>
            <div>
              <label for="neighborhood" class="sr-only">Bairro</label>
              <input
                id="neighborhood"
                name="neighborhood"
                type="text"
                class="relative block w-full appearance-none rounded-none border border-base-300 px-3 py-2 placeholder-opacity-50 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                placeholder="Bairro"
                bind:value={$formData.neighborhood}
              />
            </div>
            <div>
              <label for="number" class="sr-only">Número</label>
              <input
                id="number"
                name="number"
                type="text"
                class="relative block w-full appearance-none rounded-none border border-base-300 px-3 py-2 placeholder-opacity-50 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                placeholder="Número"
                bind:value={$formData.number}
              />
            </div>
            <div>
              <label for="city" class="sr-only">Cidade</label>
              <input
                id="city"
                name="city"
                type="text"
                class="relative block w-full appearance-none rounded-none border border-base-300 px-3 py-2 placeholder-opacity-50 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                placeholder="Cidade"
                bind:value={$formData.city}
              />
            </div>
            <div>
              <label for="state" class="sr-only">Estado</label>
              <select
                id="state"
                name="state"
                required
                class="relative block w-full appearance-none rounded-none rounded-b-md border border-base-300 px-3 py-2 placeholder-opacity-50 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                placeholder="Estado"
              >
                <option value="AC">Acre</option>
                <option value="AL">Alagoas</option>
                <option value="AP">Amapá</option>
                <option value="AM">Amazonas</option>
                <option value="BA">Bahia</option>
                <option value="CE">Ceará</option>
                <option value="DF">Distrito Federal</option>
                <option value="ES">Espírito Santo</option>
                <option value="GO">Goiás</option>
                <option value="MA">Maranhão</option>
                <option value="MT">Mato Grosso</option>
                <option value="MS">Mato Grosso do Sul</option>
                <option value="MG" selected>Minas Gerais</option>
                <option value="PA">Pará</option>
                <option value="PB">Paraíba</option>
                <option value="PR">Paraná</option>
                <option value="PE">Pernambuco</option>
                <option value="PI">Piauí</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="RN">Rio Grande do Norte</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="RO">Rondônia</option>
                <option value="RR">Roraima</option>
                <option value="SC">Santa Catarina</option>
                <option value="SP">São Paulo</option>
                <option value="SE">Sergipe</option>
                <option value="TO">Tocantins</option>
                <option value="EX">Estrangeiro</option>
              </select>
            </div>
          </div>
          <button
            disabled={$delayed ||
              (steps[0].status !== 'Concluido' &&
                steps[1].status !== 'Concluido')}
            type="submit"
            class="group relative flex w-full items-center justify-center gap-2 rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-base-300"
          >
            {$delayed ? `Criando...` : 'Criar nova distribuidora'}
            {#if $delayed}
            <svg xmlns="http://www.w3.org/2000/svg"width="24"
            height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8A8 8 0 0 1 12 20Z" opacity=".5"/><path fill="currentColor" d="M20 12h2A10 10 0 0 0 12 2V4A8 8 0 0 1 20 12Z"><animateTransform attributeName="transform" dur="1s" from="0 12 12" repeatCount="indefinite" to="360 12 12" type="rotate"/></path></svg>
            {/if}
            {#if !$delayed}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-circle-plus"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8" />
                <path d="M12 8v8" />
              </svg>
            {/if}
          </button>
        {/if}
        {#if $allErrors.length}
          <div class="mt-2 flex flex-col gap-2">
            {#each $allErrors as error}
              <div class="rounded-md bg-error bg-opacity-20 p-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg
                      class="h-5 w-5 text-error"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800">Erro</h3>
                    <div class="mt-2 text-sm text-red-700">
                      <p>{error.messages.join('. ')}</p>
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}

        {#if err != ''}
          <div class="mt-2 flex flex-col gap-2">
              <div class="rounded-md bg-error bg-opacity-20 p-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg
                      class="h-5 w-5 text-error"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800">Erro</h3>
                    <div class="mt-2 text-sm text-red-700">
                      <p>{err}</p>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        {/if}
      </form>
    {/if}
  </div>
</div>
