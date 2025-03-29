<script lang="ts">
  import { DatabaseBackupIcon, Plus } from 'lucide-svelte'
  import type { PageData } from './$types'
  import Button from '$lib/components/ui/button/button.svelte'
  import AddressesTable from './AddressesTable.svelte'
  import { modal } from '$components/modal'
  import AddressModal from '$lib/components/modal/AddressModal.svelte'
  import { invalidate, invalidateAll } from '$app/navigation'
  import { page } from '$app/state'

  let { data }: { data: PageData } = $props()

  $inspect(data.enderecos)
</script>

<div class="flex items-center justify-between mt-2">
  <h2 class="text-xl font-semibold">Todos endereços:</h2>
  <Button
    size="sm"
    variant="default"
    onclick={() => {
      modal.open(AddressModal, {
        customer_id: data.customer.id,
       
      })
    }}
  >
    <Plus class="mr-2 h-4 w-4" />
    Adicionar Endereço
  </Button>
</div>

<AddressesTable adresses={data.enderecos}/>
