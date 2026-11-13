import type { LayoutLoad } from './$types'
import { redirect } from '@sveltejs/kit'
import { supabase } from '$lib/supabase'

export const load: LayoutLoad = async ({ url }) => {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user && url.pathname !== '/admin/login') {
    throw redirect(303, '/admin/login')
  }

  return { user }
}
