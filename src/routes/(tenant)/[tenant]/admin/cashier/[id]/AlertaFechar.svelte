<script lang="ts">
  import { onMount, type Snippet } from 'svelte'
  import * as Alert from '$lib/components/ui/alert/index'
  import { CircleAlert } from 'lucide-svelte'
  import { toast } from 'svelte-sonner'
  import type { SelectCashier } from '$lib/server/db/schema'
  import type {
    SelectTenant,
    WorkSchedule,
  } from '$lib/server/db/central/schema'

  type Props = {
    cashier: SelectCashier
    tenant: SelectTenant
  }

  let { cashier, tenant }: Props = $props()
  let isOpenModal: HTMLDialogElement | null = $state(null)

  function beforeUnload(event: BeforeUnloadEvent) {
    if (showMessage === true) {
      event.preventDefault()
      isOpenModal?.showModal()
      event.returnValue = 'Fechar caixa antes de sair'
    }
  }

  let showMessage = $state(false)

  function checkCashierStatus() {
    const now = new Date()
    const dayIndex = now.getDay()
    const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()

    console.log(currentSeconds)

    const dias: (keyof WorkSchedule)[] = [
      'domingo',
      'segunda',
      'terca',
      'quarta',
      'quinta',
      'sexta',
      'sabado',
    ]
    const diaAtual = dias[dayIndex]

    const horarioHoje = tenant.funcionamento?.[diaAtual]
    console.log(horarioHoje)

    if (horarioHoje && currentSeconds >= horarioHoje.end -7200 && cashier.status === 'Aberto') {
      showMessage = true
    } else {
      showMessage = false
    }
  }

  onMount(() => {
    showMessage = false
    checkCashierStatus()

    const interval = setInterval(() => {
      checkCashierStatus()
    }, 300000)

    return () => clearInterval(interval)
  })
</script>

<div class="mx-2">
  <div class="mb-2">
    {#if showMessage}
      <Alert.Root variant="destructive" class="animate-pulse bg-error/10">
        <CircleAlert class="size-4" />
        <Alert.Title>ALERTA!</Alert.Title>
        <Alert.Description>Lembre-se de feixar o caixa</Alert.Description>
      </Alert.Root>
    {/if}
  </div>
</div>

<svelte:window on:beforeunload={beforeUnload} />

<dialog bind:this={isOpenModal} class="modal">
  <div class="modal-box m-0 rounded-lg p-0">
    <Alert.Root variant="destructive" class="animate-pulse bg-error/10">
      <CircleAlert class="size-4" />
      <Alert.Title>ALERTA!</Alert.Title>
      <Alert.Description>
        Lembre-se de feixar o caixa antes de sair
      </Alert.Description>
    </Alert.Root>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
