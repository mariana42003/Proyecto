import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import logo from "../../assets/img/logo.png";
import { supabase } from "../../api/supabase";
import { useMiProveedor } from "../../hooks/useMiProveedor";
import { useRealtimeTable } from "../../hooks/useRealtimeTable";

const PASOS_ESTADO = [
  { valor: "pendiente", etiqueta: "Pendiente" },
  { valor: "en_revision", etiqueta: "En revisión" },
  { valor: "aprobada", etiqueta: "Aprobada" },
  { valor: "rechazada", etiqueta: "Rechazada" },
];

const ETIQUETA_ESTADO = Object.fromEntries(PASOS_ESTADO.map((p) => [p.valor, p.etiqueta]));

/**
 * Portal del proveedor · Garantías (vista única, con modal
 * aprobar/rechazar — como se acordó en la reunión del 16/09).
 *
 * `garantias` no tiene una columna `proveedor_id` propia: se relaciona
 * con `ordenes_compra` a través de `garantias.orden_id`. Por eso:
 *   1. Primero se traen (en tiempo real) las órdenes de ESTE proveedor.
 *   2. Luego se traen todas las `garantias` y se filtran del lado del
 *      cliente, quedándonos solo con las que apuntan a una orden suya.
 *
 * Aprobar/Rechazar hacen un `update` real sobre `garantias.estado`
 * (+ `observacion`), que el cliente ve reflejado al instante en su
 * propio portal (misma tabla, mismo canal realtime).
 */
