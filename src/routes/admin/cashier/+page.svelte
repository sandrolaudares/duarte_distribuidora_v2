<script lang="ts">
  import type { PageData } from './$types'

  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'

  import type { RouterInputs } from '$trpc/router'

  import { modal, FormModal } from '$components/modal'
  import { icons } from '$lib/utils'

  export let data: PageData

  let cashiers = data

  function handleAddCachier() {
    modal.open(FormModal<RouterInputs['distribuidora']['insertCashier']>, {
      title: 'Adicionar Caixa',
      fields: [
        {
          label: 'Nome',
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          label: 'Quantidade em Caixa',
          name: 'currency',
          type: 'currency',
          required: true,
          value: 0,
        },
      ],
      save: async toSave => {
        try {
          await trpc($page).distribuidora.insertCashier.mutate({
            name: toSave.name,
            currency: toSave.currency,
          })

          window.location.reload()
        } catch (error: any) {
          return error.message
        }
      },
    })
  }
</script>

<main class="container mx-auto">
  <div
    class="mb-7 flex flex-col items-center justify-between gap-5 rounded-lg bg-base-200 p-3 lg:flex-row"
  >
    <h1 class="text-center text-4xl font-semibold">Selecione o caixa</h1>

    <div class="flex gap-2">
      <a href="/admin/cashier/transactions" class="btn btn-primary">
        Ver transacões dos caixas
      </a>
    </div>
  </div>
  <div class="flex flex-col justify-center gap-3">
    <button class="btn btn-outline mx-auto" onclick={handleAddCachier}>
      Adicionar Caixa
    </button>
    <div class="flex flex-col gap-2 text-center lg:mx-96">
      {#each cashiers.distribuidoras as caixa}
        <a
          href="/admin/cashier/{caixa.id}"
          class="btn btn-primary flex justify-between p-3"
        >
          {caixa.name}
          <span class="text-end font-bold">
            Valor no caixa: R${(caixa.currency / 100).toFixed(2)}
          </span>
        </a>
      {/each}
    </div>
  </div>
</main>
