import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./sidebar";
import "../assets/css/panel-base.css";
import "../assets/css/kronos-global.css";

/**
 * Shell compartido de todas las páginas del panel del jefe.
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
