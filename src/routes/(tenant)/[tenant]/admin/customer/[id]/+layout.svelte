<script lang="ts">
  import { page } from '$app/state'
  import { onMount, type Snippet } from 'svelte'
  import InfoCliente from './InfoCliente.svelte'
  import { Button } from '$lib/components/ui/button'
  import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from '$lib/components/ui/card'
  import { Separator } from '$lib/components/ui/separator'


  import {
    MapPin,
    Package,
    Edit,
    Plus,
    ShoppingBag,
    Calendar,
    Phone,
    CreditCard,
    Eye,
    Download,
    Mail,
  } from 'lucide-svelte'
  import { formatCurrency } from '$lib/utils'
  import { DateFormatter } from '@internationalized/date'
  import UsedCredits from '$lib/components/UsedCredits.svelte'
  import AddressesTable from './enderecos/AddressesTable.svelte'

  import type { LayoutData } from './$types'

  let { data, children }: { data: LayoutData; children: Snippet } = $props()

  let { customer } = data

  const df = new DateFormatter('pt-BR', {
    dateStyle: 'medium',
  })

  let isOpenModal: HTMLDialogElement | null = $state(null)
  
</script>

<div class=" px-2 py-8">
  <div class="grid grid-cols-1 gap-4 xl:grid-cols-3">
    <Card class="h-fit xl:col-span-1">
      <CardHeader class="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle class="text-sm">{customer.name}</CardTitle>
          <CardDescription class="text-xs text-gray-500">
            Desde: {customer.created_at
              ? df.format(customer.created_at)
              : 'Data não disponível'}
          </CardDescription>
        </div>
        <div class="badge badge-sm">
          {customer.is_retail ? 'Pessoa fisica' : 'Pessoa Juridica'}
        </div>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div class="flex items-center gap-2 text-xs">
            <Phone class="h-4 w-4 {customer.phone ? '' : 'text-error'}" />
            <p>{customer.phone ? customer.phone : 'Não cadastrado'}</p>
          </div>
          <div class="flex items-center gap-2 text-xs">
            <Mail class="h-4 w-4" />
            <p class={customer.email ? '' : 'text-error'}>
              {customer.email ? customer.email : 'Não cadastrado'}
            </p>
          </div>

          <div class="flex items-center gap-2 text-xs">
            <CreditCard class="h-4 w-4 " />
            <div>
              <!-- <p class="text-sm font-medium">Crédito</p> -->
              <p>
                Créditos fiado:
                <strong>
                  <UsedCredits id={customer.id} /> - {formatCurrency(
                    customer.max_credit,
                  )}
                </strong>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 text-xs">
            <p class="text-xs font-medium">CPF/CNPJ:</p>
            <p class={customer.cpf_cnpj ? '' : 'text-error'}>
              {customer.cpf_cnpj ? customer.cpf_cnpj : 'Não cadastrado'}
            </p>
          </div>

          {#if customer.rg_ie}
            <div class="flex items-center gap-2 text-xs">
              <p class="text-sm font-medium">RG/IE:</p>
              <p class={customer.rg_ie ? '' : 'text-error'}>
                {customer.rg_ie ? customer.rg_ie : 'Não cadastrado'}
              </p>
            </div>
          {/if}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outlinePrimary"
          class="w-full"
          size="sm"
          onclick={() => isOpenModal?.showModal()}
        >
          <Edit class="mr-2 h-4 w-4" />
          Editar cliente
        </Button>
      </CardFooter>
    </Card>

    <div class="xl:col-span-2">
      <div
        class="inline-flex h-10 w-full items-center justify-center rounded-md bg-base-300 p-1 text-base-content"
      >
        <a
          href="enderecos"
          class="flex w-full items-center justify-center gap-2 rounded-sm {page.url.pathname.includes('enderecos') ? 'bg-background' : ''} px-3 py-1.5 text-sm text-foreground shadow-sm focus-visible:outline-none"
        >
          <MapPin class="h-4 w-4" />
          Endereços
        </a>
        <a
          href="pedidos"
          class="flex w-full items-center justify-center gap-2 rounded-sm {page.url.pathname.includes('pedidos') ? 'bg-background' : ''} px-3 py-1.5 text-sm text-foreground shadow-sm focus-visible:outline-none"
        >
          <ShoppingBag class="h-4 w-4" />
          Pedidos
        </a>
      </div>
      {@render children()}
    </div>
  </div>
</div>

<dialog class="modal" bind:this={isOpenModal}>
  <div class="modal-box max-w-4xl">
    <InfoCliente {customer} />
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
