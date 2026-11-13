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

export type Venta = {
  id: string
  producto_id: string
  precio_venta: number
  medio_cobro: 'efectivo' | 'transferencia' | 'qr' | 'tarjeta'
  timestamp: string
  dia: string
}

export function subscribeToProductos(callback: (productos: Producto[]) => void): RealtimeChannel {
  return supabase
    .channel('productos-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'productos' }, () => {
      supabase.from('productos').select('*').then(({ data }) => {
        if (data) callback(data as Producto[])
      })
    })
    .subscribe()
}

export function subscribeToVentas(callback: (venta: Venta) => void): RealtimeChannel {
  return supabase
    .channel('ventas-changes')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ventas' }, (payload) => {
      callback(payload.new as Venta)
    })
    .subscribe()
}
