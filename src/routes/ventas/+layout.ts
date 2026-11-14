import type { LayoutLoad } from './$types'
import { redirect } from '@sveltejs/kit'
import { supabase } from '$lib/supabase'

export const load: LayoutLoad = async () => {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw redirect(303, '/admin/login')
  }

  return { user }
}
