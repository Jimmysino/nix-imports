-- NIX-035: KPIs configurables en dashboard
alter table configuracion
  add column kpis_dashboard text[] default array['pedidos_activos', 'comisiones_mes', 'ventas_perfumes_mes', 'ingresos_totales'];
