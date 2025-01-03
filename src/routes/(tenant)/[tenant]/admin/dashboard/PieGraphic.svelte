<script lang="ts">
  const mostPopularPaymentMethodsWithColor = $derived.by(
    () => data.mostPopularPaymentMethods.map((method) => (
    {
      ...method,
      color: method.payment_method in colorPaymentMethods ? colorPaymentMethods[method.payment_method] : 'gray'
    }
  )))

  let colorPaymentMethods = {
    pix: '#3CB371',
    credit_card: '#1E90FF',
    debit_card: '#87CEEB',
    dinheiro: '#006400'
  }

  let calculaAumento = (initial : number, end : number) => {
    let calcula = parseFloat((100 - (end * 100 / initial)).toFixed(2));
    let htmlText = calcula > 0 ? icons.arrows.down_line() : icons.arrows.up_line()
    return `${htmlText} ${Math.abs(calcula)}%`
    // icons.arrows()
  }
</script>