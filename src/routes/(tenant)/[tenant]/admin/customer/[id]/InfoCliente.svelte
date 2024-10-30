<script lang="ts">
    import { modal, FormModal } from '$components/modal'
  import AddressModal from '$lib/components/modal/AddressModal.svelte'
     import { icons } from '$lib/utils/icons'

      import { trpc } from '$trpc/client'
  import { page } from '$app/stores'
  import { toast } from 'svelte-sonner'

    export let customer
    let endereco = {
    number: '',
    id: '',
    created_at: '',
    updated_at: '',
    customer_id: '',
    cep: '',
    street: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    country: '',
  }
  let newcustomer = customer

// function checkChanges() {
  //   isChanged = JSON.stringify(customer) !== JSON.stringify(newcustomer)
  // }

  // async function updateCustomer() {
  //   try {
  //     await trpc($page).customer.updateCustomer.mutate({
  //       id: customer.id,
  //       customer: {
  //         name: newcustomer.name,
  //         email: newcustomer.email ?? undefined,
  //         phone: newcustomer.phone ?? undefined,
  //         cellphone: newcustomer.cellphone ?? undefined,
  //         max_credit: newcustomer.max_credit ?? undefined,
  //       },
  //     })
  //     toast.success('Informacoes atualizadas com sucesso!')
  //     endereco = {
  //       number: '',
  //       id: '',
  //       created_at: '',
  //       updated_at: '',
  //       customer_id: '',
  //       cep: '',
  //       street: '',
  //       complement: '',
  //       neighborhood: '',
  //       city: '',
  //       state: '',
  //       country: '',
  //     }
  //   } catch (error: any) {
  //     toast.error(error.message)
  //   }
  // }

    async function handleDeleteCustomer(id: number) {
    try {
      await trpc($page).customer.deleteCustomer.mutate(id)
      toast.success('Cliente deletado com sucesso!')
      window.location.href = './'
    } catch (error: any) {
      toast.error(error.message)
    }
  }
</script>


<div class="mx-4 flex items-center justify-between">
    <h1 class="text-xl font-bold">Informacões do cliente:</h1>
    <div class="flex gap-2">
      <button
        class="btn btn-error flex gap-2"
        on:click={() => handleDeleteCustomer(customer.id)}
      >
        Deletar cliente
        {@html icons.trash()}
      </button>
      <button
        class="btn btn-primary flex gap-2"
        on:click={() =>
          modal.open(AddressModal, {
            customer_id: customer.id,
          })}
      >
        Adicionar endereço
        {@html icons.plus()}
      </button>
    </div>
  </div>
  <div class="mt-2 grid grid-cols-2">
    <div class="overflow-x-auto">
      <table class="table table-zebra table-sm w-full">
        <thead>
          <tr class="font-bold">
            <th>Criado em</th>
            <th>Name</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>CPF/CNPJ</th>
            <th>Max Credit</th>
            <th>Tipo de Cliente</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              {customer.created_at
                ? new Date(customer.created_at).toLocaleDateString()
                : 'N/A'}
            </td>
            <td>{customer.name}</td>
            <td>{customer.email || 'Não cadastrado'}</td>
            <td>{customer.phone || 'Não cadastrado'}</td>
            <td>{customer.cpf_cnpj || 'Não cadastrado'}</td>
            <td>R${(customer.max_credit / 100).toFixed(2)}</td>
            <td>{customer.is_retail ? 'Varejo' : 'Atacado'}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- <div
      class="mx-auto mb-6 min-h-96 w-fit rounded-xl border bg-base-200 p-4 shadow-sm xl:mx-4" >
      <div class="mb-2">
        <strong>Data de Criação:</strong>
        <span>{newcustomer.created_at}</span>
      </div>
      <div class="mb-4 flex flex-col text-2xl font-bold md:flex-row">
        ID: {newcustomer.id} -
        <div class="md:ml-2">
          <input
            type="text"
            bind:value={newcustomer.name}
            on:change={checkChanges}
            class="editable-input"
            placeholder="Não informada"
          />
        </div>
      </div>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class=" ">
          <strong>CPF/CNPJ:</strong>
          <p class="editable-input">
            {customer.cpf_cnpj ?? 'Não informado'}
          </p>
        </div>
        <div class=" ">
          <strong>RG/IE:</strong>
          <input
            type="text"
            bind:value={newcustomer.rg_ie}
            on:change={checkChanges}
            class="editable-input"
            placeholder="Não informado"
          />
        </div>

        <div class=" ">
          <strong>E-mail:</strong>
          <input
            type="email"
            bind:value={newcustomer.email}
            on:change={checkChanges}
            class="editable-input"
            placeholder="Não informado"
          />
        </div>
        <div class=" ">
          <strong>Celular:</strong>
          <input
            type="text"
            bind:value={newcustomer.cellphone}
            on:change={checkChanges}
            class="editable-input"
            placeholder="Não informada"
          />
        </div>
        <div class=" ">
          <strong>Fixo:</strong>
          <input
            type="text"
            bind:value={newcustomer.phone}
            on:change={checkChanges}
            class="editable-input"
            placeholder="Não informado"
          />
        </div>
        <div class=" ">
          <strong>Data de Nascimento:</strong>
          <input
            type="date"
            bind:value={newcustomer.birth_date}
            on:change={checkChanges}
            class="editable-input"
            placeholder="Não informada"
          />
        </div>
      </div>
      <div class="mt-4 flex w-full items-center justify-between gap-2">
        <div
          class="block w-fit rounded-lg bg-primary p-2 text-lg font-semibold text-black"
        >
          Crédito: R${newcustomer.used_credit} / R$
          <input
            type="number"
            class="editable-input-2 ml-1 min-w-28"
            bind:value={newcustomer.max_credit}
            on:change={checkChanges}
            placeholder="Máximo"
          />
        </div>
        {#if isChanged}
          <button class="btn btn-primary block w-fit" on:click={updateCustomer}>
            Salvar informações
          </button>
        {/if}
      </div>
    </div> -->

    <div class="overflow-x-auto">
      <table class="table table-sm w-full">
        <thead>
          <tr>
            <th>CEP</th>
            <th>Cidade</th>
            <th>Rua</th>
            <th>Bairro</th>
            <th>Numero</th>
            <th>Complemento</th>
            <th>UF</th>
            <th>Distancia</th>
          </tr>
        </thead>
        <tbody>
          {#each customer.adresses as address}
            <tr>
              <td>{address.cep}</td>
              <td>{address.city}</td>
              <td>{address.street}</td>
              <td>
                {address.neighborhood}
              </td>
              <td>{address.number}</td>
              <td>
                {address.complement}
              </td>
              <td>{address.state}</td>
              <td>{(address.distance/1000).toFixed(0)}Km</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  <!-- 
<style>
  .editable-input {
    border: none;
    background: transparent;
    color: inherit;
    font-size: inherit;
    width: 100%;
    padding: 0;
    margin: 0;
    outline: none;
    border-bottom: 1px solid transparent;
    transition: border-bottom-color 0.2s;
  }
  .editable-input {
    border-bottom-color: #000;
    transition: border-bottom-color 0.3s ease;
  }
  .editable-input:focus {
    border-bottom-color: #facc15;
  }
  .editable-input::placeholder {
    color: #a8a8a8;
  }

  .editable-input-2 {
    border: none;
    background: transparent;
    font-size: inherit;
    width: auto;
    max-width: 80px;
    padding: 0;
    margin: 0;
    outline: none;
    border-bottom: 1px solid transparent;
    transition: border-bottom-color 0.2s;
  }
</style> -->
