import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

/**
 * Menú lateral del panel del jefe.
 *
 * Migrado desde Actualizacion/Maquetacion/partials/panel-shell.html
 * (js/panel-shell.js se encargaba de inyectar este HTML y de abrir
 * el acordeón correcto vía data-page / ALIAS_ACTIVO).
 *
 * Aquí el acordeón y el botón de menú móvil ya no dependen de un
 * <input type="radio"/checkbox"> oculto ni de jQuery: se controlan
 * con useState + la ruta activa de React Router.
 */

const SECCIONES = [
  {
    id: "inventario",
    icono: "bi-box-seam",
    titulo: "Gestión Inventario",
    items: [
      { to: "/jefe/stock", icono: "bi-journal-text", label: "Stock" },
      { to: "/jefe/reportes", icono: "bi-pencil", label: "Reportes" },
    ],
  },
  {
    id: "movimientos",
    icono: "bi-cart",
    titulo: "Movimientos",
    items: [
      { to: "/jefe/entradas", icono: "bi-box-arrow-in-down", label: "Entradas" },
      { to: "/jefe/salidas", icono: "bi-box-arrow-up", label: "Salidas" },
    ],
  },
  {
    id: "proveedores",
    icono: "bi-people",
    titulo: "Proveedores",
    items: [
      { to: "/jefe/proveedores/registrar", icono: "bi-card-list", label: "Registrar Proveedor" },
    ],
  },
  {
    id: "ordenes",
    icono: "bi-file-earmark-arrow-down",
    titulo: "Órdenes de Compra",
    items: [
      { to: "/jefe/ordenes/historial", icono: "bi-journal-check", label: "Historial Compras" },
      { to: "/jefe/ordenes/materiales", icono: "bi-boxes", label: "Asociar Materiales" },
    ],
  },
  {
    id: "garantias",
    icono: "bi-shield-check",
    titulo: "Garantías",
    items: [
      { to: "/jefe/garantias/solicitudes", icono: "bi-pencil-square", label: "Solicitudes" },
      { to: "/jefe/garantias/historial", icono: "bi-clock-history", label: "Historial" },
    ],
  },
];

function Sidebar() {
  const location = useLocation();
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  // Sección del acordeón que corresponde a la ruta activa.
  const seccionActiva = useMemo(() => {
    const encontrada = SECCIONES.find((seccion) =>
      seccion.items.some((item) => location.pathname.startsWith(item.to))
    );
    return encontrada ? encontrada.id : null;
  }, [location.pathname]);

  const [seccionAbierta, setSeccionAbierta] = useState(seccionActiva);

  // Si la ruta cambia (navegación por link), abre automáticamente
  // el acordeón que contiene la página activa.
  useEffect(() => {
    if (seccionActiva) setSeccionAbierta(seccionActiva);
  }, [seccionActiva]);

  // Cierra el menú móvil cada vez que cambia de página.
  useEffect(() => {
    setMenuMovilAbierto(false);
  }, [location.pathname]);

  const alternarSeccion = (id) => {
    setSeccionAbierta((actual) => (actual === id ? null : id));
  };

  return (
    <>
      <button
        type="button"
        className="menus"
        aria-label="Abrir menú"
        onClick={() => setMenuMovilAbierto((abierto) => !abierto)}
      >
        <i className="bi bi-list"></i>
      </button>

      <aside className={menuMovilAbierto ? "sidebar-abierto" : ""}>
        <div className="opciones">
          {/* PANEL DE CONTROL */}
          <NavLink
            to="/jefe/panel"
            className={({ isActive }) => `opcion-nav${isActive ? " activo" : ""}`}
          >
            <i className="bi bi-eye"></i>
            <span>Panel de Control</span>
          </NavLink>

          {SECCIONES.map((seccion) => (
            <div
              key={seccion.id}
              className={`item-acordeon${seccionAbierta === seccion.id ? " abierto" : ""}`}
            >
              <button
                type="button"
                className="titulo-menu"
                onClick={() => alternarSeccion(seccion.id)}
                aria-expanded={seccionAbierta === seccion.id}
              >
                <i className={`bi ${seccion.icono}`}></i>
                <span>{seccion.titulo}</span>
                <i className="bi bi-chevron-down flecha-acordeon ms-auto"></i>
              </button>

              <div className="submenu">
                {seccion.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => (isActive ? "activo" : "")}
                  >
                    <i className={`bi ${item.icono}`}></i> {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
