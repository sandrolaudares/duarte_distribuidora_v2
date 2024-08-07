<script lang="ts">
  import type { PageData } from './$types'

  export let data: PageData
</script>

<!-- TODO: frontend -->
<pre>
  {JSON.stringify(data.last_orders, null, 2)}
</pre>
