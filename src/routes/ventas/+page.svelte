<script lang="ts">
  import { onMount } from 'svelte'
  import { supabase } from '$lib/supabase'
  import { subscribeToProductos, subscribeToVentas, type Producto } from '$lib/stores/realtime'
  import { goto } from '$app/navigation'
  import { diaActual, loadDiaActual } from '$lib/stores/dias'

  let productos: Producto[] = []
  let ventasCount: Record<string, number> = {}
  let productosChannel: any = null
  let ventasChannel: any = null
  let connected = false

  onMount(async () => {
    await loadDiaActual()
    await loadProductos()
    await loadVentas()

    productosChannel = subscribeToProductos((updated) => {
      productos = updated
    })

    ventasChannel = subscribeToVentas((venta) => {
      if (venta.producto_id) {
        ventasCount[venta.producto_id] = (ventasCount[venta.producto_id] || 0) + 1
      }
    })

    supabase.channel('connection-status')
      .on('system', { event: 'broadcast' }, () => {
        connected = true
      })
      .subscribe((status) => {
        connected = status === 'SUBSCRIBED'
      })

    return () => {
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
      ventasCount = {}
      data.forEach(v => {
        if (v.producto_id) {
          ventasCount[v.producto_id] = (ventasCount[v.producto_id] || 0) + 1
        }
      })
    }
  }

  function getStockDisponible(producto: Producto): number {
    const vendidas = ventasCount[producto.id] || 0
    return producto.stock_total - vendidas
  }

  function selectProducto(producto: Producto) {
    if ($diaActual?.estado === 'cerrado') return
    if (getStockDisponible(producto) <= 0) return
    goto(`/ventas/${producto.id}`)
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
        {#if $diaActual}
          <span class="badge {$diaActual.estado === 'abierto' ? 'badge-success' : 'badge-danger'}">
            {$diaActual.estado === 'abierto' ? 'Abierto' : 'Cerrado'}
          </span>
        {/if}
        <span class="flex items-center gap-1.5 text-xs text-ink-muted" aria-live="polite">
          <span class="w-2 h-2 rounded-full {connected ? 'bg-success' : 'bg-danger'}"></span>
          <span class="hidden sm:inline">{connected ? 'Conectado' : 'Sin conexión'}</span>
        </span>
      </div>
    </div>
  </header>

  <main class="px-4 py-4">
    {#if $diaActual?.estado === 'cerrado'}
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
            on:click={() => selectProducto(producto)}
            disabled={sinStock || $diaActual?.estado === 'cerrado'}
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
