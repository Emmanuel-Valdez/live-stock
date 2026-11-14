<script lang="ts">
  import { onMount } from 'svelte'
  import { supabase } from '$lib/supabase'
  import { subscribeToProductos, subscribeToVentas, type Producto } from '$lib/stores/realtime'
  import { goto } from '$app/navigation'
  import { resolve } from '$app/paths'
  import { diaActual, loadDiaActual } from '$lib/stores/dias'
  import { isAdmin, logout } from '$lib/stores/auth'

  let productos: Producto[] = []
  let ventasCount: Record<string, number> = {}
  let productosChannel: any = null
  let ventasChannel: any = null
  let connected = false
  let productosRealtimeConnected = false
  let ventasRealtimeConnected = false

  onMount(() => {
    function updateConnection() {
      const wasConnected = connected
      connected = productosRealtimeConnected && ventasRealtimeConnected && navigator.onLine
      if (!wasConnected && connected) {
        void loadProductos()
        void loadVentas()
      }
    }

    const handleOnline = () => updateConnection()
    const handleOffline = () => updateConnection()
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    productosChannel = subscribeToProductos((updated) => {
      productos = updated
    }, (status) => {
      productosRealtimeConnected = status === 'SUBSCRIBED'
      updateConnection()
    })

    ventasChannel = subscribeToVentas(() => {
      void loadVentas()
    }, (status) => {
      ventasRealtimeConnected = status === 'SUBSCRIBED'
      updateConnection()
    })

    void loadDiaActual()
    void loadProductos()
    void loadVentas()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (productosChannel) supabase.removeChannel(productosChannel)
      if (ventasChannel) supabase.removeChannel(ventasChannel)
    }
  })

  async function loadProductos() {
    const { data } = await supabase.from('productos').select('*').order('nombre')
    if (data) productos = data as Producto[]
  }

  async function loadVentas() {
    const { data } = await supabase.from('ventas').select('producto_id')
    if (data) {
      const counts: Record<string, number> = {}
      data.forEach(v => {
        if (v.producto_id) {
          counts[v.producto_id] = (counts[v.producto_id] || 0) + 1
        }
      })
      ventasCount = counts
    }
  }

  function getStockDisponible(producto: Producto): number {
    const vendidas = ventasCount[producto.id] || 0
    return producto.stock_total - vendidas
  }

  function selectProducto(producto: Producto) {
    if (!$diaActual || $diaActual.estado === 'cerrado') return
    if (getStockDisponible(producto) <= 0) return
    goto(resolve('/ventas/[id]', { id: producto.id }))
  }

  async function handleLogout() {
    await logout()
    goto(resolve('/admin/login'))
  }
</script>

<svelte:head>
  <title>Ventas</title>
</svelte:head>

<div class="min-h-dvh bg-bg pb-safe">
  <header class="sticky top-0 z-40 bg-surface border-b border-border shadow-sm">
    <div class="px-4 py-3 flex items-center justify-between">
      <div>
        <h1 class="display text-xl text-ink">Ukiyo</h1>
        <p class="text-xs text-ink-muted mt-0.5">Ventas en vivo</p>
      </div>
      <div class="flex items-center gap-3">
        {#if $isAdmin}
          <a href={resolve('/admin')} class="touch-target rounded-lg bg-accent-light px-3 text-xs font-semibold text-accent">Admin</a>
        {/if}
        <button type="button" onclick={handleLogout} class="touch-target rounded-lg px-2 text-xs font-medium text-ink-muted">Salir</button>
        {#if $diaActual}
          <span class="badge {$diaActual.estado === 'abierto' ? 'badge-success' : 'badge-danger'}">
            {$diaActual.estado === 'abierto' ? 'Abierto' : 'Cerrado'}
          </span>
        {/if}
        <span class="flex items-center gap-1.5 text-xs text-ink-muted" aria-live="polite" aria-label={connected ? 'Conectado' : 'Sin conexión; el stock puede estar desactualizado'}>
          <span aria-hidden="true" class="w-2 h-2 rounded-full {connected ? 'bg-success' : 'bg-danger'}"></span>
          <span class="hidden sm:inline">{connected ? 'Conectado' : 'Sin conexión'}</span>
        </span>
      </div>
    </div>
  </header>

  <main class="px-4 py-4">
    {#if !connected}
      <div class="bg-danger-bg border border-danger/20 rounded-lg p-3 mb-4" role="alert">
        <p class="text-sm font-semibold text-danger">Sin conexión de tiempo real</p>
        <p class="text-sm text-danger/80 mt-1">El stock visible puede estar desactualizado.</p>
      </div>
    {/if}

    {#if !$diaActual}
      <div class="bg-danger-bg border border-danger/20 rounded-lg p-4 mb-4" role="alert">
        <p class="font-semibold text-danger">Día no iniciado</p>
        <p class="text-sm text-danger/80 mt-1">El administrador debe iniciar el día antes de vender.</p>
      </div>
    {:else if $diaActual.estado === 'cerrado'}
      <div class="bg-danger-bg border border-danger/20 rounded-lg p-4 mb-4" role="alert">
        <p class="font-semibold text-danger">Día cerrado</p>
        <p class="text-sm text-danger/80 mt-1">No se pueden registrar ventas</p>
      </div>
    {/if}

    {#if productos.length === 0}
      <div class="card p-12 text-center">
        <p class="text-ink-muted">No hay productos disponibles</p>
      </div>
    {:else}
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" aria-label="Productos disponibles">
        {#each productos as producto (producto.id)}
          {@const stock = getStockDisponible(producto)}
          {@const sinStock = stock <= 0}
          <button
            type="button"
            onclick={() => selectProducto(producto)}
            disabled={sinStock || !$diaActual || $diaActual.estado === 'cerrado'}
            class="card text-left transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            aria-label="{producto.nombre}, ${producto.precio_sugerido.toFixed(2)}, stock {stock}"
          >
            <div class="relative aspect-square overflow-hidden bg-border">
              <img
                src={producto.imagen_url}
                alt=""
                class="w-full h-full object-cover"
                loading="lazy"
              />
              {#if sinStock}
                <div class="absolute inset-0 bg-ink/60 flex items-center justify-center">
                  <span class="text-white font-bold text-sm">Sin stock</span>
                </div>
              {:else}
                <div class="absolute top-2 right-2 bg-surface/95 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-bold text-ink">
                  {stock}
                </div>
              {/if}
            </div>
            <div class="p-3">
              <h2 class="font-semibold text-sm text-ink truncate">{producto.nombre}</h2>
              <p class="mono text-base font-bold text-accent mt-1">${producto.precio_sugerido.toFixed(2)}</p>
            </div>
          </button>
        {/each}
      </div>
    {/if}
  </main>
</div>
