<script lang="ts" generics="T">
  import { Modal } from '$lib/components/modal'
  import { modal } from '$lib/components/modal'
  import Cardapio from '$components/Cardapio.svelte'
  import { onMount } from 'svelte'
  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'

  import type { RouterOutputs } from '$trpc/router'
  import ModalEndereco from './ModalEndereco.svelte'
  import Loading from '$lib/components/Loading.svelte'
  import { toast } from 'svelte-sonner'

  type Clientes = RouterOutputs['customer']['getCustomers']

  let isLoading = true

  let clientes: Clientes = []
  let filteredClientes = clientes

  let newCliente = {
    name: '',
    phone: '',
    is_retail: true,
  }
  onMount(async () => {
    try {
      clientes = await trpc($page).customer.getCustomers.query()
      console.log(clientes)
      filteredClientes = clientes
    } catch (error: any) {
      console.error(error.message)
      toast.error(error.message)
    }

    isLoading = false
  })

  export let selectedClient: (client: Clientes[0]) => void
  let searchTerm = ''

  const searchClientes = () => {
    return (filteredClientes = clientes.filter(cliente => {
      let nome = cliente.name.toLowerCase()
      return nome.includes(searchTerm.toLowerCase())
    }))
  }

  async function handleInsertCliente() {
    try {
      isLoading = true
      await trpc($page).customer.insertCustomer.mutate(newCliente)
      newCliente.name = ''
      newCliente.phone = ''
      toast.success('Cliente inserido com sucesso!')
      filteredClientes = await trpc($page).customer.getCustomers.query()
      isLoading = false
    } catch (error: any) {
      toast.error(error.message)
      console.error(error.message)
      isLoading = false
    }
  }
</script>

<Modal title="Clientes">
  <div class="my-4 flex flex-col gap-4">
    <h1>Criação rápida de cliente</h1>
    <div class="grid grid-cols-3 gap-2">
      <label class="input input-bordered flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          class="h-4 w-4 opacity-70"
        >
          <path
            d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z"
          />
        </svg>
        <input
          type="text"
          class="grow"
          placeholder="Nome"
          bind:value={newCliente.name}
        />
      </label>
      <label class="input input-bordered flex items-center gap-2">
        <input
          type="text"
          class="grow"
          placeholder="Telefone"
          bind:value={newCliente.phone}
        />
      </label>
      <button class="btn btn-primary" on:click={handleInsertCliente}>
        Adicionar
      </button>
    </div>
    <hr />
    <label class="input input-bordered flex items-center gap-2">
      <input
        type="text"
        class="grow"
        placeholder="Search"
        bind:value={searchTerm}
        on:input={searchClientes}
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        class="h-4 w-4 opacity-70"
      >
        <path
          fill-rule="evenodd"
          d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
          clip-rule="evenodd"
        />
      </svg>
    </label>

    {#if isLoading}
      <div class="flex items-center justify-center">
        <Loading />
      </div>
    {/if}

    {#if searchTerm && clientes.length === 0}
      <p class="text-center">Nenhum cliente com esse nome foi encontrado</p>
    {:else}
      {#each filteredClientes as cliente}
        <div class="flex items-center justify-between">
          <div>
            <p class="font-bold">{cliente.name}</p>
            <p>{cliente.phone}</p>
          </div>

          <button
            class="btn btn-primary"
            on:click={() => {
              selectedClient(cliente)
            }}
          >
            Selecionar
          </button>
        </div>
      {/each}
    {/if}
  </div>
</Modal>
