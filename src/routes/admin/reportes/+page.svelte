<script lang="ts">
  import { onMount } from 'svelte'
  import { supabase } from '$lib/supabase'

  type VentaDetalle = {
    id: string
    producto_id: string | null
    precio_venta: number
    medio_cobro: string
    timestamp: string
    dia: string
    productos?: { nombre: string } | null
  }

  let ventas: VentaDetalle[] = []
  let fechas: string[] = []
  let fechaSeleccionada: string = ''
  let loading = false

  onMount(async () => {
    await loadFechas()
    if (fechas.length > 0) {
      fechaSeleccionada = fechas[0]
    }
  })

  async function loadFechas() {
    const { data } = await supabase
      .from('ventas')
      .select('dia')
      .order('dia', { ascending: false })

    if (data) {
      const unicas = [...new Set(data.map(v => v.dia))]
      fechas = unicas
    }
  }

  async function loadVentas() {
    if (!fechaSeleccionada) return

    loading = true
    const { data } = await supabase
      .from('ventas')
      .select('*, productos(nombre)')
      .eq('dia', fechaSeleccionada)
      .order('timestamp', { ascending: false })

    if (data) {
      ventas = data as VentaDetalle[]
    }
    loading = false
  }

  $: if (fechaSeleccionada) {
    loadVentas()
  }

  $: totalVendido = ventas.reduce((sum, v) => sum + v.precio_venta, 0)
  $: cantidadVentas = ventas.length
  $: desglosePorMedio = ventas.reduce((acc, v) => {
    acc[v.medio_cobro] = (acc[v.medio_cobro] || 0) + v.precio_venta
    return acc
  }, {} as Record<string, number>)

  function formatFecha(fecha: string): string {
    return new Date(fecha + 'T12:00:00').toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  function formatTimestamp(ts: string): string {
    return new Date(ts).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function medioLabel(medio: string): string {
    const labels: Record<string, string> = {
      efectivo: '💵 Efectivo',
      transferencia: '🏦 Transferencia',
      qr: '📱 QR',
      tarjeta: '💳 Tarjeta'
    }
    return labels[medio] || medio
  }

  function exportCSV() {
    const headers = ['Fecha', 'Hora', 'Producto', 'Precio', 'Medio de Cobro']
    const rows = ventas.map(v => [
      v.dia,
      formatTimestamp(v.timestamp),
      v.productos?.nombre || 'Producto eliminado',
      v.precio_venta.toFixed(2),
      v.medio_cobro
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ventas-${fechaSeleccionada}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function exportAllCSV() {
    loading = true
    const { data } = await supabase
      .from('ventas')
      .select('*, productos(nombre)')
      .order('timestamp', { ascending: false })

    if (!data) {
      loading = false
      return
    }

    const headers = ['Fecha', 'Hora', 'Producto', 'Precio', 'Medio de Cobro']
    const rows = (data as VentaDetalle[]).map(v => [
      v.dia,
      formatTimestamp(v.timestamp),
      v.productos?.nombre || 'Producto eliminado',
      v.precio_venta.toFixed(2),
      v.medio_cobro
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ventas-todas.csv`
    a.click()
    URL.revokeObjectURL(url)
    loading = false
  }
</script>

<svelte:head>
  <title>Reportes</title>
</svelte:head>

<div class="px-4 py-6 max-w-4xl mx-auto">
  <div class="flex items-center justify-between mb-6">
    <h1 class="display text-3xl text-ink">Reportes</h1>
    <button
      on:click={exportAllCSV}
      disabled={loading}
      class="btn-secondary"
    >
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
      </svg>
      <span class="hidden sm:inline">Exportar todo</span>
    </button>
  </div>

  <div class="card p-4 mb-4">
    <label for="fecha" class="label">Seleccionar día</label>
    <select
      id="fecha"
      bind:value={fechaSeleccionada}
      class="input"
    >
      {#each fechas as fecha}
        <option value={fecha}>{formatFecha(fecha)}</option>
      {/each}
    </select>
  </div>

  {#if fechaSeleccionada}
    <div class="grid grid-cols-2 gap-3 mb-4">
      <div class="card p-4">
        <p class="text-xs text-ink-muted font-medium uppercase tracking-wide">Total</p>
        <p class="display text-2xl mono text-success mt-1">${totalVendido.toFixed(2)}</p>
      </div>

      <div class="card p-4">
        <p class="text-xs text-ink-muted font-medium uppercase tracking-wide">Ventas</p>
        <p class="display text-2xl text-accent mt-1">{cantidadVentas}</p>
      </div>
    </div>

    {#if Object.keys(desglosePorMedio).length > 0}
      <div class="card p-4 mb-4">
        <p class="label mb-3">Desglose por medio</p>
        <div class="space-y-2">
          {#each Object.entries(desglosePorMedio) as [medio, total]}
            <div class="flex items-center justify-between">
              <span class="text-sm text-ink">{medioLabel(medio)}</span>
              <span class="mono font-semibold text-ink">${total.toFixed(2)}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <div class="card overflow-hidden">
      <div class="px-4 py-3 border-b border-border flex items-center justify-between">
        <h2 class="font-semibold text-ink">Historial</h2>
        <button
          on:click={exportCSV}
          class="text-sm text-accent font-medium hover:text-accent-hover"
        >
          Exportar CSV
        </button>
      </div>

      {#if ventas.length === 0}
        <div class="p-8 text-center text-ink-muted">
          No hay ventas para este día
        </div>
      {:else}
        <ul class="divide-y divide-border">
          {#each ventas as venta (venta.id)}
            <li class="px-4 py-3 flex items-center justify-between gap-4">
              <div class="min-w-0 flex-1">
                <p class="font-medium text-ink truncate">
                  {venta.productos?.nombre || 'Producto eliminado'}
                </p>
                <p class="text-sm text-ink-muted">{medioLabel(venta.medio_cobro)}</p>
              </div>
              <div class="text-right flex-shrink-0">
                <p class="mono font-bold text-ink">${venta.precio_venta.toFixed(2)}</p>
                <p class="text-xs text-ink-muted">{formatTimestamp(venta.timestamp)}</p>
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}
</div>
