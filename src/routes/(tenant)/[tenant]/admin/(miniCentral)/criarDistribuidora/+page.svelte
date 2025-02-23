<script lang="ts">
  import { applyAction, enhance } from '$app/forms'
  import ProgressBar from '$lib/components/ProgressBar.svelte'
  // import Info from '$lib/client/components/Info.svelte'

  import { website } from '$lib/config'
  import { icons } from '$lib/utils'
  import { getEnderecoFromCEP } from '$lib/utils/cep'
  import { toast } from 'svelte-sonner'
  import type { PageData, ActionData } from './$types'

  let { data, form }: { data: PageData; form: ActionData } = $props()

  let steps = $state([
    { title: 'Insira os dados', status: 'Pendente' },
    { title: 'Informações adicionais', status: 'Pendente' },
  ])

  $effect(() => {
    if (infos) {
      if (
        infos.tenantName &&
        infos.subdomain &&
        infos.name &&
        infos.email &&
        infos.password &&
        infos.confirmPassword &&
        infos.password === infos.confirmPassword
      ) {
        steps[0].status = 'Concluido'
      }
      if (
        infos.phone &&
        infos.cep &&
        infos.street &&
        infos.neighborhood &&
        infos.city &&
        infos.number
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

  let isLoading = $state(false)

  let infos = $state({
    tenantName: '',
    subdomain: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    cep: '',
    street: '',
    neighborhood: '',
    number: '',
    city: '',
    state: 'MG',
  })

  async function handleCep(cep: string) {
    const responseapi = await getEnderecoFromCEP(cep)
    if (responseapi.bairro) {
      infos.neighborhood = responseapi.bairro
    }
    if (responseapi.logradouro) {
      infos.street = responseapi.logradouro
    }
    if (responseapi.uf) {
      infos.state = responseapi.uf
    }
    if (responseapi.localidade) {
      infos.city = responseapi.localidade
    }
    console.log(responseapi)
  }
</script>

<div
  class="bg-base-50 flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8"
>
  <div class="w-full max-w-lg space-y-8">
    {#if !form?.data?.domain}
      <ProgressBar {steps} bind:currentActive bind:this={progressBar} />
    {/if}
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold">
        Criar nova distribuidora
      </h2>
      <p class="text-base-600 mt-2 text-center text-sm">
        {form?.data?.domain ? '' : 'Digite os dados necessarios abaixo:'}
      </p>
    </div>

    {#if form?.data?.domain}
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
                href={form.data.domain}
                target="_blank"
                rel="noopener noreferrer"
                class="font-medium underline"
              >
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
        use:enhance={({ formData }) => {
          isLoading = true
          // console.log(infos)
          formData.set('tenantName', infos.tenantName)
          formData.set('subdomain', infos.subdomain)
          formData.set('name', infos.name)
          formData.set('email', infos.email)
          formData.set('password', infos.password)
          formData.set('confirmPassword', infos.confirmPassword)
          return async ({ update, result }) => {
            // await update()
            console.log('RESULTADO:', result)
            if(result.type ==='error') {
              toast.error(result.error)
            } else if (result.type === 'success') {
              toast.success('Distribuidora criada com sucesso!')
            } else {
              toast.error('Erro ao criar distribuidora')
            }
            isLoading = false
            // await applyAction(result)
          }
        }}
        class="mt-8 space-y-6"
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
                bind:value={infos.tenantName}
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
                bind:value={infos.subdomain}
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
                bind:value={infos.name}
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
                bind:value={infos.email}
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
                bind:value={infos.password}
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
                bind:value={infos.confirmPassword}
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
        {:else if stepAtivo.title === 'Informações adicionais'}
          <div class="-space-y-px rounded-md shadow-sm">
            <div>
              <label for="phone" class="sr-only">Telefone</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                class="relative block w-full appearance-none rounded-none rounded-t-md border border-base-300 px-3 py-2 placeholder-opacity-50 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                placeholder="Telefone"
                bind:value={infos.phone}
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
                bind:value={infos.cep}
                onchange={async e => {
                  const value = e.target?.value
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
                bind:value={infos.street}
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
                bind:value={infos.neighborhood}
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
                bind:value={infos.number}
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
                bind:value={infos.city}
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
            disabled={isLoading ||
              (steps[0].status !== 'Concluido' &&
                steps[1].status !== 'Concluido')}
            type="submit"
            class="group relative flex w-full items-center justify-center gap-2 rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-base-300"
          >
            {isLoading ? 'Criando...' : 'Criar nova distribuidora'}
            {#if !isLoading}
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
        {#if form?.success == false}
          <div class="mt-4 rounded-md bg-error bg-opacity-20 p-4">
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
                <h3 class="text-sm font-medium text-red-800">Error</h3>
                <div class="mt-2 text-sm text-red-700">
                  <p>{form.message}</p>
                </div>
              </div>
            </div>
          </div>
        {/if}
      </form>
    {/if}
  </div>
</div>
