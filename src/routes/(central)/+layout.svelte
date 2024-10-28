<script lang="ts">
    import type { LayoutData } from './$types';
    
    export let data: LayoutData;
</script>

<nav class="bg-base-200">
    <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
     
      <div class="hidden w-full md:block md:w-auto" id="navbar-default">
        <ul class="font-medium flex flex-col p-4 md:p-0 mt-4 border rounded-lg md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0">
          <li>
            <a href="/" class="block py-2 px-3  rounded  p-0">home</a>
          </li>
          <li>
            <a href="/distribuidoras" class="block py-2 px-3  rounded  p-0" aria-current="page">distribuidoras</a>
          </li>
          <li>
            <a href="/transferir" class="block py-2 px-3  rounded  p-0">transferir estoque</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <slot></slot>