import { useMemo } from "react";
import { useRealtimeTable } from "./useRealtimeTable";

/**
 * Hook ÚNICO para leer las categorías desde Supabase (tabla `categorias`).
 * Úsalo en TODAS las pantallas (Stock, Entradas, Salidas, etc.) para que
 * cualquier categoría creada o eliminada aparezca al instante en todas.
 *
 * Uso:
 *   const { categorias, cargando } = useCategorias();
 *   categorias -> [{ id, nombre, descripcion, icono }, ...]
 *
 * Ubicación sugerida: src/hooks/useCategorias.js
 */
const SIN_CATEGORIA = "Sin categoría";

export function useCategorias() {
  const { datos, cargando, error } = useRealtimeTable("categorias", {
    orderBy: "nombre",
    ascending: true,
  });

  // "Sin categoría" es automática: no se ofrece como opción al registrar
  const categorias = useMemo(
    () => datos.filter((c) => c.nombre && c.nombre !== SIN_CATEGORIA),
    [datos]
  );

  return { categorias, cargando, error };
}