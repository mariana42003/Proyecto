import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../assets/css/D_garantiaCliente.css";
import logoImg from "../../assets/img/logo.png";

// ─── IMPORTACIÓN DE IMÁGENES LOCALES ─────────────────────────────────────────
import amoladora from "../../assets/img/AmoladoraesEsmeril.jpeg";
import cajaHerramientas from "../../assets/img/Caja de Herramientas Grande.jpg";
import herramientas from "../../assets/img/herramientas.jpeg";
import kitHerramientas from "../../assets/img/Kit herramientas.jpeg";
import pulidora from "../../assets/img/Pulidora.jpeg";
import pulidora2 from "../../assets/img/Pulidora2.jpeg";
import setBrocas from "../../assets/img/Setbrocas.jpg";
import taladroElectrico from "../../assets/img/Taladro Electrico.webp";
import taladroInalambrico from "../../assets/img/TaladroInalambrico20V.jpg";

const IMAGENES_EVIDENCIA = [
  { nombre: "AmoladoraesEsmeril.jpeg", src: amoladora, label: "Amoladora / Esmeril" },
  { nombre: "Caja de Herramientas Grande.jpg", src: cajaHerramientas, label: "Caja de Herramientas" },
  { nombre: "herramientas.jpeg", src: herramientas, label: "Herramientas Varias" },
  { nombre: "Kit herramientas.jpeg", src: kitHerramientas, label: "Kit de Herramientas" },
  { nombre: "Pulidora.jpeg", src: pulidora, label: "Pulidora Principal" },
  { nombre: "Pulidora2.jpeg", src: pulidora2, label: "Pulidora Secundaria" },
  { nombre: "Setbrocas.jpg", src: setBrocas, label: "Set de Brocas" },
  { nombre: "Taladro Electrico.webp", src: taladroElectrico, label: "Taladro Eléctrico" },
  { nombre: "TaladroInalambrico20V.jpg", src: taladroInalambrico, label: "Taladro Inalámbrico 20V" }
];

const getSrcByNombre = (nombre) => IMAGENES_EVIDENCIA.find((i) => i.nombre === nombre)?.src;

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Cliente simulado en sesión
const CLIENTE_AUTENTICADO = {
  id: "cli-101",
  nombre: "Juan Pérez",
  correo: "juan.perez@example.com"
};

const TIPOS_FALLA = ["Eléctrico", "Mecánico", "Daño físico", "Faltan piezas"];

