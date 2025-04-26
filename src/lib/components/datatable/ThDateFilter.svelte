<script lang="ts" generics="T extends Row">
  import {
    CalendarDate,
    DateFormatter,
    getLocalTimeZone,
    today,
  } from '@internationalized/date'
  import { RangeCalendar } from '$lib/components/ui/range-calendar/index.js'
  import * as Popover from '$lib/components/ui/popover/index.js'
  import { buttonVariants } from '../ui/button'
  import { cn } from '$lib/utils'
  import type { DateRange } from 'bits-ui'
  import { Th, type Field, type Row } from '@vincjo/datatables'
  import type { TableHandler } from '@vincjo/datatables/server'
  import type { SSRFilters } from './filter.svelte'
  import Button from '../ui/button/button.svelte'
  import Separator from '../ui/separator/separator.svelte'
  import type { SelectTenant } from '$lib/server/db/central/schema'
  import { differenceInDays } from '$lib/utils/expire'

  const df = new DateFormatter('pt-BR', {
    dateStyle: 'medium',
  })

  type key = {
    start: string,
    end: string
  }

  type Props = {
    value: DateRange
    table: TableHandler<T>
    filters: SSRFilters
    futureDates?: boolean
    tenant?: SelectTenant
    key?:key
  }

  let {
    value = $bindable(),
    table,
    filters,
    futureDates = false,
    tenant,
    key = {
      start: 'startDate',
      end: 'endDate',
    },
  }: Props = $props()

  async function handleValueChange(v: DateRange) {
      let startDate: Date | undefined = undefined
      let endDate: Date | undefined = undefined
      let vStart: string | undefined = undefined
      let vEnd: string | undefined = undefined

      if (v.start) {
        startDate = new Date(v.start.toDate(getLocalTimeZone()))
        startDate.setHours(0, 0, 0, 0)
        vStart = startDate.getTime().toString()
      }

      if (v.end) {
        endDate = new Date(v.end.toDate(getLocalTimeZone()))
        endDate.setHours(23, 59, 59, 999)
        vEnd = endDate.getTime().toString()
      }

      await filters.update({
        [key.start]: vStart,
        [key.end]: vEnd,
      })

      value = v
      table.invalidate()
  }


  async function handleClear() {
    value = { start: undefined, end: undefined }
    await filters.update({
      [key.start]: undefined,
      [key.end]: undefined,
    })
    table.invalidate()
  }
  
</script>

{#snippet btn(label: string, range: DateRange)}
  <Button
    variant="outlinePrimary"
    onclick={() => {
      value = range
      if (range.start && range.end) {
        handleValueChange(range)
      }
    }}
  >
    {label}
  </Button>
{/snippet}

<Th>
  <div class="m-0 grid gap-2">
    <Popover.Root>
      <Popover.Trigger
        class={cn(
          buttonVariants({ variant: 'ghost' }),
          !value && 'text-muted-foreground',
        )}
      >
        {#if value && value.start}
          {#if value.end}
            {df.format(value.start.toDate(getLocalTimeZone()))} - {df.format(
              value.end.toDate(getLocalTimeZone()),
            )}
          {:else}
            {df.format(value.start.toDate(getLocalTimeZone()))}
          {/if}
        {:else if value?.start}
          {df.format(value.start.toDate(getLocalTimeZone()))}
        {:else}
          Escolha uma data
        {/if}
      </Popover.Trigger>
      <Popover.Content class="w-auto p-0" align="start">
        <div class="flex">
          {#if !futureDates}
            <div class="flex flex-col gap-2 p-4">
              {@render btn('Hoje', {
                start: today('America/Sao_Paulo'),
                end: today('America/Sao_Paulo'),
              })}
              {@render btn('Ultima Semana', {
                start: today('America/Sao_Paulo').subtract({ days: 7 }),
                end: today('America/Sao_Paulo'),
              })}
              {@render btn('Ultimo Mês', {
                start: today('America/Sao_Paulo').subtract({ months: 1 }),
                end: today('America/Sao_Paulo'),
              })}
              {@render btn('Ultimo Ano', {
                start: today('America/Sao_Paulo').subtract({ years: 1 }),
                end: today('America/Sao_Paulo'),
              })}
            {@render btn('Todo periodo', {
                start: today('America/Sao_Paulo').subtract({ days: tenant?.created_at ? -differenceInDays(tenant?.created_at) : 18262 }),
                end: today('America/Sao_Paulo'),
              })}
              <button onclick={handleClear} class="btn btn-outline btn-error">Limpar</button>
            </div>
            <Separator orientation="vertical" class="my-4 bg-base-300" />
          {/if}
          <RangeCalendar
            bind:value
            onValueChange={v => {
              handleValueChange(v)
            }}
            numberOfMonths={1}
            isDateDisabled={date => futureDates ? false : date.toDate(getLocalTimeZone()).getTime() > today('America/Sao_Paulo').toDate(getLocalTimeZone()).getTime()}
          />
        </div>
        {#if futureDates}
          <div class="p-3">
            <button onclick={handleClear} class="btn btn-outline btn-error w-full">Limpar</button>
          </div>
        {/if}
      </Popover.Content>
    </Popover.Root>
  </div>
</Th>
