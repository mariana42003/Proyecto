import { useMemo, useState } from "react";
import "../../assets/css/S_stock.css";
import logo from "../../assets/img/logo.png";
import { useRealtimeTable } from "../../hooks/useRealtimeTable";

/**
 * Gestión de Inventario · Stock — conectado en tiempo real a la tabla
 * `productos` de Supabase (ver esquema en src/api/supabase.js).
 *
 * Se conserva el comportamiento original (búsqueda, orden, paginación
 * de 5 registros, responsive, sin selector de cantidad ni info
 * inferior) implementado en React puro; lo único que cambia es el
 * origen de los datos: antes un array estático, ahora `productos` +
 * `postgres_changes` vía useRealtimeTable.
 */

const REGISTROS_POR_PAGINA = 5;

const COLUMNAS = [
  { clave: "codigo", etiqueta: "ID" },
  { clave: "nombre", etiqueta: "Material" },
  { clave: "categoria", etiqueta: "Categoría" },
  { clave: "stock_actual", etiqueta: "Stock Actual" },
  { clave: "ubicacion", etiqueta: "Ubicación en Bodega" },
  { clave: "precio", etiqueta: "Precio" },
];

const estadoDeStock = (producto) => {
  if (producto.stock_actual <= 0) return { clase: "agotado", etiqueta: "Agotado" };
  if (producto.stock_actual <= producto.umbral_minimo) return { clase: "bajo-stock", etiqueta: "Bajo stock" };
  return { clase: "estable", etiqueta: "Stock estable" };
};

function S_stock() {
  const { datos: productos, cargando, error } = useRealtimeTable("productos", {
    orderBy: "nombre",
    ascending: true,
  });

  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState({ columna: "nombre", direccion: "asc" });
  const [pagina, setPagina] = useState(1);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return productos;
    return productos.filter((fila) =>
      Object.values(fila).join(" ").toLowerCase().includes(termino)
    );
  }, [busqueda, productos]);

  const ordenados = useMemo(() => {
    const copia = [...filtrados];
    copia.sort((a, b) => {
      const valorA = a[orden.columna];
      const valorB = b[orden.columna];
      if (typeof valorA === "number" && typeof valorB === "number") {
        return orden.direccion === "asc" ? valorA - valorB : valorB - valorA;
      }
      return orden.direccion === "asc"
        ? String(valorA ?? "").localeCompare(String(valorB ?? ""))
        : String(valorB ?? "").localeCompare(String(valorA ?? ""));
    });
    return copia;
  }, [filtrados, orden]);

  const totalPaginas = Math.max(1, Math.ceil(ordenados.length / REGISTROS_POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const paginados = ordenados.slice(
    (paginaSegura - 1) * REGISTROS_POR_PAGINA,
    paginaSegura * REGISTROS_POR_PAGINA
  );

  const alternarOrden = (columna) => {
    setOrden((actual) => ({
      columna,
      direccion: actual.columna === columna && actual.direccion === "asc" ? "desc" : "asc",
    }));
    setPagina(1);
  };

  const manejarBusqueda = (evento) => {
    setBusqueda(evento.target.value);
    setPagina(1);
  };

  return (
    <div className="container-fluid">
      <header className="content-header mb-4">
        <h1>Gestión de Inventario</h1>
      </header>

      {error && <div className="alert alert-danger">No se pudo conectar con la tabla "productos": {error}</div>}

      <div className="buscador-stock">
        <i className="bi bi-search"></i>
        <input
          type="search"
          placeholder="Buscar material, categoría o ubicación..."
          value={busqueda}
          onChange={manejarBusqueda}
        />
      </div>

      <div className="card shadow-sm border-0 mt-2 dashboard-card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table id="tablaProductos" className="table table-hover align-middle mb-0 stock-table" style={{ width: "100%" }}>
              <thead className="table-light">
                <tr>
                  {COLUMNAS.map((columna) => (
                    <th key={columna.clave}>
                      <button
                        type="button"
                        className="stock-orden-btn"
                        onClick={() => alternarOrden(columna.clave)}
                      >
                        {columna.etiqueta}
                        {orden.columna === columna.clave && (
                          <i className={`bi ${orden.direccion === "asc" ? "bi-caret-up-fill" : "bi-caret-down-fill"}`}></i>
                        )}
                      </button>
                    </th>
                  ))}
                  <th className="text-center">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr><td colSpan={COLUMNAS.length + 1} className="text-center text-muted py-4">Cargando inventario…</td></tr>
                ) : paginados.length === 0 ? (
                  <tr>
                    <td colSpan={COLUMNAS.length + 1} className="text-center text-muted py-4">
                      No se encontraron resultados
                    </td>
                  </tr>
                ) : (
                  paginados.map((fila) => (
                    <tr key={fila.id}>
                      <td>{fila.codigo}</td>
                      <td>{fila.nombre}</td>
                      <td>{fila.categoria}</td>
                      <td>{fila.stock_actual}</td>
                      <td>{fila.ubicacion || "—"}</td>
                      <td>{fila.precio != null ? `$${Number(fila.precio).toLocaleString("es-CO")}` : "—"}</td>
                      <td className="text-center">
                        <button
                          className="btn-detalle"
                          data-bs-toggle="modal"
                          data-bs-target="#modalDetalleProducto"
                          onClick={() => setProductoSeleccionado(fila)}
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="stock-paginacion">
            <button
              type="button"
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={paginaSegura === 1}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            {Array.from({ length: totalPaginas }, (_, indice) => indice + 1).map((numero) => (
              <button
                key={numero}
                type="button"
                className={numero === paginaSegura ? "activa" : ""}
                onClick={() => setPagina(numero)}
              >
                {numero}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={paginaSegura === totalPaginas}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DETALLE PRODUCTO (idéntico al del resto del panel, ahora con datos reales) */}
      <div className="modal fade" id="modalDetalleProducto" tabIndex="-1">
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header encabezado-ficha">
              <div className="titulo-ficha">
                <i className="fa-solid fa-screwdriver-wrench"></i>
                <h2>Ficha Técnica: {productoSeleccionado?.nombre || "Producto"}</h2>
              </div>
              <img src={logo} alt="Logo" className="logo-modal" />
            </div>

            <div className="modal-body">
              <div className="datos-producto">
                <div>
                  <p><strong>Código:</strong></p>
                  <span>{productoSeleccionado?.codigo || "—"}</span>

                  <p><strong>Categoría:</strong></p>
                  <span>{productoSeleccionado?.categoria || "—"}</span>

                  <p><strong>Ubicación en Bodega:</strong></p>
                  <span>{productoSeleccionado?.ubicacion || "—"}</span>
                </div>

                <div>
                  <p><strong>Precio Unitario:</strong></p>
                  <span>
                    {productoSeleccionado?.precio != null
                      ? `$${Number(productoSeleccionado.precio).toLocaleString("es-CO")}`
                      : "—"}
                  </span>

                  <p><strong>Umbral mínimo:</strong></p>
                  <span>{productoSeleccionado?.umbral_minimo ?? "—"}</span>
                </div>
              </div>

              {productoSeleccionado && (
                <div className="panel-estado">
                  <div>
                    <h5>Panel de Estado Actual</h5>
                    <strong>Stock Físico: {productoSeleccionado.stock_actual} unidades</strong>
                  </div>

                  <span className={`badge-stock ${estadoDeStock(productoSeleccionado).clase}`}>
                    {estadoDeStock(productoSeleccionado).etiqueta}
                  </span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-cerrar-modal" data-bs-dismiss="modal">Cerrar Detalles</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default S_stock;
