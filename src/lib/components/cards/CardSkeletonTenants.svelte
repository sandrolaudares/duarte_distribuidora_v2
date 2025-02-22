<script>


  import { Skeleton } from '$lib/components/ui/skeleton/index'

</script>
<div
class="relative z-0 rounded-lg bg-base-100"
>
<div>
  <div>
    <Skeleton class="h-60 max-h-60 w-full rounded-t-lg object-cover" />
  </div>
  <div class="p-4 lg:p-6">
    <div
      class="mb-5 flex flex-col items-center justify-between lg:flex-row"
    >
      <div class=" text-lg font-semibold lg:text-xl">
        <Skeleton class="h-4 w-[250px]" />
      </div>
      <div class="text-sm">
        <Skeleton class="h-4" />
      </div>
    </div>
    <div class="flex flex-col gap-2">
      <div class="lg:text-md flex items-center gap-2 text-xs">
        <Skeleton class="h-4 w-full" />
      </div>
      <div class="lg:text-md flex items-center gap-2 text-xs">
        <Skeleton class="h-4 w-full" />
      </div>
    </div>
  </div>
</div>
</div>