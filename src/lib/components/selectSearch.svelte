<script lang="ts" module>
  export type SelectItem<T> = {
    value: (item: T) => string | number
    label: (item: T) => string
  }
</script>

<script lang="ts" generics="T">
  import Check from 'lucide-svelte/icons/check'
  import { Trash } from 'lucide-svelte';
  import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down'
  import { tick } from 'svelte'
  import * as Command from '$lib/components/ui/command/index.js'
  import * as Popover from '$lib/components/ui/popover/index.js'
  import { Button, type ButtonProps, type ButtonVariant } from '$lib/components/ui/button/index'
  import { cn } from '$lib/utils'
  import Separator from './ui/separator/separator.svelte'
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import Loading from './Loading.svelte'
  import { toast } from 'svelte-sonner'

  interface Props {
    config: SelectItem<T>
    value: string
    placeholder?: string
    onValueChange?: (value: string) => void
    variant?: ButtonVariant
    delegateQuery: () => Promise<T[]>
  }

  let {
    config,
    value = $bindable(),
    placeholder,
    onValueChange,
    variant,
    delegateQuery
  }: Props = $props()

  let open = $state(false)
  //   let value = $state('')
  let triggerRef = $state<HTMLButtonElement>(null!)

  let options: T[] = $state([])

  let isLoading = $state(true)

  //   const selectedValue = $derived(options.find(f => f.value === value)?.label)
  

  const selectedValue = $derived.by(() => {
    const selectedItem = options.find(item => String(config.value(item)) === value)
    return selectedItem ? config.label(selectedItem) :  ''
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

  async function loadOptions() {
    try {
      if (options.length === 0) {
        options = await delegateQuery()
      }
    } catch (error: any) {
      console.error(error.message)
      toast.error("Erro ao carregar fornecedores")
    } finally {
      isLoading = false
    }
  }
</script>

<Popover.Root bind:open onOpenChange={loadOptions}>
  <Popover.Trigger bind:ref={triggerRef} >
    {#snippet child({ props })}
      <Button
        variant={variant ?? 'select'}
        class="w-full justify-between"
        {...props}
        role="combobox"
        aria-expanded={open}
      >
        {selectedValue || `Selecione ${placeholder}...`}
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="w-[200px] p-0">
    <Command.Root
      onValueChange={() => {
        if (onValueChange) {
          onValueChange(value)
        }
      }}
    
    >
      <Command.Input placeholder={`Pesquise ${placeholder}...`} />
      <Command.List>
        <Command.Empty>Nenhum encontrado.</Command.Empty>
        <Command.Group>
          {#if isLoading}
            <div class="flex items-center justify-center">
              <Loading />
            </div>
          {:else}
          <Command.Item
            value=""
            onSelect={() => {
              value = ''
              closeAndFocusTrigger()
            }}
          >
            <Check
              class={cn('mr-2 size-4', value !== '' && 'text-transparent')}
            />Nenhum
          </Command.Item>
           <Separator class="my-2 bg-base-300" />
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
                  value !== String(config.value(option)) && 'text-transparent',
                )}
              />
              {config.label(option)}
            </Command.Item>
          {/each}
          {/if}
          
        </Command.Group>
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