export default function D_garantiasProveedor() {
  const { proveedor } = useMiProveedor();

  const { datos: misOrdenes } = useRealtimeTable("ordenes_compra", {
    filtroColumna: "proveedor_id",
    filtroValor: proveedor?.id,
  });

  const { datos: todasLasGarantias, cargando, error } = useRealtimeTable("garantias", {
    orderBy: "fecha",
    ascending: false,
  });

  const misOrdenesIds = useMemo(() => new Set(misOrdenes.map((o) => o.id)), [misOrdenes]);
  const garantias = useMemo(
    () => todasLasGarantias.filter((g) => misOrdenesIds.has(g.orden_id)),
    [todasLasGarantias, misOrdenesIds]
  );

  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cerrarModal = () => setSolicitudSeleccionada(null);

  const actualizarEstadoGarantia = async (nuevoEstado, observacion) => {
    if (!solicitudSeleccionada) return;
    setGuardando(true);
    try {
      const { error: errorUpdate } = await supabase
        .from("garantias")
        .update({ estado: nuevoEstado, observacion })
        .eq("id", solicitudSeleccionada.id);
      if (errorUpdate) throw errorUpdate;

      setSolicitudSeleccionada((prev) => (prev ? { ...prev, estado: nuevoEstado, observacion } : prev));
    } catch (err) {
      Swal.fire({ icon: "error", title: "No se pudo actualizar", text: err.message, confirmButtonColor: "#933c9e" });
    } finally {
      setGuardando(false);
    }
  };

  const mostrarAlertaAprobar = () => {
    Swal.fire({
      title: "¿Aprobar garantía?",
      text: "La solicitud pasará al estado Aprobada y el cliente lo verá de inmediato.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, aprobar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        actualizarEstadoGarantia("aprobada", solicitudSeleccionada?.observacion || "").then(() => {
          Swal.fire("¡Aprobada!", "La garantía ha sido aprobada.", "success");
        });
      }
    });
  };

  const mostrarAlertaRechazar = () => {
    Swal.fire({
      title: "¿Rechazar garantía?",
      text: "Escribe el motivo del rechazo para el cliente:",
      icon: "warning",
      input: "text",
      inputPlaceholder: "Ej. El daño no está cubierto por la garantía...",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, rechazar",
      cancelButtonText: "Cancelar",
      inputValidator: (value) => {
        if (!value) return "Debes escribir un motivo para rechazar la garantía.";
      },
    }).then((result) => {
      if (result.isConfirmed) {
        actualizarEstadoGarantia("rechazada", result.value).then(() => {
          Swal.fire("Rechazada", "La garantía ha sido rechazada.", "error");
        });
      }
    });
  };

  return (
    <div>
      <section className="encabezado-pagina">
        <div className="icono-pagina">
          <i className="bi bi-shield-fill-check"></i>
        </div>
        <div className="texto-pagina">
          <h1>Garantías</h1>
          <p>Gestiona las solicitudes de garantía de los productos que entregaste.</p>
        </div>
      </section>

      {error && (
        <div className="alert alert-danger">No se pudo conectar con la tabla "garantias": {error}</div>
      )}

      <section className="card shadow border-0 panelTabla">
        <div className="card-header bg-white">
          <h3 className="mb-1">
            <i className="bi bi-table"></i> Solicitudes de garantía
          </h3>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle tablaPersonalizada">
              <thead>
                <tr>
                  <th>N° Orden</th>
                  <th>Producto</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Motivo</th>
                  <th className="text-center">Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      Cargando solicitudes…
                    </td>
                  </tr>
                ) : garantias.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4">
                      No hay solicitudes de garantía sobre tus productos por el momento.
                    </td>
                  </tr>
                ) : (
                  garantias.map((g) => (
                    <tr key={g.id}>
                      <td>{g.numero_orden}</td>
                      <td>{g.producto}</td>
                      <td>{g.cliente_nombre}</td>
                      <td>{g.fecha ? new Date(g.fecha).toLocaleDateString("es-CO") : "—"}</td>
                      <td>{g.motivo}</td>
                      <td className="text-center">
                        <span className={`badge ${g.estado === "pendiente" ? "estado-pendiente" : "estado-enviado"}`}>
                          {ETIQUETA_ESTADO[g.estado] || "Pendiente"}
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn-rapido btn-naranja"
                          onClick={() => setSolicitudSeleccionada(g)}
                        >
                          Ver actualización
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {solicitudSeleccionada && (
        <>
          <div className="modal-backdrop fade show" onClick={cerrarModal}></div>

          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true" aria-labelledby="modalDetalleGarantiaLabel">
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header-kronos">
                  <div className="modal-kronos-marca">
                    <img src={logo} alt="Kronos" className="modal-kronos-logo" />
                  </div>
                  <button type="button" className="btn-close btn-close-white" aria-label="Cerrar" onClick={cerrarModal}></button>
                </div>

                <div className="modal-body p-3 p-md-4">
                  <div className="title-pill d-flex align-items-center justify-content-center gap-3 px-4 py-2 mx-auto mb-4">
                    <i className="bi bi-file-earmark-text"></i>
                    <span id="modalDetalleGarantiaLabel">Solicitud de garantía</span>
                    <i className="bi bi-file-earmark-text"></i>
                  </div>

                  <div className="row g-4">
                    <div className="col-12 col-lg-8">
                      <span className="field order d-inline-block px-3 py-2 mb-2">
                        N° de orden: {solicitudSeleccionada.numero_orden}
                      </span>
                      <br />
                      <span className="field plain d-inline-block px-3 py-2 mb-2">
                        Producto: {solicitudSeleccionada.producto}
                      </span>
                      <br />
                      <span className="field plain d-inline-block px-3 py-2 mb-2">
                        Cliente: {solicitudSeleccionada.cliente_nombre}
                      </span>
                      <br />
                      <span className="field plain d-inline-block px-3 py-2 mb-2">
                        Fecha:{" "}
                        {solicitudSeleccionada.fecha
                          ? new Date(solicitudSeleccionada.fecha).toLocaleDateString("es-CO")
                          : "—"}
                      </span>

                      <h2 className="section-title mt-4 mb-3">Motivo</h2>

                      <div className="obs-box p-3 p-md-4">{solicitudSeleccionada.motivo || "—"}</div>

                      {solicitudSeleccionada.observacion && (
                        <>
                          <h2 className="section-title mt-4 mb-3">Tu observación</h2>
                          <div className="obs-box p-3 p-md-4">{solicitudSeleccionada.observacion}</div>
                        </>
                      )}
                    </div>

                    <div className="col-12 col-lg-4">
                      <div className="card garantia-card">
                        <div className="card-header text-center fw-bold">GARANTÍA</div>

                        <div className="card-body">
                          <h6 className="fw-bold mb-3">Estado de la garantía</h6>

                          {PASOS_ESTADO.map((paso) => (
                            <div className="estado my-2" key={paso.valor}>
                              <span
                                className={`circulo ${solicitudSeleccionada.estado === paso.valor ? "activo" : ""}`}
                              ></span>
                              {paso.etiqueta}
                            </div>
                          ))}

                          {solicitudSeleccionada.estado !== "aprobada" &&
                            solicitudSeleccionada.estado !== "rechazada" && (
                              <div className="mt-4">
                                <button
                                  type="button"
                                  className="btn btn-ac mb-2 w-100"
                                  onClick={mostrarAlertaAprobar}
                                  disabled={guardando}
                                >
                                  <i className="bi bi-check-square-fill me-1"></i>
                                  Aprobar Garantía
                                </button>

                                <button
                                  type="button"
                                  className="btn btn-ac-re w-100"
                                  onClick={mostrarAlertaRechazar}
                                  disabled={guardando}
                                >
                                  <i className="bi bi-x-circle-fill me-1"></i>
                                  Rechazar Garantía
                                </button>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
