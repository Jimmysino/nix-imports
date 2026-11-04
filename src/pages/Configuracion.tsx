import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useConfiguracion } from '../hooks/useConfiguracion'

export function Configuracion() {
  const { config, loading, error, actualizarComision, actualizarDiasAlerta, actualizarTipoCambio } = useConfiguracion()
  const [comision, setComision] = useState('15')
  const [diasAlerta, setDiasAlerta] = useState('7')
  const [tipoCambio, setTipoCambio] = useState('1')
  const [guardando, setGuardando] = useState(false)
  const [guardandoDias, setGuardandoDias] = useState(false)
  const [guardandoTC, setGuardandoTC] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [mensajeDias, setMensajeDias] = useState<string | null>(null)
  const [mensajeTC, setMensajeTC] = useState<string | null>(null)
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null)
  const [errorDias, setErrorDias] = useState<string | null>(null)
  const [errorTC, setErrorTC] = useState<string | null>(null)

  useEffect(() => {
    if (config) {
      setComision(String(config.comision_default))
      setDiasAlerta(String(config.dias_alerta))
      setTipoCambio(String(config.tipo_cambio))
    }
  }, [config])

  async function guardarComision(event: FormEvent) {
    event.preventDefault()
    const valor = Number(comision)
    if (!Number.isFinite(valor) || valor < 0 || valor > 100) {
      setErrorGuardado('La comision debe estar entre 0% y 100%')
      return
    }

    setGuardando(true)
    setMensaje(null)
    setErrorGuardado(null)
    try {
      await actualizarComision(valor)
      setMensaje('Comision guardada correctamente')
    } catch (err) {
      setErrorGuardado(err instanceof Error ? err.message : 'No se pudo guardar la comision')
    } finally {
      setGuardando(false)
    }
  }

  async function guardarDias(event: FormEvent) {
    event.preventDefault()
    const valor = Number(diasAlerta)
    if (!Number.isInteger(valor) || valor < 1) {
      setErrorDias('El umbral debe ser al menos 1 dia')
      return
    }

    setGuardandoDias(true)
    setMensajeDias(null)
    setErrorDias(null)
    try {
      await actualizarDiasAlerta(valor)
      setMensajeDias('Umbral de alerta guardado correctamente')
    } catch (err) {
      setErrorDias(err instanceof Error ? err.message : 'No se pudo guardar el umbral')
    } finally {
      setGuardandoDias(false)
    }
  }

  async function guardarTipoCambio(event: FormEvent) {
    event.preventDefault()
    const valor = Number(tipoCambio)
    if (!Number.isFinite(valor) || valor <= 0) {
      setErrorTC('El tipo de cambio debe ser mayor a 0')
      return
    }

    setGuardandoTC(true)
    setMensajeTC(null)
    setErrorTC(null)
    try {
      await actualizarTipoCambio(valor)
      setMensajeTC('Tipo de cambio guardado correctamente')
    } catch (err) {
      setErrorTC(err instanceof Error ? err.message : 'No se pudo guardar el tipo de cambio')
    } finally {
      setGuardandoTC(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Configuración</h1>
        <p className="mt-1 text-sm text-gray-500">Comisión y parámetros generales de importación</p>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Comisión por defecto</h2>
            <p className="mt-1 text-sm text-gray-500">Se aplica al crear nuevas cotizaciones sin una comisión personalizada.</p>
          </div>

          {loading ? (
            <p className="px-6 py-8 text-sm text-gray-400">Cargando configuración...</p>
          ) : (
            <form onSubmit={guardarComision} className="space-y-4 p-6">
              {(error || errorGuardado) && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorGuardado ?? error}</p>
              )}
              {mensaje && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{mensaje}</p>}
              <Input
                label="Porcentaje de comisión"
                type="number"
                min="0"
                max="100"
                step="0.01"
                required
                value={comision}
                onChange={(event) => setComision(event.target.value)}
                disabled={!config}
              />
              <div className="flex justify-end">
                <Button type="submit" loading={guardando} disabled={!config}>Guardar comisión</Button>
              </div>
            </form>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Tipo de cambio</h2>
            <p className="mt-1 text-sm text-gray-500">Valor de 1 USD en moneda local. Se usa como valor por defecto en nuevas cotizaciones.</p>
          </div>

          {loading ? (
            <p className="px-6 py-8 text-sm text-gray-400">Cargando configuración...</p>
          ) : (
            <form onSubmit={guardarTipoCambio} className="space-y-4 p-6">
              {errorTC && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorTC}</p>
              )}
              {mensajeTC && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{mensajeTC}</p>}
              <Input
                label="1 USD ="
                type="number"
                min="0.01"
                step="0.01"
                required
                value={tipoCambio}
                onChange={(event) => setTipoCambio(event.target.value)}
                disabled={!config}
              />
              {config && (
                <p className="text-xs text-gray-400">
                  Ultima actualizacion: {new Date(config.updated_at).toLocaleString('es-AR')}
                </p>
              )}
              <div className="flex justify-end">
                <Button type="submit" loading={guardandoTC} disabled={!config}>Guardar tipo de cambio</Button>
              </div>
            </form>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Alertas de pedidos estancados</h2>
            <p className="mt-1 text-sm text-gray-500">Pedidos que no cambian de estado en este periodo se muestran como alerta.</p>
          </div>

          {loading ? (
            <p className="px-6 py-8 text-sm text-gray-400">Cargando configuración...</p>
          ) : (
            <form onSubmit={guardarDias} className="space-y-4 p-6">
              {errorDias && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorDias}</p>
              )}
              {mensajeDias && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{mensajeDias}</p>}
              <Input
                label="Días sin cambio de estado"
                type="number"
                min="1"
                step="1"
                required
                value={diasAlerta}
                onChange={(event) => setDiasAlerta(event.target.value)}
                disabled={!config}
              />
              <div className="flex justify-end">
                <Button type="submit" loading={guardandoDias} disabled={!config}>Guardar umbral</Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
