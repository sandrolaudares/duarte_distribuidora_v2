<script lang="ts">
  import { modal, FormModal } from '$components/modal'
  import AddressModal from '$lib/components/modal/AddressModal.svelte'
  import { icons } from '$lib/utils/icons'

  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'
  import { toast } from 'svelte-sonner'
  import EditableCell from '$lib/components/editableCells/EditableCell.svelte'
  import EditableCurrency from '$lib/components/editableCells/EditableCurrency.svelte'
  import EditableTipoPessoa from '$lib/components/editableCells/EditableTipoPessoa.svelte'

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

  async function handleDeleteCustomer(id: number) {
    try {
      await trpc($page).customer.deleteCustomer.mutate(id)
      toast.success('Cliente deletado com sucesso!')
      window.location.href = './'
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  async function handleUpdate(value: unknown, key = '', row:any) {
    const last_val = row[key]
    try {
      await trpc($page).customer.updateCustomer.mutate({
        id: row.id,
        customer: { [key]: value },
      })
      row[key] = value
      toast.success('Atualizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao atualizar')
      row[key] = last_val
    }
  }
  async function handleUpdateAddress(value: unknown, key = '', row:any) {
    const last_val = row[key]
    try {
      await trpc($page).customer.updateAddress.mutate({
        id: row.id,
        address: { [key]: value },
      })
      row[key] = value
      toast.success('Atualizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao atualizar')
      row[key] = last_val
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
          <td>
            <EditableCell
              value={customer.name}
              onUpdateValue={async newValue => {
                handleUpdate(newValue, 'name', customer)
              }}
            />
          </td>
          <td>
            <EditableCell
              value={customer.email}
              onUpdateValue={async newValue => {
                handleUpdate(newValue, 'email', customer)
              }}
            />
          </td>
          <td>
            <EditableCell
              value={customer.phone}
              onUpdateValue={async newValue => {
                handleUpdate(newValue, 'phone', customer)
              }}
            />
          </td>
          <td>
            <EditableCell
              value={customer.cpf_cnpj}
              onUpdateValue={async newValue => {
                handleUpdate(newValue, 'cpf_cnpj', customer)
              }}
            />
          </td>
          <td>
            <EditableCurrency
              value={customer.max_credit}
              onUpdateValue={async newValue => {
                handleUpdate(newValue, 'max_credit', customer)
              }}
            />
          </td>
          <td>
            <EditableTipoPessoa
              value={customer.is_retail ? 'Pessoa física' : 'Pessoa jurídica'}
              onUpdateValue={async newValue => {
                handleUpdate(newValue, 'is_retail', customer)
              }}
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
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
            <td>
              <EditableCell
                value={address.cep}
                onUpdateValue={async newValue => {
                  handleUpdateAddress(newValue, 'cep', address)
                }}
              />
            </td>
            <td>
              <EditableCell
                value={address.city}
                onUpdateValue={async newValue => {
                  handleUpdateAddress(newValue, 'city', address)
                }}
              />
            </td>
            <td>
              <EditableCell
                value={address.street}
                onUpdateValue={async newValue => {
                  handleUpdateAddress(newValue, 'street', address)
                }}
              />
            </td>
            <td>
              <EditableCell
              value={address.neighborhood}
              onUpdateValue={async newValue => {
                handleUpdateAddress(newValue, 'neighborhood', address)
              }}
            />
            </td>
            <td>
              <EditableCell
              value={address.number}
              onUpdateValue={async newValue => {
                handleUpdateAddress(newValue, 'number', address)
              }}
            />
            </td>
            <td>
              <EditableCell
              value={address.complement}
              onUpdateValue={async newValue => {
                handleUpdateAddress(newValue, 'complement', address)
              }}
            />
            </td>
            <td><EditableCell
              value={address.state}
              onUpdateValue={async newValue => {
                handleUpdateAddress(newValue, 'state', address)
              }}
            /></td>
            <td>{(address.distance / 1000).toFixed(0)}Km</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
