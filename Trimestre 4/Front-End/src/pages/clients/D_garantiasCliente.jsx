import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../../assets/css/D_garantia-cliente.css";
import logoImg from "../../assets/img/logo.png";
import { supabase } from "../../api/supabase";
import { useAuth } from "../../context/AuthContext";
import useCerrarSesion from "../../hooks/useCerrarSesion";
import { useRealtimeTable } from "../../hooks/useRealtimeTable";

/**
 * Portal del cliente · Garantías — conectado en tiempo real a la tabla
 * `garantias` (misma tabla que usa el jefe en D_solicitudGarantias.jsx
 * / D_historial-garantias.jsx). Gracias a las políticas RLS del
 * ESQUEMA_SUPABASE.sql, este cliente solo ve y crea SUS PROPIAS
 * garantías; cuando el jefe cambia el estado/observación desde el
 * panel, este listado se actualiza solo (postgres_changes).
 *
 * Bugs corregidos respecto al componente migrado originalmente:
 *   - `radicar()` usaba `alert()` nativo → ahora usa SweetAlert2 e
 *     inserta de verdad en Supabase.
 *   - El selector "Número de compra" tenía 3 opciones de ejemplo fijas
 *     → ahora carga los pedidos reales del cliente (`ordenes_compra`).
 *   - <img src="/img/logo.png"> apuntaba a un archivo que no existe en
 *     /public (no hay carpeta public) → se usa el import real del logo.
 *   - El botón "Ver Carrito" abría un carrito siempre vacío y sin
 *     relación con el carrito real de la tienda → ahora enlaza a "/"
 *     (la tienda), donde vive el carrito de verdad.
 *   - Enlace "/pedidos" no existía como ruta → ahora "/cliente/pedidos".
 */

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
};

const TABS = [
  ["todos", "Todos"],
  ["pendiente", "Pendientes"],
  ["en_revision", "En revisión"],
  ["aprobada", "Aprobados"],
  ["rechazada", "Rechazados"],
];

export default function D_garantiasCliente() {
  const navigate = useNavigate();
  const { usuario, perfil } = useAuth();
  const cerrarSesion = useCerrarSesion();

  const { datos: garantias, cargando, error } = useRealtimeTable("garantias", {
    orderBy: "fecha",
    ascending: false,
  });
  const { datos: pedidos } = useRealtimeTable("ordenes_compra", { orderBy: "fecha", ascending: false });

  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  const [modalNueva, setModalNueva] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);

  const [garantiaSel, setGarantiaSel] = useState(null);

  // Formulario nueva garantía
  const [pedidoId, setPedidoId] = useState("");
  const [tipoReclamo, setTipoReclamo] = useState("");
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);

  const filtradas = useMemo(() => {
    return garantias.filter((g) => {
      const okEstado = filtro === "todos" || g.estado === filtro;
      const q = busqueda.toLowerCase();
      const okBusq =
        (g.numero_orden || "").toLowerCase().includes(q) ||
        (g.producto || "").toLowerCase().includes(q);
      return okEstado && okBusq;
    });
  }, [garantias, filtro, busqueda]);

  const abrirDetalle = (g) => { setGarantiaSel(g); setModalDetalle(true); };
  const cerrarDetalle = () => { setModalDetalle(false); setGarantiaSel(null); };

  const abrirNueva = () => {
    setPedidoId("");
    setTipoReclamo("");
    setMotivo("");
    setModalNueva(true);
  };

  const radicar = async (e) => {
    e.preventDefault();
    const pedido = pedidos.find((p) => String(p.id) === String(pedidoId));
    if (!pedido) {
      Swal.fire({ title: "Selecciona un pedido válido", icon: "warning", confirmButtonColor: "#E8600C" });
      return;
    }

    setEnviando(true);
    try {
      const { error: errorInsert } = await supabase.from("garantias").insert({
        orden_id: pedido.id,
        numero_orden: pedido.codigo,
        cliente_id: usuario.id,
        cliente_nombre: perfil?.nombre ? `${perfil.nombre} ${perfil.apellido || ""}`.trim() : usuario.email,
        producto: pedido.producto_nombre,
        motivo: `${tipoReclamo}: ${motivo}`,
        estado: "pendiente",
      });
      if (errorInsert) throw errorInsert;

      Swal.fire({
        title: "Solicitud radicada",
        text: "Tu solicitud de garantía fue enviada correctamente. Te avisaremos cuando el equipo la revise.",
        icon: "success",
        confirmButtonColor: "#E8600C",
      });

      setPedidoId(""); setTipoReclamo(""); setMotivo("");
      setModalNueva(false);
    } catch (error) {
      Swal.fire({ title: "No se pudo radicar la solicitud", text: error.message, icon: "error", confirmButtonColor: "#E8600C" });
    } finally {
      setEnviando(false);
    }
  };

  const hayModal = modalNueva || modalDetalle;

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
                  <li className="nav-item">
                    <button className="btn btn-outline-secondary" type="button" onClick={cerrarSesion}>
                      <i className="bi bi-box-arrow-right me-2"></i>Cerrar sesión
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

                        <div className="row align-items-center g-3">
                          <div className="col-12 col-md-8 small">
                            <p className="mb-1"><strong>Número compra:</strong> {g.numero_orden}</p>
                            <p className="mb-0"><strong>Fecha:</strong> {g.fecha ? new Date(g.fecha).toLocaleDateString("es-CO") : "—"}</p>
                          </div>
                          <div className="col-12 col-md-4 text-md-end">
                            <button
                              type="button"
                              className="btn gk-btn-primary w-100 w-md-auto px-3 py-2"
                              onClick={() => abrirDetalle(g)}
                            >
                              Ver detalle
                            </button>
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

      {/* ── MODAL NUEVA GARANTÍA ───────────────────────────────────────────── */}
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
                      Número de Compra / Producto
                    </label>
                    <select
                      className="form-select"
                      id="gk-selectPedido"
                      value={pedidoId}
                      onChange={(e) => setPedidoId(e.target.value)}
                      required
                    >
                      <option value="">Selecciona un pedido...</option>
                      {pedidos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.codigo} – {p.producto_nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12 col-md-6">
                    <label htmlFor="gk-selectTipo" className="form-label fw-bold gk-moro small">
                      Tipo de Reclamación
                    </label>
                    <select
                      className="form-select"
                      id="gk-selectTipo"
                      value={tipoReclamo}
                      onChange={(e) => setTipoReclamo(e.target.value)}
                      required
                    >
                      <option value="">Selecciona la falla...</option>
                      <option value="Fallo de Fábrica">Fallo de Fábrica</option>
                      <option value="Producto Defectuoso">Producto Defectuoso / Incompleto</option>
                      <option value="Avería en Transporte">Avería en Transporte</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label htmlFor="gk-txtMotivo" className="form-label fw-bold gk-moro small">
                      Descripción de la falla
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

      {/* ── MODAL DETALLE ──────────────────────────────────────────────────── */}
      {modalDetalle && garantiaSel && (
        <div className="gk-modal-overlay" onClick={cerrarDetalle}>
          <div className="gk-modal" onClick={(e) => e.stopPropagation()}>
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
            </div>

            <div className="gk-modal-footer">
              <button type="button" className="btn btn-secondary fw-bold" onClick={cerrarDetalle}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {hayModal && <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} />}
    </div>
  );
}
