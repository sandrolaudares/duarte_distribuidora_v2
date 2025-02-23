<script lang="ts">
    import { onMount } from "svelte"
  
    type Steps = {
        title:string
        status:string
    }

    let { steps,currentActive=$bindable(1) }: {steps:Steps[],currentActive:number} = $props()
  
    let circles:NodeListOf<HTMLElement>
    let progress:HTMLElement
  
    export const handleProgress = (stepIncrement:number) => {
      circles = document.querySelectorAll('.circle')
      if (stepIncrement == 1) {
        currentActive++
  
        if (currentActive > circles.length) {
          currentActive = circles.length
        }
      } else {
        currentActive--
  
        if (currentActive < 1) {
          currentActive = 1
        }
      }
  
      update()
    }
  
    function update() {
      circles.forEach((circle, idx:number) => {
        if (idx < currentActive) {
          circle.classList.add('active')
        } else {
          circle.classList.remove('active')
        }
      })
  
      const actives = document.querySelectorAll('.active')
  
      progress.style.width =
        ((actives.length - 1) / (circles.length - 1)) * 100 + '%'
    }
  
    onMount(() => {
      circles = document.querySelectorAll('.circle');

      update();
    });
  
  </script>
  
  <div
    class="mx-auto flex max-w-screen-lg items-start gap-x-3 gap-y-6 px-4 font-[sans-serif] max-md:flex-col"
  >
    {#each steps as step, index}
      <div class="w-full">
        <div
          class="h-1 w-full rounded-xl {index < currentActive
            ? 'bg-primary'
            : 'bg-base-300'}"
        ></div>
        <button

        disabled={index > 0 && steps[index - 1].status === 'Pendente'}
          class="mt-2 flex"
          onclick={() => {
            currentActive = index + 1
          }}
        >
          {#if step.status != 'Pendente'}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              class="shrink-0 {step.status != 'Pendente'
                ? 'fill-primary'
                : 'fill-base-300'}"
              viewBox="0 0 24 24"
            >
              <switch>
                <g>
                  <g>
                    <path
                      d="M9.7 11.3c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4l3 3c.2.2.4.3.7.3s.5-.1.7-.3l7-8c.3-.5.3-1.1-.2-1.4-.4-.3-1-.3-1.3.1L12 13.5z"
                    />
                    <path
                      d="M21 11c-.6 0-1 .4-1 1 0 4.4-3.6 8-8 8s-8-3.6-8-8c0-2.1.8-4.1 2.3-5.6C7.8 4.8 9.8 4 12 4c.6 0 1.3.1 1.9.2.5.2 1.1-.1 1.3-.7s-.2-1-.7-1.2h-.1c-.8-.2-1.6-.3-2.4-.3C6.5 2 2 6.5 2 12.1c0 2.6 1.1 5.2 2.9 7 1.9 1.9 4.4 2.9 7 2.9 5.5 0 10-4.5 10-10 .1-.6-.4-1-.9-1z"
                    />
                  </g>
                </g>
              </switch>
            </svg>
          {/if}
          <div class="ml-2">
            <h6
              class="text-base font-bold {index < currentActive
                ? 'text-primary'
                : 'text-gray-400'}"
            >
              {step.title}
            </h6>
            <p
              class="text-left text-xs {step.status != 'Pendente'
                ? 'text-primary'
                : 'text-gray-400'}"
            >
              {step.status}
            </p>
          </div>
        </button>
      </div>
    {/each}
  </div>
  