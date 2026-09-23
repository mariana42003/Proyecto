import { useMemo, useState } from "react";
import "../../assets/css/D_garantia-jefe.css";
import logo from "../../assets/img/logo.png";
import { useRealtimeTable } from "../../hooks/useRealtimeTable";

/**
 * Garantías · Historial — registro acumulativo de garantías ya
 * resueltas (aprobadas o rechazadas), sincronizado en tiempo real
 * desde la misma tabla `garantias` que usa la página de Solicitudes.
 */

const ETIQUETA_ESTADO = {
  aprobada: "Aprobada",
  rechazada: "Rechazada",
  Aprobado: "Aprobada",
  Rechazado: "Rechazada",
};

const mensajePorEstado = (garantia) => {
  if (garantia.observacion) return garantia.observacion;
  if (garantia.estado === "aprobada" || garantia.estado === "Aprobado") {
    return "Su solicitud de garantía ha sido aprobada.";
  }
  return "Su solicitud de garantía ha sido revisada y no procede.";
};

function D_historialGarantias() {
  // Mantener Hook y Endpoint/Tabla original del Archivo A
  const { datos: garantias, cargando, error } = useRealtimeTable("garantias", {
    orderBy: "fecha",
    ascending: false,
  });

  const [busqueda, setBusqueda] = useState("");
  const [seleccionado, setSeleccionado] = useState(null);
  const [activeTab, setActiveTab] = useState("info");

  // Filtrado de estados resueltos soportando la nomenclatura de ambos archivos
  const resueltas = useMemo(
    () =>
      garantias.filter(
        (g) =>
          g.estado === "aprobada" ||
          g.estado === "rechazada" ||
          g.estado === "Aprobado" ||
          g.estado === "Rechazado"
      ),
    [garantias]
  );

  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return resueltas;
    return resueltas.filter((fila) =>
      Object.values(fila).join(" ").toLowerCase().includes(termino)
    );
  }, [busqueda, resueltas]);

  return (
    <div className="mt-4 container-historial">
      <div className="row">
        <div className="col-lg-12 mx-auto">
          <div className="text-center py-2 mb-4 banner-historial">
            <h2 className="mb-0 fs-4">Historial de Garantías</h2>
          </div>

          {error && (
            <div className="alert alert-danger">
              No se pudo conectar con la tabla "garantias": {error}
            </div>
          )}

          <div className="card shadow-sm card-historial p-4">
            <div className="buscarOrden">
              <i className="bi bi-search"></i>
              <input
                type="search"
                placeholder="Buscar por orden, cliente o material"
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
              />
            </div>

            <div className="table-responsive">
              <table
                id="tablaHistorial"
                className="table align-middle text-center custom-table-historial w-100"
              >
                <thead>
                  <tr>
                    <th>N° Orden</th>
                    <th>Cliente</th>
                    <th>Material</th>
                    <th>Observación</th>
                    <th>Estado / Acciones</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {cargando ? (
                    <tr>
                      <td colSpan={6} className="py-4">
                        Cargando historial…
                      </td>
                    </tr>
                  ) : filtrados.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-muted py-4">
                        Aún no hay garantías resueltas.
                      </td>
                    </tr>
                  ) : (
                    filtrados.map((fila) => (
                      <tr key={fila.id}>
                        <td className="fw-bold">{fila.numero_orden}</td>
                        <td>{fila.cliente_nombre || fila.cliente_destino || "—"}</td>
                        <td>{fila.producto}</td>
                        <td>
                          {fila.observacion ||
                            (fila.observaciones && fila.observaciones.length > 0
                              ? fila.observaciones[fila.observaciones.length - 1].texto
                              : "—")}
                        </td>
                        <td>
                          <button
                            className="btn btn-ver-actualizacion"
                            data-bs-toggle="modal"
                            data-bs-target="#modalEstadoGarantia"
                            onClick={() => {
                              setSeleccionado(fila);
                              setActiveTab("info");
                            }}
                          >
                            Ver actualización
                          </button>
                        </td>
                        <td>
                          {fila.fecha || fila.fecha_finalizacion
                            ? new Date(fila.fecha || fila.fecha_finalizacion).toLocaleDateString("es-CO")
                            : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE ESTADO Y DETALLES DE GARANTÍA */}
      <div
        className="modal fade"
        id="modalEstadoGarantia"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content card-modal-comic p-4 text-center">
            <div className="mb-3 text-center">
              <img
                src={logo}
                alt="Kronos Inventory Control"
                className="img-fluid logo-modal-kronos"
              />
            </div>

            <div className="mb-2">
              <span className="fs-4">🔔</span>
              <span className="fw-bold fs-5 mx-2">
                Solicitud de garantía #{seleccionado?.numero_orden}
              </span>
              <span className="fs-4">🔧</span>
            </div>

            {/* Navegación por pestañas herencia del Archivo B adaptada al Modal A */}
            <div className="d-flex justify-content-center gap-2 mb-3 border-bottom pb-2">
              <button
                type="button"
                className={`btn btn-sm ${
                  activeTab === "info" ? "btn-dark" : "btn-outline-dark"
                }`}
                onClick={() => setActiveTab("info")}
              >
                Información
              </button>
              <button
                type="button"
                className={`btn btn-sm ${
                  activeTab === "obs" ? "btn-dark" : "btn-outline-dark"
                }`}
                onClick={() => setActiveTab("obs")}
              >
                Observaciones
              </button>
              <button
                type="button"
                className={`btn btn-sm ${
                  activeTab === "bitacora" ? "btn-dark" : "btn-outline-dark"
                }`}
                onClick={() => setActiveTab("bitacora")}
              >
                Bitácora
              </button>
            </div>

            {/* TAB: INFORMACIÓN GENERAL */}
            {activeTab === "info" && (
              <>
                <div className="caja-info-modal text-start p-3 mb-2">
                  <p className="mb-1 text-muted">
                    Nombre de la orden :{" "}
                    <span className="fw-normal">{seleccionado?.numero_orden}</span>
                  </p>
                  <p className="mb-1 text-muted">
                    Cliente / Destino :{" "}
                    <span className="fw-bold">
                      {seleccionado?.cliente_nombre || seleccionado?.cliente_destino || "—"}
                    </span>
                  </p>
                  <p className="mb-1 text-muted">
                    Producto :{" "}
                    <span className="fw-bold">{seleccionado?.producto}</span>
                  </p>
                  {seleccionado?.precio && (
                    <p className="mb-1 text-muted">
                      Precio :{" "}
                      <span className="fw-bold">
                        $ {Number(seleccionado.precio).toLocaleString("es-CO")}
                      </span>
                    </p>
                  )}
                  {seleccionado?.motivo && (
                    <p className="mb-1 text-muted">
                      Motivo del reclamo :{" "}
                      <span className="fw-normal">{seleccionado.motivo}</span>
                    </p>
                  )}
                  <p className="mb-0 text-muted">
                    Fecha de solicitud :{" "}
                    <span className="fw-bold">
                      {seleccionado?.fecha || seleccionado?.fecha_creacion
                        ? new Date(
                            seleccionado.fecha || seleccionado.fecha_creacion
                          ).toLocaleDateString("es-CO")
                        : "—"}
                    </span>
                  </p>
                </div>

                <div className="caja-info-modal p-2 mb-2 d-flex align-items-center justify-content-center">
                  <span className="fw-bold text-muted me-2">
                    Estado de la garantía:
                  </span>
                  <span
                    className={`badge-status-comic ${
                      seleccionado?.estado?.toLowerCase() || ""
                    }`}
                  >
                    {seleccionado
                      ? ETIQUETA_ESTADO[seleccionado.estado] || seleccionado.estado
                      : "—"}
                  </span>
                </div>

                <div className="caja-info-modal p-3 mb-4 text-start">
                  <p className="mb-0 text-modal-desc text-center">
                    {seleccionado ? mensajePorEstado(seleccionado) : "—"}
                  </p>
                </div>
              </>
            )}

            {/* TAB: OBSERVACIONES ACUMULADAS */}
            {activeTab === "obs" && (
              <div className="caja-info-modal text-start p-3 mb-4">
                <h6 className="fw-bold mb-3 text-center">Historial de Observaciones</h6>
                {(!seleccionado?.observaciones || seleccionado.observaciones.length === 0) ? (
                  <p className="text-center text-muted my-2">
                    {seleccionado?.observacion || "Sin observaciones registradas."}
                  </p>
                ) : (
                  <div className="list-group list-group-flush">
                    {[...seleccionado.observaciones].reverse().map((obs, idx) => (
                      <div key={obs.id || idx} className="list-group-item bg-transparent px-0">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <small className="fw-bold text-primary">{obs.responsable || "Sistema"}</small>
                          <small className="text-muted">
                            {obs.fecha ? new Date(obs.fecha).toLocaleDateString("es-CO") : "—"}
                          </small>
                        </div>
                        <p className="mb-0 small">{obs.texto}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: BITÁCORA DE CAMBIOS */}
            {activeTab === "bitacora" && (
              <div className="caja-info-modal text-start p-3 mb-4">
                <h6 className="fw-bold mb-3 text-center">Línea de Tiempo Cronológica</h6>
                {(!seleccionado?.bitacora || seleccionado.bitacora.length === 0) ? (
                  <p className="text-center text-muted my-2">Sin registros en bitácora.</p>
                ) : (
                  <ul className="list-unstyled mb-0">
                    {seleccionado.bitacora.map((bit, idx) => (
                      <li key={bit.id || idx} className="mb-2 pb-2 border-bottom">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-bold small">{bit.accion}</span>
                          <small className="text-muted">
                            {bit.fecha ? new Date(bit.fecha).toLocaleDateString("es-CO") : "—"}
                          </small>
                        </div>
                        {bit.observacion && (
                          <p className="mb-0 text-muted small">{bit.observacion}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="d-grid gap-2 col-6 mx-auto">
              <button
                type="button"
                className="btn btn-volver-modal"
                data-bs-dismiss="modal"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default D_historialGarantias;