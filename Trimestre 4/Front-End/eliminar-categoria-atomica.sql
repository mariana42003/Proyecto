-- ============================================================
-- ELIMINAR CATEGORÍA DE FORMA ATÓMICA
-- Correr completo en Supabase > SQL Editor (se puede repetir sin problema).
--
-- Qué hace:
--   S_stock.jsx llama a esta función al eliminar una categoría. En UNA
--   sola transacción:
--     1) pasa los productos indicados a la categoría "Sin categoría"
--     2) borra la fila de la tabla `categorias`
--   Si cualquiera de los dos pasos falla, PostgreSQL deshace todo: ya no
--   pueden quedar productos reasignados con la categoría sin borrar.
--
-- Seguridad:
--   La función NO es SECURITY DEFINER: se ejecuta con los permisos de
--   quien la llama, así que siguen aplicando las políticas RLS (solo
--   jefe/administrador pueden modificar `productos` y `categorias`).
--
-- Requiere que la tabla `categorias` ya exista.
--
-- Parámetros:
--   p_categoria_id : id de la fila en `categorias` (como texto, sirve para
--                    uuid o bigint). NULL si la categoría solo existía en
--                    los productos y no tiene fila propia.
--   p_producto_ids : ids de los productos que pasan a "Sin categoría".
-- Devuelve: cuántos productos se reasignaron.
-- ============================================================
create or replace function public.eliminar_categoria(
  p_categoria_id text,
  p_producto_ids uuid[]
)
returns integer
language plpgsql
as $$
declare
  v_reasignados integer := 0;
  v_borradas    integer := 0;
begin
  -- 1) Productos -> "Sin categoría"
  if coalesce(array_length(p_producto_ids, 1), 0) > 0 then
    update productos
       set categoria = 'Sin categoría'
     where id = any(p_producto_ids);
    get diagnostics v_reasignados = row_count;
  end if;

  -- 2) Se borra la categoría (si tiene fila propia)
  if p_categoria_id is not null then
    delete from categorias
     where id::text = p_categoria_id;
    get diagnostics v_borradas = row_count;

    if v_borradas = 0 then
      -- Al lanzar la excepción se deshace también el paso 1
      raise exception 'No se eliminó la categoría: no existe o falta la política RLS de DELETE en categorias.';
    end if;
  end if;

  return v_reasignados;
end;
$$;

grant execute on function public.eliminar_categoria(text, uuid[]) to authenticated;
