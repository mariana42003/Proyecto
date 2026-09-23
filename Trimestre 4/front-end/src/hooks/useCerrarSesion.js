import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";

/**
 * Único flujo de "Cerrar sesión" de toda la app (jefe, proveedor y
 * cliente). Pide confirmación, cierra la sesión en Supabase y deja al
 * usuario SIEMPRE en la página principal ("/" → M_index.jsx).
 *
 * Antes cada header tenía su propia copia de este código y, al cerrar
 * la sesión, ProtectedRoute mandaba a la persona a "/login" antes de
 * que llegara el navigate("/"). Ahora ProtectedRoute también redirige
 * a "/", y todos los botones de salir usan este mismo hook.
 *
 * Uso:  const cerrarSesion = useCerrarSesion();
 *       <button onClick={cerrarSesion}>Salir</button>
 */
export default function useCerrarSesion() {
  const navigate = useNavigate();
  const { cerrarSesion } = useAuth();

  return (evento) => {
    evento?.preventDefault?.();

    Swal.fire({
      title: "¿Cerrar sesión?",
      text: "¿Estás seguro de que deseas salir?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E8600C",
      cancelButtonColor: "#6C7278",
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
    }).then(async (resultado) => {
      if (!resultado.isConfirmed) return;

      try {
        await cerrarSesion();
      } catch (error) {
        console.error("Error cerrando sesión:", error.message);
      }

      navigate("/", { replace: true });
    });
  };
}
