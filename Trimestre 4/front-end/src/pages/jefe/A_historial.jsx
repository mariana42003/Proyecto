import { useMemo, useState } from "react";
import { Modal } from "bootstrap";
import Swal from "sweetalert2";
import "../../assets/css/A_historial-ordenes-jefe.css";
import logo from "../../assets/img/logo.png";
import { supabase } from "../../api/supabase";
import { useRealtimeTable } from "../../hooks/useRealtimeTable";

/**
 * Órdenes de Compra · Historial de Compras — conectado a la tabla
 * `ordenes_compra` (sección 6 del prompt).
 *
 * Esa tabla integra en un solo lugar tanto las órdenes que genera el
 * administrador (columna `origen = "interno"`, ligadas a un proveedor)
 * como las que hace un cliente desde su portal (`origen = "cliente"`,
 * ligadas a un `cliente_id`); aquí se muestra el nombre que corresponda
 * en la columna "Proveedor / Cliente". Al cambiar el estado + guardar
 * una observación, el `update` se sincroniza en tiempo real hacia
 * cualquier cliente que esté viendo esa orden en /cliente/pedidos.
 */

const BADGE_POR_ESTADO = {
  pendiente: "bajo-stock",
  confirmada: "estable",
  rechazada: "agotado",
};

const ETIQUETA_ESTADO = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  rechazada: "Rechazada",
};

