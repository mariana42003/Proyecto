import { useMemo, useState } from "react";
import { Modal } from "bootstrap";
import Swal from "sweetalert2";
import { supabase } from "../../api/supabase";
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
 * Portal del proveedor · Órdenes de compra.
 *
 * Conectado en tiempo real a `ordenes_compra` (misma tabla que usa el
 * jefe en A_historial.jsx), filtrado por `proveedor_id` = la ficha de
 * este proveedor. Cada fila de esa tabla YA es un material con su
 * cantidad (no existe una lista de "materiales" por orden en el
 * esquema real), así que el modal de detalle muestra una sola fila —
 * se quitó el sub-listado con botones "sí/no" por material que tenía
 * la maqueta original, dejando solo confirmar/rechazar la orden
 * completa (como se acordó en la reunión del 16/09).
 *
 * Confirmar -> estado "confirmada".
 * Rechazar  -> pide motivo (obligatorio) y lo guarda en `observacion`,
 *              estado "rechazada".
 */
export default function ProveedorOrdenes() {
  const { proveedor } = useMiProveedor();
  const { datos: ordenes, cargando, error } = useRealtimeTable("ordenes_compra", {
    orderBy: "fecha",
    ascending: false,
    filtroColumna: "proveedor_id",
    filtroValor: proveedor?.id,
  });

  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const resumen = useMemo(
    () => ({
      total: ordenes.length,
      pendientes: ordenes.filter((o) => o.estado === "pendiente").length,
      confirmadas: ordenes.filter((o) => o.estado === "confirmada").length,
      rechazadas: ordenes.filter((o) => o.estado === "rechazada").length,
    }),
    [ordenes]
  );

  const abrirModalOrden = (orden) => {
    setOrdenSeleccionada(orden);
    const modalEl = document.getElementById("modalOrden");
    // focus:false -> Bootstrap ya no "atrapa" el foco dentro del modal. Sin esto,
    // el input de SweetAlert (motivo del rechazo) no dejaba escribir ni dar clic.
    Modal.getOrCreateInstance(modalEl, { focus: false }).show();
  };

  const cerrarModal = () => {
    const modalEl = document.getElementById("modalOrden");
    Modal.getInstance(modalEl)?.hide();
  };

  const actualizarEstado = async (nuevoEstado, observacion = "") => {
    if (!ordenSeleccionada) return;
    setGuardando(true);
    try {
      const { error: errorUpdate } = await supabase
        .from("ordenes_compra")
        .update({ estado: nuevoEstado, observacion })
        .eq("id", ordenSeleccionada.id);
      if (errorUpdate) throw errorUpdate;

      cerrarModal();
      Swal.fire({
        icon: "success",
        title: nuevoEstado === "confirmada" ? "¡Orden confirmada!" : "Orden rechazada",
        text:
          nuevoEstado === "confirmada"
            ? "Kronos verá tu confirmación de inmediato."
            : "Se notificó el motivo del rechazo.",
        confirmButtonColor: "#8d86c9",
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "No se pudo actualizar", text: err.message, confirmButtonColor: "#933c9e" });
    } finally {
      setGuardando(false);
    }
  };

  const handleConfirmar = () => {
    if (!ordenSeleccionada) return;
    Swal.fire({
      title: `¿Confirmar Orden #${ordenSeleccionada.codigo}?`,
      text: "Se notificará a Kronos que la orden está procesada.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#8d86c9",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, enviar confirmación",
      cancelButtonText: "Revisar de nuevo",
    }).then((result) => {
      if (result.isConfirmed) actualizarEstado("confirmada");
    });
  };

  const handleRechazar = () => {
    if (!ordenSeleccionada) return;
    Swal.fire({
      title: "¿Rechazar esta orden?",
      text: `Esta acción rechazará la orden #${ordenSeleccionada.codigo}. Escribe el motivo:`,
      icon: "error",
      input: "text",
      inputPlaceholder: "Ej. No hay stock del material solicitado...",
      showCancelButton: true,
      confirmButtonColor: "#933c9e",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, rechazar orden",
      cancelButtonText: "Volver",
      inputValidator: (value) => {
        if (!value) return "¡Debes escribir un motivo para rechazar la orden!";
      },
    }).then((result) => {
      if (result.isConfirmed) actualizarEstado("rechazada", result.value);
    });
  };

  return (
    <div>
      <section className="encabezado-pagina">
        <div className="icono-pagina">
          <i className="bi bi-receipt-cutoff"></i>
        </div>
        <div className="texto-pagina">
          <h1>Órdenes de compra</h1>
          <p>Consulta tus órdenes y su estado. Haz clic en el ojito para ver el detalle y confirmar o rechazar.</p>
        </div>
      </section>

      {error && (
        <div className="alert alert-danger">No se pudo conectar con la tabla "ordenes_compra": {error}</div>
      )}

      <section className="row g-4 mb-4">
        <div className="col-lg-3 col-md-6">
          <div className="card card-resumen border-0 shadow-sm">
            <div className="tarjetas card-body d-flex justify-content-between align-items-center">
              <div className="tarjeticas">
                <h6>Total órdenes</h6>
                <h2>{resumen.total}</h2>
              </div>
              <div className="icono-card azul">
                <i className="bi bi-file-earmark-text"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6">
          <div className="card card-resumen border-0 shadow-sm">
            <div className="tarjetas card-body d-flex justify-content-between align-items-center">
              <div className="tarjeticas">
                <h6>Pendientes</h6>
                <h2>{resumen.pendientes}</h2>
              </div>
              <div className="icono-card amarillo">
                <i className="bi bi-hourglass-split"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6">
          <div className="card card-resumen border-0 shadow-sm">
            <div className="tarjetas card-body d-flex justify-content-between align-items-center">
              <div className="tarjeticas">
                <h6>Confirmadas</h6>
                <h2>{resumen.confirmadas}</h2>
              </div>
              <div className="icono-card verde">
                <i className="bi bi-check-circle-fill"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6">
          <div className="card card-resumen border-0 shadow-sm">
            <div className="tarjetas card-body d-flex justify-content-between align-items-center">
              <div className="tarjeticas">
                <h6>Rechazadas</h6>
                <h2>{resumen.rechazadas}</h2>
              </div>
              <div className="icono-card azul">
                <i className="bi bi-x-circle-fill"></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="card shadow border-0 panelTabla">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <div>
            <h3 className="mb-1">
              <i className="bi bi-table"></i> Listado de órdenes
            </h3>
            <small className="text-muted">Estado actualizado de cada orden registrada.</small>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle tablaPersonalizada">
              <thead>
                <tr>
                  <th>Número de orden</th>
                  <th>Fecha</th>
                  <th>Material</th>
                  <th className="text-center">Cantidad</th>
                  <th className="text-center">Estado</th>
                  <th className="text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      Cargando órdenes…
                    </td>
                  </tr>
                ) : ordenes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      Todavía no tienes órdenes de compra asignadas.
                    </td>
                  </tr>
                ) : (
                  ordenes.map((ord) => (
                    <tr key={ord.id}>
                      <td>{ord.codigo}</td>
                      <td>{ord.fecha ? new Date(ord.fecha).toLocaleDateString("es-CO") : "—"}</td>
                      <td>{ord.producto_nombre}</td>
                      <td className="text-center">{ord.cantidad}</td>
                      <td className="text-center">
                        <span className={`badge ${BADGE_POR_ESTADO[ord.estado] || "estado-pendiente"}`}>
                          {ETIQUETA_ESTADO[ord.estado] || ord.estado}
                        </span>
                      </td>
                      <td className="text-center">
                        <button type="button" className="btn-ver btn-ver-orden" onClick={() => abrirModalOrden(ord)}>
                          <i className="bi bi-eye-fill"></i>
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

      {/* Modal Bootstrap */}
      <div className="modal fade" id="modalOrden" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-file-earmark-text-fill"></i> Detalles de la Orden
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div className="modal-body">
              {ordenSeleccionada && (
                <>
                  <div className="infoSolicitante mb-4">
                    <div className="row g-4">
                      <div className="col-lg-3 col-md-6">
                        <strong>
                          <i className="bi bi-hash"></i> Orden
                        </strong>
                        <h4 className="mt-2">#{ordenSeleccionada.codigo}</h4>
                      </div>
                      <div className="col-lg-3 col-md-6">
                        <strong>
                          <i className="bi bi-calendar-event"></i> Fecha
                        </strong>
                        <p className="mt-2 mb-0">
                          {ordenSeleccionada.fecha
                            ? new Date(ordenSeleccionada.fecha).toLocaleDateString("es-CO")
                            : "—"}
                        </p>
                      </div>
                      <div className="col-lg-3 col-md-6">
                        <strong>
                          <i className="bi bi-person"></i> Comprador
                        </strong>
                        <p className="mt-2 mb-0">
                          {ordenSeleccionada.origen === "cliente"
                            ? ordenSeleccionada.cliente_nombre
                            : "Kronos (compra interna)"}
                        </p>
                      </div>
                      <div className="col-lg-3 col-md-6">
                        <strong>
                          <i className="bi bi-cash"></i> Precio unitario
                        </strong>
                        <p className="mt-2 mb-0">
                          {ordenSeleccionada.precio_unitario != null
                            ? `$${Number(ordenSeleccionada.precio_unitario).toLocaleString("es-CO")}`
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-6 mb-3">
                      <div className="card tarjetas h-100">
                        <div className="card-body d-flex justify-content-between align-items-center">
                          <div>
                            <small>Estado actual</small>
                            <h2>{ETIQUETA_ESTADO[ordenSeleccionada.estado] || ordenSeleccionada.estado}</h2>
                          </div>
                          <div className="icono-card amarillo">
                            <i className="bi bi-hourglass-split"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="card tarjetas h-100">
                        <div className="card-body d-flex justify-content-between align-items-center">
                          <div>
                            <small>Material</small>
                            <h2 style={{ fontSize: "1.15rem" }}>{ordenSeleccionada.producto_nombre}</h2>
                          </div>
                          <div className="icono-card azul">
                            <i className="bi bi-box-seam"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover align-middle tablaPersonalizada">
                      <thead>
                        <tr>
                          <th>Material</th>
                          <th>Cantidad</th>
                          <th>Observación</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{ordenSeleccionada.producto_nombre}</td>
                          <td>{ordenSeleccionada.cantidad}</td>
                          <td>{ordenSeleccionada.observacion || "—"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer confirmaRechaza">
              <button
                type="button"
                className="confirmaOrden"
                onClick={handleConfirmar}
                disabled={guardando || ordenSeleccionada?.estado !== "pendiente"}
              >
                <i className="bi bi-check-circle-fill"></i> Confirmar orden
              </button>
              <button
                type="button"
                className="rechazaOrden"
                onClick={handleRechazar}
                disabled={guardando || ordenSeleccionada?.estado !== "pendiente"}
              >
                <i className="bi bi-x-circle-fill"></i> Rechazar orden
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
