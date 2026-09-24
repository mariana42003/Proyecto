import { useMemo, useState } from "react";
import { Modal } from "bootstrap";
import Swal from "sweetalert2";
import "../../assets/css/E_panel-jefe.css";
import logo from "../../assets/img/logo.png";
import { supabase } from "../../api/supabase";
import { useRealtimeTable } from "../../hooks/useRealtimeTable";

/**
 * Panel de Control del jefe — ahora conectado a Supabase en tiempo real.
 *
 * Tablas usadas (ver documentación de esquema en src/api/supabase.js):
 *   productos    -> KPIs, Alertas de Stock, Reporte de Críticos, Umbrales
 *   movimientos  -> Historial de Movimientos
 *   reportes_generados -> se inserta un registro cada vez que se exporta
 *
 * Toda lectura + suscripción realtime vive en useRealtimeTable; aquí solo
 * se calculan derivados (KPIs, filtros) y se hacen los `insert`/`update`
 * puntuales de cada acción, siempre envueltos en try/catch.
 */

const estadoDeStock = (producto) => {
  if (producto.stock_actual <= 0) return { clase: "agotado", etiqueta: "Agotado" };
  if (producto.stock_actual <= producto.umbral_minimo) return { clase: "bajo-stock", etiqueta: "Bajo stock" };
  return { clase: "estable", etiqueta: "Stock estable" };
};

