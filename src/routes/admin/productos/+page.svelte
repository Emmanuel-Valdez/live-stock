<script lang="ts">
  import { onMount } from 'svelte'
  import { supabase } from '$lib/supabase'
  import { subscribeToProductos, type Producto } from '$lib/stores/realtime'
  import { goto } from '$app/navigation'

  let productos: Producto[] = []
  let channel: any = null

  onMount(async () => {
    await loadProductos()
    channel = subscribeToProductos((updated) => {
      productos = updated
    })

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  })

  async function loadProductos() {
    const { data } = await supabase.from('productos').select('*').order('nombre')
    if (data) productos = data as Producto[]
  }

  async function deleteProducto(id: string) {
    if (!confirm('¿Eliminar este producto?')) return
    await supabase.from('productos').delete().eq('id', id)
    productos = productos.filter(p => p.id !== id)
  }

  function editProducto(id: string) {
    goto(`/admin/productos/${id}/edit`)
  }
</script>

<svelte:head>
  <title>Productos</title>
</svelte:head>

<div class="px-4 py-6 max-w-4xl mx-auto">
  <div class="flex items-center justify-between mb-6">
    <h1 class="display text-3xl text-ink">Productos</h1>
    <a href="/admin/productos/nuevo" class="btn-primary">
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
      </svg>
      <span class="hidden sm:inline">Nuevo</span>
    </a>
  </div>

  {#if productos.length === 0}
    <div class="card p-12 text-center">
      <div class="w-16 h-16 mx-auto mb-4 bg-bg rounded-full flex items-center justify-center">
        <svg class="w-8 h-8 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
        </svg>
      </div>
      <p class="text-ink-muted mb-4">No hay productos configurados</p>
      <a href="/admin/productos/nuevo" class="btn-primary">
        Crear primer producto
      </a>
    </div>
  {:else}
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {#each productos as producto (producto.id)}
        <div class="card overflow-hidden">
          <div class="flex">
            <img
              src={producto.imagen_url}
              alt=""
              class="w-24 h-24 sm:w-32 sm:h-32 object-cover flex-shrink-0"
              loading="lazy"
            />
            <div class="flex-1 p-3 sm:p-4 flex flex-col justify-between min-w-0">
              <div>
                <h2 class="font-semibold text-ink truncate">{producto.nombre}</h2>
                <p class="mono text-lg font-bold text-accent mt-1">${producto.precio_sugerido.toFixed(2)}</p>
              </div>
              <div class="flex items-center justify-between mt-2">
                <span class="badge {producto.stock_total > 0 ? 'badge-success' : 'badge-danger'}">
                  Stock: {producto.stock_total}
                </span>
                <div class="flex gap-2">
                  <button
                    on:click={() => editProducto(producto.id)}
                    class="p-2 text-ink-muted hover:text-accent rounded-lg hover:bg-accent-light transition-colors"
                    aria-label="Editar {producto.nombre}"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button
                    on:click={() => deleteProducto(producto.id)}
                    class="p-2 text-ink-muted hover:text-danger rounded-lg hover:bg-danger-bg transition-colors"
                    aria-label="Eliminar {producto.nombre}"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
