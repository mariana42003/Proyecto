-- ============================================================
-- KRONOS INVENTORY CONTROL — Esquema propuesto de Supabase
-- ============================================================
-- Este archivo NO se ejecutó contra tu proyecto de Supabase (este
-- entorno no tiene acceso a tu base de datos). Es la propuesta de
-- esquema que asume el código de src/pages/jefe/*.jsx, src/api/
-- supabase.js y src/context/AuthContext.jsx.
--
-- Cómo usarlo:
--   1. Si ya tienes tablas con estos propósitos pero otros nombres/
--      columnas, ajusta las referencias en el código (están todas
--      centralizadas: cada página usa useRealtimeTable("nombre_tabla")
--      y llama a supabase.from("nombre_tabla") en sus acciones).
--   2. Si no existen, puedes correr este script tal cual en el SQL
--      Editor de Supabase para levantar el esquema mínimo funcional.
--   3. Las políticas RLS de abajo son un PUNTO DE PARTIDA permisivo
--      para desarrollo, no una auditoría de seguridad. Antes de ir a
--      producción, revísalas con tu criterio (o el de tu equipo de
--      seguridad): en particular, "cliente" hoy podría leer pedidos
--      de otros clientes si no restringes por auth.uid().
-- ============================================================

-- ---------- PERFILES (rol de cada usuario) ----------
create table if not exists perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text,
  apellido text,
  telefono text,
  direccion text,
  localidad text,
  barrio text,
  rol text not null default 'cliente' check (rol in ('jefe','administrador','empleado','cliente')),
  creado_en timestamptz default now()
);

alter table perfiles enable row level security;
create policy "Perfiles: cada usuario ve y edita el suyo"
  on perfiles for select using (auth.uid() = id);
create policy "Perfiles: cada usuario inserta el suyo al registrarse"
  on perfiles for insert with check (auth.uid() = id);
create policy "Perfiles: cada usuario actualiza el suyo"
  on perfiles for update using (auth.uid() = id);

-- ---------- PRODUCTOS (inventario) ----------
create table if not exists productos (
  id uuid primary key default gen_random_uuid(),
  codigo text,
  nombre text not null,
  categoria text,
  stock_actual integer not null default 0,
  umbral_minimo integer not null default 5,
  ubicacion text,
  precio numeric,
  creado_en timestamptz default now()
);

alter table productos enable row level security;
create policy "Productos: lectura pública (catálogo)"
  on productos for select using (true);
create policy "Productos: solo jefe/administrador escribe"
  on productos for all using (
    exists (select 1 from perfiles where id = auth.uid() and rol in ('jefe','administrador'))
  );

-- ---------- MOVIMIENTOS (entradas/salidas) ----------
create table if not exists movimientos (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid references productos(id) on delete set null,
  tipo text not null check (tipo in ('entrada','salida')),
  cantidad integer not null,
  motivo text,
  responsable text,
  fecha timestamptz default now()
);

alter table movimientos enable row level security;
create policy "Movimientos: solo jefe/administrador"
  on movimientos for all using (
    exists (select 1 from perfiles where id = auth.uid() and rol in ('jefe','administrador'))
  );

-- ---------- PROVEEDORES ----------
create table if not exists proveedores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  nit text,
  telefono text,
  direccion text,
  correo text,
  tipo_producto text,
  activo boolean default true,
  creado_en timestamptz default now()
);

alter table proveedores enable row level security;
create policy "Proveedores: solo jefe/administrador"
  on proveedores for all using (
    exists (select 1 from perfiles where id = auth.uid() and rol in ('jefe','administrador'))
  );

-- ---------- REPORTES GENERADOS ----------
create table if not exists reportes_generados (
  id uuid primary key default gen_random_uuid(),
  tipo text not null,
  categoria text,
  cantidad integer,
  fecha timestamptz default now()
);

alter table reportes_generados enable row level security;
create policy "Reportes: solo jefe/administrador"
  on reportes_generados for all using (
    exists (select 1 from perfiles where id = auth.uid() and rol in ('jefe','administrador'))
  );

-- ---------- ÓRDENES DE COMPRA (internas + de clientes) ----------
create table if not exists ordenes_compra (
  id uuid primary key default gen_random_uuid(),
  codigo text not null,
  producto_id uuid references productos(id) on delete set null,
  producto_nombre text,
  cantidad integer not null,
  proveedor_id uuid references proveedores(id) on delete set null,
  proveedor_nombre text,
  cliente_id uuid references perfiles(id) on delete set null,
  cliente_nombre text,
  precio_unitario numeric,
  origen text not null default 'interno' check (origen in ('interno','cliente')),
  estado text not null default 'pendiente' check (estado in ('pendiente','confirmada','rechazada')),
  observacion text,
  fecha timestamptz default now()
);

alter table ordenes_compra enable row level security;
create policy "Ordenes: jefe/administrador ve y edita todo"
  on ordenes_compra for all using (
    exists (select 1 from perfiles where id = auth.uid() and rol in ('jefe','administrador'))
  );
create policy "Ordenes: el cliente ve y crea las suyas"
  on ordenes_compra for select using (cliente_id = auth.uid());
create policy "Ordenes: el cliente inserta las suyas"
  on ordenes_compra for insert with check (cliente_id = auth.uid() and origen = 'cliente');

-- ---------- GARANTÍAS ----------
create table if not exists garantias (
  id uuid primary key default gen_random_uuid(),
  orden_id uuid references ordenes_compra(id) on delete set null,
  numero_orden text,
  cliente_id uuid references perfiles(id) on delete set null,
  cliente_nombre text,
  producto text,
  motivo text,
  estado text not null default 'pendiente' check (estado in ('pendiente','en_revision','aprobada','rechazada')),
  observacion text,
  fecha timestamptz default now()
);

alter table garantias enable row level security;
create policy "Garantias: jefe/administrador ve y edita todo"
  on garantias for all using (
    exists (select 1 from perfiles where id = auth.uid() and rol in ('jefe','administrador'))
  );
create policy "Garantias: el cliente ve y crea las suyas"
  on garantias for select using (cliente_id = auth.uid());
create policy "Garantias: el cliente inserta las suyas"
  on garantias for insert with check (cliente_id = auth.uid());

-- ---------- Habilitar Realtime en las tablas que lo necesitan ----------
-- (Desde el Dashboard: Database > Replication > agrega estas tablas
-- a la publicación "supabase_realtime", o corre esto si tu plan lo permite)
-- alter publication supabase_realtime add table productos, movimientos,
--   proveedores, ordenes_compra, garantias, reportes_generados;

-- ============================================================
-- MIGRACIÓN · Portal de proveedor (rol "proveedor")
-- ============================================================
-- Agregado al conectar la vista de proveedor (src/pages/proveedor/*)
-- con Supabase. Corre este bloque completo en el SQL Editor de
-- Supabase (es idempotente: se puede correr más de una vez sin
-- romper nada).
--
-- Qué resuelve:
--   1. `perfiles.rol` no aceptaba el valor 'proveedor' -> se amplía
--      el check constraint.
--   2. No existía ninguna forma de saber "qué usuario de Auth
--      corresponde a qué fila de `proveedores`" -> se agrega
--      `proveedores.perfil_id`.
--   3. Ni `ordenes_compra` ni `garantias` tenían políticas RLS para
--      el rol proveedor -> se agregan, basadas en ese enlace.
--
-- Paso manual que SÍ debes hacer tú por cada proveedor que necesite
-- login (esto no se puede automatizar desde el cliente con la clave
-- anon, por seguridad):
--   a) Crear el usuario en Authentication > Users (o que se registre).
--   b) Insertar/editar su fila en `perfiles` con rol = 'proveedor'.
--   c) En la tabla `proveedores`, poner `perfil_id` = el id de ese
--      usuario en la fila del proveedor correspondiente.
-- ============================================================

-- 1) Permitir el rol 'proveedor' en perfiles.
alter table perfiles drop constraint if exists perfiles_rol_check;
alter table perfiles add constraint perfiles_rol_check
  check (rol in ('jefe','administrador','empleado','cliente','proveedor'));

-- 2) Enlace entre la cuenta de Auth del proveedor y su ficha en `proveedores`.
alter table proveedores add column if not exists perfil_id uuid references perfiles(id) on delete set null;

-- 3) El proveedor ve y actualiza su propia ficha (no las de los demás).
drop policy if exists "Proveedores: el proveedor ve su propia ficha" on proveedores;
create policy "Proveedores: el proveedor ve su propia ficha"
  on proveedores for select using (perfil_id = auth.uid());

drop policy if exists "Proveedores: el proveedor actualiza su propia ficha" on proveedores;
create policy "Proveedores: el proveedor actualiza su propia ficha"
  on proveedores for update using (perfil_id = auth.uid());

-- 4) El proveedor ve y actualiza (confirmar/rechazar) SUS órdenes.
drop policy if exists "Ordenes: el proveedor ve las suyas" on ordenes_compra;
create policy "Ordenes: el proveedor ve las suyas"
  on ordenes_compra for select using (
    proveedor_id in (select id from proveedores where perfil_id = auth.uid())
  );

drop policy if exists "Ordenes: el proveedor actualiza el estado de las suyas" on ordenes_compra;
create policy "Ordenes: el proveedor actualiza el estado de las suyas"
  on ordenes_compra for update using (
    proveedor_id in (select id from proveedores where perfil_id = auth.uid())
  );

-- 5) El proveedor ve y actualiza (aprobar/rechazar) las garantías que
--    corresponden a SUS órdenes (garantias.orden_id -> ordenes_compra).
drop policy if exists "Garantias: el proveedor ve las de sus ordenes" on garantias;
create policy "Garantias: el proveedor ve las de sus ordenes"
  on garantias for select using (
    orden_id in (
      select id from ordenes_compra
      where proveedor_id in (select id from proveedores where perfil_id = auth.uid())
    )
  );

drop policy if exists "Garantias: el proveedor actualiza el estado de las de sus ordenes" on garantias;
create policy "Garantias: el proveedor actualiza el estado de las de sus ordenes"
  on garantias for update using (
    orden_id in (
      select id from ordenes_compra
      where proveedor_id in (select id from proveedores where perfil_id = auth.uid())
    )
  );
