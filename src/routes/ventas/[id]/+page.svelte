<script lang="ts">
  import { onMount } from 'svelte'
  import { page } from '$app/stores'
  import { supabase } from '$lib/supabase'
  import { goto } from '$app/navigation'
  import { loadDiaActual } from '$lib/stores/dias'
  import type { Producto } from '$lib/stores/realtime'

  let producto: Producto | null = null
  let precio = 0
  let medio_cobro: 'efectivo' | 'transferencia' | 'qr' | 'tarjeta' | '' = ''
  let error = ''
  let success = false
  let loading = false
  let productoId = ''
  let remainingStock: number | null = null
  let diaCerrado = false
  let diaNoIniciado = false
  let availabilityChecked = false
  let availabilityError = ''

  const medios_cobro = [
    { value: 'efectivo', label: 'Efectivo', icon: '💵' },
    { value: 'transferencia', label: 'Transferencia', icon: '🏦' },
    { value: 'qr', label: 'QR', icon: '📱' },
    { value: 'tarjeta', label: 'Tarjeta', icon: '💳' }
  ] as const

  onMount(async () => {
    productoId = $page.params.id
    await loadProducto()

    if (!producto) return

    const [salesResult, dia] = await Promise.all([
      supabase.from('ventas').select('id', { count: 'exact', head: true }).eq('producto_id', productoId),
      loadDiaActual()
    ])

    if (salesResult.error || salesResult.count === null) {
      availabilityError = 'No se pudo verificar la disponibilidad. No se puede registrar la venta.'
    } else {
      remainingStock = Math.max(0, producto.stock_total - salesResult.count)
      diaNoIniciado = !dia
      diaCerrado = dia?.estado === 'cerrado'
    }

    availabilityChecked = true
  })

  async function loadProducto() {
    const { data, error: loadError } = await supabase
      .from('productos')
      .select('*')
      .eq('id', productoId)
      .single()

    if (loadError || !data) {
      error = 'Producto no encontrado'
      return
    }

    producto = data as Producto
    precio = producto.precio_sugerido
  }

  async function handleVenta() {
    error = ''
    success = false

    if (diaCerrado) {
      error = 'El día está cerrado. No se pueden registrar ventas.'
      return
    }

    if (diaNoIniciado) {
      error = 'El día no está iniciado. Pedile al administrador que lo abra.'
      return
    }

    if (remainingStock === null || remainingStock <= 0 || availabilityError) {
      error = availabilityError || 'Sin stock disponible para este producto.'
      return
    }

    if (!medio_cobro) {
      error = 'Seleccioná un medio de cobro'
      return
    }

    if (precio <= 0) {
      error = 'El precio debe ser mayor a 0'
      return
    }

    loading = true

    try {
      const { error: insertError } = await supabase.from('ventas').insert([{
        producto_id: productoId,
        precio_venta: precio,
        medio_cobro: medio_cobro
      }])

      if (insertError) throw insertError

      success = true

      if (navigator.vibrate) navigator.vibrate(50)

      setTimeout(() => {
        goto('/ventas')
      }, 1500)
    } catch (e: any) {
      error = e.message || 'Error al registrar venta'
    } finally {
      loading = false
    }
  }
</script>

<svelte:head>
  <title>{producto?.nombre || 'Producto'}</title>
</svelte:head>

