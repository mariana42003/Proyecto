import { useState } from "react";
import Swal from "sweetalert2";
import "../../assets/css/D_garantia-jefe.css";
import { supabase } from "../../api/supabase";
import { useRealtimeTable } from "../../hooks/useRealtimeTable";

const ESTADOS = ["pendiente", "en_revision", "aprobada", "rechazada"];

const ETIQUETA_ESTADO = {
  pendiente: "Pendiente",
  en_revision: "En revisión",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
};

const badgeClass = (estado) => {
  const map = {
    pendiente: "sg-badge-pendiente",
    en_revision: "sg-badge-proveedor",
    aprobada: "sg-badge-aprobado",
    rechazada: "sg-badge-rechazado",
  };
  return map[estado] ?? "sg-badge-pendiente";
};

const modalHeadClass = (estado) => {
  const map = {
    pendiente: "sg-modal-head--pendiente",
    en_revision: "sg-modal-head--proveedor",
    aprobada: "sg-modal-head--aprobado",
    rechazada: "sg-modal-head--rechazado",
  };
  return map[estado] ?? "sg-modal-head--pendiente";
};

function formatFecha(fecha) {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleDateString("es-CO");
}

function BadgeEstado({ estado }) {
  const label = ETIQUETA_ESTADO[estado] || estado || "Pendiente";
  return <span className={`sg-badge ${badgeClass(estado)}`}>{label}</span>;
}

