import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Proveedorheader from "./Proveedorheader";
import Proveedorsidebar from "./Proveedorsidebar";
import MenuToggle from "./MenuToggle";
import "../assets/css/A_panel-proveedor.css";

/**
 * Shell del portal de proveedor ("/proveedor/*").
 *
 * Migrado desde el proyecto "pro-kronos-Proveedores vista"
 * (ProveedorLayout.jsx), con dos diferencias:
 *
 *   1. Todo queda envuelto en un <div className="proveedor-scope">:
 *      el CSS de este portal (A_panel-proveedor.css) fue reescrito
 *      para vivir bajo ese selector, así sus reglas (antes globales:
 *      body, html, *, header, aside, .table...) no chocan con el CSS
 *      del panel del jefe/cliente que corre en el mismo bundle.
 *   2. Proveedorheader ya no recibe un nombre fijo: usa AuthContext
 *      (perfil.nombre) igual que Navbar.jsx en el panel del jefe.
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
