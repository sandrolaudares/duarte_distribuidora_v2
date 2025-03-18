<script lang="ts">
  import EditableCell from '$lib/components/editableCells/EditableCell.svelte'
  import type { CustomerWaddress } from '$lib/server/db/schema/customer/controller'

  import { trpc } from '$trpc/client'
  import { page } from '$app/state'
  import { toast } from 'svelte-sonner'
  import Loading from '$lib/components/Loading.svelte'
  let {
    customer,
  }: { customer: Exclude<Awaited<ReturnType<CustomerWaddress>>, undefined> } =
    $props()

  // let isLoading = $state(false)
  async function handleUpdateAddress(value: unknown, key = '', row: any) {
    const last_val = row[key]
    try {
      await trpc(page).customer.updateAddress.mutate({
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

  let loadingRows: Record<number, boolean> = $state({})

  async function recalcDistance(address: (typeof customer.adresses)[0]) {
    loadingRows[address.id] = true
    try {
      let distance = await trpc(page).customer.calculateDistance.mutate({
        cep: address.cep,
        street: address.street,
        number: address.number,
        bairro: address.neighborhood,
        city: address.city,
        state: address.state, //select
        country: 'BR',
      })

      distance = Math.round(distance)
      address.distance = distance

      if (distance) {
        await trpc(page).customer.updateAddress.mutate({
          id: address.id,
          address: {
            distance: distance,
          },
        })
      }
      toast.success('Distância recalculada com sucesso!')
    } catch (error) {
      toast.error('Erro ao recalcular')
    } finally {
      loadingRows[address.id] = false
    }
  }
</script>

<div class="overflow-x-auto">
  <table class="table table-xs w-full">
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
          <td>
            <EditableCell
              value={address.state}
              onUpdateValue={async newValue => {
                handleUpdateAddress(newValue, 'state', address)
              }}
            />
          </td>
          <!-- <td>{(address.distance / 1000).toFixed(0)}Km</td> -->
          <td class="flex items-center">
            {#if loadingRows[address.id] == true}
              <div role="status">
                <svg aria-hidden="true" class="w-4 h-4 me-2 text-gray-200 animate-spin  fill-primary" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
                <span class="sr-only">Loading...</span>
            </div>
              Calculando...
            {:else}
              <EditableCell
                value={address.distance
                  ? (address.distance / 1000).toFixed(0)
                  : 'N/A'}
                onUpdateValue={async newValue => {
                  const distance = Number(newValue) * 1000
                  handleUpdateAddress(distance, 'distance', address)
                }}
              />{address.distance ? 'km' : ''}
            {/if}
          </td>
          <td>
            <button
              class="badge badge-primary badge-xs"
              onclick={() => recalcDistance(address)}
            >
              Recalcular
            </button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
