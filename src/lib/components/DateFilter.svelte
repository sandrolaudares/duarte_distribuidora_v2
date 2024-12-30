<script lang="ts">
  import { SSRFilters } from '$lib/components/datatable/filter.svelte'
  import Datepicker from '$lib/components/input/date/datepicker.svelte'
  import { format } from 'date-fns'

  const today = new Date()
  const filters = new SSRFilters()

  export let onchange:
    | undefined
    | ((dateStart: number | null, dateEnd: number | null) => void) = undefined

  let startDate: Date | null  = null
  let endDate: Date |null  = null
  let dateFormat = 'dd/MM/yyyy'
  let isOpen = false

  export let enableFutureDates = false
  export let enablePastDates = true
  export let isRange = true

  let formattedStartDate = ''

  const onClearDates = () => {
    startDate = null
    endDate = null
    onchange?.(start, end);
  }

  const toggleDatePicker = () => (isOpen = !isOpen)
  const formatDate = (date: Date) =>
    (date && format(new Date(date), dateFormat)) || ''

  $: formattedStartDate = startDate ? formatDate(startDate) : '';
  $: formattedEndDate = endDate ? formatDate(endDate) : '';

  $: start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
  $: end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;

  $: {
    if(endDate != null && startDate !=null){
      onchange?.(start, end)
    }
  }

  export let alignP = "left";
  console.log(alignP)
</script>

<div class="date-filter">
  <Datepicker align={alignP} bind:isOpen bind:startDate bind:endDate {isRange} showPresets {enablePastDates} {enableFutureDates}>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="date-field" on:click={toggleDatePicker} class:open={isOpen}>
      <i class="icon-calendar" />
      <div class="date">
        {#if startDate}
          {formattedStartDate} - {formattedEndDate}
        {:else}
          Escolha uma data
        {/if}
      </div>
      {#if startDate}
        <span on:click={onClearDates}>
          <i class="os-icon-x" />
        </span>
      {/if}
    </div>
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