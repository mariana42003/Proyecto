import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../../assets/css/D_garantia-cliente.css";
import logoImg from "../../assets/img/logo.png";
import { supabase } from "../../api/supabase";
import { useAuth } from "../../context/AuthContext";
import { useRealtimeTable } from "../../hooks/useRealtimeTable";

// Importación de Imágenes de Evidencia (Heredadas de Archivo B)
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
  { nombre: "TaladroInalambrico20V.jpg", src: taladroInalambrico, label: "Taladro Inalámbrico 20V" },
];

const getSrcByNombre = (nombre) => IMAGENES_EVIDENCIA.find((i) => i.nombre === nombre)?.src;

const ESTADO_CFG = {
  pendiente: {
    headClass: "gk-card-head--revision",
    pillClass: "gk-pill--revision",
    modalClass: "gk-modal-header--revision",
    icon: "fa-solid fa-clock-rotate-left",
    pillIcon: "fa-solid fa-circle-notch fa-spin",
    titulo: "Solicitud pendiente",
    estadoTexto: "Pendiente",
  },
  en_revision: {
    headClass: "gk-card-head--revision",
    pillClass: "gk-pill--revision",
    modalClass: "gk-modal-header--revision",
    icon: "fa-solid fa-clock-rotate-left",
    pillIcon: "fa-solid fa-circle-notch fa-spin",
    titulo: "Estado de reclamación",
    estadoTexto: "En revisión",
  },
  aprobada: {
    headClass: "gk-card-head--aprobado",
    pillClass: "gk-pill--aprobado",
    modalClass: "gk-modal-header--aprobado",
    icon: "fa-regular fa-square-check",
    pillIcon: "fa-solid fa-check",
    titulo: "Reclamación Aprobada",
    estadoTexto: "Aprobada",
  },
  rechazada: {
    headClass: "gk-card-head--rechazado",
    pillClass: "gk-pill--rechazado",
    modalClass: "gk-modal-header--rechazado",
    icon: "fa-regular fa-circle-xmark",
    pillIcon: "fa-solid fa-xmark",
    titulo: "Reclamación Rechazada",
    estadoTexto: "Rechazada",
  },
  cancelada: {
    headClass: "gk-card-head--rechazado",
    pillClass: "gk-pill--rechazado",
    modalClass: "gk-modal-header--rechazado",
    icon: "fa-solid fa-ban",
    pillIcon: "fa-solid fa-xmark",
    titulo: "Reclamación Cancelada",
    estadoTexto: "Cancelada",
  },
};

const TABS = [
  ["todos", "Todos"],
  ["pendiente", "Pendientes"],
  ["en_revision", "En revisión"],
  ["aprobada", "Aprobados"],
  ["rechazada", "Rechazados"],
];

const TIPOS_FALLA = ["Fallo de Fábrica", "Producto Defectuoso", "Avería en Transporte", "Faltan piezas"];

