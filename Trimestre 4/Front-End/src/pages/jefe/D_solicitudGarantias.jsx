import { useState } from "react";
import { Modal } from "bootstrap";
import Swal from "sweetalert2";
import "../../assets/css/D_garantia-jefe.css";
import pulidoraAzul from "../../assets/img/pulidoraazul.jpeg";
import { supabase } from "../../api/supabase";
import { useRealtimeTable } from "../../hooks/useRealtimeTable";

/**
 * Garantías · Solicitudes — conectado en tiempo real a la tabla
 * `garantias` (sección 7 del prompt): los reclamos que un cliente
 * envía desde su sesión llegan aquí vía postgres_changes, y el
 * cambio de estado + observación que hace el jefe se guarda con
 * `update`, lo que el cliente verá reflejado de inmediato en su
 * propio apartado (misma tabla, mismo canal realtime).
 *
 * Nota: las imágenes de producto siguen siendo ilustrativas (el
 * esquema propuesto no incluye una columna de foto); si tu tabla
 * real guarda una URL de imagen, basta con reemplazar los <img>
 * fijos por `seleccionada.imagen_url`.
 */

const ESTADOS = ["pendiente", "en_revision", "aprobada", "rechazada"];
const ETIQUETA_ESTADO = {
  pendiente: "Pendiente",
  en_revision: "En revisión",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
};

function D_solicitudGarantias() {
  const { datos: solicitudes, cargando, error } = useRealtimeTable("garantias", {
    orderBy: "fecha",
    ascending: false,
  });

  const [seleccionada, setSeleccionada] = useState(null);
  const [estadoEdicion, setEstadoEdicion] = useState("pendiente");
  const [observacionEdicion, setObservacionEdicion] = useState("");
  const [guardando, setGuardando] = useState(false);

  const abrirDetalle = (solicitud) => {
    setSeleccionada(solicitud);
    setEstadoEdicion(solicitud.estado || "pendiente");
    setObservacionEdicion(solicitud.observacion || "");
  };

  const guardarEstado = async () => {
    if (!seleccionada) return;
    setGuardando(true);
    try {
      const { error: errorUpdate } = await supabase
        .from("garantias")
        .update({ estado: estadoEdicion, observacion: observacionEdicion })
        .eq("id", seleccionada.id);
      if (errorUpdate) throw errorUpdate;

      Swal.fire({
        icon: "success",
        title: "Solicitud actualizada",
        text: "El cliente verá el nuevo estado en su apartado de garantías.",
        confirmButtonColor: "#8d86c9",
      });
      Modal.getOrCreateInstance("#modalDetalleSolicitud").hide();
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo actualizar", text: error.message, confirmButtonColor: "#933c9e" });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <section className="tabla-stock">
        <h1 className="titulo-alertasG">Solicitudes de Garantías</h1>
        <br />

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
                <th className="text-start">
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
                    <td>{solicitud.cliente_nombre}</td>
                    <td className="text-start">{solicitud.producto}</td>
                    <td className="text-start">{solicitud.fecha ? new Date(solicitud.fecha).toLocaleDateString("es-CO") : "—"}</td>
                    <td className="text-start">{ETIQUETA_ESTADO[solicitud.estado] || "Pendiente"}</td>
                    <td className="text-center">
                      <button
                        className="btn-detalle btn-ver-solicitud"
                        data-bs-toggle="modal"
                        data-bs-target="#modalDetalleSolicitud"
                        onClick={() => abrirDetalle(solicitud)}
                      >
                        <i className="fa-solid fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL · DETALLE GARANTÍA */}
      <div className="modal fade" id="modalDetalleSolicitud" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-md modal-dialog-centered">
          <div className="modal-content modal-content-solicitud">
            <div className="modal-header header-solicitud py-3 justify-content-center border-0">
              <h3 className="titulo-solicitud m-0 fw-semibold text-dark text-center">Detalle de la solicitud</h3>
            </div>

            <div className="modal-body bg-white px-4 py-3 text-dark">
              <div className="seccion-info-cliente mb-3">
                <p className="mb-1 fs-5"><strong>Cliente:</strong> {seleccionada?.cliente_nombre}</p>
                <p className="mb-1 fs-5"><strong>Pedido:</strong> #{seleccionada?.numero_orden}</p>
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
            </div>

            <div className="modal-footer footer-solicitud border-0 p-4 bg-white d-flex gap-2">
              <button
                type="button"
                className="btn-volver-solicitud-lg flex-fill py-3 rounded-3 fw-bold"
                onClick={guardarEstado}
                disabled={guardando}
              >
                <i className="bi bi-check2-circle me-2"></i> {guardando ? "Guardando…" : "Guardar cambios"}
              </button>
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
