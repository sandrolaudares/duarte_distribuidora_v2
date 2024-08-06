<script lang="ts">
  import type { PageData } from './$types'

  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'

  import type { RouterInputs } from '$trpc/router'

  import { modal, FormModal } from '$components/modal'

  export let data: PageData

  const { distribuidoras } = data

  function handleAddCachier(distribuidora_id: number) {
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
            distribuidora_id: distribuidora_id,
            name: toSave.name,
            currency: 0,
          })

          window.location.reload()
        } catch (error: any) {
          return error.message
        }
      },
    })
  }
</script>

<main>
  <div class="flex justify-around">
    {#each distribuidoras as distribuidora}
      <div class="flex flex-col">
        <div>{distribuidora.name}</div>

        <button class="btn" onclick={() => handleAddCachier(distribuidora.id)}>
          Adicionar Caixa
        </button>

        {#each distribuidora.cashiers as caixa}
          <a href="/admin/cashier/{caixa.id}">
            <pre>
            {JSON.stringify(caixa, null, 2)}
          </pre>
          </a>
        {/each}
      </div>
    {/each}
  </div>
</main>