function E_panel() {
  const { datos: productos, cargando: cargandoProductos, error: errorProductos } =
    useRealtimeTable("productos", { orderBy: "nombre", ascending: true });
  const { datos: movimientos, cargando: cargandoMovimientos } =
    useRealtimeTable("movimientos", { orderBy: "fecha", ascending: false });

  const [formato, setFormato] = useState("excel");
  const [limite, setLimite] = useState("");
  const [limiteInvalido, setLimiteInvalido] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [productoAlertaId, setProductoAlertaId] = useState("");
  const [guardandoUmbral, setGuardandoUmbral] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [filtroDesde, setFiltroDesde] = useState("");
  const [filtroHasta, setFiltroHasta] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");

  // ---------- Derivados ----------
  const productosConEstado = useMemo(
    () => productos.map((p) => ({ ...p, ...estadoDeStock(p) })),
    [productos]
  );

  const alertasStock = useMemo(
    () => productosConEstado.filter((p) => p.clase !== "estable"),
    [productosConEstado]
  );

  const totalProductos = productos.length;
  const productosBajoStock = productosConEstado.filter((p) => p.clase === "bajo-stock").length;
  const productosAgotados = productosConEstado.filter((p) => p.clase === "agotado").length;
  const movimientosRecientes = movimientos.length;

  const RESUMEN = [
    { titulo: "Total de productos", valor: totalProductos },
    { titulo: "Productos bajo stock", valor: productosBajoStock, tipo: "warning" },
    { titulo: "Productos agotados", valor: productosAgotados, tipo: "danger" },
    { titulo: "Movimientos recientes", valor: movimientosRecientes },
  ];

  const productoAlerta = productos.find((p) => String(p.id) === String(productoAlertaId));

  const movimientosFiltrados = useMemo(() => {
    return movimientos.filter((mov) => {
      if (filtroTipo !== "todos" && mov.tipo !== filtroTipo) return false;
      const fecha = mov.fecha ? mov.fecha.slice(0, 10) : "";
      if (filtroDesde && fecha < filtroDesde) return false;
      if (filtroHasta && fecha > filtroHasta) return false;
      return true;
    });
  }, [movimientos, filtroDesde, filtroHasta, filtroTipo]);

  // ---------- Acciones ----------
  const verDetalle = (producto) => setProductoSeleccionado(producto);

  const validarLimite = (valor) => {
    const regexEnteroPositivo = /^[1-9]\d*$/;
    const esValido = regexEnteroPositivo.test(valor);
    setLimiteInvalido(!esValido);
    return esValido;
  };

  const manejarCambioLimite = (evento) => {
    const valor = evento.target.value;
    setLimite(valor);
    validarLimite(valor);
  };

  const seleccionarProductoAlerta = (id) => {
    setProductoAlertaId(id);
    const p = productos.find((prod) => String(prod.id) === String(id));
    setLimite(p ? String(p.umbral_minimo) : "");
    setLimiteInvalido(false);
  };

  const exportarReporte = async () => {
    if (alertasStock.length === 0) {
      Swal.fire({
        title: "No se pudo exportar",
        text: "No hay productos en alerta para exportar en este momento.",
        icon: "warning",
        confirmButtonColor: "#a34b73",
        confirmButtonText: "Regresar",
      });
      return;
    }

    setExportando(true);
    try {
      const { error } = await supabase.from("reportes_generados").insert({
        tipo: "Materiales Críticos",
        categoria: formato,
        cantidad: alertasStock.length,
      });
      if (error) throw error;

      Swal.fire({
        title: "¡Reporte generado!",
        text: `El informe de abastecimiento en formato ${formato.toUpperCase()} se ha exportado con éxito.`,
        icon: "success",
        confirmButtonColor: "#7b2cbf",
        confirmButtonText: "Entendido",
      }).then((resultado) => {
        if (resultado.isConfirmed) Modal.getOrCreateInstance("#modalGenerarReporte").hide();
      });
    } catch (error) {
      Swal.fire({
        title: "No se pudo guardar el reporte",
        text: error.message,
        icon: "error",
        confirmButtonColor: "#a34b73",
      });
    } finally {
      setExportando(false);
    }
  };

  const guardarUmbral = async () => {
    if (!productoAlertaId) {
      Swal.fire({ title: "Selecciona un producto", icon: "info", confirmButtonColor: "#7d7dd8" });
      return;
    }
    if (!validarLimite(limite)) return;

    setGuardandoUmbral(true);
    try {
      const { error } = await supabase
        .from("productos")
        .update({ umbral_minimo: Number(limite) })
        .eq("id", productoAlertaId);
      if (error) throw error;

      Swal.fire({
        title: "¡Cambios guardados!",
        text: "El nuevo límite mínimo ha sido configurado correctamente.",
        icon: "success",
        confirmButtonColor: "#7d7dd8",
      });
      Modal.getOrCreateInstance("#modalConfigurarAlerta").hide();
    } catch (error) {
      Swal.fire({ title: "No se pudo guardar", text: error.message, icon: "error", confirmButtonColor: "#a34b73" });
    } finally {
      setGuardandoUmbral(false);
    }
  };

  const abrirUmbralDesdeFicha = () => {
    if (productoSeleccionado) seleccionarProductoAlerta(productoSeleccionado.id);

    const detalle = Modal.getOrCreateInstance("#modalDetalleProducto");
    const elDetalle = document.getElementById("modalDetalleProducto");

    const abrirUmbrales = () => {
      Modal.getOrCreateInstance("#modalConfigurarAlerta").show();
      elDetalle.removeEventListener("hidden.bs.modal", abrirUmbrales);
    };

    elDetalle.addEventListener("hidden.bs.modal", abrirUmbrales);
    detalle.hide();
  };

  return (
    <>
      <h2 className="titulo-panel mb-4">Panel de Control</h2>

      {errorProductos && (
        <div className="alert alert-danger">
          No se pudo conectar con Supabase / tabla "productos": {errorProductos}
        </div>
      )}

      {/* TARJETAS DE RESUMEN */}
      <section className="targetas-panel mb-4">
        <div className="row g-3 w-100 m-0">
          {RESUMEN.map((tarjeta) => (
            <div className="col-12 col-sm-6 col-xl-3" key={tarjeta.titulo}>
              <div className={`bloque-targeta${tarjeta.tipo ? ` tarjeta-alerta-${tarjeta.tipo}` : ""}`}>
                <p className="m-0">{tarjeta.titulo}</p>
                <h3>{cargandoProductos || cargandoMovimientos ? "…" : tarjeta.valor}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TABLA ALERTAS DE STOCK */}
      <section className="tabla-stock mb-5">
        <h3 className="titulo-alertas mb-3">Alertas de Stock</h3>
        <div className="table-responsive bg-white rounded-3 p-3 shadow-sm border">
          <table id="tablaProductos" className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th><i className="fa-solid fa-box me-1"></i> Producto</th>
                <th><i className="fa-solid fa-layer-group me-1"></i> Categoría</th>
                <th className="text-start"><i className="fa-solid fa-cubes me-1"></i> Stock Actual</th>
                <th><i className="fa-solid fa-triangle-exclamation me-1"></i> Estado</th>
                <th className="text-center"><i className="fa-solid fa-gear me-1"></i> Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargandoProductos ? (
                <tr><td colSpan={5} className="text-center py-4">Cargando productos…</td></tr>
              ) : alertasStock.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-4 text-muted">Sin alertas de stock por el momento.</td></tr>
              ) : (
                alertasStock.map((fila) => (
                  <tr key={fila.id}>
                    <td className="fw-bold">{fila.nombre}</td>
                    <td>{fila.categoria}</td>
                    <td className="text-start">{fila.stock_actual}</td>
                    <td><span className={`badge-stock ${fila.clase}`}>{fila.etiqueta}</span></td>
                    <td className="text-center">
                      <button
                        className="btn-detalle"
                        data-bs-toggle="modal"
                        data-bs-target="#modalDetalleProducto"
                        onClick={() => verDetalle(fila)}
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

      {/* OPCIONES RÁPIDAS */}
      <section className="opciones-rapidas mb-4">
        <h3 className="titulo-opciones mb-3">Opciones Rápidas</h3>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="d-flex gap-3 flex-wrap">
            <button
              id="btnGenerarReporte"
              className="btn-rapido btn-naranja"
              data-bs-toggle="modal"
              data-bs-target="#modalGenerarReporte"
            >
              <i className="bi bi-file-earmark-pdf me-1"></i> Reporte Materiales Críticos
            </button>
            <button
              className="btn-rapido btn-dark-custom"
              data-bs-toggle="modal"
              data-bs-target="#modalConfigurarAlerta"
              onClick={() => seleccionarProductoAlerta(productos[0]?.id || "")}
            >
              <i className="bi bi-sliders me-1"></i> Configurar Alerta
            </button>
          </div>

          <button
            id="btnHistorialMovimientos"
            className="btn-rapido btn-historial"
            data-bs-toggle="modal"
            data-bs-target="#modalHistorialMovimientos"
          >
            Historial de Movimientos <i className="bi bi-search ms-2"></i>
          </button>
        </div>
      </section>

      {/* MODAL DETALLE PRODUCTO */}
      <div className="modal fade" id="modalDetalleProducto" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content shadow-lg border-0">
            <div className="modal-header encabezado-ficha">
              <div className="titulo-ficha d-flex align-items-center gap-2">
                <i className="fa-solid fa-screwdriver-wrench text-warning fs-3"></i>
                <h4 className="m-0 text-white fw-bold">
                  Ficha Técnica: {productoSeleccionado?.nombre || "Producto"}
                </h4>
              </div>
              <img src={logo} alt="Logo Kronos" className="logo-modal" />
            </div>

            <div className="modal-body bg-light p-4">
              <div className="row g-4 text-dark mb-4">
                <div className="col-12 col-md-6">
                  <p className="mb-1 text-muted small fw-bold">CÓDIGO</p>
                  <p className="fw-semibold fs-6">{productoSeleccionado?.codigo || "—"}</p>

                  <p className="mb-1 text-muted small fw-bold">CATEGORÍA</p>
                  <p className="fw-semibold fs-6">{productoSeleccionado?.categoria || "—"}</p>

                  <p className="mb-1 text-muted small fw-bold">UBICACIÓN EN BODEGA</p>
                  <p className="fw-semibold fs-6">{productoSeleccionado?.ubicacion || "—"}</p>
                </div>

                <div className="col-12 col-md-6">
                  <p className="mb-1 text-muted small fw-bold">PRECIO UNITARIO</p>
                  <p className="fw-semibold fs-6 text-success">
                    {productoSeleccionado?.precio != null
                      ? `$${Number(productoSeleccionado.precio).toLocaleString("es-CO")} COP`
                      : "—"}
                  </p>

                  <p className="mb-1 text-muted small fw-bold">UMBRAL MÍNIMO</p>
                  <p className="fw-semibold fs-6">{productoSeleccionado?.umbral_minimo ?? "—"}</p>
                </div>
              </div>

              <div className="panel-estado p-3 rounded-3 mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                  <h6 className="text-primary mb-1 fw-bold">Estado Actual de Inventario</h6>
                  <span className="fw-bold fs-5">
                    Stock Físico: {productoSeleccionado?.stock_actual ?? "—"} unidades
                  </span>
                </div>

                {productoSeleccionado && (
                  <span className={`badge-stock ${estadoDeStock(productoSeleccionado).clase} m-0`}>
                    {estadoDeStock(productoSeleccionado).etiqueta}
                  </span>
                )}

                <button
                  className="btn btn-dark btn-sm rounded-2"
                  id="btnModificarUmbralFicha"
                  onClick={abrirUmbralDesdeFicha}
                >
                  <i className="fa-solid fa-lock me-1"></i> Modificar Umbral
                </button>
              </div>
            </div>

            <div className="modal-footer border-0">
              <button type="button" className="btn btn-secondary rounded-2" data-bs-dismiss="modal">Cerrar Detalles</button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL GENERAR INFORMES */}
      <div className="modal fade" id="modalGenerarReporte" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content modal-content-reporte">
            <div className="modal-header header-reporte bg-white border-bottom py-3 px-4 justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-3">
                <i className="bi bi-printer text-warning fs-2"></i>
                <h4 className="titulo-reporte m-0 text-dark fw-bold">Generación de Informes de Abastecimiento</h4>
              </div>
              <img src={logo} alt="Logo" className="logo-modal-reporte" style={{ width: 150 }} />
            </div>

            <div className="modal-body body-reporte bg-white border-0 px-4 py-4">
              <div className="contenedor-vista-previa p-4 mb-4 rounded-3">
                <h5 className="titulo-vista-previa mb-2 font-accent">Vista Previa de Ítems en Alerta</h5>
                <p className="text-muted mb-3 small">El sistema ha filtrado automáticamente productos con stock bajo o agotado.</p>

                <table className="table table-hover align-middle table-preview mb-0 border">
                  <thead>
                    <tr>
                      <th>Nombre del Producto</th>
                      <th>Stock</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alertasStock.length === 0 ? (
                      <tr><td colSpan={3} className="text-center text-muted py-3">No hay materiales en alerta activa.</td></tr>
                    ) : (
                      alertasStock.map((item) => (
                        <tr key={item.id}>
                          <td>{item.nombre}</td>
                          <td>{item.stock_actual}</td>
                          <td><span className={`badge-stock ${item.clase} m-0`}>{item.etiqueta}</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="seccion-formatos mb-4 text-center">
                <p className="formato-descarga fw-bold mb-3">Seleccione el formato de descarga:</p>
                <div className="d-flex justify-content-center gap-4 my-3">
                  <div
                    className={`opcion-formato p-3 border rounded-3 text-center${formato === "pdf" ? " opcion-formato-seleccionada" : ""}`}
                    data-formato="pdf"
                    onClick={() => setFormato("pdf")}
                  >
                    <i className="bi bi-filetype-pdf text-danger display-5 d-block"></i>
                    <span className="mt-2 fw-semibold d-block small">Descargar en PDF</span>
                  </div>

                  <div
                    className={`opcion-formato p-3 border rounded-3 text-center${formato === "excel" ? " opcion-formato-seleccionada" : ""}`}
                    data-formato="excel"
                    onClick={() => setFormato("excel")}
                  >
                    <i className="bi bi-filetype-xlsx text-success display-5 d-block"></i>
                    <span className="mt-2 fw-semibold d-block small">Descargar en Excel</span>
                  </div>
                </div>
              </div>

              <div className="alert alert-warning d-flex align-items-center py-2 px-3 m-0 rounded-3 small" role="alert">
                <i className="bi bi-info-circle-fill me-2 fs-5"></i>
                <div>Si no hay materiales en alerta activa, no se emitirá reporte de abastecimiento.</div>
              </div>
            </div>

            <div className="modal-footer footer-reporte bg-white border-top px-4 py-3 d-flex justify-content-between align-items-center">
              <button type="button" className="btn btn-naranja py-2 px-4 fw-bold" onClick={exportarReporte} disabled={exportando}>
                {exportando ? "Exportando…" : "Exportar Documento"}
              </button>
              <button type="button" className="btn btn-light py-2 px-3 text-muted" data-bs-dismiss="modal">Cancelar</button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL UMBRALES DE ALERTA */}
      <div className="modal fade" id="modalConfigurarAlerta" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content modal-content-umbrales">
            <div className="modal-header header-umbrales py-3 px-4 justify-content-between align-items-center">
              <h5 className="titulo-umbrales m-0 fw-bold text-white">Umbrales de Alerta de Inventario</h5>
              <img src={logo} alt="Logo" className="logo-modal-umbrales" style={{ width: 140 }} />
            </div>

            <div className="modal-body body-umbrales bg-white px-4 py-4">
              <div className="mb-4">
                <label htmlFor="selectProductoAlerta" className="form-label label-seccion-umbrales fw-bold">Seleccionar Producto Registrado:</label>
                <select
                  className="form-select select-custom-umbrales"
                  id="selectProductoAlerta"
                  value={productoAlertaId}
                  onChange={(e) => seleccionarProductoAlerta(e.target.value)}
                >
                  <option value="" disabled>Selecciona un producto…</option>
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="contenedor-estado-actual p-3 mb-4 rounded-3 border">
                <p className="mb-1">
                  Stock actual en bodega: <span className="fw-bold text-dark">{productoAlerta?.stock_actual ?? "—"} unidades</span>
                </p>
                <p className="mb-0">
                  Estado actual:{" "}
                  <span className="fw-bold text-warning">
                    {productoAlerta ? estadoDeStock(productoAlerta).etiqueta : "—"}
                  </span>
                </p>
              </div>

              <div className="mb-4">
                <label htmlFor="inputNuevoLimite" className="form-label label-seccion-umbrales fw-bold">Nuevo Límite Mínimo Permitido</label>
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="number"
                    className={`form-control form-input-umbrales${limiteInvalido ? " is-invalid-custom" : ""}`}
                    id="inputNuevoLimite"
                    value={limite}
                    min="1"
                    onChange={manejarCambioLimite}
                  />
                </div>
                {limiteInvalido && (
                  <div id="errorLimite" className="text-danger small mt-2">
                    Ingresa un número entero positivo mayor a cero.
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer footer-umbrales border-top px-4 py-3 bg-white d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" className="btn btn-naranja fw-bold btn-guardar-umbrales" onClick={guardarUmbral} disabled={guardandoUmbral}>
                {guardandoUmbral ? "Guardando…" : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL HISTORIAL DE MOVIMIENTOS */}
      <div className="modal fade" id="modalHistorialMovimientos" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content modal-content-historial">
            <div className="modal-header header-historial py-3 px-4 justify-content-between align-items-center">
              <h5 className="m-0 fw-bold text-white">Historial de Movimientos</h5>
              <img src={logo} alt="Logo" className="logo-modal-historial" style={{ width: 140 }} />
            </div>

            <div className="modal-body bg-white px-4 pt-4 pb-3">
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <label className="form-label fw-bold">Desde:</label>
                  <input type="date" className="form-control input-fecha-custom" value={filtroDesde} onChange={(e) => setFiltroDesde(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold">Hasta:</label>
                  <input type="date" className="form-control input-fecha-custom" value={filtroHasta} onChange={(e) => setFiltroHasta(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold">Tipo:</label>
                  <select className="form-select" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                    <option value="todos">Todos</option>
                    <option value="entrada">Entradas</option>
                    <option value="salida">Salidas</option>
                  </select>
                </div>
              </div>

              <div className="table-responsive border rounded-3 mb-3">
                <table className="table table-hover align-middle table-historial-content mb-0">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Tipo Movimiento</th>
                      <th>Cantidad</th>
                      <th>Motivo</th>
                      <th>Responsable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cargandoMovimientos ? (
                      <tr><td colSpan={5} className="text-center py-4">Cargando movimientos…</td></tr>
                    ) : movimientosFiltrados.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-4 text-muted">Sin movimientos para el filtro seleccionado.</td></tr>
                    ) : (
                      movimientosFiltrados.map((mov) => (
                        <tr key={mov.id} data-tipo={mov.tipo}>
                          <td>{mov.fecha ? new Date(mov.fecha).toLocaleString("es-CO") : "—"}</td>
                          <td className={`fw-bold ${mov.tipo === "entrada" ? "text-success" : "text-danger"}`}>
                            <i className={`bi ${mov.tipo === "entrada" ? "bi-arrow-up-circle" : "bi-arrow-down-circle"} me-1`}></i>
                            {mov.tipo === "entrada" ? " Entrada" : " Salida"}
                          </td>
                          <td>{mov.cantidad}</td>
                          <td>{mov.motivo}</td>
                          <td>{mov.responsable}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer border-top px-4 py-3 bg-white">
              <button type="button" className="btn btn-dark" data-bs-dismiss="modal">Volver al Panel</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default E_panel;
