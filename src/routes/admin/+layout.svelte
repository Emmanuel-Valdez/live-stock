<script lang="ts">
  import { page } from '$app/stores'
  import { logout } from '$lib/stores/auth'
  import { goto } from '$app/navigation'

  async function handleLogout() {
    await logout()
    goto('/admin/login')
  }

  $: currentPath = $page.url.pathname
</script>

<nav class="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border shadow-lg sm:hidden safe-bottom" aria-label="Navegación principal">
  <div class="grid grid-cols-4 h-16">
    <a
      href="/admin"
      class="touch-target flex flex-col items-center justify-center gap-1 {currentPath === '/admin' ? 'text-accent' : 'text-ink-muted'}"
      aria-current={currentPath === '/admin' ? 'page' : undefined}
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
      </svg>
      <span class="text-xs font-medium">Inicio</span>
    </a>

    <a
      href="/admin/productos"
      class="touch-target flex flex-col items-center justify-center gap-1 {currentPath.includes('/productos') ? 'text-accent' : 'text-ink-muted'}"
      aria-current={currentPath.includes('/productos') ? 'page' : undefined}
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
      </svg>
      <span class="text-xs font-medium">Productos</span>
    </a>

    <a
      href="/admin/reportes"
      class="touch-target flex flex-col items-center justify-center gap-1 {currentPath.includes('/reportes') ? 'text-accent' : 'text-ink-muted'}"
      aria-current={currentPath.includes('/reportes') ? 'page' : undefined}
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
      </svg>
      <span class="text-xs font-medium">Reportes</span>
    </a>

    <a
      href="/admin/dias"
      class="touch-target flex flex-col items-center justify-center gap-1 {currentPath.includes('/dias') ? 'text-accent' : 'text-ink-muted'}"
      aria-current={currentPath.includes('/dias') ? 'page' : undefined}
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
      </svg>
      <span class="text-xs font-medium">Días</span>
    </a>
  </div>
</nav>

<header class="hidden sm:flex sticky top-0 z-50 bg-surface border-b border-border shadow-sm">
  <div class="max-w-7xl w-full mx-auto px-6 h-16 flex items-center justify-between">
    <div class="flex items-center gap-8">
      <a href="/admin" class="display text-xl text-ink">Ukiyo</a>
      <nav class="flex items-center gap-1" aria-label="Navegación principal">
        <a
          href="/admin"
          class="px-4 py-2 text-sm font-medium rounded-lg {currentPath === '/admin' ? 'bg-accent text-white' : 'text-ink-muted hover:text-ink hover:bg-bg'}"
          aria-current={currentPath === '/admin' ? 'page' : undefined}
        >
          Inicio
        </a>
        <a
          href="/admin/productos"
          class="px-4 py-2 text-sm font-medium rounded-lg {currentPath.includes('/productos') ? 'bg-accent text-white' : 'text-ink-muted hover:text-ink hover:bg-bg'}"
          aria-current={currentPath.includes('/productos') ? 'page' : undefined}
        >
          Productos
        </a>
        <a
          href="/admin/reportes"
          class="px-4 py-2 text-sm font-medium rounded-lg {currentPath.includes('/reportes') ? 'bg-accent text-white' : 'text-ink-muted hover:text-ink hover:bg-bg'}"
          aria-current={currentPath.includes('/reportes') ? 'page' : undefined}
        >
          Reportes
        </a>
        <a
          href="/admin/dias"
          class="px-4 py-2 text-sm font-medium rounded-lg {currentPath.includes('/dias') ? 'bg-accent text-white' : 'text-ink-muted hover:text-ink hover:bg-bg'}"
          aria-current={currentPath.includes('/dias') ? 'page' : undefined}
        >
          Días
        </a>
      </nav>
    </div>
    <button
      on:click={handleLogout}
      class="px-4 py-2 text-sm font-medium text-ink-muted hover:text-danger rounded-lg hover:bg-danger-bg transition-colors"
    >
      Salir
    </button>
  </div>
</header>

<div class="pb-20 sm:pb-0">
  <slot />
</div>
