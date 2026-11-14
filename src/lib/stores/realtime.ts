import { supabase } from '$lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export type Producto = {
  id: string
  nombre: string
  descripcion: string | null
  imagen_url: string
  precio_sugerido: number
  stock_total: number
  created_at: string
}

export function subscribeToProductos(
  callback: (productos: Producto[]) => void,
  onStatus?: (status: string) => void
): RealtimeChannel {
  return supabase
    .channel('productos-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'productos' }, () => {
      supabase.from('productos').select('*').then(({ data }) => {
        if (data) callback(data as Producto[])
      })
    })
    .subscribe((status) => onStatus?.(status))
}

export function subscribeToVentas(callback: () => void, onStatus?: (status: string) => void): RealtimeChannel {
  return supabase
    .channel('ventas-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'ventas' }, () => callback())
    .subscribe((status) => onStatus?.(status))
}
