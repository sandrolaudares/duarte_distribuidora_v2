<script lang="ts">
  import { modal, FormModal } from '$components/modal'
  import AddressModal from '$lib/components/modal/AddressModal.svelte'
  import { icons } from '$lib/utils/icons'

  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'
  import { toast } from 'svelte-sonner'
  import EditableCell from '$lib/components/editableCells/EditableCell.svelte'
  import EditableCurrency from '$lib/components/editableCells/EditableCurrency.svelte'
  import type { CustomerWaddress } from '$lib/server/db/schema/customer/controller'
  import EditableBoolean from '$lib/components/editableCells/EditableBoolean.svelte'

  let {
    customer,
  }: { customer: Exclude<Awaited<ReturnType<CustomerWaddress>>, undefined> } =
    $props()

  let isLoading = $state(false)

  async function handleDeleteCustomer(id: number) {
    try {
      await trpc($page).customer.deleteCustomer.mutate(id)
      toast.success('Cliente deletado com sucesso!')
      window.location.href = './'
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  async function handleUpdate(value: unknown, key = '', row: any) {
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
</script>

<div class="mx-4 flex items-center justify-between">
  <h1 class="text-xl font-bold">Informacões do cliente:</h1>
  <!-- <div class="flex gap-2">
    <button
      class="btn btn-error flex gap-2"
      onclick={() => handleDeleteCustomer(customer.id)}
    >
      Deletar cliente
      {@html icons.trash()}
    </button>
    <button
      class="btn btn-primary flex gap-2"
      onclick={() =>
        modal.open(AddressModal, {
          customer_id: customer.id,
        })}
    >
      Adicionar endereço
      {@html icons.plus()}
    </button>
  </div> -->
</div>
<div class="mt-2">
  <div class="overflow-x-auto">
    <table class="table table-zebra table-xs w-full">
      <thead>
        <tr class="font-bold">
          <!-- <th>Criado em</th> -->
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
          <!-- <td>
            {customer.created_at
              ? new Date(customer.created_at).toLocaleDateString()
              : 'N/A'}
          </td> -->
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
            <EditableBoolean
            labelTrue={"Pessoa Fisica"}
            labelFalse={"Pessoa Juridica"}
              value={customer.is_retail}
              onUpdateValue={async newValue => {
                handleUpdate(newValue, 'is_retail', customer)
              }}
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
 
</div>