export default function D_garantiasCliente() {
  const navigate = useNavigate();

  // Estados de consulta y listado
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  // Modales
  const [modalNueva, setModalNueva] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(null);
  const [modalEdicion, setModalEdicion] = useState(null);
  const [modalCancelar, setModalCancelar] = useState(null);

  // Estado del Formulario Nueva Solicitud
  const [numFacturaInput, setNumFacturaInput] = useState("");
  const [facturaValidada, setFacturaValidada] = useState(null);
  const [productosFactura, setProductosFactura] = useState([]);
  const [productoSel, setProductoSel] = useState(null);
  const [fallaSel, setFallaSel] = useState("");
  const [motivo, setMotivo] = useState("");
  const [observacion, setObservacion] = useState("");
  const [imagenSel, setImagenSel] = useState("");
  const [correoEdit, setCorreoEdit] = useState(CLIENTE_AUTENTICADO.correo);

  // Estado de mensajes y carga interna
  const [msjValidacion, setMsjValidacion] = useState("");
  const [validandoFactura, setValidandoFactura] = useState(false);
  const [enviandoForm, setEnviandoForm] = useState(false);

  // ── Cargar Garantías del Cliente ─────────────────────────────────────────
  const cargarSolicitudes = useCallback(async () => {
    setCargando(true);
    setErrorGlobal("");
    try {
      const res = await axios.get(`${API_BASE}/garantias?cliente_id=${CLIENTE_AUTENTICADO.id}`);
      setSolicitudes(res.data);
    } catch (err) {
      setErrorGlobal("Error al conectar con el servidor de garantías.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarSolicitudes();
  }, [cargarSolicitudes]);

  // ── Validar Factura contra Ventas ────────────────────────────────────────
  const handleValidarFactura = async () => {
    if (!numFacturaInput.trim()) {
      setMsjValidacion("Ingrese un número de factura válido.");
      return;
    }
    setValidandoFactura(true);
    setMsjValidacion("");
    setFacturaValidada(null);
    setProductosFactura([]);
    setProductoSel(null);

    try {
      const resVentas = await axios.get(`${API_BASE}/ventas?numero_factura=${numFacturaInput.trim()}`);
      
      if (resVentas.data.length === 0) {
        setMsjValidacion("La factura ingresada no existe en el sistema.");
        return;
      }

      const venta = resVentas.data[0];

      if (venta.cliente_id !== CLIENTE_AUTENTICADO.id) {
        setMsjValidacion("La factura ingresada no pertenece a su cuenta de cliente.");
        return;
      }

      const resDetalles = await axios.get(`${API_BASE}/detalle_ventas?numero_factura=${venta.numero_factura}`);

      if (resDetalles.data.length === 0) {
        setMsjValidacion("La factura no tiene productos registrados elegibles para garantía.");
        return;
      }

      setFacturaValidada(venta);
      setProductosFactura(resDetalles.data);
      setMsjValidacion("Factura validada correctamente.");
    } catch (err) {
      setMsjValidacion("Error de comunicación al validar la factura.");
    } finally {
      setValidandoFactura(false);
    }
  };

  const handleSeleccionarProducto = (e) => {
    const prodNombre = e.target.value;
    const prod = productosFactura.find((p) => p.producto === prodNombre);
    setProductoSel(prod || null);
  };

  // ── Crear Solicitud ──────────────────────────────────────────────────────
  const handleGuardarSolicitud = async (e) => {
    e.preventDefault();
    if (!facturaValidada || !productoSel || !fallaSel || !motivo.trim() || !imagenSel) {
      alert("Por favor complete todos los campos obligatorios y seleccione la evidencia.");
      return;
    }

    setEnviandoForm(true);
    const fechaAhora = new Date().toISOString();
    const numSolicitud = `SOL-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const nuevaSolicitud = {
      id: `GAR-${Date.now()}`,
      tipo: "Cliente",
      numero_orden: numSolicitud,
      numero_solicitud: numSolicitud,
      cliente_destino: CLIENTE_AUTENTICADO.nombre,
      cliente_nombre: CLIENTE_AUTENTICADO.nombre,
      cliente_id: CLIENTE_AUTENTICADO.id,
      correo: correoEdit,
      numero_factura: facturaValidada.numero_factura,
      producto: productoSel.producto,
      precio: productoSel.precio,
      tipo_falla: fallaSel,
      motivo: motivo.trim(),
      observacion_inicial: observacion.trim(),
      observacion_actual: "",
      imagen_nombre: imagenSel,
      estado: "Pendiente",
      fecha_creacion: fechaAhora,
      fecha_finalizacion: null,
      observaciones: [
        {
          id: `obs-${Date.now()}`,
          texto: observacion.trim() || "Solicitud registrada por el cliente.",
          autor: "Cliente",
          fecha: fechaAhora
        }
      ],
      bitacora: [
        {
          id: `bit-${Date.now()}`,
          accion: "Creación de Solicitud",
          estado: "Pendiente",
          fecha: fechaAhora,
          detalle: "Solicitud radicada en el portal de cliente."
        }
      ]
    };

    try {
      await axios.post(`${API_BASE}/garantias`, nuevaSolicitud);
      alert(`Solicitud ${numSolicitud} radicada exitosamente.`);
      cerrarModalNueva();
      cargarSolicitudes();
    } catch (err) {
      alert("No se pudo radicar la solicitud.");
    } finally {
      setEnviandoForm(false);
    }
  };

  const cerrarModalNueva = () => {
    setModalNueva(false);
    setNumFacturaInput("");
    setFacturaValidada(null);
    setProductosFactura([]);
    setProductoSel(null);
    setFallaSel("");
    setMotivo("");
    setObservacion("");
    setImagenSel("");
    setMsjValidacion("");
  };

  // ── Editar Solicitud (Estado Pendiente) ──────────────────────────────────
  const handleGuardarEdicion = async (e) => {
    e.preventDefault();
    if (!modalEdicion) return;

    const fechaAhora = new Date().toISOString();
    const nuevasObs = [...(modalEdicion.observaciones || [])];
    if (observacion.trim()) {
      nuevasObs.push({
        id: `obs-${Date.now()}`,
        texto: observacion.trim(),
        autor: "Cliente",
        fecha: fechaAhora
      });
    }

    const nuevaBitacora = [
      ...(modalEdicion.bitacora || []),
      {
        id: `bit-${Date.now()}`,
        accion: "Actualización de Solicitud",
        estado: modalEdicion.estado,
        fecha: fechaAhora,
        detalle: "El cliente actualizó el motivo/evidencia de la solicitud."
      }
    ];

    const payload = {
      motivo: motivo.trim(),
      observacion_inicial: observacion.trim(),
      imagen_nombre: imagenSel,
      observaciones: nuevasObs,
      bitacora: nuevaBitacora
    };

    try {
      await axios.patch(`${API_BASE}/garantias/${modalEdicion.id}`, payload);
      alert("Solicitud actualizada correctamente.");
      setModalEdicion(null);
      cargarSolicitudes();
    } catch (err) {
      alert("Error al actualizar la solicitud.");
    }
  };

  // ── Cancelar Solicitud ───────────────────────────────────────────────────
  const handleConfirmarCancelacion = async () => {
    if (!modalCancelar) return;

    const fechaAhora = new Date().toISOString();
    const payload = {
      estado: "Cancelado",
      bitacora: [
        ...(modalCancelar.bitacora || []),
        {
          id: `bit-${Date.now()}`,
          accion: "Cancelación de Solicitud",
          estado: "Cancelado",
          fecha: fechaAhora,
          detalle: "El cliente canceló la solicitud de garantía."
        }
      ]
    };

    try {
      await axios.patch(`${API_BASE}/garantias/${modalCancelar.id}`, payload);
      alert("La solicitud ha sido cancelada.");
      setModalCancelar(null);
      cargarSolicitudes();
    } catch (err) {
      alert("Error al cancelar la solicitud.");
    }
  };

  // ── Filtrado Frontend ────────────────────────────────────────────────────
  const solicitudesFiltradas = solicitudes.filter((s) => {
    if (s.estado === "Cancelado") return false;

    const coincideEstado = filtroEstado === "todos" || s.estado.toLowerCase() === filtroEstado.toLowerCase();
    const q = busqueda.toLowerCase();
    const coincideBusqueda =
      s.numero_orden?.toLowerCase().includes(q) ||
      s.numero_solicitud?.toLowerCase().includes(q) ||
      s.numero_factura?.toLowerCase().includes(q) ||
      s.producto?.toLowerCase().includes(q);

    return coincideEstado && coincideBusqueda;
  });

  return (
    <div className="gk-root">
      {/* ── BARRA SUPERIOR (HEADER) CONSERVADA ────────────────────────────── */}
      <header className="sticky-top shadow-sm">
        <nav className="gk-navbar navbar navbar-expand-lg py-2">
          <div className="container-fluid px-3 px-md-4 d-flex align-items-center justify-content-between">
            <a href="/" className="navbar-brand d-flex align-items-center gap-2 m-0 p-0">
              <img src={logoImg} alt="Logo Kronos" className="gk-logo" />
            </a>

            <button
              className="navbar-toggler border-0 shadow-none"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#gkMenu"
              aria-controls="gkMenu"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse mt-3 mt-lg-0" id="gkMenu">
              <div className="ms-auto d-flex flex-column flex-lg-row align-items-lg-center gap-2 gap-lg-3 w-100 justify-content-end">
                <ul className="navbar-nav align-items-lg-center gap-2 gap-lg-3 m-0 p-0">
                  <li className="nav-item">
                    <button className="btn btn-outline-secondary" type="button" onClick={() => navigate("/cliente/pedidos")}>
                      <i className="bi bi-box-seam me-2"></i>Mis pedidos
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className="gk-btn-cart nav-link d-flex align-items-center justify-content-center rounded px-3 py-2"
                      onClick={() => navigate("/")}
                      title="Volver a la tienda"
                    >
                      <i className="bi bi-shop me-2 me-lg-0"></i>
                      <span className="d-lg-none fw-bold ms-2">Ir a la tienda</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* ── CONTENIDO PRINCIPAL ────────────────────────────────────────────── */}
      <main className="container-fluid px-3 px-md-4 mt-4 mb-5">
        <div className="row g-4">
          {/* ── BARRA LATERAL (ASIDE) CONSERVADA ──────────────────────────── */}
          <aside className="col-12 col-lg-3 col-xl-2 d-flex flex-column gap-3">
            <div className="d-grid gap-2 d-md-flex d-lg-grid">
              <button className="btn btn-outline-secondary text-start flex-fill" onClick={() => navigate("/")}>
                <i className="bi bi-tag-fill me-2"></i>Categorías
              </button>
              <button className="btn btn-outline-secondary text-start flex-fill" onClick={() => navigate("/cliente/pedidos")}>
                <i className="bi bi-box-seam-fill me-2"></i>Mis pedidos
              </button>
              <button className="btn gk-btn-sidebar text-start flex-fill active">
                <i className="fa-solid fa-shield me-2"></i>Garantías
              </button>
            </div>

            <div className="gk-info-box">
              <span className="fw-bold fs-6 mb-1 d-block gk-moro">Información</span>
              <a href="#">Política de privacidad</a>
              <a href="#">Términos y condiciones</a>
              <a href="#">Contáctenos</a>
            </div>
          </aside>

          {/* ── CUADRO CENTRAL (SECCIÓN PRINCIPAL REEMPLAZADA) ─────────────── */}
          <section className="gk-section col-12 col-lg-9 col-xl-10 bg-white shadow-sm rounded-3 p-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
              <h1 className="gk-moro fw-bold h3 m-0">Mis Solicitudes de Garantía</h1>
              <button className="btn gk-btn-primary px-3 py-2" onClick={() => setModalNueva(true)}>
                <i className="fa-solid fa-plus me-1"></i>Nueva Solicitud
              </button>
            </div>

            {/* BUSCADOR Y FILTROS */}
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por N° solicitud, factura o producto..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <div className="col-12 col-md-6 d-flex gap-2">
                {["todos", "Pendiente", "Aprobado", "Rechazado"].map((est) => (
                  <button
                    key={est}
                    className={`btn btn-sm ${filtroEstado === est ? "btn-dark" : "btn-outline-dark"}`}
                    onClick={() => setFiltroEstado(est)}
                  >
                    {est.charAt(0).toUpperCase() + est.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* TABLA DE SOLICITUDES */}
            {cargando ? (
              <p className="text-center py-4">Cargando solicitudes...</p>
            ) : errorGlobal ? (
              <p className="text-center text-danger py-4">{errorGlobal}</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>N.º Solicitud</th>
                      <th>N.º Factura</th>
                      <th>Producto</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitudesFiltradas.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-4">
                          No se encontraron solicitudes activas.
                        </td>
                      </tr>
                    ) : (
                      solicitudesFiltradas.map((s) => (
                        <tr key={s.id}>
                          <td className="fw-bold">{s.numero_solicitud}</td>
                          <td>{s.numero_factura}</td>
                          <td>{s.producto}</td>
                          <td>{new Date(s.fecha_creacion).toLocaleDateString()}</td>
                          <td>
                            <span
                              className={`badge ${
                                s.estado === "Pendiente"
                                  ? "bg-warning text-dark"
                                  : s.estado === "Aprobado"
                                  ? "bg-success"
                                  : "bg-danger"
                              }`}
                            >
                              {s.estado}
                            </span>
                          </td>
                          <td className="text-center">
                            <button
                              className="btn btn-sm btn-outline-primary me-1"
                              onClick={() => setModalDetalle(s)}
                            >
                              Ver Detalle
                            </button>
                            {s.estado === "Pendiente" && (
                              <>
                                <button
                                  className="btn btn-sm btn-outline-secondary me-1"
                                  onClick={() => {
                                    setModalEdicion(s);
                                    setMotivo(s.motivo);
                                    setObservacion(s.observacion_inicial || "");
                                    setImagenSel(s.imagen_nombre);
                                  }}
                                >
                                  Editar
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => setModalCancelar(s)}
                                >
                                  Cancelar
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ── MODAL NUEVA SOLICITUD ────────────────────────────────────────────── */}
      {modalNueva && (
        <div className="gk-modal-overlay">
          <div className="gk-modal gk-modal-responsive">
            <form onSubmit={handleGuardarSolicitud} className="gk-modal-form">
              
              {/* Cabecera Fija */}
              <div className="gk-modal-header">
                <h5 className="m-0 text-white">Nueva Solicitud de Garantía</h5>
                <button type="button" className="gk-modal-close" onClick={cerrarModalNueva}>✕</button>
              </div>

              {/* Cuerpo Desplazable (Scroll) */}
              <div className="gk-modal-body">
                {/* Datos Autenticados */}
                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold small">Cliente</label>
                    <input type="text" className="form-control" value={CLIENTE_AUTENTICADO.nombre} disabled />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small">Correo Electrónico</label>
                    <input
                      type="email"
                      className="form-control"
                      value={correoEdit}
                      onChange={(e) => setCorreoEdit(e.target.value)}
                    />
                  </div>
                </div>

                {/* Validación Factura */}
                <div className="border p-3 rounded bg-light mb-3">
                  <label className="form-label fw-bold small">N.º Factura de Compra *</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej: FAC-2026-001"
                      value={numFacturaInput}
                      onChange={(e) => setNumFacturaInput(e.target.value)}
                      disabled={!!facturaValidada}
                    />
                    {!facturaValidada ? (
                      <button
                        type="button"
                        className="btn btn-dark"
                        onClick={handleValidarFactura}
                        disabled={validandoFactura}
                      >
                        {validandoFactura ? "Validando..." : "Validar"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setFacturaValidada(null);
                          setProductosFactura([]);
                          setProductoSel(null);
                        }}
                      >
                        Cambiar
                      </button>
                    )}
                  </div>
                  {msjValidacion && (
                    <p className={`small mt-1 mb-0 ${facturaValidada ? "text-success" : "text-danger"}`}>
                      {msjValidacion}
                    </p>
                  )}
                </div>

                {/* Selección Producto y Campos adicionales */}
                {facturaValidada && (
                  <div className="d-flex flex-column gap-3">
                    <div className="row g-2">
                      <div className="col-md-8">
                        <label className="form-label fw-bold small">Producto Elegible *</label>
                        <select className="form-select" onChange={handleSeleccionarProducto} required>
                          <option value="">Seleccione un producto...</option>
                          {productosFactura.map((p) => (
                            <option key={p.id} value={p.producto}>
                              {p.producto}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-bold small">Precio (COP)</label>
                        <input
                          type="text"
                          className="form-control"
                          value={productoSel ? `$ ${productoSel.precio.toLocaleString()}` : "$ 0"}
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="row g-2">
                      <div className="col-md-6">
                        <label className="form-label fw-bold small">Tipo de Falla *</label>
                        <select
                          className="form-select"
                          value={fallaSel}
                          onChange={(e) => setFallaSel(e.target.value)}
                          required
                        >
                          <option value="">Seleccione tipo...</option>
                          {TIPOS_FALLA.map((tf) => (
                            <option key={tf} value={tf}>{tf}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="form-label fw-bold small">Motivo del Reclamo *</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="form-label fw-bold small">Observación Inicial (Opcional)</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={observacion}
                        onChange={(e) => setObservacion(e.target.value)}
                      />
                    </div>

                    {/* Selector Visual de Evidencia */}
                    <div>
                      <label className="form-label fw-bold small">Seleccionar Imagen de Evidencia *</label>
                      <div className="d-flex gap-2 flex-wrap gk-img-scroll">
                        {IMAGENES_EVIDENCIA.map((img) => (
                          <div
                            key={img.nombre}
                            onClick={() => setImagenSel(img.nombre)}
                            style={{
                              border: imagenSel === img.nombre ? "2px solid #7a61e6" : "1px solid #ccc",
                              borderRadius: "6px",
                              padding: "4px",
                              cursor: "pointer",
                              width: "80px",
                              textAlign: "center"
                            }}
                          >
                            <img src={img.src} alt={img.label} style={{ width: "100%", height: "50px", objectFit: "cover" }} />
                            <span style={{ fontSize: "0.65rem" }} className="d-block text-truncate">{img.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Pie de página Fijo */}
              <div className="gk-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={cerrarModalNueva}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-dark" disabled={!facturaValidada || enviandoForm}>
                  {enviandoForm ? "Radicando..." : "Radicar Solicitud"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ── MODAL DETALLE ────────────────────────────────────────────────────── */}
      {modalDetalle && (
        <div className="gk-modal-overlay">
          <div className="gk-modal" style={{ maxWidth: "650px" }}>
            <div className="gk-modal-header">
              <h5 className="m-0">Detalle de Solicitud - {modalDetalle.numero_solicitud}</h5>
              <button className="gk-modal-close" onClick={() => setModalDetalle(null)}>✕</button>
            </div>
            <div className="gk-modal-body d-flex flex-column gap-3">
              <div className="row g-2 small">
                <div className="col-6"><strong>Factura:</strong> {modalDetalle.numero_factura}</div>
                <div className="col-6"><strong>Estado:</strong> {modalDetalle.estado}</div>
                <div className="col-6"><strong>Producto:</strong> {modalDetalle.producto}</div>
                <div className="col-6"><strong>Precio:</strong> $ {modalDetalle.precio?.toLocaleString()}</div>
                <div className="col-6"><strong>Tipo Falla:</strong> {modalDetalle.tipo_falla}</div>
                <div className="col-6"><strong>Fecha:</strong> {new Date(modalDetalle.fecha_creacion).toLocaleString()}</div>
              </div>

              <div>
                <strong>Motivo:</strong>
                <p className="bg-light p-2 rounded small m-0">{modalDetalle.motivo}</p>
              </div>

              <div>
                <strong>Evidencia Adjunta:</strong>
                <div className="mt-2">
                  {getSrcByNombre(modalDetalle.imagen_nombre) ? (
                    <img
                      src={getSrcByNombre(modalDetalle.imagen_nombre)}
                      alt="Evidencia"
                      style={{ maxWidth: "200px", borderRadius: "6px" }}
                    />
                  ) : (
                    <span className="text-muted small">Sin imagen asociada</span>
                  )}
                </div>
              </div>

              <div>
                <strong>Historial / Bitácora:</strong>
                <ul className="list-group list-group-flush small mt-1">
                  {(modalDetalle.bitacora || []).map((b) => (
                    <li key={b.id} className="list-group-item px-0">
                      <span className="fw-bold">{b.accion}</span> - {b.estado} <br />
                      <span className="text-muted">{new Date(b.fecha).toLocaleString()} - {b.detalle}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="gk-modal-footer">
              <button className="btn btn-secondary" onClick={() => setModalDetalle(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL EDICIÓN ────────────────────────────────────────────────────── */}
      {modalEdicion && (
        <div className="gk-modal-overlay">
          <div className="gk-modal" style={{ maxWidth: "600px" }}>
            <div className="gk-modal-header">
              <h5 className="m-0">Modificar Solicitud {modalEdicion.numero_solicitud}</h5>
              <button className="gk-modal-close" onClick={() => setModalEdicion(null)}>✕</button>
            </div>
            <form onSubmit={handleGuardarEdicion}>
              <div className="gk-modal-body d-flex flex-column gap-3">
                <div>
                  <label className="form-label fw-bold small">Motivo del Reclamo *</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label fw-bold small">Agregar Observación</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label fw-bold small">Cambiar Imagen Evidencia</label>
                  <div className="d-flex gap-2 flex-wrap" style={{ maxHeight: "120px", overflowY: "auto" }}>
                    {IMAGENES_EVIDENCIA.map((img) => (
                      <div
                        key={img.nombre}
                        onClick={() => setImagenSel(img.nombre)}
                        style={{
                          border: imagenSel === img.nombre ? "2px solid #0d6efd" : "1px solid #ccc",
                          borderRadius: "6px",
                          padding: "4px",
                          cursor: "pointer",
                          width: "70px",
                          textAlign: "center"
                        }}
                      >
                        <img src={img.src} alt={img.label} style={{ width: "100%", height: "40px", objectFit: "cover" }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="gk-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalEdicion(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-dark">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL CANCELAR ──────────────────────────────────────────────────── */}
      {modalCancelar && (
        <div className="gk-modal-overlay">
          <div className="gk-modal" style={{ maxWidth: "450px" }}>
            <div className="gk-modal-header bg-danger text-white">
              <h5 className="m-0 text-white">Cancelar Solicitud</h5>
              <button className="gk-modal-close text-white" onClick={() => setModalCancelar(null)}>✕</button>
            </div>
            <div className="gk-modal-body">
              <p className="m-0">
                ¿Está seguro de que desea cancelar la solicitud <strong>{modalCancelar.numero_solicitud}</strong>?
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="gk-modal-footer">
              <button className="btn btn-secondary" onClick={() => setModalCancelar(null)}>No, regresar</button>
              <button className="btn btn-danger" onClick={handleConfirmarCancelacion}>Sí, Cancelar Solicitud</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}