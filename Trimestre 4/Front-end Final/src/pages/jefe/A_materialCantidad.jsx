import { useMemo, useState } from "react";
import { Modal } from "bootstrap";
import Swal from "sweetalert2";
import "../../assets/css/A_materiales-ordenes-jefe.css";
import logo from "../../assets/img/logo.png";
import { supabase } from "../../api/supabase";
import { useRealtimeTable } from "../../hooks/useRealtimeTable";

/**
 * Órdenes de Compra · Asociar Materiales / Generar Orden.
 *
 * Conectado en tiempo real a `productos` (catálogo con stock real) y a
 * `proveedores` (solo se listan los `activo = true`, según la sección 6
 * del prompt: "carga en tiempo real únicamente los proveedores
 * activos"). Al confirmar, se inserta una fila en `ordenes_compra` por
 * cada material del carrito, con `origen: "interno"`.
 */

function A_materialCantidad() {
  const { datos: productos, cargando: cargandoProductos } = useRealtimeTable("productos", {
    orderBy: "nombre",
    ascending: true,
  });
  const { datos: proveedores } = useRealtimeTable("proveedores", { orderBy: "nombre", ascending: true });
  const proveedoresActivos = useMemo(() => proveedores.filter((p) => p.activo !== false), [proveedores]);

  const [busqueda, setBusqueda] = useState("");
  const [cantidades, setCantidades] = useState({});
  const [carrito, setCarrito] = useState([]);
  const [proveedorPorMaterial, setProveedorPorMaterial] = useState({});
  const [enviando, setEnviando] = useState(false);

  const catalogoFiltrado = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return productos;
    return productos.filter((material) =>
      `${material.codigo || ""} ${material.nombre}`.toLowerCase().includes(termino)
    );
  }, [busqueda, productos]);

  const agregarAlCarrito = (material) => {
    const cantidad = Number(cantidades[material.id]) || 1;
    setCarrito((actual) => {
      const yaExiste = actual.some((item) => item.id === material.id);
      if (yaExiste) {
        return actual.map((item) => (item.id === material.id ? { ...item, cantidad } : item));
      }
      return [...actual, { id: material.id, codigo: material.codigo, nombre: material.nombre, precio: material.precio, cantidad }];
    });
  };

  const quitarDelCarrito = (id) => {
    setCarrito((actual) => actual.filter((item) => item.id !== id));
    setProveedorPorMaterial((actual) => {
      const copia = { ...actual };
      delete copia[id];
      return copia;
    });
  };

  const seleccionarProveedor = (id, proveedorId) => {
    setProveedorPorMaterial((actual) => ({ ...actual, [id]: proveedorId }));
  };

  const confirmarOrden = async () => {
    const faltaProveedor = carrito.some((item) => !proveedorPorMaterial[item.id]);
    if (faltaProveedor) {
      Swal.fire({
        icon: "warning",
        title: "Faltan proveedores",
        text: "Selecciona un proveedor para cada material antes de confirmar.",
        confirmButtonColor: "#933c9e",
      });
      return;
    }

    setEnviando(true);
    try {
      const filas = carrito.map((item) => {
        const proveedor = proveedoresActivos.find((p) => String(p.id) === String(proveedorPorMaterial[item.id]));
        return {
          codigo: `OC-${Date.now().toString().slice(-6)}-${item.id}`,
          producto_id: item.id,
          producto_nombre: item.nombre,
          cantidad: item.cantidad,
          proveedor_id: proveedor?.id || null,
          proveedor_nombre: proveedor?.nombre || null,
          precio_unitario: item.precio || null,
          origen: "interno",
          estado: "pendiente",
        };
      });

      const { error } = await supabase.from("ordenes_compra").insert(filas);
      if (error) throw error;

      Modal.getOrCreateInstance("#modalAsociarProveedores").hide();

      Swal.fire({
        icon: "success",
        title: "¡Orden Enviada!",
        text: "La orden de compra ha sido generada y asociada a los proveedores seleccionados.",
        confirmButtonColor: "#8d86c9",
      });

      setCarrito([]);
      setProveedorPorMaterial({});
      setCantidades({});
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo generar la orden", text: error.message, confirmButtonColor: "#933c9e" });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <div className="cabecera-tabla">
        <div className="tituloProveedores">
          <h1><i className="bi bi-clipboard-plus"></i> Generar orden de compra</h1>
          <p>Selecciona los materiales que deseas adquirir e indica la cantidad; luego confirma para asociarlos a un proveedor.</p>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* CATÁLOGO DE MATERIALES */}
        <div className="col-lg-7">
          <div className="tablaProductos p-4 rounded shadow-sm h-100">
            <h2 className="mb-3">Materiales disponibles</h2>

            <div className="buscarOrden">
              <i className="bi bi-search"></i>
              <input
                type="search"
                placeholder="Buscar por código o nombre..."
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
              />
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" id="tablaMateriales">
                <thead>
                  <tr>
                    <th>Codigo</th>
                    <th>Material</th>
                    <th>Stock</th>
                    <th>Cantidad</th>
                    <th className="text-center">Agregar</th>
                  </tr>
                </thead>
                <tbody>
                  {cargandoProductos ? (
                    <tr><td colSpan={5} className="text-center py-4">Cargando catálogo…</td></tr>
                  ) : catalogoFiltrado.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-4">No se encontraron materiales</td>
                    </tr>
                  ) : (
                    catalogoFiltrado.map((material) => (
                      <tr key={material.id}>
                        <td>{material.codigo}</td>
                        <td>{material.nombre}</td>
                        <td><span className={material.stock_actual <= 0 ? "agotado" : "normal"}>{material.stock_actual}</span></td>
                        <td>
                          <input
                            className="cantidad form-control form-control-sm"
                            type="number"
                            placeholder="Cant."
                            min="1"
                            step="1"
                            value={cantidades[material.id] || ""}
                            onChange={(evento) =>
                              setCantidades((actual) => ({ ...actual, [material.id]: evento.target.value }))
                            }
                          />
                        </td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm rounded-circle"
                            title="Agregar al pedido"
                            onClick={() => agregarAlCarrito(material)}
                          >
                            <i className="bi bi-plus-lg"></i>
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

        {/* CARRITO DE SELECCIONADOS */}
        <div className="col-lg-5">
          <div className="tablaProductos p-4 rounded shadow-sm carritoMateriales">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h2 className="mb-0"><i className="bi bi-cart-check text-success"></i> Seleccionados</h2>
              <span className="badge-contador" id="contadorSeleccionados">
                {carrito.length} {carrito.length === 1 ? "material" : "materiales"}
              </span>
            </div>

            <ul className="listaCarrito list-unstyled mb-4" id="listaCarrito">
              {carrito.map((item) => (
                <li key={item.id} className="itemCarrito d-flex align-items-center justify-content-between">
                  <div>
                    <p className="mb-0 fw-semibold">{item.nombre}</p>
                    <p className="mb-0 text-muted small">Código {item.codigo} · Cantidad: {item.cantidad}</p>
                  </div>
                  <i
                    className="bi bi-trash text-danger"
                    style={{ cursor: "pointer" }}
                    title="Quitar"
                    onClick={() => quitarDelCarrito(item.id)}
                  ></i>
                </li>
              ))}
            </ul>

            {carrito.length === 0 && (
              <div className="estadoVacioSeleccion">
                <i className="bi bi-inbox"></i>
                <p>Aún no has seleccionado ningún material.</p>
              </div>
            )}

            <button
              type="button"
              className="btn btn-primary btn-lg w-100 shadow"
              data-bs-toggle="modal"
              data-bs-target="#modalAsociarProveedores"
              disabled={carrito.length === 0}
            >
              Confirmar <i className="bi bi-arrow-right-circle ms-1"></i>
            </button>
          </div>
        </div>
      </div>

      <h3 className="advertenciaProductos alert alert-info border-0 shadow-sm text-dark d-flex align-items-center">
        <i className="bi bi-exclamation-triangle-fill text-info fs-4 me-3"></i>
        <span className="fs-5">Al presionar "Confirmar" podrás asignar un proveedor a cada material seleccionado.</span>
      </h3>

      {/* MODAL · ASOCIAR PROVEEDORES */}
      <div className="modal fade" id="modalAsociarProveedores" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header header-historial">
              <h5 className="m-0 fw-bold text-white"><i className="bi bi-people-fill me-2"></i>Asociar proveedores</h5>
              <img src={logo} alt="Logo Kronos" className="logo-modal" />
            </div>

            <div className="modal-body p-4">
              <p className="text-muted mb-4">Selecciona el proveedor que surtirá cada material antes de generar la orden de compra.</p>

              {proveedoresActivos.length === 0 && (
                <div className="alert alert-warning">No hay proveedores activos registrados todavía.</div>
              )}

              <div className="table-responsive">
                <table className="table align-middle mb-0" id="tablaAsociarProveedores">
                  <thead>
                    <tr>
                      <th>Material</th>
                      <th className="text-center">Cantidad</th>
                      <th>Proveedor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carrito.map((item) => (
                      <tr key={item.id}>
                        <td>{item.nombre} <span className="text-muted small d-block">{item.codigo}</span></td>
                        <td className="text-center fw-bold">{item.cantidad}</td>
                        <td>
                          <select
                            className="form-select"
                            value={proveedorPorMaterial[item.id] || ""}
                            onChange={(evento) => seleccionarProveedor(item.id, evento.target.value)}
                          >
                            <option value="" disabled>Selecciona un proveedor</option>
                            {proveedoresActivos.map((proveedor) => (
                              <option key={proveedor.id} value={proveedor.id}>{proveedor.nombre}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer d-flex justify-content-between">
              <button type="button" className="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" className="btn btn-naranja fw-bold" id="btnConfirmarProveedores" onClick={confirmarOrden} disabled={enviando}>
                <i className="bi bi-check-circle"></i> {enviando ? "Enviando…" : "Confirmar orden"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default A_materialCantidad;
