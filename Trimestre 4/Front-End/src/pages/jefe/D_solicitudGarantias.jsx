import { useMemo, useState } from "react";
import { Modal } from "bootstrap";
import Swal from "sweetalert2";
import "../../assets/css/D_garantia-jefe.css";
import "../../assets/css/D_garantia-modales.css";
import logo from "../../assets/img/logo.png";
import pulidoraAzul from "../../assets/img/pulidoraazul.jpeg";
import { supabase } from "../../api/supabase";
import { useRealtimeTable } from "../../hooks/useRealtimeTable";

const GARANTIA_DIAS = 90;

function calcularVigenciaGarantia(fechaOrden) {
  if (!fechaOrden) return { diasTranscurridos: null, diasRestantes: null, vigente: true };
  const transcurridoMs = Date.now() - new Date(fechaOrden).getTime();
  const diasTranscurridos = Math.floor(transcurridoMs / (1000 * 60 * 60 * 24));
  const diasRestantes = GARANTIA_DIAS - diasTranscurridos;
  return { diasTranscurridos, diasRestantes, vigente: diasRestantes >= 0 };
}

const ESTADOS = ["pendiente", "en_revision", "aprobada", "rechazada", "cancelada"];
const ETIQUETA_ESTADO = {
  pendiente: "Pendiente",
  en_revision: "En revisión",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
  cancelada: "Cancelada (por el cliente)",
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

  // Proveedores y órdenes de compra ya existentes, para radicar la
  // garantía contra datos reales en vez de texto libre.
  const { datos: proveedores } = useRealtimeTable("proveedores", {
    orderBy: "nombre",
    ascending: true,
  });
  const { datos: ordenesCompra } = useRealtimeTable("ordenes_compra", {
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
    proveedor_id: "",
    orden_id: "",
    numero_orden: "",
    cliente_nombre: "",
    producto: "",
    motivo: "",
    observacion: "",
    correo: "",
  });
  const [creando, setCreando] = useState(false);

  // Órdenes de compra confirmadas del proveedor seleccionado (las
  // órdenes "de cliente" no aplican aquí: la garantía del jefe es
  // frente al proveedor que le vendió el material).
  const ordenesDelProveedor = useMemo(() => {
    if (!nuevoForm.proveedor_id) return [];
    return ordenesCompra.filter(
      (orden) =>
        String(orden.proveedor_id) === String(nuevoForm.proveedor_id) &&
        orden.origen === "interno" &&
        orden.estado === "confirmada"
    );
  }, [ordenesCompra, nuevoForm.proveedor_id]);

  const ordenSeleccionada = useMemo(
    () => ordenesDelProveedor.find((o) => String(o.id) === String(nuevoForm.orden_id)) || null,
    [ordenesDelProveedor, nuevoForm.orden_id]
  );

  const vigenciaSeleccionada = useMemo(
    () => (ordenSeleccionada ? calcularVigenciaGarantia(ordenSeleccionada.fecha) : null),
    [ordenSeleccionada]
  );

  const alCambiarProveedor = (proveedorId) => {
    setNuevoForm((actual) => ({
      ...actual,
      proveedor_id: proveedorId,
      orden_id: "",
      numero_orden: "",
      producto: "",
    }));
  };

  const alCambiarOrden = (ordenId) => {
    const orden = ordenesDelProveedor.find((o) => String(o.id) === String(ordenId));
    setNuevoForm((actual) => ({
      ...actual,
      orden_id: ordenId,
      numero_orden: orden?.codigo || "",
      producto: orden?.producto_nombre || "",
    }));
  };

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

    if (!nuevoForm.proveedor_id) {
      Swal.fire({
        icon: "warning",
        title: "Selecciona un proveedor",
        text: "La garantía debe radicarse contra un proveedor ya registrado.",
        confirmButtonColor: "#8d86c9",
      });
      return;
    }

    if (!nuevoForm.orden_id || !ordenSeleccionada) {
      Swal.fire({
        icon: "warning",
        title: "Selecciona una orden de compra",
        text: "Elige la orden de compra de ese proveedor sobre la que aplica la garantía.",
        confirmButtonColor: "#8d86c9",
      });
      return;
    }

    if (vigenciaSeleccionada && !vigenciaSeleccionada.vigente) {
      Swal.fire({
        icon: "error",
        title: "Garantía vencida",
        text: `Esa orden se recibió hace ${vigenciaSeleccionada.diasTranscurridos} día(s), fuera de los ${GARANTIA_DIAS} días de garantía. No es posible radicar una solicitud contra ella.`,
        confirmButtonColor: "#933c9e",
      });
      return;
    }

    if (!nuevoForm.cliente_nombre) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Indica el cliente o destino de esta garantía.",
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
        orden_id: nuevoForm.orden_id,
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
        proveedor_id: "",
        orden_id: "",
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

      {/* MODAL · NUEVA SOLICITUD (mismo diseño que los modales de Stock) */}
      <div className="modal fade modal-garantia" id="modalNuevaSolicitud" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <form className="modal-content" onSubmit={crearSolicitud}>
            <div className="modal-header encabezado-ficha">
              <div className="titulo-ficha">
                <i className="bi bi-shield-plus"></i>
                <h2>Nueva solicitud de garantía</h2>
              </div>
              <img src={logo} alt="Logo" className="logo-modal" />
            </div>

            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Proveedor *</label>
                  <select
                    className="form-select"
                    required
                    value={nuevoForm.proveedor_id}
                    onChange={(e) => alCambiarProveedor(e.target.value)}
                  >
                    <option value="">Selecciona un proveedor…</option>
                    {proveedores.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Orden de compra *</label>
                  <select
                    className="form-select"
                    required
                    disabled={!nuevoForm.proveedor_id}
                    value={nuevoForm.orden_id}
                    onChange={(e) => alCambiarOrden(e.target.value)}
                  >
                    <option value="">
                      {nuevoForm.proveedor_id
                        ? ordenesDelProveedor.length === 0
                          ? "Este proveedor no tiene órdenes confirmadas"
                          : "Selecciona una orden…"
                        : "Primero elige un proveedor"}
                    </option>
                    {ordenesDelProveedor.map((orden) => (
                      <option key={orden.id} value={orden.id}>
                        #{orden.codigo} · {orden.producto_nombre} · {orden.fecha ? new Date(orden.fecha).toLocaleDateString("es-CO") : "—"}
                      </option>
                    ))}
                  </select>
                  {ordenSeleccionada && vigenciaSeleccionada && (
                    <div className={`gm-vigencia ${vigenciaSeleccionada.vigente ? "gm-vigencia--ok" : "gm-vigencia--vencida"}`}>
                      <i className={`bi ${vigenciaSeleccionada.vigente ? "bi-patch-check-fill" : "bi-exclamation-triangle-fill"}`}></i>
                      {vigenciaSeleccionada.vigente
                        ? `Garantía vigente · quedan ${vigenciaSeleccionada.diasRestantes} día(s) (de ${GARANTIA_DIAS})`
                        : `Garantía vencida hace ${Math.abs(vigenciaSeleccionada.diasRestantes)} día(s)`}
                    </div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label">N.º de Orden / Factura</label>
                  <input type="text" className="form-control" readOnly value={nuevoForm.numero_orden} placeholder="Se completa al elegir la orden" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Producto</label>
                  <input type="text" className="form-control" readOnly value={nuevoForm.producto} placeholder="Se completa al elegir la orden" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Cliente / Destino *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="¿A quién afecta este reclamo?"
                    value={nuevoForm.cliente_nombre}
                    onChange={(e) => setNuevoForm({ ...nuevoForm, cliente_nombre: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Correo electrónico</label>
                  <input
                    type="email"
                    className="form-control"
                    value={nuevoForm.correo}
                    onChange={(e) => setNuevoForm({ ...nuevoForm, correo: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Motivo del reclamo</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={nuevoForm.motivo}
                    onChange={(e) => setNuevoForm({ ...nuevoForm, motivo: e.target.value })}
                  ></textarea>
                </div>
                <div className="col-12">
                  <label className="form-label">Observación inicial</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={nuevoForm.observacion}
                    onChange={(e) => setNuevoForm({ ...nuevoForm, observacion: e.target.value })}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="gm-btn-secundario" data-bs-dismiss="modal">
                Cancelar
              </button>
              <button type="submit" className="gm-btn-primario" disabled={creando}>
                <i className="bi bi-check2-circle me-2"></i>
                {creando ? "Creando…" : "Radicar solicitud"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* MODAL · DETALLE / EDITAR GARANTÍA (mismo diseño que los modales de Stock) */}
      <div className="modal fade modal-garantia" id="modalDetalleSolicitud" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header encabezado-ficha">
              <div className="titulo-ficha">
                <i className="bi bi-file-earmark-text"></i>
                <h2>Detalle de la solicitud #{seleccionada?.numero_orden}</h2>
              </div>
              <img src={logo} alt="Logo" className="logo-modal" />
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
              {activeTab === "info" && (
                <>
                  <div className="gm-datos mb-3">
                    <div className="gm-dato">
                      <small>Cliente</small>
                      <span>{seleccionada?.cliente_nombre || seleccionada?.cliente_destino || "—"}</span>
                    </div>
                    <div className="gm-dato">
                      <small>Pedido</small>
                      <span>#{seleccionada?.numero_orden}</span>
                    </div>
                    {seleccionada?.correo && (
                      <div className="gm-dato">
                        <small>Correo</small>
                        <span>{seleccionada.correo}</span>
                      </div>
                    )}
                    <div className="gm-dato">
                      <small>Fecha de la solicitud</small>
                      <span>{seleccionada?.fecha ? new Date(seleccionada.fecha).toLocaleDateString("es-CO") : "—"}</span>
                    </div>
                  </div>

                  <div className="gm-caja gm-producto mb-3">
                    <img src={pulidoraAzul} alt={seleccionada?.producto || "Producto"} />
                    <div>
                      <small>Producto</small>
                      <h5>{seleccionada?.producto}</h5>
                    </div>
                  </div>

                  <div className="gm-caja mb-3">
                    <h6>Motivo del reclamo</h6>
                    <p className="mb-0">{seleccionada?.motivo || "—"}</p>
                  </div>

                  <div className="gm-caja gm-caja--acento">
                    <h6><i className="bi bi-sliders me-2"></i>Gestión (solo jefe/administrador)</h6>

                    <label className="form-label">Estado de la solicitud</label>
                    <select
                      className="form-select mb-3"
                      value={estadoEdicion}
                      onChange={(e) => setEstadoEdicion(e.target.value)}
                    >
                      {ESTADOS.map((estado) => (
                        <option key={estado} value={estado}>{ETIQUETA_ESTADO[estado]}</option>
                      ))}
                    </select>

                    <label className="form-label">Observación para el cliente</label>
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
                <div className="gm-caja">
                  <h6><i className="bi bi-chat-left-text me-2"></i>Historial de observaciones</h6>
                  {(!seleccionada?.observaciones || seleccionada.observaciones.length === 0) ? (
                    <p className="gm-vacio">
                      {seleccionada?.observacion || "Sin observaciones acumuladas."}
                    </p>
                  ) : (
                    [...seleccionada.observaciones].reverse().map((obs, idx) => (
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

              {activeTab === "bitacora" && (
                <div className="gm-caja">
                  <h6><i className="bi bi-clock-history me-2"></i>Bitácora cronológica</h6>
                  {(!seleccionada?.bitacora || seleccionada.bitacora.length === 0) ? (
                    <p className="gm-vacio">Sin registros en la bitácora.</p>
                  ) : (
                    <ul className="gm-linea">
                      {seleccionada.bitacora.map((bit, idx) => (
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
                Cerrar
              </button>
              {activeTab === "info" && (
                <button
                  type="button"
                  className="gm-btn-primario"
                  onClick={guardarEstado}
                  disabled={guardando}
                >
                  <i className="bi bi-check2-circle me-2"></i>
                  {guardando ? "Guardando…" : "Guardar cambios"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default D_solicitudGarantias;