import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Proveedorheader from "./Proveedorheader";
import Proveedorsidebar from "./Proveedorsidebar";
import MenuToggle from "./MenuToggle";
import "../assets/css/A_panel-proveedor.css";

/**
 * Shell del portal de proveedor
 */
export default function ProveedorLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { pathname } = useLocation();

  // Al navegar a otra página del panel, el menú móvil se cierra solo.
  useEffect(() => {
    setMenuAbierto(false);
  }, [pathname]);

  // Si la ventana vuelve a ser grande, se deja el menú cerrado
  // para que no quede "abierto" al volver a achicarla.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 769px)");
    const alCambiar = (e) => {
      if (e.matches) setMenuAbierto(false);
    };
    mq.addEventListener("change", alCambiar);
    return () => mq.removeEventListener("change", alCambiar);
  }, []);

  return (
    <div className="proveedor-scope">
      {/* Tiene que ir ANTES y AFUERA de .contenedor: el CSS usa
          "#menu:checked ~ .contenedor aside" (hermano anterior). */}
      <MenuToggle abierto={menuAbierto} onCambiar={setMenuAbierto} />

      <Proveedorheader />

      <div className="contenedor">
        <Proveedorsidebar />

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
