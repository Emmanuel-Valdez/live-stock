<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { login, currentUser } from '$lib/stores/auth'

  let email = import.meta.env.VITE_ADMIN_EMAIL || ''
  let password = ''
  let error = ''
  let loading = false

  onMount(() => {
    if ($currentUser) {
      goto('/admin')
    }
  })

  async function handleSubmit() {
    error = ''
    loading = true
    try {
      await login(email, password)
      goto('/admin')
    } catch (e: any) {
      error = e.message || 'Error al iniciar sesión'
    } finally {
      loading = false
    }
  }
</script>

<svelte:head>
  <title>Admin</title>
</svelte:head>

<div class="min-h-dvh bg-bg flex items-center justify-center p-4">
  <div class="w-full max-w-sm">
    <div class="text-center mb-8">
      <h1 class="display text-3xl text-ink">Ukiyo</h1>
      <p class="text-ink-muted mt-1">Panel de administración</p>
    </div>

    <form on:submit|preventDefault={handleSubmit} class="card p-6 space-y-4">
      {#if error}
        <div class="bg-danger-bg border border-danger/20 rounded-lg p-3" role="alert">
          <p class="text-sm text-danger">{error}</p>
        </div>
      {/if}

      <div>
        <label for="email" class="label">Email</label>
        <input
          id="email"
          type="email"
          inputmode="email"
          bind:value={email}
          required
          autocomplete="username"
          class="input"
          placeholder="admin@ukiyostudio.com"
        />
      </div>

      <div>
        <label for="password" class="label">Contraseña</label>
        <input
          id="password"
          type="password"
          bind:value={password}
          required
          autocomplete="current-password"
          class="input"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        class="btn-primary w-full"
      >
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  </div>
</div>