<div class="min-h-dvh bg-bg">
  {#if success}
    <div class="min-h-dvh flex items-center justify-center p-4">
      <div class="bg-success-bg border border-success/20 rounded-2xl p-8 text-center max-w-sm w-full" role="status">
        <div class="w-16 h-16 mx-auto mb-4 bg-success rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <p class="display text-2xl text-success">Vendido</p>
        <p class="text-sm text-success/80 mt-2">Volviendo a la grilla...</p>
      </div>
    </div>
  {:else if producto}
    <header class="sticky top-0 z-40 bg-surface border-b border-border">
      <div class="px-4 py-3 flex items-center justify-between">
        <a href="/ventas" class="flex items-center gap-2 text-ink-muted hover:text-ink">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          <span class="text-sm font-medium">Volver</span>
        </a>
        <h1 class="display text-lg text-ink truncate max-w-[50%]">{producto.nombre}</h1>
        <div class="w-16"></div>
      </div>
    </header>

    <main class="px-4 py-4 max-w-lg mx-auto">
      <div class="card mb-4">
        <div class="aspect-square overflow-hidden bg-border">
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            class="w-full h-full object-cover"
          />
        </div>
        {#if producto.descripcion}
          <div class="p-4">
            <p class="text-sm text-ink-muted leading-relaxed">{producto.descripcion}</p>
          </div>
        {/if}
      </div>

      <div class="card p-4 mb-4" aria-live="polite">
        {#if !availabilityChecked}
          <p class="text-sm text-ink-muted">Verificando disponibilidad...</p>
        {:else if availabilityError}
          <p class="text-sm font-medium text-danger">{availabilityError}</p>
        {:else}
          <p class="text-sm font-semibold text-ink">Quedan {remainingStock} unidades</p>
          {#if remainingStock !== null && remainingStock <= 0}
            <p class="text-sm font-semibold text-danger mt-1">Sin stock</p>
          {/if}
          {#if diaCerrado}
            <p class="text-sm font-semibold text-danger mt-1">Día cerrado. No se pueden registrar ventas.</p>
          {/if}
          {#if diaNoIniciado}
            <p class="text-sm font-semibold text-danger mt-1">Día no iniciado. El administrador debe iniciar el día.</p>
          {/if}
        {/if}
      </div>

      {#if error}
        <div class="bg-danger-bg border border-danger/20 rounded-lg p-4 mb-4" role="alert">
          <p class="text-sm font-medium text-danger">{error}</p>
        </div>
      {/if}

      <form on:submit|preventDefault={handleVenta} class="space-y-4">
        <div class="card p-4">
          <label for="precio" class="label">Precio de venta</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-ink-muted">$</span>
            <input
              id="precio"
              type="number"
              inputmode="decimal"
              bind:value={precio}
              min="0"
              step="0.01"
              class="input pl-10 pr-4 text-2xl font-bold mono text-center"
              aria-describedby="precio-sugerido"
            />
          </div>
          <p id="precio-sugerido" class="text-xs text-ink-muted text-center mt-2">
            Sugerido: ${producto.precio_sugerido.toFixed(2)}
          </p>
        </div>

        <div class="card p-4">
          <fieldset>
            <legend class="label">Medio de cobro</legend>
            <div class="grid grid-cols-2 gap-3">
              {#each medios_cobro as medio}
                <button
                  type="button"
                  on:click={() => medio_cobro = medio.value}
                  class="min-h-touch flex flex-col items-center justify-center gap-2 p-4 border-2 rounded-lg transition-all active:scale-[0.97] {medio_cobro === medio.value ? 'border-accent bg-accent-light text-accent' : 'border-border bg-surface text-ink hover:border-ink-muted'}"
                  aria-pressed={medio_cobro === medio.value}
                >
                  <span class="text-2xl">{medio.icon}</span>
                  <span class="text-sm font-medium">{medio.label}</span>
                </button>
              {/each}
            </div>
          </fieldset>
        </div>

        <div class="flex gap-3 pt-2">
          <a href="/ventas" class="btn-secondary flex-1">
            Cancelar
          </a>
          <button
            type="submit"
            disabled={loading || !availabilityChecked || !!availabilityError || diaCerrado || diaNoIniciado || remainingStock === null || remainingStock <= 0}
            class="btn-primary flex-1"
          >
            {loading ? 'Procesando...' : 'Vender'}
          </button>
        </div>
      </form>
    </main>
  {:else}
    <div class="min-h-dvh flex items-center justify-center">
      <p class="text-ink-muted">Cargando...</p>
    </div>
  {/if}
</div>