function A_historial() {
  const { datos: ordenes, cargando, error, setDatos } = useRealtimeTable("ordenes_compra", {
    orderBy: "fecha",
    ascending: false,
  });

  const [busqueda, setBusqueda] = useState("");
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("pendiente");
  const [observacion, setObservacion] = useState("");
  const [guardando, setGuardando] = useState(false);

  const filtradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return ordenes;
    return ordenes.filter((orden) =>
      Object.values(orden).join(" ").toLowerCase().includes(termino)
    );
  }, [ordenes, busqueda]);

  const abrirActualizacion = (orden) => {
    setOrdenSeleccionada(orden);
    setEstadoSeleccionado(orden.estado || "pendiente");
    setObservacion(orden.observacion || "");
  };

  const actualizarEstado = async (nuevoEstado) => {
    if (!ordenSeleccionada) return;

    if (nuevoEstado === "rechazada" && !observacion.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Falta la observación",
        text: "Escribe el motivo del rechazo antes de continuar.",
        confirmButtonColor: "#933c9e",
      });
      return;
    }

    setGuardando(true);
    try {
      // .select() devuelve las filas realmente modificadas. Sin esto, si las
      // políticas RLS bloquean el update, Supabase responde "ok" con 0 filas
      // y la pantalla parecería no hacer nada.
      const { data: filasActualizadas, error: errorUpdate } = await supabase
        .from("ordenes_compra")
        .update({ estado: nuevoEstado, observacion: observacion.trim() })
        .eq("id", ordenSeleccionada.id)
        .select();
      if (errorUpdate) throw errorUpdate;

      if (!filasActualizadas || filasActualizadas.length === 0) {
        throw new Error(
          "La base de datos no aplicó el cambio (0 filas actualizadas). Revisa que tu usuario tenga rol jefe/administrador y las políticas RLS de la tabla ordenes_compra."
        );
      }

      // Actualiza la tabla al instante, sin esperar a Realtime. Si Realtime
      // está activo, su recarga posterior simplemente confirma este mismo dato.
      const ordenActualizada = filasActualizadas[0];
      setDatos((actuales) =>
        actuales.map((orden) => (orden.id === ordenActualizada.id ? { ...orden, ...ordenActualizada } : orden))
      );

      Modal.getOrCreateInstance("#modalEstadoOrden").hide();

      Swal.fire({
        icon: "success",
        title: nuevoEstado === "rechazada" ? "Orden rechazada" : "Orden actualizada",
        text: `La orden ${ordenSeleccionada.codigo} ahora está en estado "${ETIQUETA_ESTADO[nuevoEstado]}".`,
        confirmButtonColor: "#8d86c9",
      });
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo actualizar", text: error.message, confirmButtonColor: "#933c9e" });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <section className="panelTabla">
        <div className="cabecera-tabla">
          <div className="tituloProveedores">
            <h1><i className="bi bi-receipt"></i> Historial de compras</h1>
            <p>Revisa las órdenes registradas (propias y de clientes) y actualiza su estado.</p>
          </div>
        </div>

        {error && <div className="alert alert-danger">No se pudo conectar con la tabla "ordenes_compra": {error}</div>}

        <div className="buscarOrden">
          <i className="bi bi-search"></i>
          <input
            type="search"
            placeholder="Buscar por código, producto o proveedor/cliente"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
          />
        </div>

        <div className="table-responsive">
          <table id="tablaHistorialCompras" className="table table-hover align-middle w-100 mb-0">
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th className="text-center">Cantidad</th>
                <th>Proveedor / Cliente</th>
                <th className="text-end">Precio unitario</th>
                <th className="text-center">Fecha</th>
                <th className="text-center">Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan={8} className="text-center py-4">Cargando órdenes…</td></tr>
              ) : filtradas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-4">No se encontraron resultados</td>
                </tr>
              ) : (
                filtradas.map((orden) => (
                  <tr key={orden.id}>
                    <td>{orden.codigo}</td>
                    <td>{orden.producto_nombre}</td>
                    <td className="text-center">{orden.cantidad}</td>
                    <td>
                      {orden.origen === "cliente" ? orden.cliente_nombre : orden.proveedor_nombre}
                      {orden.origen === "cliente" && (
                        <span className="badge bg-info-subtle text-info-emphasis ms-2">Cliente</span>
                      )}
                    </td>
                    <td className="text-end fw-bold">
                      {orden.precio_unitario != null ? `$${Number(orden.precio_unitario).toLocaleString("es-CO")}` : "—"}
                    </td>
                    <td className="text-center">{orden.fecha ? new Date(orden.fecha).toLocaleDateString("es-CO") : "—"}</td>
                    <td className="text-center">
                      <span className={`badge-stock ${BADGE_POR_ESTADO[orden.estado] || "bajo-stock"}`}>
                        {ETIQUETA_ESTADO[orden.estado] || orden.estado}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-actualiza btn-sm"
                        data-bs-toggle="modal"
                        data-bs-target="#modalEstadoOrden"
                        onClick={() => abrirActualizacion(orden)}
                      >
                        <i className="bi bi-eye-fill"></i> Ver actualización
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL · ESTADO DE LA ORDEN */}
      <div className="modal fade" id="modalEstadoOrden" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header header-historial">
              <h5 className="m-0 fw-bold text-white">
                Orden <span id="modalOrdenCodigo">{ordenSeleccionada?.codigo || "—"}</span>
              </h5>
              <img src={logo} alt="Logo Kronos" className="logo-modal" />
            </div>

            <div className="modal-body p-4">
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <p className="text-muted small mb-1">Producto</p>
                  <p className="fw-semibold mb-0">{ordenSeleccionada?.producto_nombre || "—"}</p>
                </div>
                <div className="col-md-6">
                  <p className="text-muted small mb-1">Proveedor / Cliente</p>
                  <p className="fw-semibold mb-0">
                    {ordenSeleccionada?.origen === "cliente"
                      ? ordenSeleccionada?.cliente_nombre
                      : ordenSeleccionada?.proveedor_nombre || "—"}
                  </p>
                </div>
                <div className="col-md-6">
                  <p className="text-muted small mb-1">Cantidad</p>
                  <p className="fw-semibold mb-0">{ordenSeleccionada?.cantidad ?? "—"}</p>
                </div>
                <div className="col-md-6">
                  <p className="text-muted small mb-1">Fecha de compra</p>
                  <p className="fw-semibold mb-0">
                    {ordenSeleccionada?.fecha ? new Date(ordenSeleccionada.fecha).toLocaleDateString("es-CO") : "—"}
                  </p>
                </div>
              </div>

              <div className="panel-estado">
                <div>
                  <h5>Estado de la orden</h5>
                  <p className="text-muted small m-0">Selecciona el estado y guarda para actualizar el historial (el cliente lo verá al instante).</p>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-4">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="estadoOrden"
                    id="estadoPendiente"
                    checked={estadoSeleccionado === "pendiente"}
                    onChange={() => setEstadoSeleccionado("pendiente")}
                  />
                  <label className="form-check-label" htmlFor="estadoPendiente">Pendiente</label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="estadoOrden"
                    id="estadoConfirmada"
                    checked={estadoSeleccionado === "confirmada"}
                    onChange={() => setEstadoSeleccionado("confirmada")}
                  />
                  <label className="form-check-label" htmlFor="estadoConfirmada">Confirmada</label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="estadoOrden"
                    id="estadoRechazada"
                    checked={estadoSeleccionado === "rechazada"}
                    onChange={() => setEstadoSeleccionado("rechazada")}
                  />
                  <label className="form-check-label" htmlFor="estadoRechazada">Rechazada</label>
                </div>
              </div>

              <div className="mt-4">
                <label className="form-label fw-semibold" htmlFor="modalObservacion">Observación</label>
                <textarea
                  className="form-control"
                  id="modalObservacion"
                  rows="3"
                  placeholder="Motivo del rechazo o nota para el proveedor/cliente"
                  value={observacion}
                  onChange={(evento) => setObservacion(evento.target.value)}
                ></textarea>
              </div>
            </div>

            <div className="modal-footer d-flex justify-content-between">
              <button type="button" className="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-outline-danger" id="btnRechazarOrden" onClick={() => actualizarEstado("rechazada")} disabled={guardando}>
                  <i className="bi bi-x-circle"></i> Rechazar
                </button>
                <button type="button" className="btn btn-naranja fw-bold" id="btnAceptarOrden" onClick={() => actualizarEstado(estadoSeleccionado)} disabled={guardando}>
                  <i className="bi bi-check-circle"></i> {guardando ? "Guardando…" : "Aceptar orden"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default A_historial;
