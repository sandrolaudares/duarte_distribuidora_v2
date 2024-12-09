<script lang="ts">
  let { value = $bindable(),onchange }:{value:number,onchange?:()=>void} = $props()

  if (!value) {
    value = 0
  }

  let amountFormatted = $state('0.00')

  amountFormatted = (value / 100).toFixed(2)
  let currencyInput: HTMLInputElement

  const handleChange = () => {

    let cleanedInput = currencyInput.value
      .replace(/\D*/gm, '')
      .replace(/^0+/gm, '')

    if (cleanedInput.length === 0) {
      console.log('setting amountFormatted to 0.00 --- BUT IT does not work ')
      amountFormatted = '0.00'
    } else {
      value = parseInt(cleanedInput, 10)
      amountFormatted = (value / 100).toFixed(2);
    }
    value = Number(amountFormatted.replace('.', ''))
  }
</script>

<label class="input input-bordered flex items-center gap-2">
  R$
  <input
    type="tel"
    class=" w-28"
    value={amountFormatted}
    bind:this={currencyInput}
    oninput={handleChange}
    onchange={onchange}
  />
</label>
