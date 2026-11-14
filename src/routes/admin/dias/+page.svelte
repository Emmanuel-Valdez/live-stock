<script lang="ts">
  import { onMount } from 'svelte'
  import { diaActual, loadDiaActual, cerrarDia, reabrirDia, reiniciarDia } from '$lib/stores/dias'

  let loading = false
  let error = ''
  let success = ''

  onMount(async () => {
    await loadDiaActual(true)
  })

  async function handleClose() {
    if (!confirm('¿Cerrar el día actual? No se podrán registrar más ventas.')) return
    loading = true
    error = ''
    success = ''
    await cerrarDia()
    loading = false
  }

  async function handleReopen() {
    loading = true
    error = ''
    success = ''
    await reabrirDia()
    loading = false
  }

  async function handleReset() {
    if (!confirm('¿Reiniciar el día? Se eliminarán todas las ventas y se reiniciará el stock.')) return
    loading = true
    error = ''
    success = ''
    const result = await reiniciarDia()
    if (result.error) {
      error = result.error.message
    } else {
      success = 'Día reiniciado correctamente'
      setTimeout(() => success = '', 3000)
    }
    loading = false
  }

  function formatFecha(fecha: string): string {
    return new Date(fecha + 'T12:00:00').toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
</script>

<svelte:head>
  <title>Gestión de días</title>
</svelte:head>

<div class="px-4 py-6 max-w-lg mx-auto">
  <h1 class="display text-3xl text-ink mb-6">Días</h1>

  {#if error}
    <div class="bg-danger-bg border border-danger/20 rounded-lg p-3 mb-4" role="alert">
      <p class="text-sm font-semibold text-danger">Error</p>
      <p class="text-sm text-danger/80 mt-1">{error}</p>
    </div>
  {/if}

  {#if success}
    <div class="bg-success-bg border border-success/20 rounded-lg p-3 mb-4" role="status">
      <p class="text-sm font-semibold text-success">{success}</p>
    </div>
  {/if}

  {#if $diaActual}
    <div class="card p-6 mb-4">
      <p class="text-xs text-ink-muted font-medium uppercase tracking-wide">Día actual</p>
      <p class="display text-xl text-ink mt-2 capitalize">{formatFecha($diaActual.fecha)}</p>
      <div class="mt-4">
        <span class="badge {$diaActual.estado === 'abierto' ? 'badge-success' : 'badge-danger'} text-sm px-3 py-1.5">
          {$diaActual.estado === 'abierto' ? 'Abierto' : 'Cerrado'}
        </span>
      </div>
      {#if $diaActual.cerrado_en}
        <p class="text-sm text-ink-muted mt-3">
          Cerrado a las {new Date($diaActual.cerrado_en).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      {/if}
    </div>

    <div class="card p-4 mb-4">
      {#if $diaActual.estado === 'abierto'}
        <button
          on:click={handleClose}
          disabled={loading}
          class="btn-danger w-full"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
          Cerrar día
        </button>
      {:else}
        <button
          on:click={handleReopen}
          disabled={loading}
          class="btn-success w-full"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path>
          </svg>
          Reabrir día
        </button>
      {/if}
    </div>

    <div class="card p-4 border-danger/30">
      <p class="text-sm text-ink-muted mb-3">Eliminar todas las ventas del día y reiniciar el stock.</p>
      <button
        on:click={handleReset}
        disabled={loading}
        class="btn-danger w-full"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
        Reiniciar día
      </button>
    </div>
  {:else}
    <div class="card p-12 text-center">
      <p class="text-ink-muted">Cargando...</p>
    </div>
  {/if}
</div>
