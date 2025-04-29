<script lang="ts">
  import { alimentTypeEnum, type AlimentType } from '$lib/utils/enums'
  import * as Select from '$lib/components/ui/select/index'
  import Button from '$lib/components/ui/button/button.svelte'

  type Props = {
    value?: AlimentType
    customClass?: string
  }

  let { value = $bindable() ,customClass }: Props = $props()

  const triggerContent = $derived(
    alimentTypeEnum.find((f) => f === aux) ?? "Selecione um tipo"
  );

  let aux = $state(value)
</script>


<Select.Root type="single" bind:value onValueChange={(v) => {
    aux = v as AlimentType
  }}>
  <Select.Trigger class="select border-gray-300 focus:ring-gray-300 !text-gray-700 {customClass}">
    {triggerContent}
</Select.Trigger>
  <Select.Content>
    {#each alimentTypeEnum as type}
      <Select.Item value={type}>{type}</Select.Item>
    {/each}
  </Select.Content>
</Select.Root>


