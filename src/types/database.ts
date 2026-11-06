export type EstadoPedido =
  | 'Solicitado'
  | 'Cotizado'
  | 'Aprobado'
  | 'Comprado'
  | 'En tránsito'
  | 'Recibido'
  | 'Entregado'
  | 'Cancelado'

export type CategoriaTech =
  | 'Celular'
  | 'Laptop'
  | 'Tablet'
  | 'Accesorio'
  | 'Otro'

export interface Cliente {
  id: string
  nombre: string
  telefono: string
  email: string | null
  direccion: string | null
  notas: string | null
  created_at: string
}

export interface Pedido {
  id: string
  codigo: string
  cliente_id: string
  cliente?: Cliente
  producto_nombre: string
  producto_descripcion: string | null
  producto_url: string | null
  link_compra: string | null
  numero_tracking: string | null
  url_tracking: string | null
  categoria: CategoriaTech
  estado: EstadoPedido
  precio_usd: number | null
  costo_envio_usd: number | null
  impuestos_usd: number | null
  comision_porcentaje: number | null
  comision_monto_usd: number | null
  total_usd: number | null
  tipo_cambio: number | null
  notas: string | null
  created_at: string
  updated_at: string
}

export interface InventarioItem {
  id: string
  pedido_id: string | null
  producto_nombre: string
  numero_serie: string | null
  cantidad: number
  estado: 'En almacén' | 'Entregado'
  fecha_recepcion: string
  fecha_entrega: string | null
  notas: string | null
  created_at: string
}

export interface CostoAdicional {
  id: string
  pedido_id: string
  concepto: string
  monto_usd: number
  notas: string | null
  created_at: string
}

export interface HistorialEstado {
  id: string
  pedido_id: string
  estado: EstadoPedido
  fecha: string
  notas: string | null
}

export type GeneroPerfume = 'Hombre' | 'Mujer' | 'Unisex'

export interface Perfume {
  id: string
  nombre: string
  marca: string
  presentacion_ml: number
  genero: GeneroPerfume
  descripcion: string | null
  imagen_url: string | null
  costo_compra: number
  precio_minorista: number
  precio_mayorista: number
  created_at: string
  updated_at: string
}

export interface Proveedor {
  id: string
  nombre: string
  telefono: string | null
  email: string | null
  direccion: string | null
  notas: string | null
  created_at: string
}

export type TipoMovimientoPerfume = 'Entrada' | 'Venta' | 'Ajuste' | 'Merma'

export interface MovimientoPerfume {
  id: string
  perfume_id: string
  perfume?: Perfume
  tipo: TipoMovimientoPerfume
  cantidad: number
  costo_unitario: number | null
  proveedor: string | null
  proveedor_id: string | null
  nota: string | null
  fecha: string
  created_at: string
}

export type TipoVenta = 'Minorista' | 'Mayorista'
export type EstadoVenta = 'Confirmada' | 'Anulada'

export interface VentaPerfume {
  id: string
  codigo: string
  tipo: TipoVenta
  cliente_id: string | null
  cliente_nombre: string | null
  cliente?: Cliente
  estado: EstadoVenta
  total: number
  nota: string | null
  fecha_anulacion: string | null
  motivo_anulacion: string | null
  fecha: string
  created_at: string
  items?: VentaPerfumeItem[]
}

export interface VentaPerfumeItem {
  id: string
  venta_id: string
  perfume_id: string
  perfume?: Perfume
  cantidad: number
  precio_unitario: number
  subtotal: number
  created_at: string
}

export interface Configuracion {
  id: string
  comision_default: number
  dias_alerta: number
  tipo_cambio: number
  stock_minimo_perfumes: number
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      clientes: {
        Row: Cliente
        Insert: Omit<Cliente, 'id' | 'created_at' | 'email' | 'direccion' | 'notas'> & {
          email?: string | null
          direccion?: string | null
          notas?: string | null
        }
        Update: Partial<Omit<Cliente, 'id' | 'created_at'>>
        Relationships: []
      }
      pedidos: {
        Row: Pedido
        Insert: Omit<Pedido, 'id' | 'codigo' | 'created_at' | 'updated_at' | 'cliente'>
        Update: Partial<Omit<Pedido, 'id' | 'codigo' | 'created_at' | 'cliente'>>
        Relationships: []
      }
      inventario: {
        Row: InventarioItem
        Insert: Omit<InventarioItem, 'id' | 'created_at'>
        Update: Partial<Omit<InventarioItem, 'id' | 'created_at'>>
        Relationships: []
      }
      costos_adicionales: {
        Row: CostoAdicional
        Insert: Omit<CostoAdicional, 'id' | 'created_at'>
        Update: Partial<Omit<CostoAdicional, 'id' | 'created_at'>>
        Relationships: []
      }
      historial_estados: {
        Row: HistorialEstado
        Insert: Omit<HistorialEstado, 'id' | 'fecha'>
        Update: Partial<Omit<HistorialEstado, 'id' | 'pedido_id' | 'fecha'>>
        Relationships: []
      }
      perfumes: {
        Row: Perfume
        Insert: Omit<Perfume, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Perfume, 'id' | 'created_at'>>
        Relationships: []
      }
      configuracion: {
        Row: Configuracion
        Insert: Omit<Configuracion, 'id' | 'updated_at'>
        Update: Partial<Omit<Configuracion, 'id'>>
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
