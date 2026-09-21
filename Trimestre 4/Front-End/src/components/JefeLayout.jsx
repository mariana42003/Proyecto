import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./sidebar";
import "../assets/css/panel-base.css";
import "../assets/css/kronos-global.css";

/**
 * Shell compartido de todas las páginas del panel del jefe.
 *
 * Equivale a Actualizacion/Maquetacion/partials/panel-shell.html +
 * js/panel-shell.js: antes cada página hacía fetch() del HTML del
 * header/aside y lo inyectaba a mano en #kronos-shell-top /
 * #kronos-shell-panel. En React esto es, simplemente, un layout de
 * React Router: <Navbar/> y <Sidebar/> se montan una sola vez y el
 * contenido propio de cada página se renderiza en <Outlet/> (equivalente
 * al antiguo <main>...</main> de cada archivo .html).
 */
function JefeLayout() {
  return (
    <div className="contenedor">
      <Navbar />
      <Sidebar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default JefeLayout;
