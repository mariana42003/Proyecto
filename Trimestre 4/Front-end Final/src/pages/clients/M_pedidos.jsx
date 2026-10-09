import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/M_index.css";
import "../../assets/css/M_pedidos.css";
import logoImg from "../../assets/img/logo.png";
import { useAuth } from "../../context/AuthContext";
import { useRealtimeTable } from "../../hooks/useRealtimeTable";
import useCerrarSesion from "../../hooks/useCerrarSesion";

/**
 * Portal del cliente · Mis Pedidos — conectado en tiempo real a
 * `ordenes_compra` (fila = un material comprado por este cliente).
 * Gracias a la política RLS "el cliente ve y crea las suyas" (ver
 * ESQUEMA_SUPABASE.sql), esta consulta ya devuelve solo los pedidos
 * de la persona autenticada; no hace falta filtrar por cliente_id en
 * el cliente.
 *
 * Corrige además dos bugs del componente original migrado desde el
 * proyecto de referencia:
 *   - <HeaderKronos /> se llamaba sin pasarle modoOscuro/toggleModo/
 *     onAbrirCarrito, así que el botón de tema y el del carrito
 *     lanzaban "is not a function" al hacer clic. Ahora el header
 *     maneja su propio tema (igual que Navbar.jsx) y el carrito
 *     enlaza de vuelta a la tienda ("/"), donde vive el carrito real.
 *   - Enlaces a "/register" y "/M_index" que no existen como rutas;
 *     ahora usan "/registro" y "/".
 */

const ETIQUETA_ESTADO = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  rechazada: "Rechazada",
};

const CLASE_ESTADO = {
  pendiente: "text-warning",
  confirmada: "text-success",
  rechazada: "text-danger",
};

function formatearPrecio(valor) {
  if (typeof valor !== "number") return "$0";
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(valor);
}

