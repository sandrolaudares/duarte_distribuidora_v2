<script lang="ts">
  let {
    value = $bindable(),
    onchange,
    oninput,
    size = ''
  }: { value: number; onchange?: () => void,oninput?: () => void,size?:string } = $props()

  if (!value) {
    value = 0
  }

  let amountFormatted = $state('0.00')

  amountFormatted = (value / 100).toFixed(2)
  let currencyInput: HTMLInputElement

  const handleChange = () => {
    oninput?.()
    let cleanedInput = currencyInput.value
      .replace(/\D*/gm, '')
      .replace(/^0+/gm, '')

    if (cleanedInput.length === 0) {
      console.log('setting amountFormatted to 0.00 --- BUT IT does not work ')
      amountFormatted = '0.00'
    } else {
      value = parseInt(cleanedInput, 10)
      amountFormatted = (value / 100).toFixed(2)
    }
    value = Number(amountFormatted.replace('.', ''))
  }

  $effect(() => {
    if (value) {
      amountFormatted = (value / 100).toFixed(2)
    }
  })
</script>

<label class="input input-bordered flex items-center gap-2 {size}">
  R$
  <input
    type="tel"
    class=" w-28"
    value={amountFormatted}
    bind:this={currencyInput}
    oninput={handleChange}
    {onchange}
  />
</label>
