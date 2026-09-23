import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/img/logo.png";
import { useAuth } from "../context/AuthContext";
import useCerrarSesion from "../hooks/useCerrarSesion";

const CLAVE_TEMA = "kronos-theme";

/**
 * Barra superior compartida del panel del jefe.
 *
 * Migrado desde Actualizacion/Maquetacion/partials/panel-shell.html
 * (header) + js/tema-global.js (selector de tema claro/oscuro) +
 * el listener de "Cerrar sesión" que antes vivía en js/panel-shell.js.
 */
function Navbar({ nombreUsuario }) {
  const { usuario, perfil } = useAuth();
  const cerrarSesion = useCerrarSesion();
  const nombreMostrado = nombreUsuario || perfil?.nombre || usuario?.email || "Administrador";
  const [tema, setTema] = useState(
    () => localStorage.getItem(CLAVE_TEMA) || "dark"
  );

  // Aplica el tema al <html> cada vez que cambia, igual que hacía
  // el script inline de <head> + tema-global.js en el HTML original.
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
        <span className="d-none d-md-inline text-white fw-bold">{nombreMostrado}</span>
      </div>

      <Link to="/jefe/panel">
        <img src={logo} alt="Logo Kronos" className="logo-header" />
      </Link>

      <button
        className="btn-theme-toggle"
        id="btnToggleTheme"
        type="button"
        title="Cambiar Tema"
        onClick={alternarTema}
      >
        <i className={`bi ${tema === "dark" ? "bi-sun-fill" : "bi-moon-fill"}`} id="iconTheme"></i>
      </button>

      <div className="cerrarSesion">
        <button type="button" id="btnSalir" title="Cerrar Sesión" onClick={cerrarSesion}>
          <i className="bi bi-box-arrow-right"></i>
        </button>
      </div>
    </header>
  );
}

export default Navbar;
