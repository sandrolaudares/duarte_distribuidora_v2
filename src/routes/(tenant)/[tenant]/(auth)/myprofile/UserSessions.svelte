<script lang="ts">
  import type { SelectSession } from '$lib/server/db/schema'

  let { userSessions }: { userSessions: SelectSession[] } = $props()

  function isSessionExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt
  }

  function formatExpirationDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  function getRelativeTime(expiresAt: Date): string {
    const now = new Date()
    const diffMs = expiresAt.getTime() - now.getTime()

    if (diffMs < 0) {
      return 'Expirado'
    }

    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)

    if (diffDay > 0) {
      return `Expira em ${diffDay} dia${diffDay > 1 ? 's' : ''}`
    } else if (diffHour > 0) {
      return `Expira em ${diffHour} hora${diffHour > 1 ? 's' : ''}`
    } else if (diffMin > 0) {
      return `Expira em ${diffMin} minuto${diffMin > 1 ? 's' : ''}`
    } else {
      return 'Expira em menos de 1 minuto'
    }
  }
</script>

<div class="rounded-lg border bg-base-100 shadow-sm">
  <div class="p-6">
    <h2 class="mb-4 text-lg font-semibold">Sessões ativas</h2>

    <div class="space-y-4">
      {#each userSessions as session}
        <div
          class="rounded-md border p-4 {isSessionExpired(session.expiresAt)
            ? 'border-red-200 bg-red-50'
            : 'border-gray-200'}"
        >
          <div class="flex items-start justify-between">
            <div>
              <div class="max-w-xs truncate text-sm font-medium">
                ID da sessão: {session.id}
              </div>
              <div class="mt-1 text-xs text-gray-500">
                Expira: {formatExpirationDate(session.expiresAt)}
              </div>
            </div>

            <div>
              <span
                class={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isSessionExpired(session.expiresAt) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
              >
                {isSessionExpired(session.expiresAt) ? 'Expired' : 'Active'}
              </span>
            </div>
          </div>

          <div class="mt-2 text-xs">
            <span
              class={isSessionExpired(session.expiresAt)
                ? 'text-red-600'
                : 'text-green-600'}
            >
              {getRelativeTime(session.expiresAt)}
            </span>
          </div>
          <!-- {#if !isSessionExpired(session.expiresAt)}
                <div class="mt-3 flex justify-end">
                  <button class="text-xs text-red-600 hover:text-red-800 font-medium">
                    Revoke Session
                  </button>
                </div>
              {/if} -->
        </div>
      {/each}
    </div>
  </div>
</div>