function ModalDetalleSolicitud({ seleccionada, onClose, onGuardarSuccess }) {
  const [estadoEdicion, setEstadoEdicion] = useState(seleccionada?.estado || "pendiente");
  const [observacionEdicion, setObservacionEdicion] = useState(seleccionada?.observacion || "");
  const [guardando, setGuardando] = useState(false);
  const [tab, setTab] = useState("info");

  if (!seleccionada) return null;

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      const { error: errorUpdate } = await supabase
        .from("garantias")
        .update({ estado: estadoEdicion, observacion: observacionEdicion })
        .eq("id", seleccionada.id);

      if (errorUpdate) throw errorUpdate;

      Swal.fire({
        icon: "success",
        title: "Solicitud actualizada",
        text: "El cliente verá el nuevo estado en su apartado de garantías.",
        confirmButtonColor: "#8d86c9",
      });

      onGuardarSuccess();
      onClose();
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

  const accentClass = modalHeadClass(seleccionada.estado);

  return (
    <div className="sg-overlay" onClick={onClose}>
      <div className="sg-modal" onClick={(e) => e.stopPropagation()}>
        <div className={`sg-modal-head ${accentClass}`}>
          <h5>
            <i className="fa-solid fa-circle-info"></i> Detalle — {seleccionada.numero_orden}
          </h5>
          <button className="sg-modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div style={{ borderBottom: "1px solid var(--sg-border)", display: "flex", gap: "1.5rem", padding: "0 1.5rem", background: "var(--sg-white)", flexShrink: 0 }}>
          {[["info", "Información"], ["gestion", "Gestión / Respuesta"]].map(([k, lbl]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0.6rem 0",
                fontWeight: 600,
                fontSize: "0.875rem",
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
            <div className="sg-detail-grid">
              <div className="sg-info-list" style={{ gridColumn: "1 / -1" }}>
                <div className="sg-info-item">
                  <span className="sg-info-label">Cliente</span>
                  <span className="sg-info-value">{seleccionada.cliente_nombre || "—"}</span>
                </div>
                <div className="sg-info-item">
                  <span className="sg-info-label">N.º de orden</span>
                  <span className="sg-info-value">{seleccionada.numero_orden || "—"}</span>
                </div>
                <div className="sg-info-item">
                  <span className="sg-info-label">Fecha</span>
                  <span className="sg-info-value">{formatFecha(seleccionada.fecha)}</span>
                </div>
                <div className="sg-info-item">
                  <span className="sg-info-label">Producto</span>
                  <span className="sg-info-value">{seleccionada.producto || "—"}</span>
                </div>
                <div className="sg-info-item">
                  <span className="sg-info-label">Estado actual</span>
                  <BadgeEstado estado={seleccionada.estado} />
                </div>
                <div className="sg-info-item sg-info-full">
                  <span className="sg-info-label">Motivo del reclamo</span>
                  <span className="sg-info-value">{seleccionada.motivo || "—"}</span>
                </div>
                <div className="sg-info-item sg-info-full">
                  <span className="sg-info-label">Observación previa</span>
                  <span className="sg-info-value">{seleccionada.observacion || "—"}</span>
                </div>
              </div>
            </div>
          )}

          {tab === "gestion" && (
            <div style={{ padding: "0.5rem" }}>
              <p className="sg-section-label">
                <i className="fa-solid fa-pen"></i> Gestión (solo jefe / administrador)
              </p>
              <div className="sg-form-grid" style={{ gap: "0.75rem" }}>
                <div>
                  <label className="sg-label" htmlFor="sg-estado-select">Estado de la solicitud</label>
                  <select
                    id="sg-estado-select"
                    className="sg-select"
                    value={estadoEdicion}
                    onChange={(e) => setEstadoEdicion(e.target.value)}
                  >
                    {ESTADOS.map((est) => (
                      <option key={est} value={est}>
                        {ETIQUETA_ESTADO[est]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sg-form-full">
                  <label className="sg-label" htmlFor="sg-obs-text">Observación para el cliente</label>
                  <textarea
                    id="sg-obs-text"
                    rows={4}
                    className="sg-textarea"
                    placeholder="Ej. Se aprueba el cambio, pasa por el punto de recolección más cercano."
                    value={observacionEdicion}
                    onChange={(e) => setObservacionEdicion(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sg-modal-footer">
          <button className="sg-btn sg-btn-secondary" onClick={onClose}>
            Cerrar
          </button>
          <button className="sg-btn sg-btn-black" onClick={handleGuardar} disabled={guardando}>
            {guardando ? (
              <>
                <span className="sg-spinner" style={{ width: 14, height: 14 }}></span> Guardando…
              </>
            ) : (
              <>
                <i className="fa-solid fa-floppy-disk"></i> Guardar cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function D_solicitudGarantias() {
  const { datos: solicitudes, cargando, error } = useRealtimeTable("garantias", {
    orderBy: "fecha",
    ascending: false,
  });

  const [busqueda, setBusqueda] = useState("");
  const [seleccionada, setSeleccionada] = useState(null);

  const listado = solicitudes.filter((fila) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    return (
      fila.numero_orden?.toLowerCase().includes(q) ||
      fila.cliente_nombre?.toLowerCase().includes(q) ||
      fila.producto?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="sg-root">
      <div className="sg-page-header">
        <h1 className="sg-page-title">
          <i className="fa-solid fa-shield-halved"></i>
          Solicitudes de Garantías
        </h1>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <div className="sg-search-wrap">
          <input
            type="search"
            className="sg-search-input"
            placeholder="Buscar por orden, cliente o producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <button className="sg-btn sg-btn-black sg-search-btn" aria-label="Buscar">
            <i className="bi bi-search"></i>
          </button>
        </div>
      </div>

      <div className="sg-card">
        {cargando && (
          <div className="sg-loading">
            <div className="sg-spinner"></div> Cargando solicitudes…
          </div>
        )}

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
                  <th>Producto</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th style={{ textAlign: "center" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {listado.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="sg-empty">
                        <i className="fa-solid fa-inbox"></i>
                        <p>
                          {busqueda
                            ? "Sin resultados para la búsqueda."
                            : "No hay solicitudes de garantía por el momento."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  listado.map((solicitud) => (
                    <tr key={solicitud.id}>
                      <td><strong>{solicitud.numero_orden}</strong></td>
                      <td>{solicitud.cliente_nombre}</td>
                      <td>{solicitud.producto}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{formatFecha(solicitud.fecha)}</td>
                      <td>
                        <BadgeEstado estado={solicitud.estado} />
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center" }}>
                          <button
                            className="sg-btn sg-btn-black sg-btn-icon"
                            title="Ver detalle"
                            onClick={() => setSeleccionada(solicitud)}
                          >
                            <i className="fa-solid fa-eye"></i>
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

      {seleccionada && (
        <ModalDetalleSolicitud
          seleccionada={seleccionada}
          onClose={() => setSeleccionada(null)}
          onGuardarSuccess={() => setSeleccionada(null)}
        />
      )}
    </div>
  );
}

export default D_solicitudGarantias;