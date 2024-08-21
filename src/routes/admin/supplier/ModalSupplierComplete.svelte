<script lang="ts" generics="T">
  import { Modal } from '$lib/components/modal'
  import { modal } from '$lib/components/modal'
  import { onMount } from 'svelte'
  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'

  import type { RouterOutputs } from '$trpc/router'
  import { toast } from 'svelte-sonner'

  type Supplier = RouterOutputs['stock']['getSupplier']

  let suppliers: Supplier = []

  let new_suppliers = {
    name: '',
    razao_social: '',
    cnpj_cpf: '',
    ie_rg: '',
    telephone_1: '',
    telephone_2: '',
    cep: '',
  }

  onMount(async () => {
    suppliers = await trpc($page).stock.getSupplier.query()
  })

  async function createSupplier() {
    if (!new_suppliers.name) {
      return toast.error('Nome do fornecedor não pode ser vazio!')
    }
    try {
      const [resp] = await trpc($page).stock.insertSupplier.mutate({
        name: new_suppliers.name,
        razao_social: new_suppliers.razao_social,
        cnpj_cpf: new_suppliers.cnpj_cpf,
        ie_rg: new_suppliers.ie_rg,
        telephone_1: new_suppliers.telephone_1,
        telephone_2: new_suppliers.telephone_2,
        cep: new_suppliers.cep,
      })
      toast.success('Fornecedor criado com sucesso!')
      suppliers = [...suppliers, resp]

      modal.close()
    } catch (error) {
      toast.error('Erro ao criar fornecedor!')
    } 
  }
</script>

<Modal title="Fornecedor">
  <div class="my-3 flex flex-col gap-4">
    <!-- {#each suppliers as supplier}
      <div class="flex items-center justify-between">
        <div>
          <p class="font-bold">{supplier.name}</p>
        </div>
      </div>
    {/each} -->

    <label class="form-control w-full">
      <div class="flex gap-2">
        <div>
          <div class="label">
            <span class="label-text">Nome</span>
          </div>
          <input
            type="text"
            placeholder="Nome novo fornecedor"
            class="input input-bordered w-full"
            bind:value={new_suppliers.name}
          />
        </div>
        <div>
          <div class="label">
            <span class="label-text">Razão social</span>
          </div>
          <input
            type="text"
            placeholder="Razão social"
            class="input input-bordered w-full"
            bind:value={new_suppliers.razao_social}
          />
        </div>
      </div>

      <div>
        <div class="label">
          <span class="label-text">CEP</span>
        </div>
        <input
          type="text"
          placeholder="cep"
          class="input input-bordered w-full"
          bind:value={new_suppliers.cep}
        />
      </div>

      <div class="label">
        <span class="label-text">CNPJ</span>
      </div>
      <input
        type="text"
        placeholder="CNPJ"
        class="input input-bordered w-full"
        bind:value={new_suppliers.cnpj_cpf}
      />
      <div class="label">
        <span class="label-text">IE</span>
      </div>
      <input
        type="text"
        placeholder="IE"
        class="input input-bordered w-full"
        bind:value={new_suppliers.ie_rg}
      />
      <div class="flex gap-2">
        <div>
          <div class="label">
            <span class="label-text">Telefone 1</span>
          </div>
          <input
            type="text"
            placeholder="Telefone"
            class="input input-bordered w-full"
            bind:value={new_suppliers.telephone_1}
          />
        </div>

        <div>
          <div class="label">
            <span class="label-text">Telefone 2</span>
          </div>
          <input
            type="text"
            placeholder="Telefone"
            class="input input-bordered w-full"
            bind:value={new_suppliers.telephone_2}
          />
        </div>
      </div>
    </label>
  </div>
  <svelte:fragment slot="footer">
    <div class="mt-4 flex w-full">
      <button class="btn btn-primary w-full" on:click={createSupplier}>
        Criar fornecedor
      </button>
    </div>
  </svelte:fragment>
</Modal>
