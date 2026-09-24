-- ============================================================
-- SALIDA AUTOMÁTICA AL CONFIRMAR LA COMPRA DEL CLIENTE
-- Correr completo en Supabase > SQL Editor (se puede repetir sin problema).
--
-- Qué hace:
--   Cuando el cliente pulsa "Confirmar compra", M_index.jsx inserta
--   filas en `ordenes_compra`. Este trigger reacciona a ese insert y,
--   en la misma transacción:
--     1) descuenta el stock en `productos`
--     2) registra la fila tipo 'salida' en `movimientos`
--   La fila de `movimientos` es la que el jefe ve en tiempo real en
--   Panel de Control > Historial de Movimientos.
--
-- Por qué en la base de datos y no en el JS del cliente:
--   las políticas RLS de `productos` y `movimientos` solo dejan
--   escribir a jefe/administrador, así que desde la sesión del cliente
--   esa escritura fallaría. La función es SECURITY DEFINER: se ejecuta
--   con permisos del dueño y salta esa restricción de forma controlada.
-- ============================================================

-- 1) Compra confirmada -> salida + descuento de stock
create or replace function public.registrar_salida_pedido_cliente()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prod productos%rowtype;
begin
  -- Solo pedidos hechos por clientes (las órdenes internas a
  -- proveedores no son salidas).
  if new.origen is distinct from 'cliente' then
    return new;
  end if;

  -- Busca el producto por nombre y lo bloquea para que dos compras
  -- simultáneas no descuenten sobre el mismo stock viejo.
  select * into v_prod
  from productos
  where lower(trim(nombre)) = lower(trim(new.producto_nombre))
  limit 1
  for update;

  if found then
    if v_prod.stock_actual < new.cantidad then
      -- Se cancela TODA la compra y el mensaje le llega al cliente
      -- en el Swal "No se pudo confirmar la compra".
      raise exception 'Stock insuficiente de "%": solo hay % disponible(s).',
        v_prod.nombre, v_prod.stock_actual;
    end if;

    update productos
       set stock_actual = stock_actual - new.cantidad
     where id = v_prod.id;
  end if;

  -- Si el nombre no existe en `productos`, la salida igual queda
  -- registrada (producto_id null) pero no hay stock que descontar.
  insert into movimientos (producto_id, tipo, cantidad, motivo, responsable)
  values (
    v_prod.id,
    'salida',
    new.cantidad,
    'Venta en línea · Pedido ' || new.codigo || ' · ' || new.producto_nombre,
    'Cliente: ' || coalesce(new.cliente_nombre, 'sin nombre')
  );

  return new;
end;
$$;

drop trigger if exists trg_salida_pedido_cliente on ordenes_compra;
create trigger trg_salida_pedido_cliente
  after insert on ordenes_compra
  for each row
  execute function public.registrar_salida_pedido_cliente();


-- 2) Si el jefe RECHAZA el pedido -> devuelve el stock (entrada)
--    Como ahora el stock se descuenta al comprar, un pedido rechazado
--    no puede quedarse con el material descontado.
create or replace function public.revertir_salida_pedido_rechazado()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prod productos%rowtype;
begin
  if new.origen = 'cliente'
     and new.estado = 'rechazada'
     and old.estado is distinct from 'rechazada' then

    select * into v_prod
    from productos
    where lower(trim(nombre)) = lower(trim(new.producto_nombre))
    limit 1
    for update;

    if found then
      update productos
         set stock_actual = stock_actual + new.cantidad
       where id = v_prod.id;
    end if;

    insert into movimientos (producto_id, tipo, cantidad, motivo, responsable)
    values (
      v_prod.id,
      'entrada',
      new.cantidad,
      'Pedido rechazado · devolución de stock · ' || new.codigo,
      'Sistema'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_revertir_salida_rechazo on ordenes_compra;
create trigger trg_revertir_salida_rechazo
  after update of estado on ordenes_compra
  for each row
  execute function public.revertir_salida_pedido_rechazado();
