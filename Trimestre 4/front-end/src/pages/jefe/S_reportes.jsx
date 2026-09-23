import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import "../../assets/css/S_reportes.css";
import { supabase } from "../../api/supabase";
import { useRealtimeTable } from "../../hooks/useRealtimeTable";

/**
 * Gestión de Inventario · Reportes — ahora conectado a Supabase:
 *   - Las categorías del formulario se cargan dinámicamente desde
 *     la tabla `productos` (categorías distintas realmente registradas).
 *   - Si no hay productos registrados, el botón "Generar reporte" se
 *     deshabilita y se muestra la advertencia (sección 3 del prompt).
 *   - Cada reporte generado se guarda en `reportes_generados` y la
 *     tabla de abajo se sincroniza en tiempo real con esa tabla.
 */

function S_reportes() {
  const { datos: productos, cargando: cargandoProductos } = useRealtimeTable("productos");
  const { datos: reportes, cargando: cargandoReportes } = useRealtimeTable("reportes_generados", {
    orderBy: "fecha",
    ascending: false,
  });

  const [tipo, setTipo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [guardando, setGuardando] = useState(false);

  const categorias = useMemo(() => {
    const unicas = new Set(productos.map((p) => p.categoria).filter(Boolean));
    return Array.from(unicas);
  }, [productos]);

  const hayProductos = !cargandoProductos && productos.length > 0;
  const hayReportes = reportes.length > 0;

  const cerrarModal = () => {
    const boton = document.querySelector("#modalReporte .btn-close");
    if (boton) boton.click();
  };

  const generarReporte = async (evento) => {
    evento.preventDefault();
    if (!tipo.trim() || !categoria || !cantidad.trim()) return;

    setGuardando(true);
    try {
      const { error } = await supabase.from("reportes_generados").insert({
        tipo: tipo.trim(),
        categoria,
        cantidad: Number(cantidad),
      });
      if (error) throw error;

      setTipo("");
      setCategoria("");
      setCantidad("");
      cerrarModal();
      Swal.fire({
        icon: "success",
        title: "Reporte generado",
        text: "El reporte se guardó correctamente.",
        confirmButtonColor: "#37ac1d",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo generar", text: error.message, confirmButtonColor: "#f44336" });
    } finally {
      setGuardando(false);
    }
  };

  const eliminarReporte = (id) => {
    Swal.fire({
      icon: "warning",
      title: "¿Eliminar reporte?",
      text: "Esta acción no se puede deshacer",
      showCancelButton: true,
      confirmButtonColor: "#f44336",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (resultado) => {
      if (!resultado.isConfirmed) return;
      try {
        const { error } = await supabase.from("reportes_generados").delete().eq("id", id);
        if (error) throw error;
        Swal.fire({ icon: "success", title: "Eliminado", text: "El reporte ha sido borrado con éxito.", confirmButtonColor: "#37ac1d" });
      } catch (error) {
        Swal.fire({ icon: "error", title: "No se pudo eliminar", text: error.message, confirmButtonColor: "#f44336" });
      }
    });
  };

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h3 text-secondary text-center text-md-start page-title">Generar reportes de inventario</h1>
        </div>
      </div>

      {/* SECCIÓN DE ALERTA Y BOTÓN */}
      <section className="report-form-container card shadow-sm p-4 bg-white mb-4">
        <div className="row g-3 align-items-center">
          <div
            className="col-12 col-md-8"
            style={hayProductos ? { display: "none" } : undefined}
          >
            <div className="alert-warning-custom d-flex align-items-center m-0" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
              <span>No existen productos registrados para generar el reporte</span>
            </div>
          </div>

          <div className={`col-12 col-md-4 ${hayProductos ? "text-start" : "text-md-end text-center"}`}>
            <button
              type="button"
              className="btn btn-reporte w-100 py-3"
              data-bs-toggle="modal"
              data-bs-target="#modalReporte"
              disabled={!hayProductos}
              title={!hayProductos ? "Registra al menos un producto para poder generar reportes" : undefined}
            >
              {hayProductos ? (
                <><i className="fa-solid fa-plus me-2"></i> Generar reporte</>
              ) : (
                <><i className="fa-solid fa-plus"></i><br />Generar reporte</>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* VENTANA MODAL */}
      <div className="modal fade" id="modalReporte" tabIndex="-1" aria-labelledby="modalReporteLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content modal-login border-0 shadow-lg">
            <div className="modal-header border-0 bg-dark text-light p-3">
              <h2 className="modal-tittle w-100 text-center m-0 fs-5" id="modalReporteLabel">Nuevo Reporte</h2>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body p-4">
              <form id="formReporte" onSubmit={generarReporte}>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tipo de reporte"
                    required
                    value={tipo}
                    onChange={(evento) => setTipo(evento.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <select
                    className="form-select"
                    required
                    value={categoria}
                    onChange={(evento) => setCategoria(evento.target.value)}
                  >
                    <option value="" disabled>Categoria</option>
                    {categorias.map((opcion) => (
                      <option key={opcion} value={opcion}>{opcion}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Cantidad"
                    required
                    value={cantidad}
                    onChange={(evento) => setCantidad(evento.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-reporte w-100 py-2 mt-2" disabled={guardando}>
                  {guardando ? "Generando…" : "Generar"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* TABLA DE REPORTES GENERADOS */}
      <div className="container-fluid mt-4 px-0">
        <div className="card shadow-sm border-0 dashboard-card">
          <div className="card-header bg-light py-3">
            <h5 className="mb-0 text-dark"><i className="bi bi-table me-2"></i>Reportes Generados</h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" id="tablaReportes" style={{ width: "100%" }}>
                <thead className="table-light">
                  <tr>
                    <th>ID Reporte</th>
                    <th>Tipo de Reporte</th>
                    <th>Categoría</th>
                    <th>Cantidad</th>
                    <th>Fecha de Generación</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cargandoReportes ? (
                    <tr><td colSpan={6} className="text-center py-4">Cargando reportes…</td></tr>
                  ) : !hayReportes ? (
                    <tr><td colSpan={6} className="text-center py-4 text-muted">Aún no se ha generado ningún reporte.</td></tr>
                  ) : (
                    reportes.map((reporte) => (
                      <tr key={reporte.id}>
                        <td>{reporte.id}</td>
                        <td>{reporte.tipo}</td>
                        <td>{reporte.categoria}</td>
                        <td>{reporte.cantidad}</td>
                        <td>{reporte.fecha ? new Date(reporte.fecha).toLocaleString("es-CO") : "—"}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-eliminar btn-sm"
                            onClick={() => eliminarReporte(reporte.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default S_reportes;
