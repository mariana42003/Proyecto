import { useEffect, useState } from "react";
import logo from "../assets/img/logo.png";
import { useAuth } from "../context/AuthContext";
import useCerrarSesion from "../hooks/useCerrarSesion";

const CLAVE_TEMA = "kronos-theme";

/**
 * Barra superior del portal de proveedor.
 *
 * A diferencia de la maqueta original (que recibía `usuario` fijo por
 * prop y hacía `window.location.href = '/login'` a mano), aquí usa
 * AuthContext real: nombre del perfil logueado y el hook
 * `useCerrarSesion()` (mismo que Navbar.jsx en el panel del jefe), que
 * al salir deja a la persona en la página principal ("/").
 */
export default function Proveedorheader() {
  const { usuario, perfil } = useAuth();
  const handleLogout = useCerrarSesion();
  const nombreMostrado = perfil?.nombre || usuario?.email || "Proveedor";

  const [tema, setTema] = useState(() => localStorage.getItem(CLAVE_TEMA) || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", tema);
    localStorage.setItem(CLAVE_TEMA, tema);
  }, [tema]);

  const alternarTema = () => {
    setTema((actual) => (actual === "dark" ? "light" : "dark"));
  };

  return (
    <header>
      <div className="nombreUsuario">
        <i className="bi bi-person-circle"></i>
        <span>{nombreMostrado}</span>
      </div>

      <div className="d-flex align-items-center gap-2">
        <img src={logo} alt="Kronos Inventory Control" className="logo-header" />
        <button
          type="button"
          className="btn-theme-toggle ms-2"
          onClick={alternarTema}
          title="Cambiar tema claro/oscuro"
        >
          <i className={`bi ${tema === "dark" ? "bi-sun-fill" : "bi-moon-fill"}`}></i>
        </button>
      </div>

      <div className="cerrarSesion">
        <a href="#logout" title="Cerrar sesión" onClick={handleLogout} id="btnSalir">
          <i className="bi bi-box-arrow-right"></i>
        </a>
      </div>
    </header>
  );
}
