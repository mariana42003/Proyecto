import { NavLink } from "react-router-dom";

export default function Proveedorsidebar() {
  return (
    <aside>
      <div className="opciones">
        <NavLink
          to="/proveedor"
          end
          className={({ isActive }) => `opcion-nav ${isActive ? "activo selected" : ""}`}
        >
          <i className="bi bi-speedometer2"></i>
          <span>Panel de control</span>
        </NavLink>

        <NavLink
          to="/proveedor/ordenes"
          className={({ isActive }) => `opcion-nav ${isActive ? "activo selected" : ""}`}
        >
          <i className="bi bi-file-earmark-text-fill"></i>
          <span>Órdenes de compra</span>
        </NavLink>

        <NavLink
          to="/proveedor/garantias"
          className={({ isActive }) => `opcion-nav ${isActive ? "activo selected" : ""}`}
        >
          <i className="bi bi-shield-fill-check"></i>
          <span>Garantías</span>
        </NavLink>
      </div>
    </aside>
  );
}
