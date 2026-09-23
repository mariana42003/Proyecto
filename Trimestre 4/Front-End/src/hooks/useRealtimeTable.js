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
  const { orderBy, ascending = false, select = "*" } = opciones;
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      let consulta = supabase.from(tabla).select(select);
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
  }, [tabla, orderBy, ascending, select]);

  useEffect(() => {
    let activo = true;
    recargar();

    const canal = supabase
      .channel(`realtime:${tabla}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: tabla },
        () => {
          if (activo) recargar();
        }
      )
      .subscribe();

    return () => {
      activo = false;
      supabase.removeChannel(canal);
    };
  }, [recargar, tabla]);

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
