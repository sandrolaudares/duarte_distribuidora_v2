<script>
  let image_url = 'https://via.placeholder.com/672x448'

  import StaggeredLetterPullUpAnimation from '$lib/components/animation/StaggeredLetterPullUpAnimation.svelte'
  import FlipText from '$lib/components/animation/FlipText.svelte';
</script>

<div class="hero min-h-screen" style="background-image: url({image_url});">
  <div class="hero-overlay bg-opacity-60"></div>
  <div class="hero-content text-center text-neutral-content">
    <div class="max-w-md">
      <h1 class="mb-5 text-5xl font-bold">
       
        <FlipText words='Bem vindo'  />
      </h1>
      <p class="mb-5">
        description
      </p>
      <button class="btn btn-primary">Get Started</button>
    </div>
  </div>
</div>
