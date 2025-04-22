<script lang="ts">
  import { modal, Modal } from '$lib/components/modal'
  import { icons } from '$lib/utils'
  import { getEnderecoFromCEP } from '$lib/utils/cep'
  import { trpc } from '$trpc/client'
  import { page } from '$app/state'
  import { toast } from 'svelte-sonner'
  import type { SelectAddress, SelectCustomer } from '$db/schema'
  import Separator from './ui/separator/separator.svelte'

  type Props = {
    customer_id: SelectCustomer['id']
    invalidate: (address:SelectAddress) => void | undefined
  }
  
  let { customer_id,invalidate }:Props = $props()

  let formEndereco = $state({
      number: '',
      id: 0,
      created_at: '',
      updated_at: '',
      customer_id: 0,
      cep: '',
      street: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      country: '',
    })

  let isLoading = $state(false)
  let disabled = $state(false)

  async function addAddress() {
    isLoading = true
    try {
      let newAddress = await trpc(page).customer.insertAddress.mutate({
        customer_id: customer_id,
        cep: formEndereco.cep,
        street: formEndereco.street,
        number: formEndereco.number,
        complement: formEndereco.complement,
        neighborhood: formEndereco.neighborhood,
        city: formEndereco.city,
        state: formEndereco.state,
        country: 'BR',
        distance: 0,
      })
      toast.success('Endereco adicionado com sucesso!')
      
      if(!newAddress) {
        throw new Error('Erro ao adicionar endereco')
      }
      
      // invalidate(newAddress)
      
      let distance = await trpc(page).customer.calculateDistance.mutate({ 
        cep: formEndereco.cep,
        street: formEndereco.street,
        number: formEndereco.number,
        bairro: formEndereco.neighborhood,
        city: formEndereco.city,
        state: formEndereco.state,
        country: 'BR',
      })

      
      if(distance>0 && newAddress) {
        distance = Math.round(distance)
        await trpc(page).customer.updateAddress.mutate({
          id:newAddress.id,
          address:{
            distance:distance,
          }
        })
      }
      invalidate(newAddress)
    } catch (error: any) {
      toast.error(error.message)
      return error.message
    } finally {
      isLoading = false
    }
  }

  async function handleCep(cep: string) {
    disabled = true
    const responseapi = await getEnderecoFromCEP(cep)
    if (responseapi.bairro) {
      formEndereco.neighborhood = responseapi.bairro
    }
    if (responseapi.logradouro) {
      formEndereco.street = responseapi.logradouro
    }
    if (responseapi.uf) {
      formEndereco.state = responseapi.uf
    }
    if (responseapi.localidade) {
      formEndereco.city = responseapi.localidade
    }
    console.log(responseapi)
    disabled = false
  }
</script>

<main class="flex flex-col items-center space-y-4">
  <label class="form-control w-full">
    <div class="label">
      <span class="label-text">CEP</span>
    </div>
    <input
      type="text"
      placeholder="Digite seu CEP"
      class="input input-bordered w-full"
      onchange={async e => {
        const value = (e.target as HTMLInputElement)?.value
        if (value.length === 8) {
          await handleCep(value)
        }
        if (value.length != 8) {
          disabled = false
        }
        console.log(value)
      }}
      bind:value={formEndereco.cep}
      disabled={disabled || isLoading}
    />
  </label>

  <label class="form-control w-full">
    <div class="label">
      <span class="label-text">Bairro</span>
    </div>
    <input
      type="text"
      placeholder="Digite seu Bairro"
      class="input input-bordered w-full"
      bind:value={formEndereco.neighborhood}
      disabled={disabled || isLoading}
    />
  </label>

  <label class="form-control w-full">
    <div class="label">
      <span class="label-text">Cidade</span>
    </div>
    <input
      type="text"
      placeholder="Digite sua Cidade"
      class="input input-bordered w-full"
      bind:value={formEndereco.city}
      disabled={disabled || isLoading}
    />
  </label>

  <label class="form-control w-full">
    <div class="label">
      <span class="label-text">Rua</span>
    </div>
    <input
      type="text"
      placeholder="Digite sua Cidade"
      class="input input-bordered w-full"
      bind:value={formEndereco.street}
      disabled={disabled || isLoading}
    />
  </label>

  <label class="form-control w-full">
    <div class="label">
      <span class="label-text">Estado</span>
    </div>
    <input
      type="text"
      placeholder="Digite seu Estado"
      class="input input-bordered w-full"
      bind:value={formEndereco.state}
      disabled={disabled || isLoading}
    />
  </label>

  <label class="form-control w-full">
    <div class="label">
      <span class="label-text">Numero</span>
    </div>
    <input
      type="text"
      placeholder="Digite seu Numero"
      class="input input-bordered w-full"
      bind:value={formEndereco.number}
    />
  </label>

  <label class="form-control w-full">
    <div class="label">
      <span class="label-text">Complemento</span>
    </div>
    <input
      type="text"
      placeholder="Digite o Complemento"
      class="input input-bordered w-full"
      bind:value={formEndereco.complement}
    />
  </label>
</main>

<Separator class="my-4"/>

<div class="flex w-full justify-end">
  <div class="flex gap-3 w-full">
    <button class="btn btn-primary w-full"disabled={isLoading} onclick={addAddress}>{isLoading?'Adicionando...':'Salvar novo endereco'}</button>
  </div>
</div>
