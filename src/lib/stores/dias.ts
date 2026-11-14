import { writable } from 'svelte/store'
import { supabase } from '$lib/supabase'

export type DiaEvento = {
  id: string
  fecha: string
  estado: 'abierto' | 'cerrado'
  cerrado_en: string | null
}

export const diaActual = writable<DiaEvento | null>(null)

export async function loadDiaActual(createIfMissing = false) {
  const today = new Date().toISOString().split('T')[0]

  const { data: existente } = await supabase
    .from('dias_evento')
    .select('*')
    .eq('fecha', today)
    .maybeSingle()

  if (existente) {
    diaActual.set(existente as DiaEvento)
    return existente as DiaEvento
  }

  diaActual.set(null)
  if (!createIfMissing) return null

  const { data: nuevo } = await supabase
    .from('dias_evento')
    .insert([{ fecha: today, estado: 'abierto' }])
    .select()
    .single()

  if (nuevo) {
    diaActual.set(nuevo as DiaEvento)
    return nuevo as DiaEvento
  }

  return null
}

export async function cerrarDia() {
  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('dias_evento')
    .update({ estado: 'cerrado', cerrado_en: new Date().toISOString() })
    .eq('fecha', today)
    .select()
    .single()

  if (data) {
    diaActual.set(data as DiaEvento)
  }

  return data
}

export async function reabrirDia() {
  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('dias_evento')
    .update({ estado: 'abierto', cerrado_en: null })
    .eq('fecha', today)
    .select()
    .single()

  if (data) {
    diaActual.set(data as DiaEvento)
  }

  return data
}

export async function reiniciarDia() {
  const today = new Date().toISOString().split('T')[0]

  const { error: ventasError } = await supabase
    .from('ventas')
    .delete()
    .eq('dia', today)

  if (ventasError) return { error: ventasError }

  const { data: dia } = await supabase
    .from('dias_evento')
    .update({ estado: 'abierto', cerrado_en: null })
    .eq('fecha', today)
    .select()
    .single()

  if (dia) {
    diaActual.set(dia as DiaEvento)
  }

  return { data: dia }
}

  return { data: dia }
}
