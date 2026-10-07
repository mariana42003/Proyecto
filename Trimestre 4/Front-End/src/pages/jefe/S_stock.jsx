import { useMemo, useRef, useState } from "react";
import "../../assets/css/S_stock.css";
import logo from "../../assets/img/logo.png";
import { useRealtimeTable } from "../../hooks/useRealtimeTable";
// AJUSTA esta importación según cómo exportes el cliente en src/api/supabase.js
import { supabase } from "../../api/supabase";

/**
 * Gestión de Inventario · Stock (tiempo real con Supabase)
 *
 *  - Tablas: `productos` y `categorias` (ver categorias.sql).
 *  - Categorías en tarjetas con icono + descripción + cantidad al seleccionar.
 *  - "Seleccionar todas" / "Limpiar".
 *  - Crear categoría nueva (sin repetidas, ignora mayúsculas, tildes y espacios).
 *  - Eliminar categoría (sus productos pasan a "Sin categoría").
 *  - Editar producto con la categoría en lista desplegable (no se escribe).
 *  - Eliminar producto (con confirmación).
 */

const REGISTROS_POR_PAGINA = 5;
const SIN_CATEGORIA = "Sin categoría";

const COLUMNAS = [
  { clave: "codigo", etiqueta: "ID" },
  { clave: "nombre", etiqueta: "Material" },
  { clave: "categoria", etiqueta: "Categoría" },
  { clave: "stock_actual", etiqueta: "Stock Actual" },
  { clave: "ubicacion", etiqueta: "Ubicación en Bodega" },
  { clave: "precio", etiqueta: "Precio" },
];

/* Iconos (Bootstrap Icons) que se pueden elegir al crear una categoría */
const ICONOS = [
  "bi-tools", "bi-hammer", "bi-plug", "bi-lightning-charge",
  "bi-paperclip", "bi-box-seam", "bi-gear", "bi-droplet",
  "bi-paint-bucket", "bi-shield-check", "bi-lightbulb", "bi-truck",
  "bi-cpu", "bi-key", "bi-scissors", "bi-tag",
];
const ICONO_POR_DEFECTO = "bi-tag";

