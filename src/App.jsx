import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/protectedRoud";
import JefeLayout from "./components/JefeLayout";
import ProveedorLayout from "./components/ProveedorLayout";

// Landing / autenticación
import M_index from "./pages/clients/M_index";
import Login from "./pages/auth/login";
import Registrarse from "./pages/auth/Registrarse";
import OlvidoContra from "./pages/auth/OlvidoContra";
import RestablecimientoContra from "./pages/auth/RestablecimientoContra";
import ModificarCorreo from "./pages/auth/ModificarCorreo";
import CambiarContra from "./pages/auth/CambiarContra";

// Portal del cliente
import M_pedidos from "./pages/clients/M_pedidos";
import D_garantiasCliente from "./pages/clients/D_garantiasCliente";

// Panel del jefe
import E_panel from "./pages/jefe/E_panel";
import S_stock from "./pages/jefe/S_stock";
import S_reportes from "./pages/jefe/S_reportes";
import M_entrada from "./pages/jefe/M_entrada";
import M_salida from "./pages/jefe/M_salida";
import A_registrarProveedor from "./pages/jefe/A_registrarProveedor";
import A_historial from "./pages/jefe/A_historial";
import A_materialCantidad from "./pages/jefe/A_materialCantidad";
import D_solicitudGarantias from "./pages/jefe/D_solicitudGarantias";
import D_historialGarantias from "./pages/jefe/D_historial-garantias";

// Portal del proveedor
import A_principalProveedor from "./pages/proveedor/A_principalProveedor";
import A_orden from "./pages/proveedor/A_orden";
import D_garantiasProveedor from "./pages/proveedor/D_garantiasProveedor";

/**
 * Rutas de la aplicación.
 *
 * - "/" es el índice/landing público (tienda + login/registro en modal),
 *   migrado tal cual desde el proyecto de referencia.
 * - "/login" y "/registro" son la versión de página completa de esos
 *   mismos formularios (solo para enlaces directos). ProtectedRoute ya
 *   NO redirige aquí: al cerrar sesión (jefe, proveedor o cliente) o
 *   entrar sin sesión a una ruta privada, siempre se va a "/" (M_index).
 * - "/cliente/*" es el portal del cliente (pedidos y garantías),
 *   protegido para el rol "cliente".
 * - "/jefe/*" es el panel administrativo, protegido para los roles
 *   "jefe" y "administrador".
 *
 * - "/proveedor/*" es el portal del proveedor (panel, órdenes de
 *   compra y garantías), protegido para el rol "proveedor".
 *
 * El rol "empleado" todavía no tiene una vista propia (no formaba
 * parte de ninguno de los dos proyectos fuente); por ahora, si un
 * usuario con ese rol inicia sesión, ProtectedRoute lo deja en "/".
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<M_index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registrarse />} />
      <Route path="/recuperar-contrasena" element={<OlvidoContra />} />
      <Route path="/restablecimiento-contrasena" element={<RestablecimientoContra />} />
      <Route path="/modificar-correo" element={<ModificarCorreo />} />
      <Route path="/cambiar-contrasena" element={<CambiarContra />} />

      <Route element={<ProtectedRoute allowedRoles={["cliente"]} />}>
        <Route path="/cliente/pedidos" element={<M_pedidos />} />
        <Route path="/cliente/garantias" element={<D_garantiasCliente />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["proveedor"]} />}>
        <Route path="/proveedor" element={<ProveedorLayout />}>
          <Route index element={<A_principalProveedor />} />
          <Route path="ordenes" element={<A_orden />} />
          <Route path="garantias" element={<D_garantiasProveedor />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["jefe", "administrador"]} />}>
        <Route path="/jefe" element={<JefeLayout />}>
          <Route index element={<Navigate to="panel" replace />} />
          <Route path="panel" element={<E_panel />} />
          <Route path="stock" element={<S_stock />} />
          <Route path="reportes" element={<S_reportes />} />
          <Route path="entradas" element={<M_entrada />} />
          <Route path="salidas" element={<M_salida />} />
          <Route path="proveedores/registrar" element={<A_registrarProveedor />} />
          <Route path="ordenes/historial" element={<A_historial />} />
          <Route path="ordenes/materiales" element={<A_materialCantidad />} />
          <Route path="garantias/solicitudes" element={<D_solicitudGarantias />} />
          <Route path="garantias/historial" element={<D_historialGarantias />} />
        </Route>
      </Route>

      {/* Cualquier otra ruta no reconocida vuelve al índice. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
