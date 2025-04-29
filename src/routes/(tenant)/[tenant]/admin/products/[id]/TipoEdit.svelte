<script lang="ts">
    import { alimentTypeEnum, type AlimentType } from '$lib/utils/enums'
    import * as Select from '$lib/components/ui/select/index'
  
    type Props = {
      customClass?: string
      onValueChange?: (value:AlimentType) => void
      value?: AlimentType
    }
  
    let { customClass,onValueChange,value }: Props = $props()

    // let value:AlimentType | undefined = $state()
  
    const triggerContent = $derived(
      alimentTypeEnum.find((f) => f === value) ?? "Selecione um tipo"
    );
  </script>
  
  
  <Select.Root type="single" bind:value onValueChange={(v)=>{ 
      value = v as AlimentType
      if (onValueChange) {
        onValueChange(value)
      }
    }}>
    <Select.Trigger class="select border-gray-300 focus:ring-gray-300 {customClass}">
      {triggerContent}
  </Select.Trigger>
    <Select.Content>
      {#each alimentTypeEnum as type}
        <Select.Item value={type}>{type}</Select.Item>
      {/each}
    </Select.Content>
  </Select.Root>
  