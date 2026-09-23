import { useState } from "react";
import { Modal } from "bootstrap";
import Swal from "sweetalert2";
import "../../assets/css/D_garantia-jefe.css";
import pulidoraAzul from "../../assets/img/pulidoraazul.jpeg";
import { supabase } from "../../api/supabase";
import { useRealtimeTable } from "../../hooks/useRealtimeTable";

/**
 * Garantías · Solicitudes — conectado en tiempo real a Supabase (tabla `garantias`).
 * Permite listar, crear (radicar), actualizar estado/observaciones/bitácora y eliminar solicitudes,
 * manteniendo la estética visual y la estructura de datos original.
 */

const ESTADOS = ["pendiente", "en_revision", "aprobada", "rechazada"];
const ETIQUETA_ESTADO = {
  pendiente: "Pendiente",
  en_revision: "En revisión",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
  Pendiente: "Pendiente",
  "En revisión": "En revisión",
  Aprobado: "Aprobada",
  Rechazado: "Rechazada",
  "Enviado a Proveedor": "Enviado a Proveedor",
};

function D_solicitudGarantias() {
  // Conexión en tiempo real con Supabase (Archivo A_2)
  const { datos: solicitudes, cargando, error } = useRealtimeTable("garantias", {
    orderBy: "fecha",
    ascending: false,
  });

  const [seleccionada, setSeleccionada] = useState(null);
  const [estadoEdicion, setEstadoEdicion] = useState("pendiente");
  const [observacionEdicion, setObservacionEdicion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  // Estado para el formulario de Nueva Solicitud (Herencia del Archivo B_2)
  const [nuevoForm, setNuevoForm] = useState({
    numero_orden: "",
    cliente_nombre: "",
    producto: "",
    motivo: "",
    observacion: "",
    correo: "",
  });
  const [creando, setCreando] = useState(false);

  // --- ACCIONES CRUD ---

  const abrirDetalle = (solicitud) => {
    setSeleccionada(solicitud);
    setEstadoEdicion(solicitud.estado || "pendiente");
    setObservacionEdicion(solicitud.observacion || "");
    setActiveTab("info");
  };

  const guardarEstado = async () => {
    if (!seleccionada) return;
    setGuardando(true);
    try {
      const ahora = new Date().toISOString();

      // Construcción de la observación acumulada y bitácora heredada del Archivo B_2
      const nuevaObs = {
        id: `obs-${Date.now()}`,
        texto: observacionEdicion,
        estado: estadoEdicion,
        responsable: "Jefe de Garantías",
        fecha: ahora,
      };

      const nuevaBit = {
        id: `bit-${Date.now()}`,
        accion: "Cambio de estado",
        estado: estadoEdicion,
        responsable: "Jefe de Garantías",
        fecha: ahora,
        observacion: observacionEdicion,
      };

      const obsActuales = Array.isArray(seleccionada.observaciones) ? seleccionada.observaciones : [];
      const bitActuales = Array.isArray(seleccionada.bitacora) ? seleccionada.bitacora : [];

      const { error: errorUpdate } = await supabase
        .from("garantias")
        .update({
          estado: estadoEdicion,
          observacion: observacionEdicion,
          observaciones: [...obsActuales, nuevaObs],
          bitacora: [...bitActuales, nuevaBit],
        })
        .eq("id", seleccionada.id);

      if (errorUpdate) throw errorUpdate;

      Swal.fire({
        icon: "success",
        title: "Solicitud actualizada",
        text: "El cliente verá el nuevo estado en su apartado de garantías.",
        confirmButtonColor: "#8d86c9",
      });
      Modal.getOrCreateInstance("#modalDetalleSolicitud").hide();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "No se pudo actualizar",
        text: err.message,
        confirmButtonColor: "#933c9e",
      });
    } finally {
      setGuardando(false);
    }
  };

  const crearSolicitud = async (e) => {
    e.preventDefault();
    if (!nuevoForm.numero_orden || !nuevoForm.cliente_nombre || !nuevoForm.producto) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor completa el número de orden, cliente y producto.",
        confirmButtonColor: "#8d86c9",
      });
      return;
    }

    setCreando(true);
    try {
      const ahora = new Date().toISOString();
      const obsInicial = {
        id: `obs-${Date.now()}`,
        texto: nuevoForm.observacion || "Solicitud creada.",
        estado: "pendiente",
        responsable: "Jefe de Garantías",
        fecha: ahora,
      };

      const bitInicial = {
        id: `bit-${Date.now()}`,
        accion: "Creación de solicitud",
        estado: "pendiente",
        responsable: "Jefe de Garantías",
        fecha: ahora,
        observacion: nuevoForm.observacion || "Solicitud creada.",
      };

      const payload = {
        numero_orden: nuevoForm.numero_orden,
        cliente_nombre: nuevoForm.cliente_nombre,
        producto: nuevoForm.producto,
        motivo: nuevoForm.motivo,
        observacion: nuevoForm.observacion,
        correo: nuevoForm.correo,
        estado: "pendiente",
        fecha: ahora,
        observaciones: [obsInicial],
        bitacora: [bitInicial],
      };

      const { error: errorInsert } = await supabase.from("garantias").insert([payload]);
      if (errorInsert) throw errorInsert;

      Swal.fire({
        icon: "success",
        title: "Solicitud radicada",
        text: "La solicitud ha sido creada con éxito.",
        confirmButtonColor: "#8d86c9",
      });

      setNuevoForm({
        numero_orden: "",
        cliente_nombre: "",
        producto: "",
        motivo: "",
        observacion: "",
        correo: "",
      });
      Modal.getOrCreateInstance("#modalNuevaSolicitud").hide();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error al crear",
        text: err.message,
        confirmButtonColor: "#933c9e",
      });
    } finally {
      setCreando(false);
    }
  };

  const eliminarSolicitud = async (id, orden) => {
    const res = await Swal.fire({
      title: "¿Eliminar solicitud?",
      text: `Esta acción no se puede deshacer para la orden #${orden}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (res.isConfirmed) {
      try {
        const { error: errorDelete } = await supabase.from("garantias").delete().eq("id", id);
        if (errorDelete) throw errorDelete;

        Swal.fire({
          icon: "success",
          title: "Eliminada",
          text: "La solicitud ha sido eliminada.",
          confirmButtonColor: "#8d86c9",
        });
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error al eliminar",
          text: err.message,
          confirmButtonColor: "#933c9e",
        });
      }
    }
  };

  return (
    <>
      <section className="tabla-stock">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="titulo-alertasG m-0">Solicitudes de Garantías</h1>
          <button
            className="btn btn-dark fw-semibold"
            data-bs-toggle="modal"
            data-bs-target="#modalNuevaSolicitud"
          >
            <i className="fa-solid fa-plus me-2"></i>Nueva solicitud
          </button>
        </div>

        {error && <div className="alert alert-danger">No se pudo conectar con la tabla "garantias": {error}</div>}

        <div className="table-responsive">
          <table id="tablaGarantias" className="table table-hover table-bordered align-start">
            <thead>
              <tr>
                <th className="text-start">
                  <div className="d-inline-flex align-items-center">
                    <i className="fa-solid fa-cubes me-2" style={{ color: "var(--k-orange)" }}></i>
                    N° Orden
                  </div>
                </th>
                <th className="text-start">
                  <div className="d-inline-flex align-items-center">
                    <i className="fa-solid fa-address-card me-2" style={{ color: "var(--k-orange)", marginRight: 8 }}></i>
                    Cliente
                  </div>
                </th>
                <th className="text-start">
                  <div className="d-inline-flex align-items-center">
                    <i className="fa-solid fa-box" style={{ color: "var(--k-orange)", marginRight: 8 }}></i>
                    Producto
                  </div>
                </th>
                <th className="text-start">
                  <div className="d-inline-flex align-items-center">
                    <i className="fa-solid fa-calendar-days me-2" style={{ color: "var(--k-orange)", marginRight: 8 }}></i>
                    Fecha
                  </div>
                </th>
                <th className="text-start">
                  <div className="d-inline-flex align-items-center">
                    <i className="fa-solid fa-triangle-exclamation me-2" style={{ color: "var(--k-orange)", marginRight: 8 }}></i>
                    Estado
                  </div>
                </th>
                <th className="text-center">
                  <div className="d-inline-flex align-items-center">
                    <i className="fa-solid fa-gear me-2" style={{ color: "var(--k-orange)", marginRight: 8 }}></i>
                    Acciones
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              {cargando ? (
                <tr><td colSpan={6} className="text-center py-4">Cargando solicitudes…</td></tr>
              ) : solicitudes.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-muted py-4">No hay solicitudes de garantía por el momento.</td></tr>
              ) : (
                solicitudes.map((solicitud) => (
                  <tr key={solicitud.id}>
                    <td className="text-start">{solicitud.numero_orden}</td>
                    <td>{solicitud.cliente_nombre || solicitud.cliente_destino}</td>
                    <td className="text-start">{solicitud.producto}</td>
                    <td className="text-start">{solicitud.fecha ? new Date(solicitud.fecha).toLocaleDateString("es-CO") : "—"}</td>
                    <td className="text-start">{ETIQUETA_ESTADO[solicitud.estado] || "Pendiente"}</td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <button
                          className="btn-detalle btn-ver-solicitud"
                          data-bs-toggle="modal"
                          data-bs-target="#modalDetalleSolicitud"
                          onClick={() => abrirDetalle(solicitud)}
                          title="Ver / Editar"
                        >
                          <i className="fa-solid fa-eye"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => eliminarSolicitud(solicitud.id, solicitud.numero_orden)}
                          title="Eliminar"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL · NUEVA SOLICITUD (CREAR CRUD) */}
      <div className="modal fade" id="modalNuevaSolicitud" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-md modal-dialog-centered">
          <div className="modal-content modal-content-solicitud">
            <div className="modal-header header-solicitud py-3 justify-content-center border-0">
              <h3 className="titulo-solicitud m-0 fw-semibold text-dark text-center">Nueva Solicitud de Garantía</h3>
            </div>
            <form onSubmit={crearSolicitud}>
              <div className="modal-body bg-white px-4 py-3 text-dark">
                <div className="mb-2">
                  <label className="form-label fw-semibold small">N.º de Orden / Factura *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={nuevoForm.numero_orden}
                    onChange={(e) => setNuevoForm({ ...nuevoForm, numero_orden: e.target.value })}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label fw-semibold small">Cliente / Destino *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={nuevoForm.cliente_nombre}
                    onChange={(e) => setNuevoForm({ ...nuevoForm, cliente_nombre: e.target.value })}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label fw-semibold small">Correo Electrónico</label>
                  <input
                    type="email"
                    className="form-control"
                    value={nuevoForm.correo}
                    onChange={(e) => setNuevoForm({ ...nuevoForm, correo: e.target.value })}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label fw-semibold small">Producto *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={nuevoForm.producto}
                    onChange={(e) => setNuevoForm({ ...nuevoForm, producto: e.target.value })}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label fw-semibold small">Motivo del reclamo</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={nuevoForm.motivo}
                    onChange={(e) => setNuevoForm({ ...nuevoForm, motivo: e.target.value })}
                  ></textarea>
                </div>
                <div className="mb-2">
                  <label className="form-label fw-semibold small">Observación inicial</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={nuevoForm.observacion}
                    onChange={(e) => setNuevoForm({ ...nuevoForm, observacion: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer footer-solicitud border-0 p-4 bg-white d-flex gap-2">
                <button
                  type="submit"
                  className="btn-volver-solicitud-lg flex-fill py-3 rounded-3 fw-bold"
                  disabled={creando}
                >
                  <i className="bi bi-check2-circle me-2"></i> {creando ? "Creando…" : "Radicar solicitud"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary flex-fill py-3 rounded-3"
                  data-bs-dismiss="modal"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* MODAL · DETALLE / EDITAR GARANTÍA */}
      <div className="modal fade" id="modalDetalleSolicitud" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-md modal-dialog-centered">
          <div className="modal-content modal-content-solicitud">
            <div className="modal-header header-solicitud py-3 justify-content-center border-0">
              <h3 className="titulo-solicitud m-0 fw-semibold text-dark text-center">
                Detalle de la solicitud #{seleccionada?.numero_orden}
              </h3>
            </div>

            {/* Pestañas adaptadas al diseño del Archivo A_2 */}
            <div className="d-flex justify-content-center gap-2 bg-white pt-2 border-bottom">
              <button
                type="button"
                className={`btn btn-sm ${activeTab === "info" ? "btn-dark" : "btn-outline-dark"}`}
                onClick={() => setActiveTab("info")}
              >
                Información
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === "obs" ? "btn-dark" : "btn-outline-dark"}`}
                onClick={() => setActiveTab("obs")}
              >
                Observaciones
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === "bitacora" ? "btn-dark" : "btn-outline-dark"}`}
                onClick={() => setActiveTab("bitacora")}
              >
                Bitácora
              </button>
            </div>

            <div className="modal-body bg-white px-4 py-3 text-dark">
              {activeTab === "info" && (
                <>
                  <div className="seccion-info-cliente mb-3">
                    <p className="mb-1 fs-5">
                      <strong>Cliente:</strong> {seleccionada?.cliente_nombre || seleccionada?.cliente_destino}
                    </p>
                    <p className="mb-1 fs-5"><strong>Pedido:</strong> #{seleccionada?.numero_orden}</p>
                    {seleccionada?.correo && (
                      <p className="mb-1 text-muted"><strong>Correo:</strong> {seleccionada.correo}</p>
                    )}
                    <p className="mb-3 text-muted">
                      Realizado el: {seleccionada?.fecha ? new Date(seleccionada.fecha).toLocaleDateString("es-CO") : "—"}
                    </p>
                    <hr className="linea-divisoria my-2" />
                    <p className="mt-2 font-motivo"><strong>Motivo del reclamo:</strong> {seleccionada?.motivo || "—"}</p>
                  </div>

                  <div className="row align-items-center g-3 my-3">
                    <div className="col-12 col-sm-4 text-center">
                      <img
                        src={pulidoraAzul}
                        alt={seleccionada?.producto || "Producto"}
                        className="img-fluid rounded border p-1 img-solicitud-preview mx-auto d-block"
                      />
                    </div>
                    <div className="col-12 col-sm-8">
                      <h5 className="nombre-producto-solicitud mb-1 fw-bold">{seleccionada?.producto}</h5>
                    </div>
                  </div>

                  <div className="contenedor-resumen-pedido p-3 rounded-3 mt-4">
                    <p className="text-muted small fw-semibold mb-2 tracking-wider">Gestión (solo jefe/administrador)</p>

                    <label className="form-label fw-semibold small">Estado de la solicitud</label>
                    <select
                      className="form-select mb-3"
                      value={estadoEdicion}
                      onChange={(e) => setEstadoEdicion(e.target.value)}
                    >
                      {ESTADOS.map((estado) => (
                        <option key={estado} value={estado}>{ETIQUETA_ESTADO[estado]}</option>
                      ))}
                    </select>

                    <label className="form-label fw-semibold small">Observación para el cliente</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Ej. Se aprueba el cambio, pasa por el punto de recolección más cercano."
                      value={observacionEdicion}
                      onChange={(e) => setObservacionEdicion(e.target.value)}
                    ></textarea>
                  </div>
                </>
              )}

              {activeTab === "obs" && (
                <div className="contenedor-resumen-pedido p-3 rounded-3">
                  <h6 className="fw-bold mb-3">Historial de Observaciones</h6>
                  {(!seleccionada?.observaciones || seleccionada.observaciones.length === 0) ? (
                    <p className="text-muted small">
                      {seleccionada?.observacion || "Sin observaciones acumuladas."}
                    </p>
                  ) : (
                    <div className="list-group list-group-flush">
                      {[...seleccionada.observaciones].reverse().map((obs, idx) => (
                        <div key={obs.id || idx} className="list-group-item bg-transparent px-0">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <small className="fw-bold">{obs.responsable || "Sistema"}</small>
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

              {activeTab === "bitacora" && (
                <div className="contenedor-resumen-pedido p-3 rounded-3">
                  <h6 className="fw-bold mb-3">Bitácora Cronológica</h6>
                  {(!seleccionada?.bitacora || seleccionada.bitacora.length === 0) ? (
                    <p className="text-muted small">Sin registros en la bitácora.</p>
                  ) : (
                    <ul className="list-unstyled mb-0">
                      {seleccionada.bitacora.map((bit, idx) => (
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
            </div>

            <div className="modal-footer footer-solicitud border-0 p-4 bg-white d-flex gap-2">
              {activeTab === "info" && (
                <button
                  type="button"
                  className="btn-volver-solicitud-lg flex-fill py-3 rounded-3 fw-bold"
                  onClick={guardarEstado}
                  disabled={guardando}
                >
                  <i className="bi bi-check2-circle me-2"></i> {guardando ? "Guardando…" : "Guardar cambios"}
                </button>
              )}
              <button
                type="button"
                className="btn btn-outline-secondary flex-fill py-3 rounded-3"
                data-bs-dismiss="modal"
              >
                <i className="bi bi-arrow-left me-2"></i> Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default D_solicitudGarantias;