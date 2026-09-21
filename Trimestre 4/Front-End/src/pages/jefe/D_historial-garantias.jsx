import { useMemo, useState } from "react";
import "../../assets/css/D_garantia-jefe.css";
import logo from "../../assets/img/logo.png";
import { useRealtimeTable } from "../../hooks/useRealtimeTable";

/**
 * Garantías · Historial — registro acumulativo de garantías ya
 * resueltas (aprobadas o rechazadas), sincronizado en tiempo real
 * desde la misma tabla `garantias` que usa la página de Solicitudes.
 *
 * (El campo "Tipo" del diseño original —Proveedor/Ferretería— no
 * forma parte del esquema propuesto en src/api/supabase.js porque no
 * se especificó en el prompt; se omite en vez de inventar un dato que
 * no existe. Si tu tabla real sí lo tiene, es trivial re-agregar la
 * columna.)
 */

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
    <div className="mt-4 container-historial">
      <div className="row">
        <div className="col-lg-12 mx-auto">
          <div className="text-center py-2 mb-4 banner-historial">
            <h2 className="mb-0 fs-4">Historial de Garantías</h2>
          </div>

          {error && <div className="alert alert-danger">No se pudo conectar con la tabla "garantias": {error}</div>}

          <div className="card shadow-sm card-historial p-4">
            <div className="buscarOrden">
              <i className="bi bi-search"></i>
              <input
                type="search"
                placeholder="Buscar por orden, cliente o material"
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
              />
            </div>

            <div className="table-responsive">
              <table id="tablaHistorial" className="table align-middle text-center custom-table-historial w-100">
                <thead>
                  <tr>
                    <th>N° Orden</th>
                    <th>Cliente</th>
                    <th>Material</th>
                    <th>Observación</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {cargando ? (
                    <tr><td colSpan={6} className="py-4">Cargando historial…</td></tr>
                  ) : filtrados.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-muted py-4">Aún no hay garantías resueltas.</td>
                    </tr>
                  ) : (
                    filtrados.map((fila) => (
                      <tr key={fila.id}>
                        <td className="fw-bold">{fila.numero_orden}</td>
                        <td>{fila.cliente_nombre}</td>
                        <td>{fila.producto}</td>
                        <td>{fila.observacion || "—"}</td>
                        <td>
                          <button
                            className="btn btn-ver-actualizacion"
                            data-bs-toggle="modal"
                            data-bs-target="#modalEstadoGarantia"
                            onClick={() => setSeleccionado(fila)}
                          >
                            Ver actualización
                          </button>
                        </td>
                        <td>{fila.fecha ? new Date(fila.fecha).toLocaleDateString("es-CO") : "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE ESTADO DE GARANTÍA (compartido, se llena con el estado seleccionado) */}
      <div className="modal fade" id="modalEstadoGarantia" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content card-modal-comic p-4 text-center">
            <div className="mb-3 text-center">
              <img src={logo} alt="Kronos Inventory Control" className="img-fluid logo-modal-kronos" />
            </div>

            <div className="mb-2">
              <span className="fs-4">🔔</span>
              <span className="fw-bold fs-5 mx-2">Solicitud de garantía</span>
              <span className="fs-4">🔧</span>
            </div>

            <div className="caja-info-modal text-start p-3 mb-2">
              <p className="mb-1 text-muted">Nombre de la orden : <span className="fw-normal">{seleccionado?.numero_orden}</span></p>
              <p className="mb-1 text-muted">Producto : <span className="fw-bold">{seleccionado?.producto}</span></p>
              <p className="mb-0 text-muted">
                Fecha de solicitud : <span className="fw-bold">{seleccionado?.fecha ? new Date(seleccionado.fecha).toLocaleDateString("es-CO") : "—"}</span>
              </p>
            </div>

            <div className="caja-info-modal p-2 mb-2 d-flex align-items-center justify-content-center">
              <span className="fw-bold text-muted me-2">Estado de la garantía:</span>
              <span className={`badge-status-comic ${seleccionado?.estado || ""}`}>
                {seleccionado ? (ETIQUETA_ESTADO[seleccionado.estado] || seleccionado.estado) : "—"}
              </span>
            </div>

            <div className="caja-info-modal p-3 mb-4 text-start">
              <p className="mb-0 text-modal-desc text-center">{seleccionado ? mensajePorEstado(seleccionado) : "—"}</p>
            </div>

            <div className="d-grid gap-2 col-6 mx-auto">
              <button type="button" className="btn btn-volver-modal" data-bs-dismiss="modal">Volver</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default D_historialGarantias;
