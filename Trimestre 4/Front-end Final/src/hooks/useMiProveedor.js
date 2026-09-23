import { useEffect, useState } from "react";
import { supabase } from "../api/supabase";
import { useAuth } from "../context/AuthContext";

/**
 * Portal del proveedor · resuelve la fila de `proveedores` que
 * corresponde al usuario logueado.
 *
 * La tabla `proveedores` ya existía (la usa el jefe en
 * A_registrarProveedor.jsx) con su propio `id` (uuid), que NO es el
 * mismo `id` que Supabase Auth le da a la cuenta del proveedor. Para
 * poder decir "estas órdenes son MÍAS" se necesita un puente entre
 * ambos ids: la columna `proveedores.perfil_id` (uuid, referencia a
 * `perfiles.id` / `auth.users.id`), agregada en la migración al final
 * de ESQUEMA_SUPABASE.sql.
 *
 * Uso típico en una página del portal de proveedor:
 *   const { proveedor, cargando, error } = useMiProveedor();
 *   const { datos: misOrdenes } = useRealtimeTable("ordenes_compra", {
 *     filtroColumna: "proveedor_id",
 *     filtroValor: proveedor?.id,
 *   });
 *
 * Si el usuario tiene rol "proveedor" pero su cuenta todavía no fue
 * vinculada (nadie llenó `proveedores.perfil_id` con su id), `proveedor`
 * queda en `null` y `error` explica qué falta — para que no se vea como
 * una pantalla vacía sin explicación.
 */
export function useMiProveedor() {
  const { usuario } = useAuth();
  const [proveedor, setProveedor] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      if (!usuario) {
        setProveedor(null);
        setCargando(false);
        return;
      }
      setCargando(true);
      setError(null);
      try {
        const { data, error: errorConsulta } = await supabase
          .from("proveedores")
          .select("*")
          .eq("perfil_id", usuario.id)
          .maybeSingle();
        if (errorConsulta) throw errorConsulta;
        if (!activo) return;
        if (!data) {
          setProveedor(null);
          setError(
            "Tu cuenta todavía no está vinculada a una ficha de proveedor. Pide al administrador que asocie tu usuario en el panel de Proveedores."
          );
        } else {
          setProveedor(data);
        }
      } catch (err) {
        if (!activo) return;
        console.error("No se pudo cargar la ficha de proveedor:", err.message);
        setError(err.message);
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargar();
    return () => {
      activo = false;
    };
  }, [usuario]);

  return { proveedor, cargando, error };
}
