<script lang="ts">
  let { variant = "green" }: { variant?: "green" | "white" } = $props();
</script>

<div class="absolute inset-0 pointer-events-none">
  <!-- Large blurred background dots -->
  <div
    class="absolute w-64 h-64 rounded-full blur-3xl opacity-20 animate-float-slow"
    style="
      top: 10%;
      left: -5%;
      background-color: {variant === 'green'
      ? 'var(--primary)'
      : 'var(--secondary)'};
    "
  ></div>

  <div
    class="absolute w-96 h-96 rounded-full blur-3xl opacity-15 animate-float-slower"
    style="
      top: 40%;
      right: -10%;
      background-color: {variant === 'green'
      ? 'var(--secondary)'
      : 'var(--primary)'};
    "
  ></div>

  <div
    class="absolute w-48 h-48 rounded-full blur-2xl opacity-25 animate-float-medium"
    style="
      bottom: 20%;
      left: 10%;
      background-color: {variant === 'green'
      ? 'oklch(0.98 0.0464 124.31)'
      : 'var(--primary)'};
    "
  ></div>

  <!-- Small decorative polka dots -->
  <div
    class="absolute w-3 h-3 rounded-full animate-pulse"
    style="
      top: 15%;
      right: 20%;
      background-color: {variant === 'green'
      ? 'var(--primary)'
      : 'var(--secondary)'};
      opacity: 0.3;
    "
  ></div>

  <div
    class="absolute w-2 h-2 rounded-full animate-pulse delay-500"
    style="
      top: 60%;
      left: 15%;
      background-color: {variant === 'green'
      ? 'var(--secondary)'
      : 'var(--primary)'};
      opacity: 0.4;
    "
  ></div>

  <div
    class="absolute w-4 h-4 rounded-full animate-pulse delay-1000"
    style="
      bottom: 30%;
      right: 15%;
      background-color: {variant === 'green'
      ? 'oklch(0.98 0.0464 124.31)'
      : 'var(--primary)'};
      opacity: 0.35;
    "
  ></div>

  <!-- Medium circles -->
  <div
    class="absolute w-8 h-8 rounded-full opacity-20 animate-float-fast"
    style="
      top: 25%;
      left: 5%;
      background-color: {variant === 'green'
      ? 'var(--primary)'
      : 'var(--secondary)'};
    "
  ></div>

  <div
    class="absolute w-6 h-6 rounded-full opacity-25 animate-float-medium"
    style="
      bottom: 40%;
      right: 8%;
      background-color: {variant === 'green'
      ? 'var(--secondary)'
      : 'oklch(0.98 0.0464 124.31)'};
    "
  ></div>
</div>

<style>
  @keyframes float-slow {
    0%, 100% {
      transform: translateY(0px) translateX(0px);
    }
    50% {
      transform: translateY(-20px) translateX(10px);
    }
  }

  @keyframes float-medium {
    0%, 100% {
      transform: translateY(0px) translateX(0px);
    }
    50% {
      transform: translateY(-15px) translateX(-10px);
    }
  }

  @keyframes float-fast {
    0%, 100% {
      transform: translateY(0px) translateX(0px);
    }
    50% {
      transform: translateY(-25px) translateX(15px);
    }
  }

  @keyframes float-slower {
    0%, 100% {
      transform: translateY(0px) translateX(0px);
    }
    50% {
      transform: translateY(-10px) translateX(-15px);
    }
  }

  .animate-float-slow {
    animation: float-slow 20s ease-in-out infinite;
  }

  .animate-float-medium {
    animation: float-medium 15s ease-in-out infinite;
  }

  .animate-float-fast {
    animation: float-fast 12s ease-in-out infinite;
  }

  .animate-float-slower {
    animation: float-slower 25s ease-in-out infinite;
  }

  .delay-500 {
    animation-delay: 0.5s;
  }

  .delay-1000 {
    animation-delay: 1s;
  }
</style>
