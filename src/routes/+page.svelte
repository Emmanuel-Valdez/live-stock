<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { resolve } from '$app/paths'
  import { checkAuth } from '$lib/stores/auth'

  onMount(async () => {
    const user = await checkAuth()
    goto(
      resolve(!user ? '/admin/login' : user.email === import.meta.env.VITE_ADMIN_EMAIL ? '/admin' : '/ventas'),
      { replace: true }
    )
  })
</script>

<div class="min-h-dvh bg-bg flex items-center justify-center">
  <p class="text-ink-muted">Cargando...</p>
</div>
