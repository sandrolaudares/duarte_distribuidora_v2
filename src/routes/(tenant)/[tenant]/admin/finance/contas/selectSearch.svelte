<script lang="ts" module>
  export type SelectItem<T> = {
    value: (item: T) => string | number
    label: (item: T) => string
  }
</script>

<script lang="ts" generics="T">
  import Check from 'lucide-svelte/icons/check'
  import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down'
  import { tick } from 'svelte'
  import * as Command from '$lib/components/ui/command/index.js'
  import * as Popover from '$lib/components/ui/popover/index.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import { cn } from '$lib/utils'

  let {
    options,
    config,
    value = $bindable(),
    placeholder,
  }: {
    options: T[]
    config: SelectItem<T>
    value: string
    placeholder: string
  } = $props()

  let open = $state(false)
  //   let value = $state('')
  let triggerRef = $state<HTMLButtonElement>(null!)

  //   const selectedValue = $derived(options.find(f => f.value === value)?.label)

  const selectedValue = $derived.by(() => {
    const selectedItem = options.find(item => config.value(item) === value)
    return selectedItem ? config.label(selectedItem) : ''
  })

  // We want to refocus the trigger button when the user selects
  // an item from the list so users can continue navigating the
  // rest of the form with the keyboard.
  function closeAndFocusTrigger() {
    open = false
    tick().then(() => {
      triggerRef.focus()
    })
  }
</script>

<Popover.Root bind:open>
  <Popover.Trigger bind:ref={triggerRef}>
    {#snippet child({ props })}
      <Button
        variant="select"
        class="w-full justify-between"
        {...props}
        role="combobox"
        aria-expanded={open}
      >
        {selectedValue || `Selecione ${placeholder}...`}
        <!-- <ChevronsUpDown class="ml-2 size-4 shrink-0 opacity-50" /> -->
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="w-[200px] p-0">
    <Command.Root>
      <Command.Input placeholder={`Pesquise ${placeholder}...`} />
      <Command.List>
        <Command.Empty>Nenhum encontrado.</Command.Empty>
        <Command.Group>
          {#each options as option}
            <Command.Item
              value={config.label(option)}
              onSelect={() => {
                value = String(config.value(option))
                closeAndFocusTrigger()
              }}
            >
              <Check
                class={cn(
                  'mr-2 size-4',
                  value !== config.value(option) && 'text-transparent',
                )}
              />
              {config.label(option)}
            </Command.Item>
          {/each}
        </Command.Group>
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
