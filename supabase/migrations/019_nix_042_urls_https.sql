-- NIX-042: solo URLs https en columnas de enlaces.
-- NOT VALID aplica la regla a filas nuevas y editadas sin fallar por datos historicos.
alter table pedidos drop constraint if exists pedidos_producto_url_https;
alter table pedidos add constraint pedidos_producto_url_https
  check (producto_url is null or producto_url ~* '^https://') not valid;

alter table pedidos drop constraint if exists pedidos_link_compra_https;
alter table pedidos add constraint pedidos_link_compra_https
  check (link_compra is null or link_compra ~* '^https://') not valid;

alter table pedidos drop constraint if exists pedidos_url_tracking_https;
alter table pedidos add constraint pedidos_url_tracking_https
  check (url_tracking is null or url_tracking ~* '^https://') not valid;

alter table perfumes drop constraint if exists perfumes_imagen_url_https;
alter table perfumes add constraint perfumes_imagen_url_https
  check (imagen_url is null or imagen_url ~* '^https://') not valid;
