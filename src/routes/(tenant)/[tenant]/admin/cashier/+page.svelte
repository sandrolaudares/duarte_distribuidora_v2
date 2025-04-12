<script lang="ts">
  import type { PageData } from './$types'

  import { trpc } from '$trpc/client'
  import { page } from '$app/state'

  import type { RouterInputs } from '$trpc/router'

  import { modal, FormModal } from '$components/modal'
  import { formatCurrency, icons } from '$lib/utils'
  import { toast } from 'svelte-sonner'
  import CurrencyInput from '$lib/components/input/CurrencyInput.svelte'
  import { getUserContext } from '$lib/stores/user'

  let { data }: { data: PageData } = $props()

  let { distribuidoras, tenant } = data

  const user = getUserContext()

  function handleAddCachier() {
    modal.open(FormModal, {
      title: 'Adicionar Caixa',
      fields: [
        {
          label: 'Nome',
          name: 'name',
          type: 'text',
          required: true,
        },
        // {
        //   label: 'Quantidade em Caixa',
        //   name: 'currency',
        //   type: 'currency',
        //   required: false,
        //   value: 0,
        // },
      ],
      save: async toSave => {
        try {
          await trpc(page).distribuidora.insertCashier.mutate({
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

  async function handleDeleteCashier(id: number) {
    try {
      await trpc(page).distribuidora.deleteCashierById.mutate(id)
      toast.success('Caixa deletado com sucesso!')
      window.location.reload()
    } catch (error) {
      toast.error('Erro ao deletar o caixa!')
    }
  }

  let editingLink: { [key: number]: boolean } = $state({})

  function editLink(id: number) {
    editingLink[id] = !editingLink[id]
  }

  async function handleEditNameCashier(id: number, data: string) {
    try {
      await trpc(page).distribuidora.updateCashier.mutate({
        id: id,
        data: {
          name: data,
        },
      })
      toast.success('Nome editado com sucesso!')
    } catch (error) {
      toast.error('Erro ao editar nome')
    }
  }

  let taxa = $state(0)

  if (tenant?.taxa_por_km) taxa = tenant?.taxa_por_km

  async function updateCashierDeliveryFee() {
    try {
      await trpc(page).distribuidora.updateDistribuidora.mutate({
        id: tenant?.tenantId ?? 0,
        data: { taxa_por_km: taxa },
      })
      Math.round(taxa)
      console.log(taxa)
      toast.success('Taxa de entrega atualizada!')
      isTaxaChanged = false
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  let isTaxaChanged = $state(false)
</script>

<main class="mx-2">
  <div
    class="mb-7 flex flex-col items-center justify-end gap-5lg:flex-row"
  >
    <!-- <h1 class="text-center text-4xl font-semibold">Selecione o caixa</h1> -->

    <div class="flex flex-col gap-2 lg:flex-row w-full justify-center">
      <div class="flex gap-2">
        <a href="/admin/cashier/transactions" class="btn btn-primary">
          Ver transacões dos caixas
        </a>
      </div>
      {#if $user && $user.role !== 'caixa'}
      <div class="flex gap-2 items-center">
        <div class="flex gap-2 input input-bordered rounded-xl items-center justify-between">
          <div class="label">
            <span class="label-text">Valor entrega por quilometro:</span>
          </div>
            <CurrencyInput
              bind:value={taxa}
              oninput={() => {
                isTaxaChanged = true
              }}
              rawStyle={true}
              size="max-w-14"
            />
          </div>
          {#if isTaxaChanged}
            <button class="btn btn-primary" onclick={updateCashierDeliveryFee}>
              salvar
            </button>
          {/if}

      </div>
      {/if}

    </div>
  </div>
  <div class="flex flex-col justify-center gap-3">
    {#if $user && $user.role !== 'caixa'}
      <button class="btn btn-outline mx-auto" onclick={handleAddCachier}>
        Adicionar Caixa
      </button>
    {/if}
    <div class="flex flex-col gap-2 text-center">
      {#each distribuidoras as caixa}
          <div class="flex items-center gap-3  container mx-auto max-w-2xl">
            <div class="flex w-full justify-center gap-3">
              {#if !editingLink[caixa.id]}
                <a
                  href="/admin/cashier/{caixa.id}"
                  class="btn btn-primary flex flex-1 justify-between p-2 items-center"
                >
                  <span class="flex flex-col text-start">
                    {caixa.name}
                    {#if caixa.user_in && caixa.status === 'Aberto'}
                      <p class="flex justify-start text-center font-normal text-xs">
                        Nesse caixa: {caixa.user_in}
                      </p>
                    {/if}
                  </span>
                  <span class="text-center font-bold">
                    Valor no caixa:
                    {formatCurrency(caixa.currency)}
                  </span>
                </a>
                {#if $user && $user.role !== 'caixa'}
                  <button
                    class="btn btn-circle btn-primary"
                    onclick={() => editLink(caixa.id)}
                  >
                    {@html icons.edit()}
                  </button>
                  <button
                    class="btn btn-circle"
                    onclick={() => {
                      if (
                        confirm(
                          'Tem certeza que gostaria de excluir o caixa?',
                        ) === true
                      ) {
                        handleDeleteCashier(caixa.id)
                      } else {
                        toast.info('Ação cancelada!')
                      }
                    }}
                  >
                    {@html icons.trash()}
                  </button>
                {/if}
              {:else if $user && $user.role !== 'caixa'}
                <input
                  type="text"
                  bind:value={caixa.name}
                  class="input input-primary flex w-full justify-between p-3"
                />
                <button
                  class="btn btn-circle btn-primary"
                  onclick={() => {
                    editLink(caixa.id)
                    handleEditNameCashier(caixa.id, caixa.name)
                  }}
                >
                  {@html icons.save()}
                </button>
                <button
                  class="btn btn-circle"
                  onclick={() => {
                    editLink(caixa.id)
                  }}
                >
                  {@html icons.x()}
                </button>
              {/if}
            </div>
            <p
              class="badge min-w-24 {caixa.status === 'Fechado'
                ? 'badge-error'
                : ' badge-success text-white '}"
            >
              {caixa.status}
            </p>
          </div>
      {/each}
    </div>
  </div>
</main>
