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
  import Separator from './ui/separator/separator.svelte'

  interface Props {
    startValue?: DateValue
    endValue?: DateValue
    onChange?: (startDate: number, endDate: number) => void
    title?: string
    futureDates?: boolean
    filters?: SSRFilters
  }

  let {
    startValue: sVProps,
    endValue,
    onChange,
    title,
    futureDates,
    filters = $bindable(),
  }: Props = $props()

  const df = new DateFormatter('pt-BR', {
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

  // let filters = new SSRFilters()

  const clearCalendar = () => {
    startValue = undefined
    endValue = undefined
    value = { start: undefined, end: undefined }

    console.log('clearing compare')
    filters?.clear('compareStartDate', 'compareEndDate', 'startDate', 'endDate')

    // if (title == 'Base')
    //   filters.update({
    //     startDate: today('America/Sao_Paulo')
    //       .subtract({ days: 7 })
    //       .toDate(getLocalTimeZone())
    //       .getTime()
    //       .toString(),
    //     endDate: today('America/Sao_Paulo')
    //       .toDate(getLocalTimeZone())
    //       .getTime()
    //       .toString(),
    //   })
  }
</script>

{#snippet btn(label: string, range: DateRange)}
  <Button
    variant="outlinePrimary"
    onclick={() => {
      value = range
      if (onChange && range.start && range.end) {

        const startDate = new Date(range.start.toDate(getLocalTimeZone()));
        const endDate = new Date(range.end.toDate(getLocalTimeZone()));

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        onChange(
          startDate.getTime(),
          endDate.getTime(),
        )
      }
    }}
  >
    {label}
  </Button>
{/snippet}

<div class="m-0 grid gap-2">
  <Popover.Root>
    <Popover.Trigger
      class={cn(
        buttonVariants({ variant: 'ghost' }),
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
        Escolha uma data
      {/if}
    </Popover.Trigger>
    <Popover.Content class="w-auto p-0" align="start">
      {#if title}
        <div class="divider mx-4 flex items-center justify-center">
          <p class=" text-center text-lg font-semibold">{title}</p>
        </div>
      {/if}
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
              start: today('America/Sao_Paulo').subtract({ years: 50 }),
              end: today('America/Sao_Paulo'),
            })}
            <button onclick={clearCalendar} class="btn btn-outline btn-error">
              Limpar
            </button>
          </div>
          <Separator orientation="vertical" class="my-4 bg-base-300" />
        {/if}
        <RangeCalendar
          isDateDisabled={date =>
            futureDates
              ? false
              : date.toDate(getLocalTimeZone()).getTime() >
                today('America/Sao_Paulo').toDate(getLocalTimeZone()).getTime()}
          bind:value
          onStartValueChange={v => {
            startValue = v
          }}
          numberOfMonths={1}
          onValueChange={v => {
             if (onChange && v.start && v.end) {
              const startDate = new Date(v.start.toDate(getLocalTimeZone()));
              const endDate = new Date(v.end.toDate(getLocalTimeZone()));

              startDate.setHours(0, 0, 0, 0);
              endDate.setHours(23, 59, 59, 999);

              onChange(startDate.getTime(), endDate.getTime());
            }
          }}
        />
      </div>
      {#if futureDates}
      <div class="p-3">
        <button onclick={clearCalendar} class="btn btn-outline btn-error w-full">
          Limpar
        </button>
      </div>
      {/if}
    </Popover.Content>
  </Popover.Root>
</div>
