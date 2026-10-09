import { useMemo, useState } from "react";
import "../../assets/css/D_garantia-jefe.css";
import "../../assets/css/D_garantia-modales.css";
import logo from "../../assets/img/logo.png";
import { useRealtimeTable } from "../../hooks/useRealtimeTable"; 

const ETIQUETA_ESTADO = {
  aprobada: "Aprobada",
  rechazada: "Rechazada",
  cancelada: "Cancelada por el cliente",
  Aprobado: "Aprobada",
  Rechazado: "Rechazada",
};

const mensajePorEstado = (garantia) => {
  if (garantia.observacion) return garantia.observacion;
  if (garantia.estado === "aprobada" || garantia.estado === "Aprobado") {
    return "Su solicitud de garantía ha sido aprobada.";
  }
  if (garantia.estado === "cancelada") {
    return "El cliente canceló esta solicitud de garantía.";
  }
  return "Su solicitud de garantía ha sido revisada y no procede.";
};

const claseBadgeEstado = (estado) => {
  const valor = (estado || "").toLowerCase();
  if (valor === "aprobada" || valor === "aprobado") return "aprobado";
  if (valor === "rechazada" || valor === "rechazado") return "rechazado";
  if (valor === "en_revision" || valor === "en revisión") return "revision";
  return "no-aplica"; // pendiente, cancelada, u otros
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
          g.estado === "cancelada" ||
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

      {/* MODAL DE ESTADO Y DETALLES DE GARANTÍA (mismo diseño que los modales de Stock) */}
      <div
        className="modal fade modal-garantia"
        id="modalEstadoGarantia"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header encabezado-ficha">
              <div className="titulo-ficha">
                <i className="bi bi-shield-check"></i>
                <h2>Solicitud de garantía #{seleccionado?.numero_orden}</h2>
              </div>
              <img src={logo} alt="Kronos Inventory Control" className="logo-modal" />
            </div>

            <div className="gm-tabs" role="tablist">
              {[
                ["info", "Información"],
                ["obs", "Observaciones"],
                ["bitacora", "Bitácora"],
              ].map(([clave, texto]) => (
                <button
                  key={clave}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === clave}
                  className={`gm-tab ${activeTab === clave ? "activa" : ""}`}
                  onClick={() => setActiveTab(clave)}
                >
                  {texto}
                </button>
              ))}
            </div>

            <div className="modal-body">
              {/* TAB: INFORMACIÓN GENERAL */}
              {activeTab === "info" && (
                <>
                  <div className="gm-datos mb-3">
                    <div className="gm-dato">
                      <small>Nombre de la orden</small>
                      <span>{seleccionado?.numero_orden}</span>
                    </div>
                    <div className="gm-dato">
                      <small>Cliente / Destino</small>
                      <span>{seleccionado?.cliente_nombre || seleccionado?.cliente_destino || "—"}</span>
                    </div>
                    <div className="gm-dato">
                      <small>Producto</small>
                      <span>{seleccionado?.producto}</span>
                    </div>
                    {seleccionado?.precio && (
                      <div className="gm-dato">
                        <small>Precio</small>
                        <span>$ {Number(seleccionado.precio).toLocaleString("es-CO")}</span>
                      </div>
                    )}
                    <div className="gm-dato">
                      <small>Fecha de solicitud</small>
                      <span>
                        {seleccionado?.fecha || seleccionado?.fecha_creacion
                          ? new Date(
                              seleccionado.fecha || seleccionado.fecha_creacion
                            ).toLocaleDateString("es-CO")
                          : "—"}
                      </span>
                    </div>
                    {seleccionado?.motivo && (
                      <div className="gm-dato gm-dato--ancho">
                        <small>Motivo del reclamo</small>
                        <span className="fw-normal">{seleccionado.motivo}</span>
                      </div>
                    )}
                  </div>

                  <div className="gm-caja d-flex align-items-center justify-content-center gap-2 mb-3">
                    <span className="fw-semibold text-muted">Estado de la garantía:</span>
                    <span className={`badge-status-comic ${claseBadgeEstado(seleccionado?.estado)}`}>
                      {seleccionado
                        ? ETIQUETA_ESTADO[seleccionado.estado] || seleccionado.estado
                        : "—"}
                    </span>
                  </div>

                  <div className="gm-caja gm-caja--acento">
                    <p className="gm-mensaje mb-0">
                      {seleccionado ? mensajePorEstado(seleccionado) : "—"}
                    </p>
                  </div>
                </>
              )}

              {/* TAB: OBSERVACIONES ACUMULADAS */}
              {activeTab === "obs" && (
                <div className="gm-caja">
                  <h6><i className="bi bi-chat-left-text me-2"></i>Historial de observaciones</h6>
                  {(!seleccionado?.observaciones || seleccionado.observaciones.length === 0) ? (
                    <p className="gm-vacio">
                      {seleccionado?.observacion || "Sin observaciones registradas."}
                    </p>
                  ) : (
                    [...seleccionado.observaciones].reverse().map((obs, idx) => (
                      <div key={obs.id || idx} className="gm-obs-item">
                        <div className="gm-cabecera-item">
                          <strong className="small">{obs.responsable || "Sistema"}</strong>
                          <span className="gm-fecha">
                            {obs.fecha ? new Date(obs.fecha).toLocaleDateString("es-CO") : "—"}
                          </span>
                        </div>
                        <p className="mb-0 small">{obs.texto}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB: BITÁCORA DE CAMBIOS */}
              {activeTab === "bitacora" && (
                <div className="gm-caja">
                  <h6><i className="bi bi-clock-history me-2"></i>Línea de tiempo cronológica</h6>
                  {(!seleccionado?.bitacora || seleccionado.bitacora.length === 0) ? (
                    <p className="gm-vacio">Sin registros en bitácora.</p>
                  ) : (
                    <ul className="gm-linea">
                      {seleccionado.bitacora.map((bit, idx) => (
                        <li key={bit.id || idx}>
                          <div className="gm-cabecera-item">
                            <strong className="small">{bit.accion}</strong>
                            <span className="gm-fecha">
                              {bit.fecha ? new Date(bit.fecha).toLocaleDateString("es-CO") : "—"}
                            </span>
                          </div>
                          {bit.observacion && (
                            <p className="mb-0 small text-muted">{bit.observacion}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="gm-btn-secundario" data-bs-dismiss="modal">
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