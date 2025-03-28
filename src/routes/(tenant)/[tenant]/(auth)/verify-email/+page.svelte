<script lang="ts">
  import type { PageData } from './$types'
  import OTP from '$components/input/otp/OTP.svelte'

  import SEO, { getSEOProps } from '$lib/components/SEO/index.svelte'

  export let data: PageData

  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'
  import { toast } from 'svelte-sonner'
  import { goto } from '$app/navigation'

  let code = ''

  let isLoading = false

  let error_message = ''

  async function verifyEmail() {
    isLoading = true
    const { error, data } = await trpc($page).auth.verifyEmail.query({
      code,
    })

    if (error) {
      error_message = error
      toast.error(error)
      isLoading = false
      return
    }

    if (data?.success) {
      goto('/')
    }
  }

  let resendDelay = 60
  let timeLeft = resendDelay
  let timer: number | undefined = undefined
  let canResend = true
  async function resendEmail() {
    if (!canResend) return
    const { message } = await trpc($page).auth.resendEmailVerification.query()
    toast(message)
    startResendTimer()
    timeLeft = resendDelay
    canResend = false
  }

  function startResendTimer() {
    timer = window.setInterval(() => {
      timeLeft -= 1

      if (timeLeft <= 0) {
        clearInterval(timer)
        canResend = true
      }
    }, 1000)
  }
</script>

<SEO
  {...getSEOProps({
    title: 'Verify Email',
    description:
      'Enter the 8-digit verification code sent to your email address.',
  })}
/>

<div class="flex h-full flex-col items-center justify-center bg-base-200">
  <div class="mx-auto w-full max-w-lg space-y-6">
    <div class="rounded-lg border bg-base-100 text-card-foreground shadow-sm">
      <div class="flex flex-col space-y-1.5 p-6">
        <h3 class="text-2xl font-semibold leading-none tracking-tight">
          Verifique seu email
        </h3>
        <p class="text-sm text-gray-600">
          Digite o código de verificação enviado para seu email
        </p>
      </div>
      <div class="p-6 pt-0">
        <div class="grid gap-4">
          <div class="grid gap-2">
            <label
              for="otp"
              class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Código de verificação
            </label>
            <OTP bind:value={code} numOfInputs={8} inputClass="" numberOnly />
            <p class="text-sm text-gray-600">
              Digite o código de 8 digitos enviado para o seu email.
            </p>
          </div>
        </div>
      </div>
      <div class="flex items-center p-6 pt-0">
        <button
          disabled={isLoading}
          onclick={verifyEmail}
          class="btn btn-primary w-full"
        >
          Verify Code
        </button>
      </div>
      <div class="p-6 pt-0">
        {#if canResend}
          Não recebeu?
          <button
            class="link"
            onclick={resendEmail}
            disabled={isLoading || !canResend}
          >
            Reenviar
          </button>
        {:else}
          Reenviar em {timeLeft} segundos
        {/if}
      </div>
      {#if error_message}
        <p>{error_message}</p>
      {/if}
    </div>
  </div>
</div>
