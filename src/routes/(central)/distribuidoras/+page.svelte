<script lang="ts">
  import type { PageData } from './$types'
  import { page } from '$app/stores'
  export let data: PageData
</script>

<div>
  {#each data.tenats as item}
    <a href="http://{item.subdomain}.localhost:5173">
      
    <pre>
      {JSON.stringify(item, null, 2)}
    </pre>
    </a>
  {/each}
</div>
