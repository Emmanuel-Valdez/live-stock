<script lang="ts">
  import { onMount } from 'svelte'
  import { diaActual, loadDiaActual, cerrarDia, reabrirDia } from '$lib/stores/dias'

  let loading = false

  onMount(async () => {
    await loadDiaActual()
  })

  async function handleClose() {
    if (!confirm('¿Cerrar el día actual? No se podrán registrar más ventas.')) return
    loading = true
    await cerrarDia()
    loading = false
  }

  async function handleReopen() {
    loading = true
    await reabrirDia()
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

    <div class="card p-4">
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
  {:else}
    <div class="card p-12 text-center">
      <p class="text-ink-muted">Cargando...</p>
    </div>
  {/if}
</div>
