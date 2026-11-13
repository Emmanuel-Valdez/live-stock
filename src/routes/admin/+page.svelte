<script lang="ts">
  import { onMount } from 'svelte'
  import { supabase } from '$lib/supabase'

  let stats = {
    totalProductos: 0,
    stockTotal: 0,
    ventasHoy: 0,
    totalHoy: 0
  }

  onMount(async () => {
    await loadStats()
  })

  async function loadStats() {
    const { data: productos } = await supabase.from('productos').select('stock_total')
    if (productos) {
      stats.totalProductos = productos.length
      stats.stockTotal = productos.reduce((sum, p) => sum + p.stock_total, 0)
    }

    const today = new Date().toISOString().split('T')[0]
    const { data: ventas, count } = await supabase
      .from('ventas')
      .select('precio_venta', { count: 'exact' })
      .eq('dia', today)

    stats.ventasHoy = count || 0
    stats.totalHoy = (ventas || []).reduce((sum, v) => sum + v.precio_venta, 0)
  }
</script>

<svelte:head>
  <title>Admin</title>
</svelte:head>

<div class="px-4 py-6 max-w-4xl mx-auto">
  <h1 class="display text-3xl text-ink mb-6">Panel</h1>

  <div class="grid grid-cols-2 gap-3 mb-6">
    <div class="card p-4">
      <p class="text-xs text-ink-muted font-medium uppercase tracking-wide">Productos</p>
      <p class="display text-3xl text-ink mt-1">{stats.totalProductos}</p>
    </div>

    <div class="card p-4">
      <p class="text-xs text-ink-muted font-medium uppercase tracking-wide">Stock</p>
      <p class="display text-3xl text-ink mt-1">{stats.stockTotal}</p>
    </div>

    <div class="card p-4">
      <p class="text-xs text-ink-muted font-medium uppercase tracking-wide">Ventas hoy</p>
      <p class="display text-3xl text-accent mt-1">{stats.ventasHoy}</p>
    </div>

    <div class="card p-4">
      <p class="text-xs text-ink-muted font-medium uppercase tracking-wide">Total hoy</p>
      <p class="display text-3xl mono text-success mt-1">${stats.totalHoy.toFixed(0)}</p>
    </div>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <a href="/admin/productos" class="card p-5 flex items-center gap-4 active:scale-[0.98] transition-transform">
      <div class="w-12 h-12 bg-accent-light rounded-xl flex items-center justify-center flex-shrink-0">
        <svg class="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
        </svg>
      </div>
      <div>
        <p class="font-semibold text-ink">Productos</p>
        <p class="text-sm text-ink-muted">Gestionar catálogo</p>
      </div>
    </a>

    <a href="/admin/reportes" class="card p-5 flex items-center gap-4 active:scale-[0.98] transition-transform">
      <div class="w-12 h-12 bg-success-bg rounded-xl flex items-center justify-center flex-shrink-0">
        <svg class="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
      </div>
      <div>
        <p class="font-semibold text-ink">Reportes</p>
        <p class="text-sm text-ink-muted">Ver ventas y exportar</p>
      </div>
    </a>

    <a href="/admin/dias" class="card p-5 flex items-center gap-4 active:scale-[0.98] transition-transform sm:col-span-2">
      <div class="w-12 h-12 bg-warning-bg rounded-xl flex items-center justify-center flex-shrink-0">
        <svg class="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      </div>
      <div>
        <p class="font-semibold text-ink">Gestión de días</p>
        <p class="text-sm text-ink-muted">Cerrar o reabrir jornada</p>
      </div>
    </a>
  </div>

  <div class="mt-6">
    <a href="/ventas" class="btn-secondary w-full flex items-center justify-center gap-2">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
      </svg>
      Ir a vista de ventas
    </a>
  </div>
</div>