function HeaderKronos({ onIrGarantias }) {
  const navigate = useNavigate();
  const cerrarSesion = useCerrarSesion();
  const [tema, setTema] = useState(() => localStorage.getItem("kronos-theme") || "dark");

  const alternarTema = () => {
    const nuevo = tema === "dark" ? "light" : "dark";
    setTema(nuevo);
    document.documentElement.setAttribute("data-theme", nuevo);
    localStorage.setItem("kronos-theme", nuevo);
  };

  return (
    <header className="site-header border-bottom border-warning border-2">
      <div className="topbar py-1">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="topbar-text">
            <i className="bi bi-truck me-2"></i>
            Envíos a toda Bogotá · Retiro en Usme el mismo día
          </div>
          <div className="topbar-text">
            <i className="bi bi-telephone me-2"></i>
            (601) 745 20 18
          </div>
        </div>
      </div>

      <nav className="navbar navbar-expand-lg py-2">
        <div className="container d-flex align-items-center justify-content-between">
          <a href="/" className="navbar-brand m-0 p-0 me-4">
            <img src={logoImg} alt="Logo Kronos" style={{ height: "36px" }} />
          </a>

          <div className="d-flex align-items-center gap-4 ms-auto">
            <button className="btn p-0 border-0 text-light fs-5" onClick={alternarTema} type="button" title="Cambiar tema">
              <i className={`bi ${tema === "dark" ? "bi-moon" : "bi-sun"}`}></i>
            </button>

            <button className="btn p-0 border-0 text-light fs-5" type="button" title="Volver a la tienda" onClick={() => navigate("/")}>
              <i className="bi bi-shop"></i>
            </button>

            <button className="btn p-0 border-0 text-light fs-5" type="button" title="Ir a Garantías" onClick={onIrGarantias}>
              <i className="bi bi-shield"></i>
            </button>

            <button className="btn p-0 border-0 text-light fs-5" type="button" title="Cerrar sesión" onClick={cerrarSesion}>
              <i className="bi bi-box-arrow-right"></i>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}

function SidebarLateral({ onIrGarantias }) {
  const navigate = useNavigate();
  return (
    <aside className="col-lg-2 d-flex flex-column gap-3" style={{ fontSize: "0.85rem" }}>
      <div className="d-flex flex-column gap-2">
        <button
          onClick={() => navigate("/")}
          className="btn btn-dark text-start border-secondary text-light-50 py-1 px-2 text-decoration-none d-block"
          style={{ fontSize: "0.8rem", background: "#151921" }}
        >
          <i className="bi bi-tag me-2"></i> Categorías
        </button>

        <button className="btn text-start fw-bold text-white py-1 px-2 rounded" style={{ fontSize: "0.8rem", background: "#ff6b00", border: "none" }}>
          <i className="bi bi-box-seam me-2"></i> Mis pedidos
        </button>

        <button
          onClick={onIrGarantias}
          className="btn btn-dark text-start border-secondary text-light-50 py-1 px-2"
          style={{ fontSize: "0.8rem", background: "#151921" }}
        >
          <i className="bi bi-shield me-2"></i> Garantías
        </button>
      </div>

      <div className="text-light-50 d-flex flex-column gap-1">
        <h6 className="fw-bold text-white mb-1" style={{ fontSize: "0.85rem" }}>Información</h6>
        <a href="#" className="text-decoration-none text-secondary" style={{ fontSize: "0.75rem" }}>Política de privacidad</a>
        <a href="#" className="text-decoration-none text-secondary" style={{ fontSize: "0.75rem" }}>Términos y condiciones</a>
        <a href="#" className="text-decoration-none text-secondary" style={{ fontSize: "0.75rem" }}>Contáctenos</a>
      </div>
    </aside>
  );
}

export default function M_pedidos() {
  const navigate = useNavigate();
  const { perfil, usuario } = useAuth();
  const { datos: pedidos, cargando, error } = useRealtimeTable("ordenes_compra", {
    orderBy: "fecha",
    ascending: false,
  });

  const nombreEnvio = perfil?.nombre ? `${perfil.nombre} ${perfil.apellido || ""}`.trim() : usuario?.email;

  return (
    <div style={{ background: "#0b0e14", minHeight: "100vh", color: "#e2e8f0" }}>
      <HeaderKronos onIrGarantias={() => navigate("/cliente/garantias")} />
      <div style={{ height: "2px", background: "#ff6b00" }}></div>

      <main className="container-fluid py-4 px-4">
        <div className="row g-4">
          <SidebarLateral onIrGarantias={() => navigate("/cliente/garantias")} />

          <section className="col-lg-10">
            <h3 className="fw-bold text-white mb-2">Mis Pedidos</h3>
            <div className="text-center mb-3">
              <span className="fw-bold text-white border-bottom border-warning pb-1" style={{ fontSize: "0.9rem" }}>
                Todos mis Pedidos
              </span>
            </div>

            {error && <div className="alert alert-danger">No se pudo conectar con "ordenes_compra": {error}</div>}

            {cargando ? (
              <p className="text-center text-light-50 py-5">Cargando tus pedidos…</p>
            ) : pedidos.length === 0 ? (
              <div className="text-center text-light-50 py-5">
                <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                Aún no has realizado ningún pedido.{" "}
                <button className="btn btn-link text-warning p-0" onClick={() => navigate("/")}>
                  Ir a la tienda
                </button>
              </div>
            ) : (
              pedidos.map((pedido) => (
                <article key={pedido.id} className="p-3 rounded mb-4" style={{ background: "#151921", border: "1px solid #2b3340" }}>
                  <div className="pb-2 mb-3 border-bottom border-secondary d-flex justify-content-between flex-wrap gap-2">
                    <span className="fw-bold" style={{ fontSize: "0.85rem", color: "#58a6ff" }}>
                      <i className="bi bi-bag-check me-2"></i>
                      Pedido #{pedido.codigo} · {pedido.fecha ? new Date(pedido.fecha).toLocaleDateString("es-CO") : "—"}
                    </span>
                    <span className={`fw-bold ${CLASE_ESTADO[pedido.estado] || "text-warning"}`} style={{ fontSize: "0.85rem" }}>
                      {ETIQUETA_ESTADO[pedido.estado] || "Pendiente"}
                    </span>
                  </div>

                  <div className="mb-3 text-light-50" style={{ fontSize: "0.8rem", lineHeight: "1.8" }}>
                    <p className="m-0"><i className="bi bi-person me-2"></i>Enviar a {pedido.cliente_nombre || nombreEnvio}</p>
                    {perfil?.direccion && <p className="m-0"><i className="bi bi-house me-2"></i>{perfil.direccion}</p>}
                    {(perfil?.localidad || perfil?.barrio) && (
                      <p className="m-0"><i className="bi bi-geo-alt me-2"></i>{[perfil?.barrio, perfil?.localidad].filter(Boolean).join(", ")}</p>
                    )}
                    {perfil?.telefono && <p className="m-0"><i className="bi bi-telephone me-2"></i>{perfil.telefono}</p>}
                  </div>

                  <div className="p-3 rounded" style={{ background: "#181d26", border: "1px solid #28303d" }}>
                    <div className="p-3 mb-2 d-flex align-items-center justify-content-between rounded" style={{ background: "#1c222b", border: "1px solid #2b3340" }}>
                      <div>
                        <h6 className="m-0 fw-bold text-white" style={{ fontSize: "0.85rem" }}>{pedido.producto_nombre}</h6>
                        <p className="m-0 fw-bold text-white mt-2" style={{ fontSize: "0.85rem" }}>
                          {pedido.precio_unitario != null ? formatearPrecio(Number(pedido.precio_unitario)) : "—"}
                        </p>
                      </div>
                      <span className="px-2 py-1 text-white fw-bold rounded" style={{ background: "#151921", fontSize: "0.75rem", border: "1px solid #2b3340" }}>
                        x{pedido.cantidad}
                      </span>
                    </div>
                    {pedido.observacion && (
                      <p className="text-light-50 small m-0 mt-2">
                        <i className="bi bi-chat-left-text me-1"></i>Nota del vendedor: {pedido.observacion}
                      </p>
                    )}
                  </div>
                </article>
              ))
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