/* Normaliza para comparar: sin tildes, minúsculas y espacios simples */
const normalizar = (texto) =>
  String(texto ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

/* Icono sugerido para categorías que no tienen uno propio */
const adivinarIcono = (nombre) => {
  const n = normalizar(nombre);
  const reglas = [
    ["herramient", "bi-tools"],
    ["accesori", "bi-plug"],
    ["fijacion", "bi-paperclip"],
    ["electric", "bi-lightning-charge"],
    ["pintur", "bi-paint-bucket"],
    ["seguridad", "bi-shield-check"],
    ["epp", "bi-shield-check"],
    ["ilumin", "bi-lightbulb"],
    ["plomer", "bi-droplet"],
    ["hidraul", "bi-droplet"],
    ["tornill", "bi-gear"],
    ["ferreter", "bi-hammer"],
    ["transporte", "bi-truck"],
  ];
  const regla = reglas.find(([clave]) => n.includes(clave));
  return regla ? regla[1] : ICONO_POR_DEFECTO;
};

const estadoDeStock = (producto) => {
  if (producto.stock_actual <= 0) return { clase: "agotado", etiqueta: "Agotado" };
  if (producto.stock_actual <= producto.umbral_minimo) return { clase: "bajo-stock", etiqueta: "Bajo stock" };
  return { clase: "estable", etiqueta: "Stock estable" };
};

const FORM_VACIO = {
  id: null,
  codigo: "",
  nombre: "",
  categoria: "",
  stock_actual: 0,
  umbral_minimo: 0,
  ubicacion: "",
  precio: 0,
};

const FORM_CATEGORIA_VACIO = { nombre: "", descripcion: "", icono: "bi-tools" };

function S_stock() {
  const { datos: productosRaw, cargando, error } = useRealtimeTable("productos", {
    orderBy: "nombre",
    ascending: true,
  });
  const { datos: tablaCategoriasRaw } = useRealtimeTable("categorias", {
    orderBy: "nombre",
    ascending: true,
  });

  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState({ columna: "nombre", direccion: "asc" });
  const [pagina, setPagina] = useState(1);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  // Categorías seleccionadas (guardamos la "clave" normalizada)
  const [clavesSel, setClavesSel] = useState([]);
  // Categorías recién creadas (se ven al instante aunque el realtime tarde)
  const [categoriasNuevas, setCategoriasNuevas] = useState([]);

  // Elementos eliminados (se ocultan al instante aunque el realtime tarde)
  const [idsProductosEliminados, setIdsProductosEliminados] = useState([]);
  const [idsCategoriasEliminadas, setIdsCategoriasEliminadas] = useState([]);
  const [clavesCategoriasEliminadas, setClavesCategoriasEliminadas] = useState([]);

  // Edición de producto
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [errorEdicion, setErrorEdicion] = useState("");
  const botonCerrarEdicion = useRef(null);

  // Nueva categoría
  const [formCat, setFormCat] = useState(FORM_CATEGORIA_VACIO);
  const [guardandoCat, setGuardandoCat] = useState(false);
  const [errorCat, setErrorCat] = useState("");
  const botonCerrarCategoria = useRef(null);

  // Eliminar producto
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [eliminandoProducto, setEliminandoProducto] = useState(false);
  const [errorEliminarProducto, setErrorEliminarProducto] = useState("");
  const botonCerrarEliminarProducto = useRef(null);

  // Eliminar categoría
  const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);
  const [eliminandoCategoria, setEliminandoCategoria] = useState(false);
  const [errorEliminarCategoria, setErrorEliminarCategoria] = useState("");
  const botonCerrarEliminarCategoria = useRef(null);

  const [exito, setExito] = useState("");

  const mostrarExito = (mensaje) => {
    setExito(mensaje);
    setTimeout(() => setExito(""), 3000);
  };

  /* ---------- Datos sin los elementos recién eliminados ---------- */
  const productos = useMemo(
    () => productosRaw.filter((p) => !idsProductosEliminados.includes(p.id)),
    [productosRaw, idsProductosEliminados]
  );
  const tablaCategorias = useMemo(
    () => tablaCategoriasRaw.filter((c) => !idsCategoriasEliminadas.includes(c.id)),
    [tablaCategoriasRaw, idsCategoriasEliminadas]
  );

  /* ---------- Lista de categorías (tabla + las que ya usan los productos) ---------- */
  const categorias = useMemo(() => {
    const mapa = new Map();
    const agregar = (categoria, virtual = false) => {
      const nombre = String(categoria.nombre ?? "").trim().replace(/\s+/g, " ");
      const clave = normalizar(nombre);
      if (!clave || mapa.has(clave)) return;
      // Una categoría "virtual" (solo existe en productos) no se muestra si acaba de eliminarse
      if (virtual && clavesCategoriasEliminadas.includes(clave)) return;
      mapa.set(clave, {
        id: categoria.id ?? null, // null = no existe como fila en la tabla `categorias`
        clave,
        nombre,
        descripcion: categoria.descripcion || "",
        icono:
          categoria.icono && categoria.icono !== ICONO_POR_DEFECTO
            ? categoria.icono
            : adivinarIcono(nombre),
        virtual,
        sinCategoria: nombre === SIN_CATEGORIA,
      });
    };

    [...tablaCategorias, ...categoriasNuevas].forEach((c) => agregar(c));
    // Categorías que aparecen en productos pero no están en la tabla
    productos.forEach((p) => agregar({ nombre: p.categoria || SIN_CATEGORIA }, true));

    return [...mapa.values()].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [tablaCategorias, categoriasNuevas, productos, clavesCategoriasEliminadas]);

  const clavesExistentes = useMemo(
    () => new Set(categorias.map((c) => c.clave)),
    [categorias]
  );

  const conteoPorClave = useMemo(() => {
    const conteo = {};
    productos.forEach((p) => {
      const clave = normalizar(p.categoria || SIN_CATEGORIA);
      conteo[clave] = (conteo[clave] || 0) + 1;
    });
    return conteo;
  }, [productos]);

  // Categorías disponibles para el desplegable de edición
  const categoriasElegibles = categorias.filter((c) => !c.sinCategoria);

  const totalSeleccionado = clavesSel.reduce(
    (suma, clave) => suma + (conteoPorClave[clave] || 0),
    0
  );
  const todasSeleccionadas =
    categorias.length > 0 && clavesSel.length === categorias.length;

  const alternarCategoria = (clave) => {
    setClavesSel((actual) =>
      actual.includes(clave) ? actual.filter((c) => c !== clave) : [...actual, clave]
    );
    setPagina(1);
  };

  const alternarTodas = () => {
    setClavesSel(todasSeleccionadas ? [] : categorias.map((c) => c.clave));
    setPagina(1);
  };

  const limpiarCategorias = () => {
    setClavesSel([]);
    setPagina(1);
  };

  /* ---------- Filtrado, orden y paginación ---------- */
  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    return productos.filter((fila) => {
      const clave = normalizar(fila.categoria || SIN_CATEGORIA);
      const coincideCategoria = clavesSel.length === 0 || clavesSel.includes(clave);
      const coincideBusqueda =
        !termino || Object.values(fila).join(" ").toLowerCase().includes(termino);
      return coincideCategoria && coincideBusqueda;
    });
  }, [busqueda, productos, clavesSel]);

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

  /* ---------- Crear categoría ---------- */
  const abrirNuevaCategoria = () => {
    setFormCat(FORM_CATEGORIA_VACIO);
    setErrorCat("");
  };

  const nombreRepetido =
    formCat.nombre.trim() !== "" && clavesExistentes.has(normalizar(formCat.nombre));

  const crearCategoria = async (evento) => {
    evento.preventDefault();
    setErrorCat("");

    const nombre = formCat.nombre.trim().replace(/\s+/g, " ");
    if (!nombre) {
      setErrorCat("Escribe el nombre de la categoría.");
      return;
    }
    if (clavesExistentes.has(normalizar(nombre))) {
      setErrorCat(`Ya existe una categoría llamada "${nombre}".`);
      return;
    }

    setGuardandoCat(true);
    const { data, error: errorInsert } = await supabase
      .from("categorias")
      .insert({
        nombre,
        descripcion: formCat.descripcion.trim() || null,
        icono: formCat.icono,
      })
      .select()
      .single();
    setGuardandoCat(false);

    if (errorInsert) {
      setErrorCat(
        errorInsert.code === "23505"
          ? `Ya existe una categoría llamada "${nombre}".`
          : `No se pudo crear la categoría: ${errorInsert.message}`
      );
      return;
    }

    // Si antes se había eliminado una con el mismo nombre, vuelve a permitirse
    setClavesCategoriasEliminadas((actual) => actual.filter((c) => c !== normalizar(nombre)));
    setCategoriasNuevas((actual) => [...actual, data]);
    botonCerrarCategoria.current?.click();
    mostrarExito(`Categoría "${nombre}" creada correctamente.`);
  };

  /* ---------- Eliminar categoría ---------- */
  const prepararEliminarCategoria = (categoria) => {
    setErrorEliminarCategoria("");
    setCategoriaAEliminar(categoria);
  };

  const eliminarCategoria = async () => {
    const categoria = categoriaAEliminar;
    if (!categoria) return;

    setErrorEliminarCategoria("");
    setEliminandoCategoria(true);

    // 1) Los productos de esta categoría pasan a "Sin categoría"
    const idsAfectados = productos
      .filter((p) => normalizar(p.categoria || SIN_CATEGORIA) === categoria.clave)
      .map((p) => p.id);

    if (idsAfectados.length > 0) {
      const { error: errorMover } = await supabase
        .from("productos")
        .update({ categoria: SIN_CATEGORIA })
        .in("id", idsAfectados);

      if (errorMover) {
        setEliminandoCategoria(false);
        setErrorEliminarCategoria(`No se pudieron reasignar los productos: ${errorMover.message}`);
        return;
      }
    }

    // 2) Se borra la categoría de la tabla (si existe como fila)
    if (categoria.id) {
      const { data: borradas, error: errorDelete } = await supabase
        .from("categorias")
        .delete()
        .eq("id", categoria.id)
        .select();

      if (errorDelete) {
        setEliminandoCategoria(false);
        setErrorEliminarCategoria(`No se pudo eliminar: ${errorDelete.message}`);
        return;
      }
      if (!borradas || borradas.length === 0) {
        setEliminandoCategoria(false);
        setErrorEliminarCategoria(
          "Supabase no borró nada. Revisa que exista una política (RLS) de DELETE en la tabla categorias."
        );
        return;
      }
      setIdsCategoriasEliminadas((actual) => [...actual, categoria.id]);
      setCategoriasNuevas((actual) => actual.filter((c) => c.id !== categoria.id));
    }

    setEliminandoCategoria(false);
    setClavesCategoriasEliminadas((actual) => [...actual, categoria.clave]);
    setClavesSel((actual) => actual.filter((c) => c !== categoria.clave));
    setPagina(1);
    botonCerrarEliminarCategoria.current?.click();
    mostrarExito(
      idsAfectados.length > 0
        ? `Categoría "${categoria.nombre}" eliminada. ${idsAfectados.length} producto(s) pasaron a "${SIN_CATEGORIA}".`
        : `Categoría "${categoria.nombre}" eliminada.`
    );
  };

  /* ---------- Editar producto ---------- */
  const abrirEdicion = (fila) => {
    setErrorEdicion("");
    // Usa el nombre "oficial" de la categoría para que el select lo reconozca
    const oficial = categorias.find((c) => c.clave === normalizar(fila.categoria));
    setForm({
      id: fila.id,
      codigo: fila.codigo ?? "",
      nombre: fila.nombre ?? "",
      categoria: oficial && !oficial.sinCategoria ? oficial.nombre : "",
      stock_actual: fila.stock_actual ?? 0,
      umbral_minimo: fila.umbral_minimo ?? 0,
      ubicacion: fila.ubicacion ?? "",
      precio: fila.precio ?? 0,
    });
  };

  const manejarCambioForm = (evento) => {
    const { name, value } = evento.target;
    setForm((actual) => ({ ...actual, [name]: value }));
  };

  const guardarEdicion = async (evento) => {
    evento.preventDefault();
    setErrorEdicion("");

    if (!form.nombre.trim()) {
      setErrorEdicion("El nombre del material es obligatorio.");
      return;
    }
    if (!form.categoria) {
      setErrorEdicion("Selecciona una categoría.");
      return;
    }
    if (Number(form.stock_actual) < 0 || Number(form.precio) < 0 || Number(form.umbral_minimo) < 0) {
      setErrorEdicion("Stock, umbral y precio no pueden ser negativos.");
      return;
    }

    setGuardando(true);
    const { error: errorUpdate } = await supabase
      .from("productos")
      .update({
        codigo: form.codigo.trim(),
        nombre: form.nombre.trim(),
        categoria: form.categoria,
        stock_actual: Number(form.stock_actual),
        umbral_minimo: Number(form.umbral_minimo),
        ubicacion: form.ubicacion.trim() || null,
        precio: Number(form.precio),
      })
      .eq("id", form.id);
    setGuardando(false);

    if (errorUpdate) {
      setErrorEdicion(`No se pudo guardar: ${errorUpdate.message}`);
      return;
    }

    botonCerrarEdicion.current?.click();
    mostrarExito("Producto actualizado correctamente.");
  };

  /* ---------- Eliminar producto ---------- */
  const prepararEliminarProducto = (fila) => {
    setErrorEliminarProducto("");
    setProductoAEliminar(fila);
  };

  const eliminarProducto = async () => {
    const fila = productoAEliminar;
    if (!fila) return;

    setErrorEliminarProducto("");
    setEliminandoProducto(true);
    const { data: borrados, error: errorDelete } = await supabase
      .from("productos")
      .delete()
      .eq("id", fila.id)
      .select();
    setEliminandoProducto(false);

    if (errorDelete) {
      setErrorEliminarProducto(`No se pudo eliminar: ${errorDelete.message}`);
      return;
    }
    if (!borrados || borrados.length === 0) {
      setErrorEliminarProducto(
        "Supabase no borró nada. Revisa que exista una política (RLS) de DELETE en la tabla productos."
      );
      return;
    }

    setIdsProductosEliminados((actual) => [...actual, fila.id]);
    botonCerrarEliminarProducto.current?.click();
    mostrarExito(`Producto "${fila.nombre}" eliminado correctamente.`);
  };

  return (
    <div className="container-fluid">
      <header className="content-header mb-4">
        <h1>Gestión de Inventario</h1>
      </header>

      {error && <div className="alert alert-danger">No se pudo conectar con la tabla "productos": {error}</div>}
      {exito && <div className="alert alert-success">{exito}</div>}

      <div className="buscador-stock">
        <i className="bi bi-search"></i>
        <input
          type="search"
          placeholder="Buscar material, categoría o ubicación..."
          value={busqueda}
          onChange={manejarBusqueda}
        />
      </div>

      {/* ================= CATEGORÍAS ================= */}
      <section className="filtro-categorias">
        <div className="filtro-categorias-titulo">
          <div>
            <h3>Categorías</h3>
            <small>{categorias.length} en total · marca una o varias para filtrar</small>
          </div>

          <div className="filtro-categorias-acciones">
            <button type="button" className="btn-chip-accion" onClick={alternarTodas}>
              <i className={`bi ${todasSeleccionadas ? "bi-check2-square" : "bi-square"}`}></i>{" "}
              {todasSeleccionadas ? "Quitar todas" : "Seleccionar todas"}
            </button>
            {clavesSel.length > 0 && (
              <button type="button" className="btn-chip-accion" onClick={limpiarCategorias}>
                <i className="bi bi-x-circle"></i> Limpiar
              </button>
            )}
          </div>
        </div>

        <div className="categorias-grid">
          {categorias.map((categoria) => {
            const activa = clavesSel.includes(categoria.clave);
            const cantidad = conteoPorClave[categoria.clave] || 0;
            return (
              <label key={categoria.clave} className={`categoria-card ${activa ? "activa" : ""}`}>
                <input
                  type="checkbox"
                  className="categoria-check"
                  checked={activa}
                  onChange={() => alternarCategoria(categoria.clave)}
                />
                <span className="categoria-icono">
                  <i className={`bi ${categoria.icono}`}></i>
                </span>
                <span className="categoria-info">
                  <span className="categoria-nombre">{categoria.nombre}</span>
                  <span className="categoria-desc">
                    {categoria.descripcion || "Sin descripción"}
                  </span>
                </span>
                {activa && (
                  <span className="categoria-cantidad">
                    <strong>{cantidad}</strong> {cantidad === 1 ? "producto" : "productos"}
                  </span>
                )}

                {/* "Sin categoría" es automática y no se puede eliminar */}
                {!categoria.sinCategoria && (
                  <button
                    type="button"
                    className="categoria-eliminar"
                    title="Eliminar categoría"
                    data-bs-toggle="modal"
                    data-bs-target="#modalEliminarCategoria"
                    onClick={(e) => {
                      e.stopPropagation();
                      prepararEliminarCategoria(categoria);
                    }}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                )}
              </label>
            );
          })}

          {/* Tarjeta para crear una categoría nueva */}
          <button
            type="button"
            className="categoria-card categoria-nueva"
            data-bs-toggle="modal"
            data-bs-target="#modalNuevaCategoria"
            onClick={abrirNuevaCategoria}
          >
            <i className="bi bi-plus-circle"></i>
            <span>Nueva categoría</span>
          </button>
        </div>

        {clavesSel.length > 0 && (
          <div className="resumen-categorias">
            <i className="bi bi-box-seam"></i> <strong>{totalSeleccionado}</strong>{" "}
            {totalSeleccionado === 1 ? "producto" : "productos"} en{" "}
            {clavesSel.length === 1
              ? "la categoría seleccionada"
              : `las ${clavesSel.length} categorías seleccionadas`}
          </div>
        )}
      </section>

      {/* ================= TABLA ================= */}
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
                  <th className="text-center">Acciones</th>
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
                          type="button"
                          className="btn-detalle"
                          title="Ver detalle"
                          data-bs-toggle="modal"
                          data-bs-target="#modalDetalleProducto"
                          onClick={() => setProductoSeleccionado(fila)}
                        >
                          <i className="bi bi-eye"></i>
                        </button>{" "}
                        <button
                          type="button"
                          className="btn-detalle btn-editar"
                          title="Editar producto"
                          data-bs-toggle="modal"
                          data-bs-target="#modalEditarProducto"
                          onClick={() => abrirEdicion(fila)}
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>{" "}
                        <button
                          type="button"
                          className="btn-detalle btn-eliminar"
                          title="Eliminar producto"
                          data-bs-toggle="modal"
                          data-bs-target="#modalEliminarProducto"
                          onClick={() => prepararEliminarProducto(fila)}
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

      {/* ================= MODAL DETALLE PRODUCTO ================= */}
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

      {/* ================= MODAL EDITAR PRODUCTO ================= */}
      <div className="modal fade" id="modalEditarProducto" tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <form className="modal-content" onSubmit={guardarEdicion}>
            <div className="modal-header encabezado-ficha">
              <div className="titulo-ficha">
                <i className="bi bi-pencil-square"></i>
                <h2>Editar producto</h2>
              </div>
              <img src={logo} alt="Logo" className="logo-modal" />
            </div>

            <div className="modal-body">
              {errorEdicion && <div className="alert alert-danger">{errorEdicion}</div>}

              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Código</label>
                  <input className="form-control" name="codigo" value={form.codigo} onChange={manejarCambioForm} />
                </div>
                <div className="col-md-8">
                  <label className="form-label">Nombre del material</label>
                  <input className="form-control" name="nombre" value={form.nombre} onChange={manejarCambioForm} required />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Categoría</label>
                  <select
                    className="form-select"
                    name="categoria"
                    value={form.categoria}
                    onChange={manejarCambioForm}
                    required
                  >
                    <option value="" disabled>Selecciona una categoría…</option>
                    {categoriasElegibles.map((c) => (
                      <option key={c.clave} value={c.nombre}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Ubicación en bodega</label>
                  <input className="form-control" name="ubicacion" value={form.ubicacion} onChange={manejarCambioForm} />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Stock actual</label>
                  <input type="number" min="0" className="form-control" name="stock_actual" value={form.stock_actual} onChange={manejarCambioForm} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Umbral mínimo</label>
                  <input type="number" min="0" className="form-control" name="umbral_minimo" value={form.umbral_minimo} onChange={manejarCambioForm} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Precio unitario</label>
                  <input type="number" min="0" step="any" className="form-control" name="precio" value={form.precio} onChange={manejarCambioForm} />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-cerrar-modal"
                data-bs-dismiss="modal"
                ref={botonCerrarEdicion}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-guardar-modal" disabled={guardando}>
                {guardando ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ================= MODAL NUEVA CATEGORÍA ================= */}
      <div className="modal fade" id="modalNuevaCategoria" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <form className="modal-content" onSubmit={crearCategoria}>
            <div className="modal-header encabezado-ficha">
              <div className="titulo-ficha">
                <i className="bi bi-plus-circle"></i>
                <h2>Nueva categoría</h2>
              </div>
              <img src={logo} alt="Logo" className="logo-modal" />
            </div>

            <div className="modal-body">
              {errorCat && <div className="alert alert-danger">{errorCat}</div>}

              <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input
                  className={`form-control ${nombreRepetido ? "is-invalid" : ""}`}
                  value={formCat.nombre}
                  maxLength={40}
                  placeholder="Ej: Equipos de seguridad"
                  onChange={(e) => setFormCat((a) => ({ ...a, nombre: e.target.value }))}
                  required
                />
                {nombreRepetido && (
                  <div className="invalid-feedback">Esa categoría ya existe.</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-control"
                  rows="2"
                  maxLength={120}
                  placeholder="¿Qué productos incluye esta categoría?"
                  value={formCat.descripcion}
                  onChange={(e) => setFormCat((a) => ({ ...a, descripcion: e.target.value }))}
                />
              </div>

              <div>
                <label className="form-label">Icono</label>
                <div className="selector-iconos">
                  {ICONOS.map((icono) => (
                    <button
                      key={icono}
                      type="button"
                      aria-pressed={formCat.icono === icono}
                      className={`icono-opcion ${formCat.icono === icono ? "activa" : ""}`}
                      onClick={() => setFormCat((a) => ({ ...a, icono }))}
                    >
                      <i className={`bi ${icono}`}></i>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-cerrar-modal"
                data-bs-dismiss="modal"
                ref={botonCerrarCategoria}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-guardar-modal"
                disabled={guardandoCat || nombreRepetido}
              >
                {guardandoCat ? "Creando…" : "Crear categoría"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ================= MODAL ELIMINAR PRODUCTO ================= */}
      <div className="modal fade" id="modalEliminarProducto" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header encabezado-ficha">
              <div className="titulo-ficha">
                <i className="bi bi-trash"></i>
                <h2>Eliminar producto</h2>
              </div>
              <img src={logo} alt="Logo" className="logo-modal" />
            </div>

            <div className="modal-body">
              {errorEliminarProducto && (
                <div className="alert alert-danger">{errorEliminarProducto}</div>
              )}
              <p className="mb-1">
                ¿Seguro que quieres eliminar{" "}
                <strong>{productoAEliminar?.nombre || "este producto"}</strong>
                {productoAEliminar?.codigo ? ` (${productoAEliminar.codigo})` : ""}?
              </p>
              <small className="text-muted">Esta acción no se puede deshacer.</small>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-cerrar-modal"
                data-bs-dismiss="modal"
                ref={botonCerrarEliminarProducto}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-eliminar-modal"
                onClick={eliminarProducto}
                disabled={eliminandoProducto}
              >
                {eliminandoProducto ? "Eliminando…" : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL ELIMINAR CATEGORÍA ================= */}
      <div className="modal fade" id="modalEliminarCategoria" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header encabezado-ficha">
              <div className="titulo-ficha">
                <i className="bi bi-trash"></i>
                <h2>Eliminar categoría</h2>
              </div>
              <img src={logo} alt="Logo" className="logo-modal" />
            </div>

            <div className="modal-body">
              {errorEliminarCategoria && (
                <div className="alert alert-danger">{errorEliminarCategoria}</div>
              )}
              <p className="mb-1">
                ¿Seguro que quieres eliminar la categoría{" "}
                <strong>{categoriaAEliminar?.nombre}</strong>?
              </p>
              {categoriaAEliminar && (conteoPorClave[categoriaAEliminar.clave] || 0) > 0 ? (
                <small className="text-muted">
                  Tiene <strong>{conteoPorClave[categoriaAEliminar.clave]}</strong>{" "}
                  {conteoPorClave[categoriaAEliminar.clave] === 1 ? "producto" : "productos"}.
                  No se borrarán: pasarán a "{SIN_CATEGORIA}".
                </small>
              ) : (
                <small className="text-muted">No tiene productos asociados.</small>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-cerrar-modal"
                data-bs-dismiss="modal"
                ref={botonCerrarEliminarCategoria}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-eliminar-modal"
                onClick={eliminarCategoria}
                disabled={eliminandoCategoria}
              >
                {eliminandoCategoria ? "Eliminando…" : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default S_stock;