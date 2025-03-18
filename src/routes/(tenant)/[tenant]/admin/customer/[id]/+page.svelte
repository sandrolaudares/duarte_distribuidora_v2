<script lang="ts">
  import SuperSelect from '$lib/components/input/Select.svelte'
  import { icons } from '$lib/utils/icons'
  import { modal, FormModal } from '$components/modal'
  import type { PageData } from './$types'

  import type { RouterInputs } from '$trpc/router'

  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'

  import { toast } from 'svelte-sonner'
  import AddressModal from '$lib/components/modal/AddressModal.svelte'
  import CardShowPedidos from '$lib/components/cards/CardShowPedidos.svelte'
  import { onMount } from 'svelte'
  import DateFilter from '$lib/components/DateFilter.svelte'
  import {
    TableHandler,
    Datatable,
    ThSort,
    ThFilter,
    Th,
    RowsPerPage,
    Pagination,
  } from '@vincjo/datatables'
  import NoResults from '$lib/components/NoResults.svelte'
  import ThCalendar from './ThCalendar.svelte'
  import InfoCliente from './InfoCliente.svelte'
  import PedidoCliente from './PedidoCliente.svelte'

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
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from '$lib/components/ui/tabs'

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
  import AddressesTable from './AddressesTable.svelte'

  let { data }: { data: PageData } = $props()

  let { customer, orders } = data

  const table = new TableHandler(orders, {
    rowsPerPage: 100,
    i18n: {
      show: 'Mostrar',
      entries: 'entradas',
      previous: 'Anterior',
      next: 'Próximo',
      noRows: 'Nenhum encontrado',
      filter: 'Filtrar',
    },
  })

  const df = new DateFormatter('pt-BR', {
    dateStyle: 'medium',
  })

  let isOpenModal: HTMLDialogElement | null = $state(null)

  // $: sum = table.createCalculation('total').sum()

  const sum = $derived(table.createCalculation('total').sum())
  //TODO: SOMA apenas rows renderizadas, não  
</script>

<div class=" px-2 py-8">
  <div class="grid grid-cols-1 gap-4 xl:grid-cols-3">
    <Card class="h-fit xl:col-span-1">
      <CardHeader class="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle class="text-sm">{customer.name}</CardTitle>
          <CardDescription class="text-gray-500 text-xs">
            Desde: {customer.created_at
              ? df.format(customer.created_at)
              : 'Data não disponível'}
          </CardDescription>
        </div>
        <div
          class="badge badge-sm"
        >
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
        <Button variant="outlinePrimary" class="w-full" size="sm" onclick={()=> isOpenModal?.showModal()}>
          <Edit class="mr-2 h-4 w-4" />
          Editar cliente
        </Button>
      </CardFooter>
    </Card>

    <div class="xl:col-span-2">
      <Tabs value="addresses">
        <TabsList class="grid w-full grid-cols-2">
          <TabsTrigger value="addresses" class="flex items-center gap-2">
            <MapPin class="h-4 w-4" />
            <span class="hidden sm:inline">Endereços</span>
          </TabsTrigger>
          <TabsTrigger value="orders" class="flex items-center gap-2">
            <ShoppingBag class="h-4 w-4" />
            <span class="hidden sm:inline">Pedidos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="addresses" class="space-y-4 pt-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Todos endereços:</h2>
            <Button
              size="sm"
              variant="default"
              onclick={() => {
                modal.open(AddressModal, {
                  customer_id: customer.id,
                })
              }}
            >
              <Plus class="mr-2 h-4 w-4" />
              Adicionar Endereço
            </Button>
          </div>

          <AddressesTable {customer} />
        </TabsContent>

        <TabsContent value="orders" class="">
          <Card class="h-full overflow-hidden border-none shadow-none">
            <CardContent class="p-0 h-full">
              <div >
                <PedidoCliente {df} {table} total={sum} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
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
