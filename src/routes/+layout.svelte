<script>
  import { onMount } from 'svelte';
  import '../app.css';
  import { supabase } from '$lib/supabase';
  import { checkAuth, currentUser } from '$lib/stores/auth';

  onMount(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      currentUser.set(session?.user ?? null);
    });

    void checkAuth();

    return () => subscription.unsubscribe();
  });
</script>

<slot />
