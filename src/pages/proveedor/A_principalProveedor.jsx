import { Link } from "react-router-dom";
import { useMiProveedor } from "../../hooks/useMiProveedor";
import { useRealtimeTable } from "../../hooks/useRealtimeTable";

const BADGE_POR_ESTADO = {
  pendiente: "estado-pendiente",
  confirmada: "estado-enviado",
  rechazada: "estado-cancelado",
};

const ETIQUETA_ESTADO = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  rechazada: "Rechazada",
};

/**
 * Portal del proveedor · Panel de control.
 *
 * Antes tenía todo hardcodeado (nombre "John Doe", conteos fijos,
 * filas de ejemplo). Ahora:
 *   - El proveedor se identifica vía `useMiProveedor()` (busca en
 *     `proveedores` la fila con `perfil_id = auth.uid()`).
 *   - Las órdenes son las suyas: `ordenes_compra` filtrado por
 *     `proveedor_id`, en tiempo real (postgres_changes).
 */
export default function ProveedorDashboard() {
  const { proveedor, cargando: cargandoProveedor, error: errorProveedor } = useMiProveedor();

  const { datos: ordenes, cargando: cargandoOrdenes } = useRealtimeTable("ordenes_compra", {
    orderBy: "fecha",
    ascending: false,
    filtroColumna: "proveedor_id",
    filtroValor: proveedor?.id,
  });

  const confirmadas = ordenes.filter((o) => o.estado === "confirmada").length;
  const pendientes = ordenes.filter((o) => o.estado === "pendiente").length;
  const ultimasOrdenes = ordenes.slice(0, 5);

  return (
    <div>
      <section className="encabezado-pagina">
        <div className="icono-pagina">
          <i className="bi bi-speedometer2"></i>
        </div>
        <div className="texto-pagina">
          <h1>Panel de control</h1>
          <p>Resumen general de tu actividad como proveedor.</p>
        </div>
      </section>

      {errorProveedor && (
        <div className="alert alert-warning" role="alert">
          {errorProveedor}
        </div>
      )}

      <div className="row g-4 mb-4">
        <div className="col-lg-4">
          <div className="card card-resumen border-0 shadow-sm h-100">
            <div className="tarjetas card-body d-flex justify-content-between align-items-center">
              <div className="Usuario">
                <h6>Proveedor</h6>
                <h2 style={{ fontSize: "22px" }}>
                  {cargandoProveedor ? "Cargando…" : proveedor?.nombre || "Sin vincular"}
                </h2>
                <small className="text-muted">
                  {proveedor?.telefono ? `Tel: ${proveedor.telefono}` : ""}
                </small>
              </div>
              <div className="icono-card azul">
                <i className="bi bi-person-badge"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card card-resumen border-0 shadow-sm h-100">
            <div className="tarjetas card-body d-flex justify-content-between align-items-center">
              <div className="tarjeticas">
                <h6>Confirmadas</h6>
                <h2>{cargandoOrdenes ? "…" : confirmadas}</h2>
              </div>
              <div className="icono-card verde">
                <i className="bi bi-check-circle-fill"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card card-resumen border-0 shadow-sm h-100">
            <div className="tarjetas card-body d-flex justify-content-between align-items-center">
              <div className="tarjeticas">
                <h6>Pendientes</h6>
                <h2>{cargandoOrdenes ? "…" : pendientes}</h2>
              </div>
              <div className="icono-card amarillo">
                <i className="bi bi-hourglass-split"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="card shadow border-0 panelTabla">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <div className="tarjeticas">
            <h3 className="mb-1">
              <i className="bi bi-table"></i> Últimas órdenes
            </h3>
            <small className="text-muted">Vista rápida de las órdenes más recientes.</small>
          </div>
          <Link to="/proveedor/ordenes" className="btn-ver" title="Ver todas">
            <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle tablaPersonalizada">
              <thead>
                <tr>
                  <th>Número de orden</th>
                  <th>Fecha</th>
                  <th>Comprador</th>
                  <th className="text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                {cargandoOrdenes ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4">
                      Cargando órdenes…
                    </td>
                  </tr>
                ) : ultimasOrdenes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-muted py-4">
                      Todavía no tienes órdenes registradas.
                    </td>
                  </tr>
                ) : (
                  ultimasOrdenes.map((orden) => (
                    <tr key={orden.id}>
                      <td>{orden.codigo}</td>
                      <td>{orden.fecha ? new Date(orden.fecha).toLocaleDateString("es-CO") : "—"}</td>
                      <td>{orden.origen === "cliente" ? orden.cliente_nombre : "Kronos (compra interna)"}</td>
                      <td className="text-center">
                        <span className={`badge ${BADGE_POR_ESTADO[orden.estado] || "estado-pendiente"}`}>
                          {ETIQUETA_ESTADO[orden.estado] || orden.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