export default function D_garantiasCliente() {
  const navigate = useNavigate();
  const { usuario, perfil } = useAuth();

  // Conexiones en tiempo real Supabase (Rutas intactas del Archivo A)
  const { datos: garantias, cargando, error } = useRealtimeTable("garantias", {
    orderBy: "fecha",
    ascending: false,
  });
  const { datos: pedidos } = useRealtimeTable("ordenes_compra", { orderBy: "fecha", ascending: false });

  // Filtros y búsquedas
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  // Control de Modales
  const [modalNueva, setModalNueva] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalEdicion, setModalEdicion] = useState(false);

  // Garantía seleccionada
  const [garantiaSel, setGarantiaSel] = useState(null);

  // Estados Formulario de Radicación y Edición
  const [pedidoId, setPedidoId] = useState("");
  const [pedidoSel, setPedidoSel] = useState(null);
  const [tipoReclamo, setTipoReclamo] = useState("");
  const [motivo, setMotivo] = useState("");
  const [observacion, setObservacion] = useState("");
  const [imagenSel, setImagenSel] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Filtrado de lista de garantías
  const filtradas = useMemo(() => {
    return garantias.filter((g) => {
      if (g.estado === "cancelada") return false;
      const okEstado = filtro === "todos" || g.estado === filtro;
      const q = busqueda.toLowerCase();
      const okBusq =
        (g.numero_orden || "").toLowerCase().includes(q) ||
        (g.producto || "").toLowerCase().includes(q);
      return okEstado && okBusq;
    });
  }, [garantias, filtro, busqueda]);

  // Manejadores de Modal Detalle
  const abrirDetalle = (g) => {
    setGarantiaSel(g);
    setModalDetalle(true);
  };
  const cerrarDetalle = () => {
    setModalDetalle(false);
    setGarantiaSel(null);
  };

  // Manejadores de Radicación (Crear CRUD)
  const abrirNueva = () => {
    setPedidoId("");
    setPedidoSel(null);
    setTipoReclamo("");
    setMotivo("");
    setObservacion("");
    setImagenSel("");
    setModalNueva(true);
  };

  const seleccionarPedido = (id) => {
    setPedidoId(id);
    const p = pedidos.find((item) => String(item.id) === String(id));
    setPedidoSel(p || null);
  };

  const radicar = async (e) => {
    e.preventDefault();
    if (!pedidoSel) {
      Swal.fire({ title: "Selecciona un pedido válido", icon: "warning", confirmButtonColor: "#E8600C" });
      return;
    }

    setEnviando(true);
    const fechaAhora = new Date().toISOString();
    const clienteNombre = perfil?.nombre ? `${perfil.nombre} ${perfil.apellido || ""}`.trim() : usuario?.email || "Cliente";

    const obsInicial = {
      id: `obs-${Date.now()}`,
      texto: observacion.trim() || "Solicitud registrada por el cliente.",
      autor: "Cliente",
      fecha: fechaAhora,
    };

    const bitInicial = {
      id: `bit-${Date.now()}`,
      accion: "Creación de Solicitud",
      estado: "pendiente",
      fecha: fechaAhora,
      detalle: "Solicitud radicada en el portal del cliente.",
    };

    try {
      const { error: errorInsert } = await supabase.from("garantias").insert({
        orden_id: pedidoSel.id,
        numero_orden: pedidoSel.codigo || `ORD-${pedidoSel.id}`,
        cliente_id: usuario?.id,
        cliente_nombre: clienteNombre,
        cliente_destino: clienteNombre,
        producto: pedidoSel.producto_nombre,
        motivo: `${tipoReclamo}: ${motivo}`,
        observacion: observacion.trim(),
        imagen_nombre: imagenSel,
        estado: "pendiente",
        fecha: fechaAhora,
        observaciones: [obsInicial],
        bitacora: [bitInicial],
      });

      if (errorInsert) throw errorInsert;

      Swal.fire({
        title: "Solicitud radicada",
        text: "Tu solicitud de garantía fue enviada correctamente. Te avisaremos cuando el equipo la revise.",
        icon: "success",
        confirmButtonColor: "#E8600C",
      });

      setModalNueva(false);
    } catch (err) {
      Swal.fire({
        title: "No se pudo radicar la solicitud",
        text: err.message,
        icon: "error",
        confirmButtonColor: "#E8600C",
      });
    } finally {
      setEnviando(false);
    }
  };

  // Manejadores de Edición (Update CRUD)
  const abrirEdicion = (g) => {
    setGarantiaSel(g);
    setMotivo(g.motivo || "");
    setObservacion(g.observacion || "");
    setImagenSel(g.imagen_nombre || "");
    setModalEdicion(true);
  };

  const guardarEdicion = async (e) => {
    e.preventDefault();
    if (!garantiaSel) return;

    setEnviando(true);
    const fechaAhora = new Date().toISOString();

    const nuevasObs = [...(garantiaSel.observaciones || [])];
    if (observacion.trim()) {
      nuevasObs.push({
        id: `obs-${Date.now()}`,
        texto: observacion.trim(),
        autor: "Cliente",
        fecha: fechaAhora,
      });
    }

    const nuevaBitacora = [
      ...(garantiaSel.bitacora || []),
      {
        id: `bit-${Date.now()}`,
        accion: "Actualización de Solicitud",
        estado: garantiaSel.estado,
        fecha: fechaAhora,
        detalle: "El cliente actualizó la información de la solicitud.",
      },
    ];

    try {
      const { error: errorUpdate } = await supabase
        .from("garantias")
        .update({
          motivo,
          observacion: observacion.trim(),
          imagen_nombre: imagenSel,
          observaciones: nuevasObs,
          bitacora: nuevaBitacora,
        })
        .eq("id", garantiaSel.id);

      if (errorUpdate) throw errorUpdate;

      Swal.fire({
        title: "Garantía actualizada",
        text: "Los cambios han sido guardados exitosamente.",
        icon: "success",
        confirmButtonColor: "#E8600C",
      });

      setModalEdicion(false);
      setGarantiaSel(null);
    } catch (err) {
      Swal.fire({
        title: "Error al actualizar",
        text: err.message,
        icon: "error",
        confirmButtonColor: "#E8600C",
      });
    } finally {
      setEnviando(false);
    }
  };

  // Manejador de Cancelación (Delete / Status Change CRUD)
  const cancelarSolicitud = async (g) => {
    const res = await Swal.fire({
      title: "¿Cancelar solicitud?",
      text: `¿Estás seguro de cancelar la solicitud para la orden #${g.numero_orden}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "Regresar",
    });

    if (res.isConfirmed) {
      const fechaAhora = new Date().toISOString();
      const nuevaBitacora = [
        ...(g.bitacora || []),
        {
          id: `bit-${Date.now()}`,
          accion: "Cancelación de Solicitud",
          estado: "cancelada",
          fecha: fechaAhora,
          detalle: "El cliente canceló la solicitud de garantía.",
        },
      ];

      try {
        const { error: errorPatch } = await supabase
          .from("garantias")
          .update({
            estado: "cancelada",
            bitacora: nuevaBitacora,
          })
          .eq("id", g.id);

        if (errorPatch) throw errorPatch;

        Swal.fire({
          title: "Solicitud cancelada",
          text: "La solicitud fue cancelada correctamente.",
          icon: "success",
          confirmButtonColor: "#E8600C",
        });
      } catch (err) {
        Swal.fire({
          title: "Error al cancelar",
          text: err.message,
          icon: "error",
          confirmButtonColor: "#E8600C",
        });
      }
    }
  };

  const hayModal = modalNueva || modalDetalle || modalEdicion;

  return (
    <div className="gk-root">
      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
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
          {/* ── ASIDE ──────────────────────────────────────────────────────── */}
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

          {/* ── SECCIÓN GARANTÍAS ──────────────────────────────────────────── */}
          <section className="gk-section col-12 col-lg-9 col-xl-10 bg-white shadow-sm rounded-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
              <h1 className="gk-moro fw-bold h3 m-0">
                <i className="fa-solid fa-shield me-2"></i>Garantías
              </h1>

              <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto">
                <div className="input-group w-100 w-sm-auto">
                  <input
                    type="text"
                    className="form-control gk-input"
                    placeholder="Buscar por código o producto..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                  <span className="btn gk-btn-primary px-3">
                    <i className="bi bi-search"></i>
                  </span>
                </div>

                <button
                  type="button"
                  className="btn gk-btn-primary px-3 py-2 text-nowrap"
                  onClick={abrirNueva}
                  disabled={pedidos.length === 0}
                  title={pedidos.length === 0 ? "Necesitas al menos un pedido para radicar una garantía" : undefined}
                >
                  <i className="fa-solid fa-plus me-1"></i>Radicar Garantía
                </button>
              </div>
            </div>

            {error && <div className="alert alert-danger">No se pudo conectar con "garantias": {error}</div>}

            <div className="border-bottom mb-4">
              <div className="gk-tabs">
                {TABS.map(([valor, texto]) => (
                  <button
                    key={valor}
                    className={`gk-tab ${filtro === valor ? "active" : ""}`}
                    onClick={() => setFiltro(valor)}
                  >
                    {texto}
                  </button>
                ))}
              </div>
            </div>

            <div className="d-flex flex-column gap-3 gap-md-4">
              {cargando ? (
                <p className="text-center text-muted py-5">Cargando tus garantías…</p>
              ) : (
                filtradas.map((g) => {
                  const cfg = ESTADO_CFG[g.estado] || ESTADO_CFG.pendiente;
                  return (
                    <div key={g.id} className="gk-card">
                      <div className={`gk-card-head ${cfg.headClass}`}>
                        <h5 className="m-0 fw-bold gk-moro fs-6">
                          <i className={`${cfg.icon} me-2`}></i>
                          {cfg.titulo}
                        </h5>
                        <span className={`gk-pill ${cfg.pillClass}`}>
                          <i className={cfg.pillIcon}></i>
                          {cfg.estadoTexto}
                        </span>
                      </div>

                      <div className="p-3 p-md-4">
                        <div className="gk-product-row d-flex align-items-center gap-3">
                          <i className="fa-solid fa-screwdriver-wrench fs-3 d-none d-sm-inline"></i>
                          <div>
                            <span className="badge bg-dark mb-1">{g.numero_orden}</span>
                            <h6 className="m-0 fw-bold">{g.producto}</h6>
                          </div>
                        </div>

                        <div className="row align-items-center g-3 mt-1">
                          <div className="col-12 col-md-7 small">
                            <p className="mb-1"><strong>Número compra:</strong> {g.numero_orden}</p>
                            <p className="mb-0"><strong>Fecha:</strong> {g.fecha ? new Date(g.fecha).toLocaleDateString("es-CO") : "—"}</p>
                          </div>
                          <div className="col-12 col-md-5 d-flex gap-2 justify-content-md-end flex-wrap">
                            <button
                              type="button"
                              className="btn gk-btn-primary px-3 py-2"
                              onClick={() => abrirDetalle(g)}
                            >
                              Ver detalle
                            </button>
                            {g.estado === "pendiente" && (
                              <>
                                <button
                                  type="button"
                                  className="btn btn-outline-secondary px-2 py-2"
                                  onClick={() => abrirEdicion(g)}
                                  title="Editar solicitud"
                                >
                                  <i className="fa-solid fa-pen"></i>
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-outline-danger px-2 py-2"
                                  onClick={() => cancelarSolicitud(g)}
                                  title="Cancelar solicitud"
                                >
                                  <i className="fa-solid fa-trash"></i>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {!cargando && filtradas.length === 0 && (
                <div className="text-center text-muted py-5">No se encontraron garantías.</div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* ── MODAL NUEVA GARANTÍA (Heredado e integrado) ───────────────────── */}
      {modalNueva && (
        <div className="gk-modal-overlay" onClick={() => setModalNueva(false)}>
          <div className="gk-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gk-modal-header gk-modal-header--new">
              <h5><i className="fa-solid fa-shield-plus me-2"></i>Radicar Solicitud de Garantía</h5>
              <button className="gk-modal-close" onClick={() => setModalNueva(false)} aria-label="Cerrar">✕</button>
            </div>

            <form onSubmit={radicar} style={{ display: "contents" }}>
              <div className="gk-modal-body">
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label htmlFor="gk-selectPedido" className="form-label fw-bold gk-moro small">
                      Número de Compra / Producto *
                    </label>
                    <select
                      className="form-select"
                      id="gk-selectPedido"
                      value={pedidoId}
                      onChange={(e) => seleccionarPedido(e.target.value)}
                      required
                    >
                      <option value="">Selecciona un pedido...</option>
                      {pedidos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.codigo || `ORD-${p.id}`} – {p.producto_nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12 col-md-6">
                    <label htmlFor="gk-selectTipo" className="form-label fw-bold gk-moro small">
                      Tipo de Reclamación *
                    </label>
                    <select
                      className="form-select"
                      id="gk-selectTipo"
                      value={tipoReclamo}
                      onChange={(e) => setTipoReclamo(e.target.value)}
                      required
                    >
                      <option value="">Selecciona la falla...</option>
                      {TIPOS_FALLA.map((tf) => (
                        <option key={tf} value={tf}>{tf}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12">
                    <label htmlFor="gk-txtMotivo" className="form-label fw-bold gk-moro small">
                      Descripción de la falla *
                    </label>
                    <textarea
                      className="form-control"
                      id="gk-txtMotivo"
                      rows="3"
                      placeholder="Describe el problema detectado..."
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label htmlFor="gk-txtObs" className="form-label fw-bold gk-moro small">
                      Observación inicial (Opcional)
                    </label>
                    <textarea
                      className="form-control"
                      id="gk-txtObs"
                      rows="2"
                      placeholder="Añade algún detalle o instrucción particular..."
                      value={observacion}
                      onChange={(e) => setObservacion(e.target.value)}
                    />
                  </div>

                  {/* Selector visual de evidencia adaptado a las clases estéticas del Archivo A */}
                  <div className="col-12">
                    <label className="form-label fw-bold gk-moro small">
                      Seleccionar Imagen de Evidencia
                    </label>
                    <div className="d-flex gap-2 flex-wrap p-2 border rounded bg-light" style={{ maxHeight: "140px", overflowY: "auto" }}>
                      {IMAGENES_EVIDENCIA.map((img) => (
                        <div
                          key={img.nombre}
                          onClick={() => setImagenSel(img.nombre)}
                          className="text-center p-1 rounded"
                          style={{
                            border: imagenSel === img.nombre ? "2px solid #E8600C" : "1px solid #ddd",
                            cursor: "pointer",
                            width: "80px",
                            backgroundColor: "#fff",
                          }}
                        >
                          <img src={img.src} alt={img.label} style={{ width: "100%", height: "45px", objectFit: "cover" }} />
                          <span style={{ fontSize: "0.65rem" }} className="d-block text-truncate mt-1">{img.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="gk-modal-footer">
                <button type="button" className="btn btn-secondary fw-bold" onClick={() => setModalNueva(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn gk-btn-primary fw-bold px-4" disabled={enviando}>
                  <i className="fa-solid fa-paper-plane me-1"></i>{enviando ? "Enviando…" : "Radicar Solicitud"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL DETALLE (Ampliado con Evidencia, Bitácora e Historial) ──── */}
      {modalDetalle && garantiaSel && (
        <div className="gk-modal-overlay" onClick={cerrarDetalle}>
          <div className="gk-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "650px" }}>
            <div className={`gk-modal-header ${(ESTADO_CFG[garantiaSel.estado] || ESTADO_CFG.pendiente).modalClass}`}>
              <h5><i className="fa-solid fa-circle-info me-2"></i>Detalle de Garantía {garantiaSel.numero_orden}</h5>
              <button className="gk-modal-close" onClick={cerrarDetalle} aria-label="Cerrar">✕</button>
            </div>

            <div className="gk-modal-body">
              <div className="mb-3 border rounded overflow-hidden">
                <div className="gk-modal-sub-head">
                  <i className="fa-solid fa-list-check me-2"></i>Resumen de Reclamación
                </div>
                <div className="table-responsive">
                  <table className="gk-table mb-0">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Motivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="fw-bold">{garantiaSel.producto}</td>
                        <td>{garantiaSel.motivo}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Muestra Evidencia Fotográfica si existe */}
              {garantiaSel.imagen_nombre && (
                <div className="mb-3 border rounded overflow-hidden">
                  <div className="gk-modal-sub-head">
                    <i className="fa-solid fa-image me-2"></i>Evidencia Adjunta
                  </div>
                  <div className="p-3 text-center">
                    {getSrcByNombre(garantiaSel.imagen_nombre) ? (
                      <img
                        src={getSrcByNombre(garantiaSel.imagen_nombre)}
                        alt="Evidencia"
                        className="img-fluid rounded border p-1"
                        style={{ maxHeight: "180px" }}
                      />
                    ) : (
                      <span className="text-muted small">Evidencia: {garantiaSel.imagen_nombre}</span>
                    )}
                  </div>
                </div>
              )}

              <div className="mb-3 border rounded overflow-hidden">
                <div className="gk-modal-sub-head">
                  <i className="fa-solid fa-comment-dots me-2"></i>Observaciones del Equipo Técnico
                </div>
                <div className="p-3">
                  <p className="m-0 small text-secondary">
                    {garantiaSel.observacion || "Tu solicitud aún no tiene observaciones registradas."}
                  </p>
                </div>
              </div>

              {/* Bitácora / Historial de Cambios */}
              {garantiaSel.bitacora && garantiaSel.bitacora.length > 0 && (
                <div className="mb-3 border rounded overflow-hidden">
                  <div className="gk-modal-sub-head">
                    <i className="fa-solid fa-clock-rotate-left me-2"></i>Historial de la Solicitud
                  </div>
                  <ul className="list-group list-group-flush small">
                    {garantiaSel.bitacora.map((b, idx) => (
                      <li key={b.id || idx} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-bold">{b.accion}</span>
                          <span className="text-muted">{b.fecha ? new Date(b.fecha).toLocaleString("es-CO") : "—"}</span>
                        </div>
                        <span className="text-secondary d-block">{b.detalle || b.observacion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="gk-modal-footer">
              <button type="button" className="btn btn-secondary fw-bold" onClick={cerrarDetalle}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL EDICIÓN (Heredado de Archivo B) ─────────────────────────── */}
      {modalEdicion && garantiaSel && (
        <div className="gk-modal-overlay" onClick={() => setModalEdicion(false)}>
          <div className="gk-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gk-modal-header gk-modal-header--new">
              <h5><i className="fa-solid fa-pen-to-square me-2"></i>Editar Solicitud #{garantiaSel.numero_orden}</h5>
              <button className="gk-modal-close" onClick={() => setModalEdicion(false)} aria-label="Cerrar">✕</button>
            </div>

            <form onSubmit={guardarEdicion} style={{ display: "contents" }}>
              <div className="gk-modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-bold gk-moro small">Motivo del Reclamo *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-bold gk-moro small">Agregar Observación</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={observacion}
                      onChange={(e) => setObservacion(e.target.value)}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-bold gk-moro small">Cambiar Imagen Evidencia</label>
                    <div className="d-flex gap-2 flex-wrap p-2 border rounded bg-light" style={{ maxHeight: "120px", overflowY: "auto" }}>
                      {IMAGENES_EVIDENCIA.map((img) => (
                        <div
                          key={img.nombre}
                          onClick={() => setImagenSel(img.nombre)}
                          className="text-center p-1 rounded"
                          style={{
                            border: imagenSel === img.nombre ? "2px solid #E8600C" : "1px solid #ddd",
                            cursor: "pointer",
                            width: "70px",
                            backgroundColor: "#fff",
                          }}
                        >
                          <img src={img.src} alt={img.label} style={{ width: "100%", height: "40px", objectFit: "cover" }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="gk-modal-footer">
                <button type="button" className="btn btn-secondary fw-bold" onClick={() => setModalEdicion(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn gk-btn-primary fw-bold px-4" disabled={enviando}>
                  {enviando ? "Guardando…" : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {hayModal && <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} />}
    </div>
  );
}