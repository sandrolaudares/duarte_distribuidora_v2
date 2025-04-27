<script lang="ts">
  import { Modal, modal } from '$lib/components/modal'

  interface Props {
    title?: string
    text: string
    onConfirm?: () => Promise<void> | void
    onCancel?: () => Promise<void> | void
    confirmText?:string
  }

  const {
    title = 'Alerta!!!!',
    text = 'Tem certeza?!?',
    onCancel,
    onConfirm,
    confirmText = 'Confirmar'
  }: Props = $props()

  async function confirm() {
    if (onConfirm) await onConfirm()
    modal.close()
  }

  async function cancel() {
    if (onCancel) await onCancel()
    modal.close()
  }
</script>

  <Modal {title}>
    <p class="my-3 text-lg text-center">{text}</p>
    <div class="flex justify-end gap-2">
      {@render footer()}
    </div>
  </Modal>
  {#snippet footer()}
  {#if onCancel}
  <button class="btn" onclick={cancel}>Fechar</button>
  {/if}
  {#if onConfirm}
    <button class="btn" onclick={confirm}>{confirmText}</button>
  {/if}
  {/snippet}
