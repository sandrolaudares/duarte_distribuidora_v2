<script lang="ts">
  import type { PageData } from './$types'

  export let data: PageData

  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'

  import { toast } from 'svelte-sonner'

  let { customer, orders } = data

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
<pre>
  {JSON.stringify(data.customer, null, 2)}
</pre>
<pre>
  {JSON.stringify(data.orders, null, 2)}
</pre>
