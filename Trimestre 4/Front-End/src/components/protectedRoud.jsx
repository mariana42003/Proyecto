import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Punto único de protección de rutas privadas.
 */
function ProtectedRoute({ allowedRoles }) {
  const { usuario, rol, cargandoSesion } = useAuth();

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
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(rol)) {
    const destinoPorRol = rol === "jefe" || rol === "administrador"
      ? "/jefe/panel"
      : rol === "cliente"
        ? "/cliente/pedidos"
        : rol === "proveedor"
          ? "/proveedor"
          : "/";
    return <Navigate to={destinoPorRol} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
