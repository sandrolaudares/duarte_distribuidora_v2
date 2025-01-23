<script lang="ts">
  import CalendarIcon from 'lucide-svelte/icons/calendar'
  import type { DateRange } from 'bits-ui'
  import {
    CalendarDate,
    DateFormatter,
    type DateValue,
    getLocalTimeZone,
    today,
    toCalendar,
  } from '@internationalized/date'
  import { cn } from '$lib/utils'
  import { buttonVariants } from '$lib/components/ui/button/index.js'
  import { RangeCalendar } from '$lib/components/ui/range-calendar/index.js'
  import * as Popover from '$lib/components/ui/popover/index.js'

  import * as Select from '$lib/components/ui/select/index.js'
  import Button from './ui/button/button.svelte'
  import { SSRFilters } from '$lib/components/datatable/filter.svelte'

  interface Props {
    startValue?: DateValue
    endValue?: DateValue
    onChange?: (startDate: number, endDate: number) => void
    title?: string
  }

  let { startValue: sVProps, endValue, onChange, title }: Props = $props()

  const df = new DateFormatter('en-US', {
    dateStyle: 'medium',
  })

  let value: DateRange = $state({
    start: sVProps ? sVProps : undefined,
    end: endValue ? endValue : undefined,
  })

  let startValue: DateValue | undefined = $state(sVProps)

  const DateRanges = [
    { value: 0, label: 'Today' },
    { value: 1, label: 'Tomorrow' },
    { value: 3, label: 'In 3 days' },
    { value: 7, label: 'In a week' },
  ]
  const valueString = $derived({
    start: value.start ? df.format(value.start.toDate(getLocalTimeZone())) : '',
    end: value.end ? df.format(value.end.toDate(getLocalTimeZone())) : '',
  })

  let filters = new SSRFilters()

  const clearCalendar = () => {
    startValue = undefined
    value.start = undefined
    value.end = undefined
    if (title == 'Comparar'){
      filters.clear('compareStartDate', 'compareEndDate')
    } 
    if (title == 'Base')
      filters.update({
        startDate: today('America/Sao_Paulo')
          .subtract({ days: 7 })
          .toDate(getLocalTimeZone())
          .getTime()
          .toString(),
        endDate: today('America/Sao_Paulo')
          .toDate(getLocalTimeZone())
          .getTime()
          .toString(),
      })
  }
</script>

{#snippet btn(label: string, range: DateRange)}
  <Button
    onclick={() => {
      value = range
      if (onChange && range.start && range.end) {
        onChange(
          range.start.toDate(getLocalTimeZone()).getTime(),
          range.end.toDate(getLocalTimeZone()).getTime(),
        )
      }
    }}
  >
    {label}
  </Button>
{/snippet}

<div class="ms-5 grid gap-2">
  <Popover.Root>
    <Popover.Trigger
      class={cn(
        buttonVariants({ variant: 'outline' }),
        !value && 'text-muted-foreground',
      )}
    >
      <CalendarIcon class="mr-2 size-4" />
      {#if value && value.start}
        {#if value.end}
          {df.format(value.start.toDate(getLocalTimeZone()))} - {df.format(
            value.end.toDate(getLocalTimeZone()),
          )}
        {:else}
          {df.format(value.start.toDate(getLocalTimeZone()))}
        {/if}
      {:else if startValue}
        {df.format(startValue.toDate(getLocalTimeZone()))}
      {:else}
        Pick a date
      {/if}
    </Popover.Trigger>
    <Popover.Content class="w-auto p-0" align="start">
      {#if title}
        <p class="mt-3 text-center text-lg font-semibold">{title}</p>
      {/if}
      <RangeCalendar
        bind:value
        onStartValueChange={v => {
          startValue = v
        }}
        numberOfMonths={1}
        onValueChange={v => {
          if (onChange && v.start && v.end) {
            onChange(
              v.start.toDate(getLocalTimeZone()).getTime(),
              v.end.toDate(getLocalTimeZone()).getTime(),
            )
          }
        }}
      />

      <div class="flex flex-col gap-1 px-5 pb-5">
        {@render btn('Ultima Semana', {
          start: today('America/Sao_Paulo').subtract({ days: 7 }),
          end: today('America/Sao_Paulo'),
        })}
        {@render btn('Ultimo Mes', {
          start: today('America/Sao_Paulo').subtract({ months: 1 }),
          end: today('America/Sao_Paulo'),
        })}
        {@render btn('Ultimo Ano', {
          start: today('America/Sao_Paulo').subtract({ years: 1 }),
          end: today('America/Sao_Paulo'),
        })}
        <button onclick={clearCalendar} class="btn btn-error">Limpar</button>
      </div>
    </Popover.Content>
  </Popover.Root>
</div>
