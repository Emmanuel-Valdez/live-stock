<script lang="ts">
  import { supabase } from '$lib/supabase'
  import { goto } from '$app/navigation'

  let form = {
    nombre: '',
    descripcion: '',
    imagen_url: '',
    precio_sugerido: 0,
    stock_total: 0
  }

  let error = ''
  let loading = false
  let imgError = false

  async function handleSubmit() {
    error = ''
    loading = true

    if (!form.nombre || !form.imagen_url || form.precio_sugerido <= 0) {
      error = 'Completá todos los campos requeridos'
      loading = false
      return
    }

    try {
      const { error: insertError } = await supabase
        .from('productos')
        .insert([form])
        .select()

      if (insertError) throw insertError

      goto('/admin/productos')
    } catch (e: any) {
      error = e.message || 'Error al crear producto'
    } finally {
      loading = false
    }
  }
</script>

<svelte:head>
  <title>Nuevo producto</title>
</svelte:head>

<div class="px-4 py-6 max-w-lg mx-auto">
  <header class="flex items-center gap-4 mb-6">
    <a href="/admin/productos" class="p-2 -ml-2 text-ink-muted hover:text-ink rounded-lg" aria-label="Volver">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
      </svg>
    </a>
    <h1 class="display text-2xl text-ink">Nuevo producto</h1>
  </header>

  {#if error}
    <div class="bg-danger-bg border border-danger/20 rounded-lg p-4 mb-4" role="alert">
      <p class="text-sm text-danger">{error}</p>
    </div>
  {/if}

  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div class="card p-4 space-y-4">
      <div>
        <label for="nombre" class="label">Nombre *</label>
        <input
          id="nombre"
          type="text"
          bind:value={form.nombre}
          required
          class="input"
          placeholder="Nombre del producto"
        />
      </div>

      <div>
        <label for="descripcion" class="label">Descripción</label>
        <textarea
          id="descripcion"
          bind:value={form.descripcion}
          rows="3"
          class="input resize-none"
          placeholder="Descripción del producto (opcional)"
        ></textarea>
      </div>

      <div>
        <label for="imagen_url" class="label">URL de imagen *</label>
        <input
          id="imagen_url"
          type="url"
          inputmode="url"
          bind:value={form.imagen_url}
          required
          placeholder="https://ukiyostudio.evaldez.ar/..."
          class="input"
          on:input={() => imgError = false}
        />
        {#if form.imagen_url && !imgError}
          <div class="mt-3 rounded-lg overflow-hidden bg-border aspect-square max-w-[200px]">
            <img
              src={form.imagen_url}
              alt="Vista previa"
              class="w-full h-full object-cover"
              on:error={() => imgError = true}
            />
          </div>
        {:else if imgError}
          <p class="text-sm text-danger mt-2">No se pudo cargar la imagen</p>
        {/if}
      </div>
    </div>

    <div class="card p-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="precio_sugerido" class="label">Precio *</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted">$</span>
            <input
              id="precio_sugerido"
              type="number"
              inputmode="decimal"
              bind:value={form.precio_sugerido}
              min="0"
              step="0.01"
              required
              class="input pl-8 mono font-bold"
            />
          </div>
        </div>

        <div>
          <label for="stock_total" class="label">Stock *</label>
          <input
            id="stock_total"
            type="number"
            inputmode="numeric"
            bind:value={form.stock_total}
            min="0"
            required
            class="input mono font-bold text-center"
          />
        </div>
      </div>
    </div>

    <div class="flex gap-3 pt-2">
      <a href="/admin/productos" class="btn-secondary flex-1">
        Cancelar
      </a>
      <button type="submit" disabled={loading} class="btn-primary flex-1">
        {loading ? 'Guardando...' : 'Crear'}
      </button>
    </div>
  </form>
</div>
