import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Punto único de protección de rutas privadas.
 *
 * Ahora sí valida sesión real de Supabase (vía AuthContext):
 *   1. Mientras se resuelve la sesión inicial -> pantalla de carga breve.
 *   2. Sin sesión -> redirige a /login, recordando a dónde quería ir.
 *   3. Con `allowedRoles`, si el rol del perfil no está en la lista ->
 *      redirige a la home de su propio rol (o a "/" si no se reconoce).
 *   4. Todo correcto -> renderiza la ruta hija (<Outlet/>).
 *
 * `allowedRoles` es opcional: si no se pasa, solo exige estar logueado.
 */
function ProtectedRoute({ allowedRoles }) {
  const { usuario, rol, cargandoSesion } = useAuth();
  const location = useLocation();

  if (cargandoSesion) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Cargando…</span>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(rol)) {
    const destinoPorRol = rol === "jefe" || rol === "administrador"
      ? "/jefe/panel"
      : rol === "cliente"
        ? "/cliente/pedidos"
        : "/";
    return <Navigate to={destinoPorRol} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
