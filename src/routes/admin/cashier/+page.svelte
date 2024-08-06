<script lang="ts">
  import type { PageData } from './$types'

  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'

  import type { RouterInputs } from '$trpc/router'

  import { modal, FormModal } from '$components/modal'
  import { icons } from '$lib/utils'

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
            currency: toSave.currency,
          })

          window.location.reload()
        } catch (error: any) {
          return error.message
        }
      },
    })
  }

  function handleAddDistribuidora() {
    modal.open(
      FormModal<RouterInputs['distribuidora']['insertDistribuidora']>,
      {
        title: 'Adicionar distribuidora',
        fields: [
          {
            label: 'Nome',
            name: 'name',
            type: 'text',
            required: true,
          },
        ],
        save: async toSave => {
          try {
            await trpc($page).distribuidora.insertDistribuidora.mutate({
              name: toSave.name,
            })
            window.location.reload()
          } catch (error: any) {
            return error.message
          }
        },
      },
    )
  }
</script>

<main class="container mx-auto">
  <div
    class="mb-7 flex flex-col items-center justify-between gap-5 rounded-lg bg-base-200 p-3 lg:flex-row"
  >
    <h1 class="text-center text-4xl font-semibold">Selecione o caixa</h1>

    <div class="flex gap-2">
      <a href="/admin/caixa/transacoes" class="btn btn-primary">
        Ver transacões dos caixas
      </a>
      <button
        class="btn btn-primary flex gap-2"
        onclick={handleAddDistribuidora}
      >
        Add distribuidora {@html icons.plus()}
      </button>
    </div>
  </div>
  <div class="grid grid-cols-1 justify-center gap-2 lg:grid-cols-3">
    {#each distribuidoras as distribuidora}
      <div class="flex flex-col gap-3">
        <h1 class="min-w-48 rounded p-2 text-center text-xl">
          {distribuidora.name}:
        </h1>
        <button
          class="btn btn-outline mx-auto"
          onclick={() => handleAddCachier(distribuidora.id)}
        >
          Adicionar Caixa
        </button>
        <div class="flex flex-col gap-2 text-center">
          {#each distribuidora.cashiers as caixa}
            <a
              href="/admin/cashier/{caixa.id}"
              class="btn btn-primary flex justify-between p-3"
            >
              {caixa.name}
              <span class="text-end font-bold">
                Valor no caixa: R${caixa.currency}
              </span>
            </a>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</main>
