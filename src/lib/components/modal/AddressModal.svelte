<script lang="ts">
  import { modal, Modal } from '$lib/components/modal'
  import type { SelectCustomer } from '$db/schema'
  import AddAdress from '../AddAdress.svelte'
  import { invalidateAll } from '$app/navigation'

  type Props = {
    customer_id: SelectCustomer['id']
  }

  let { customer_id }: Props = $props()

</script>

<Modal title="Cadastre um endereco para o cliente">
  <AddAdress {customer_id}
  invalidate={()=>{
    modal.close()
    invalidateAll()
  }}
  />
</Modal>
