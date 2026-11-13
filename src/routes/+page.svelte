<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { supabase } from '$lib/supabase'

  onMount(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    goto(user ? '/admin' : '/ventas')
  })
</script>

<div class="min-h-dvh bg-bg flex items-center justify-center">
  <p class="text-ink-muted">Cargando...</p>
</div>
