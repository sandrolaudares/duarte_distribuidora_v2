<script lang="ts">
  import Datepicker from '$lib/components/input/date/datepicker.svelte'

  // import { DatePicker } from '@svelte-plugins/datepicker'
  import type { TableHandler } from '@vincjo/datatables/server'
  import { format } from 'date-fns'

  const today = new Date()

  interface Props {
    table: TableHandler
    field: string
  }

  let { table, field }: Props = $props()

  const filterStart = table.createFilter(field + '_start')
  const filterEnd = table.createFilter(field + '_end')
  // export let onchange:
  //   | undefined
  //   | ((dateStart: Date | string, dateEnd: Date | string) => void) = undefined

  let startDate: Date = $state(today)
  let endDate: Date = $state(today)
  let dateFormat = 'dd/MM/yyyy'
  let isOpen = $state(false)

  // let formattedStartDate = $state('')

  const onClearDates = () => {
    startDate = today
    endDate = today
  }

  const toggleDatePicker = () => (isOpen = !isOpen)
  const formatDate = (date: Date | string) =>
    (date && format(new Date(date), dateFormat)) || ''

  $effect(() => {
    filterStart.value = startDate.toString()
    filterEnd.value = endDate.toString()
    // filterStart.set()
    // filterEnd.set()

    console.log('Raw:', startDate)
    console.log('Raw:', endDate)
    console.log('Formatted:', formattedStartDate)
    console.log('Formatted:', formattedEndDate)
    console.log(filterStart)
    console.log(filterEnd)
  })

  let formattedStartDate = $derived(formatDate(startDate))
  let formattedEndDate = $derived(formatDate(endDate))
</script>

<div class="date-filter">
  <Datepicker bind:isOpen bind:startDate bind:endDate isRange showPresets>
    <span class="date-field" on:click={toggleDatePicker} class:open={isOpen}>
      <i class="icon-calendar" ></i>
      <div class="date">
        {#if startDate}
          {formattedStartDate} - {formattedEndDate}
        {:else}
          Pick a date
        {/if}
      </div>
      {#if startDate}
        <button on:click={onClearDates}>
          <i class="os-icon-x" ></i>
        </button>
      {/if}
      </span>
  </Datepicker>
</div>

<style>
  .date-field {
    align-items: center;
    background-color: #fff;
    border-bottom: 1px solid #e8e9ea;
    display: inline-flex;
    gap: 8px;
    min-width: 100px;
    padding: 16px;
    z-index: 9999;
  }

  .date-field.open {
    border-bottom: 1px solid oklch(var(--p));
    z-index: 9999;
  }

  .date-field .icon-calendar {
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAEmSURBVHgB7ZcPzcIwEMUfXz4BSCgKwAGgACRMAg6YBBxsOMABOAAHFAXgAK5Z2Y6lHbfQ8SfpL3lZaY/1rb01N+BHUKSMNBfEJjZWISA56Uo6C2KvVpkgFn9oRx9vICFtUT1JKO3tvRtZdjBxXQs+YY+1FenIfuesPUGVVLzfRWKvmrSzbbN19wS+kAb2+sCEuUxrYzkbe4YvCVM2Vr5NPAkVa+van7Wn38U95uTpN5TJ/A8ZKemAakmbmJJGpI0gVmwA0huieFItjG19DgTHtwIZhCfZq3ztCuzQYh+FKBSvusjAGs8PnLYkLgMf34JoIBqIBqKBaIAb0Kw9RlhMCTbzzPWAqYq7LsuPaGDUsYmznaOk5zChUJTNQ4TFVMkrOL4HPsoNn26PxROHCggAAAAASUVORK5CYII=)
      no-repeat center center;
    background-size: 14px 14px;
    height: 14px;
    width: 14px;
    z-index: 9999;
  }
</style>
