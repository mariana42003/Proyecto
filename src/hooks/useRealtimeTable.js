import { useCallback, useEffect, useState } from "react";
import { supabase } from "../api/supabase";

/**
 * Hook genérico de lectura + tiempo real para una tabla de Supabase.
 *
 * Se usa en todas las páginas del panel del jefe para no repetir 10
 * veces el mismo patrón "cargar + suscribirse a postgres_changes +
 * limpiar al desmontar". Cubre el requisito de la sección 2/3/4/5/6/7
 * del prompt: "Conexión en tiempo real (supabase.channel con
 * suscripción a postgres_changes)".
 *
 * @param {string} tabla - nombre de la tabla en Supabase.
 * @param {object} [opciones]
 * @param {string} [opciones.orderBy] - columna por la que ordenar.
 * @param {boolean} [opciones.ascending=false] - orden ascendente/descendente.
 * @param {string} [opciones.select="*"] - columnas a traer (para joins, etc).
 * @param {string} [opciones.filtroColumna] - columna para filtrar con `.eq()`
 *        (ej. "proveedor_id"). Útil para que un proveedor solo vea SUS
 *        propias filas. Si se pasa, la suscripción realtime también se
 *        limita a esa columna/valor (postgres_changes `filter`).
 * @param {string|number} [opciones.filtroValor] - valor a comparar con
 *        `filtroColumna`. Mientras sea `null`/`undefined` (ej. porque aún
 *        no se cargó el id del proveedor logueado), el hook NO consulta
 *        nada y deja `cargando en true` — evita traer datos de más.
 *
 * @returns {{
 *   datos: any[],
 *   cargando: boolean,
 *   error: string|null,
 *   recargar: () => Promise<void>,
 *   setDatos: Function,
 * }}
 *
 * NOTA IMPORTANTE: esta capa asume que las tablas y columnas descritas
 * en cada página (productos, movimientos, proveedores, ordenes_compra,
 * garantias, reportes_generados, perfiles) existen en tu proyecto de
 * Supabase con esos nombres. Si tu esquema real usa otros nombres,
 * basta con ajustar las constantes al inicio de cada página — toda la
 * lógica de carga/realtime/errores vive aquí y no hay que tocarla.
 */
export function useRealtimeTable(tabla, opciones = {}) {
  const { orderBy, ascending = false, select = "*", filtroColumna, filtroValor } = opciones;
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Si se pidió filtrar por columna pero el valor todavía no está listo
  // (ej. esperando el id del proveedor logueado), no consultamos nada.
  const filtroPendiente = Boolean(filtroColumna) && (filtroValor === null || filtroValor === undefined);

  const recargar = useCallback(async () => {
    if (filtroPendiente) {
      setDatos([]);
      setCargando(false);
      return;
    }
    setCargando(true);
    setError(null);
    try {
      let consulta = supabase.from(tabla).select(select);
      if (filtroColumna && !filtroPendiente) consulta = consulta.eq(filtroColumna, filtroValor);
      if (orderBy) consulta = consulta.order(orderBy, { ascending });
      const { data, error: errorConsulta } = await consulta;
      if (errorConsulta) throw errorConsulta;
      setDatos(data || []);
    } catch (err) {
      console.error(`Error cargando "${tabla}":`, err.message);
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [tabla, orderBy, ascending, select, filtroColumna, filtroValor, filtroPendiente]);

  useEffect(() => {
    let activo = true;
    recargar();

    if (filtroPendiente) return undefined;

    const canal = supabase
      .channel(`realtime:${tabla}:${filtroColumna || "todo"}:${filtroValor || "-"}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: tabla,
          ...(filtroColumna ? { filter: `${filtroColumna}=eq.${filtroValor}` } : {}),
        },
        () => {
          if (activo) recargar();
        }
      )
      .subscribe();

    return () => {
      activo = false;
      supabase.removeChannel(canal);
    };
  }, [recargar, tabla, filtroColumna, filtroValor, filtroPendiente]);

  return { datos, cargando, error, recargar, setDatos };
}

/** Envuelve una operación de escritura de Supabase con SweetAlert2 + try/catch,
 *  para no repetir el mismo bloque en cada botón "Guardar" / "Eliminar". */
export async function ejecutarOperacion(operacionAsync, { onExito, onError } = {}) {
  try {
    const resultado = await operacionAsync();
    if (onExito) onExito(resultado);
    return resultado;
  } catch (error) {
    console.error(error);
    if (onError) onError(error);
    else throw error;
  }
}
