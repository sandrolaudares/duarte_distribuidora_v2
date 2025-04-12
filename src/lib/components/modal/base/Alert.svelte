<script lang="ts">
  import { Modal, modal } from '$lib/components/modal'

  interface Props {
    title?: string
    text: string
    onConfirm?: () => Promise<void> | void
    onCancel?: () => Promise<void> | void
  }

  const {
    title = 'Alerta!!!!',
    text = 'Tem certeza?!?',
    onCancel,
    onConfirm,
  }: Props = $props()

  async function confirm() {
    modal.close()
    if (onConfirm) await onConfirm()
  }

  async function cancel() {
    modal.close()
    if (onCancel) await onCancel()
  }
</script>

  <Modal {title}>
    <p>{text}</p>
    {#snippet footer()}
    {#if onConfirm}
      <button class="btn" onclick={confirm}>Confirm</button>
    {/if}
    <button class="btn" onclick={cancel}>
      {onCancel ? 'Cancel' : 'Close'}
    </button>
    {/snippet}
  </Modal>
