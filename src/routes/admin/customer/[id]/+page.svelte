<script lang="ts">
  import type { PageData } from './$types'

  export let data: PageData

  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'

  import { toast } from 'svelte-sonner'

  let { customer, orders } = data
  let newcustomer = customer

  let isChanged = false

  customer = { ...newcustomer }

  function checkChanges() {
    isChanged = JSON.stringify(customer) !== JSON.stringify(newcustomer)
  }

  async function updateCustomer() {
    try {
      await trpc($page).customer.updateCustomer.mutate({
        id: customer.id,
        customer: {
          name: customer.name,
          email: customer.email ?? undefined,
          phone: customer.phone ?? undefined,
          cellphone: customer.cellphone ?? undefined,
          max_credit: customer.max_credit ?? undefined,
        },
      })
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  async function addAddress() {
    // talvez usar o form modal aqui
    try {
      await trpc($page).customer.insertAddress.mutate({
        customer_id: customer.id,
        cep: '00000-000',
        street: 'Rua Teste',
        number: '123',
        complement: 'Casa',
        neighborhood: 'Bairro Teste',
        city: 'Cidade Teste',
        state: 'ST',
        country: 'BR',
      })
    } catch (error: any) {
      toast.error(error.message)
    }
  }
</script>

<!-- TODO: frontend -->
<!-- <pre>
  {JSON.stringify(data.customer, null, 2)}
</pre>
<pre>
  {JSON.stringify(data.orders, null, 2)}
</pre> -->

<main class="min-h-screen mt-10">
  <div class="mx-auto mb-6 w-fit rounded-xl border bg-base-200 p-4 shadow-sm">
    <div class="md:flex">
      <div class="md:flex-shrink-0">
        <div class="mb-2 ">
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
            <input
              type="text"
              bind:value={newcustomer.cpf_cnpj}
              on:change={checkChanges}
              class="editable-input"
              placeholder="Não informada"
            />
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
						<button
							class="btn btn-primary block w-fit "
						>
							Salvar informações
						</button>
					{/if}
        </div>
      </div>
    </div>
  </div>
  {#each orders as order}
    <div class=" mt-4 rounded-lg border bg-base-100 p-6 shadow-sm">
      <div class="mb-4 flex flex-col gap-2 text-center text-lg md:flex-row">
        <h3>
          Pedido <strong>#{order.id}</strong>
          -
        </h3>
        <p>
          Total: <strong>R${order.total}</strong>
          -
        </p>
        <p>
          Tipo do pedido: <strong>{order.payment_method}</strong>
        </p>
        <p>
          Status do pedido: <strong>{order.status}</strong>
        </p>
      </div>
      <div>
        <h4 class="mb-2 text-lg font-semibold">Produtos pedidos:</h4>
        <div
          class="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
        >
          {#each order.items as produto}
            <div class="flex rounded-md bg-white p-2 shadow-sm">
              <p class="text-gray-800">
                {produto.quantity}x -
                {produto.product.name}-
                <span class="font-bold text-success">
                  R${produto.price}
                </span>
              </p>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/each}
</main>

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
</style>
