import { writable, derived } from 'svelte/store'
import { supabase } from '$lib/supabase'
import { browser } from '$app/environment'
import type { User } from '@supabase/supabase-js'

export const currentUser = writable<User | null>(null)
export const isAdmin = derived(currentUser, $user => $user?.email === import.meta.env.VITE_ADMIN_EMAIL)

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  currentUser.set(data.user)
  return data.user
}

export async function logout() {
  await supabase.auth.signOut()
  currentUser.set(null)
}

export async function checkAuth() {
  if (!browser) return null
  const { data: { user } } = await supabase.auth.getUser()
  currentUser.set(user)
  return user
}
