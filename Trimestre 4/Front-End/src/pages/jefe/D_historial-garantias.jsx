import { useMemo, useState, useEffect } from "react";
import "../../assets/css/D_garantia-jefe.css";
import { useRealtimeTable } from "../../hooks/useRealtimeTable";

const ETIQUETA_ESTADO = {
  aprobada: "Aprobada",
  rechazada: "Rechazada",
};

const mensajePorEstado = (garantia) => {
  if (garantia.observacion) return garantia.observacion;
  if (garantia.estado === "aprobada") {
    return "Su solicitud de garantía ha sido aprobada.";
  }
  return "Su solicitud de garantía ha sido revisada y no procede.";
};

function formatFecha(fecha) {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleDateString("es-CO");
}

function badgeClass(estado) {
  if (estado === "aprobada") return "sg-badge-aprobado";
  if (estado === "rechazada") return "sg-badge-rechazado";
  return "";
}

function BadgeEstado({ estado }) {
  const label = ETIQUETA_ESTADO[estado] || estado;
  return <span className={`sg-badge ${badgeClass(estado)}`}>{label}</span>;
}

function ModalHistorialDetalle({ seleccionado, onClose }) {
  const [tab, setTab] = useState("info");

  if (!seleccionado) return null;

  const esAprobada = seleccionado.estado === "aprobada";
  const headAccent = esAprobada ? "sg-modal-head--aprobado" : "sg-modal-head--rechazado";

  return (
    <div className="sg-overlay" onClick={onClose}>
      <div className="sg-modal" onClick={(e) => e.stopPropagation()}>
        <div className={`sg-modal-head ${headAccent}`}>
          <h5>
            <i className="fa-solid fa-clock-rotate-left"></i>
            Historial — {seleccionado.numero_orden}
            <span style={{ marginLeft: "0.5rem", opacity: 0.7, fontSize: "0.8rem", fontWeight: 400 }}>
              (solo lectura)
            </span>
          </h5>
          <button className="sg-modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div style={{ borderBottom: "1px solid var(--sg-border)", display: "flex", gap: "1.5rem", padding: "0 1.5rem", background: "var(--sg-white)", flexShrink: 0 }}>
          {[["info", "Información"], ["obs", "Observaciones"]].map(([k, lbl]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "0.6rem 0", fontWeight: 600, fontSize: "0.875rem",
                color: tab === k ? "var(--sg-black)" : "var(--sg-muted)",
                borderBottom: tab === k ? "3px solid var(--sg-black)" : "3px solid transparent",
                transition: "all 0.15s",
              }}
            >
              {lbl}
            </button>
          ))}
        </div>

        <div className="sg-modal-body">
          {tab === "info" && (
            <>
              <div style={{
                background: esAprobada ? "var(--sg-success-bg)" : "var(--sg-danger-bg)",
                border: `1px solid ${esAprobada ? "var(--sg-success-pill)" : "var(--sg-danger-pill)"}`,
                borderRadius: 8,
                padding: "0.6rem 1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1rem",
                fontSize: "0.875rem",
              }}>
                <i className={`fa-solid ${esAprobada ? "fa-check-circle" : "fa-times-circle"}`}
                   style={{ color: esAprobada ? "var(--sg-success)" : "var(--sg-danger)" }}
                ></i>
                <strong>Veredicto final:</strong>
                <BadgeEstado estado={seleccionado.estado} />
                {seleccionado.fecha && (
                  <span style={{ color: "var(--sg-muted)", marginLeft: "auto" }}>
                    Fecha: {formatFecha(seleccionado.fecha)}
                  </span>
                )}
              </div>

              <div className="sg-detail-grid">
                <div className="sg-info-list" style={{ gridColumn: "1 / -1" }}>
                  <div className="sg-info-item">
                    <span className="sg-info-label">Cliente</span>
                    <span className="sg-info-value">{seleccionado.cliente_nombre || "—"}</span>
                  </div>
                  <div className="sg-info-item">
                    <span className="sg-info-label">N.º de orden</span>
                    <span className="sg-info-value">{seleccionado.numero_orden || "—"}</span>
                  </div>
                  <div className="sg-info-item">
                    <span className="sg-info-label">Fecha</span>
                    <span className="sg-info-value">{formatFecha(seleccionado.fecha)}</span>
                  </div>
                  <div className="sg-info-item">
                    <span className="sg-info-label">Material / Producto</span>
                    <span className="sg-info-value">{seleccionado.producto || "—"}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", background: "#f8f9fa", borderLeft: "4px solid var(--sg-purple)", borderRadius: "0 8px 8px 0" }}>
                <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--sg-purple)", marginBottom: "0.25rem", textTransform: "uppercase" }}>
                  Veredicto / Observación
                </p>
                <p style={{ fontSize: "0.875rem", margin: 0 }}>
                  {mensajePorEstado(seleccionado)}
                </p>
              </div>
            </>
          )}

          {tab === "obs" && (
            <div>
              <p className="sg-section-label">
                <i className="fa-solid fa-comments"></i>
                Observación registrada
              </p>
              <div className="sg-obs-list" style={{ maxHeight: "none" }}>
                <div className="sg-obs-item">
                  <div className="sg-obs-item-meta">
                    <span><i className="fa-regular fa-calendar"></i> {formatFecha(seleccionado.fecha)}</span>
                    <BadgeEstado estado={seleccionado.estado} />
                  </div>
                  <p className="sg-obs-item-text">{mensajePorEstado(seleccionado)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sg-modal-footer">
          <button className="sg-btn sg-btn-secondary" onClick={onClose}>Volver</button>
        </div>
      </div>
    </div>
  );
}

function D_historialGarantias() {
  const { datos: garantias, cargando, error } = useRealtimeTable("garantias", {
    orderBy: "fecha",
    ascending: false,
  });

  const [busqueda, setBusqueda] = useState("");
  const [seleccionado, setSeleccionado] = useState(null);

  const resueltas = useMemo(
    () => garantias.filter((g) => g.estado === "aprobada" || g.estado === "rechazada"),
    [garantias]
  );

  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return resueltas;
    return resueltas.filter((fila) =>
      Object.values(fila).join(" ").toLowerCase().includes(termino)
    );
  }, [busqueda, resueltas]);

  return (
    <div className="sg-root">
      <div className="sg-page-header">
        <h1 className="sg-page-title">
          <i className="fa-solid fa-clock-rotate-left"></i>
          Historial de Garantías
        </h1>
        <span style={{
          background: "var(--sg-purple-light)",
          color: "var(--sg-purple)",
          border: "1px solid var(--sg-purple-pill)",
          borderRadius: 20,
          padding: "0.3rem 0.9rem",
          fontSize: "0.8rem",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
        }}>
          <i className="fa-solid fa-lock"></i> Vista de solo lectura
        </span>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <div className="sg-search-wrap">
          <input
            type="search"
            className="sg-search-input"
            placeholder="Buscar por orden, cliente o material..."
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
          />
          <button className="sg-btn sg-btn-black sg-search-btn" aria-label="Buscar">
            <i className="bi bi-search"></i>
          </button>
        </div>
      </div>

      {!cargando && !error && (
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          {[
            { label: "Total finalizadas", count: resueltas.length, color: "var(--sg-black)" },
            { label: "Aprobadas", count: resueltas.filter((g) => g.estado === "aprobada").length, color: "var(--sg-success)" },
            { label: "Rechazadas", count: resueltas.filter((g) => g.estado === "rechazada").length, color: "var(--sg-danger)" },
          ].map(({ label, count, color }) => (
            <div key={label} style={{
              background: "var(--sg-white)",
              borderRadius: 10,
              padding: "0.6rem 1rem",
              border: "1px solid var(--sg-border)",
              minWidth: 120,
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}>
              <p style={{ fontSize: "1.4rem", fontWeight: 700, color, margin: 0 }}>{count}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--sg-muted)", margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="sg-card">
        {cargando && <div className="sg-loading"><div className="sg-spinner"></div> Cargando historial…</div>}

        {error && (
          <div className="sg-empty">
            <i className="fa-solid fa-triangle-exclamation" style={{ color: "var(--sg-danger)" }}></i>
            <p>No se pudo conectar con la tabla "garantias": {error}</p>
          </div>
        )}

        {!cargando && !error && (
          <div className="sg-table-wrap">
            <table className="sg-table">
              <thead>
                <tr>
                  <th>N° Orden</th>
                  <th>Cliente</th>
                  <th>Material</th>
                  <th>Observación</th>
                  <th>Fecha</th>
                  <th style={{ textAlign: "center" }}>Estado / Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="sg-empty">
                        <i className="fa-solid fa-inbox"></i>
                        <p>
                          {busqueda
                            ? "Sin resultados para la búsqueda."
                            : "Aún no hay garantías resueltas."
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtrados.map((fila) => (
                    <tr key={fila.id}>
                      <td><strong>{fila.numero_orden}</strong></td>
                      <td>{fila.cliente_nombre}</td>
                      <td>{fila.producto}</td>
                      <td style={{ maxWidth: 220 }}>
                        <span style={{ fontSize: "0.82rem", color: "var(--sg-text)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {fila.observacion || "—"}
                        </span>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>{formatFecha(fila.fecha)}</td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
                          <BadgeEstado estado={fila.estado} />
                          <button
                            className="sg-btn sg-btn-orange"
                            style={{ fontSize: "0.78rem", padding: "0.3rem 0.7rem" }}
                            onClick={() => setSeleccionado(fila)}
                          >
                            <i className="fa-solid fa-eye"></i> Ver actualización
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {seleccionado && (
        <ModalHistorialDetalle
          seleccionado={seleccionado}
          onClose={() => setSeleccionado(null)}
        />
      )}
    </div>
  );
}

export default D_historialGarantias;