import { useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";
import "../../assets/css/S_reportes.css";
import { supabase } from "../../api/supabase";
import { useRealtimeTable } from "../../hooks/useRealtimeTable";
import { useCategorias } from "../../hooks/useCategorias";

/**
 * Gestión de Inventario · Reportes (conectado a Supabase en tiempo real)
 *
 *  - Los reportes se CALCULAN solos desde `productos` y `movimientos`
 *    (ya no se escribe el tipo ni la cantidad a mano).
 *  - 5 tipos: Inventario general, Por reabastecer, Agotados,
 *    Valorización por categoría y Movimientos (entradas/salidas por fechas).
 *  - Filtro por categoría (las mismas de la tabla `categorias`).
 *  - Vista previa en vivo con resumen, gráfico de barras y tabla.
 *  - Exportar a CSV (abre en Excel) e imprimir / guardar como PDF.
 *  - "Guardar reporte" deja un registro en `reportes_generados`
 *    (historial en tiempo real). Desde el historial se puede volver a ver,
 *    descargar o eliminar.
 */

const SIN_CATEGORIA = "Sin categoría";
const TODAS = "Todas";

const TIPOS = [
  {
    clave: "general",
    etiqueta: "Inventario general",
    icono: "bi-clipboard-data",
    descripcion: "Todos los materiales con su stock, precio, valor y estado.",
  },
  {
    clave: "bajo",
    etiqueta: "Por reabastecer",
    icono: "bi-exclamation-triangle",
    descripcion:
      "Materiales con stock igual o menor al umbral mínimo. Sugiere cuánto pedir para llegar a 2 veces el umbral y el costo estimado.",
  },
  {
    clave: "agotados",
    etiqueta: "Agotados",
    icono: "bi-x-octagon",
    descripcion: "Materiales sin unidades en bodega, con la reposición sugerida.",
  },
  {
    clave: "valor",
    etiqueta: "Valorización",
    icono: "bi-cash-coin",
    descripcion: "Cuánto dinero hay invertido en inventario, agrupado por categoría.",
  },
  {
    clave: "movimientos",
    etiqueta: "Movimientos",
    icono: "bi-arrow-left-right",
    descripcion: "Entradas y salidas de material dentro de un rango de fechas.",
  },
];

const CLASE_ESTADO = { Agotado: "agotado", "Bajo stock": "bajo", Estable: "estable" };

/* ---------------------------- utilidades ---------------------------- */

const normalizar = (texto) =>
  String(texto ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

const fmtNum = (n) => Number(n || 0).toLocaleString("es-CO");
const fmtMoneda = (n) => `$${Number(n || 0).toLocaleString("es-CO")}`;

// yyyy-mm-dd en hora LOCAL (toISOString usa UTC y puede cambiar el día)
const aFechaLocal = (fecha) => {
  const a = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${a}-${m}-${d}`;
};

const estadoDe = (stock, umbral) => {
  if (stock <= 0) return "Agotado";
  if (stock <= umbral) return "Bajo stock";
  return "Estable";
};

// La fecha del movimiento puede llamarse distinto según cómo creaste la tabla
const fechaDeMovimiento = (m) => m.fecha ?? m.creado_en ?? m.created_at ?? null;

// Texto como se ve en pantalla / impresión
const valorCelda = (columna, valor) => {
  switch (columna.tipo) {
    case "moneda":
      return fmtMoneda(valor);
    case "numero":
      return fmtNum(valor);
    case "porcentaje":
      return `${Number(valor || 0).toFixed(1)} %`;
    case "fecha":
      return valor ? new Date(valor).toLocaleString("es-CO") : "—";
    default:
      return valor ?? "—";
  }
};

// Valor para el CSV (números reales para que Excel pueda sumarlos)
const valorCSV = (columna, valor) => {
  switch (columna.tipo) {
    case "moneda":
    case "numero":
      return Number(valor) || 0;
    case "porcentaje":
      return Number(valor || 0).toFixed(1).replace(".", ",");
    case "fecha":
      return valor ? new Date(valor).toLocaleString("es-CO") : "";
    default: {
      const texto = String(valor ?? "");
      // Evita que Excel interprete un texto como fórmula
      return /^[=+\-@]/.test(texto) ? `'${texto}` : texto;
    }
  }
};

const suma = (filas, obtener) => filas.reduce((total, f) => total + obtener(f), 0);

const agrupar = (filas, obtener) => {
  const mapa = new Map();
  filas.forEach((f) => mapa.set(f.categoria, (mapa.get(f.categoria) || 0) + obtener(f)));
  return [...mapa.entries()]
    .map(([etiqueta, valor]) => ({ etiqueta, valor }))
    .sort((a, b) => b.valor - a.valor);
};

const aBarras = (items, formato, tono) => {
  const lista = items.slice(0, 8);
  const maximo = Math.max(0, ...lista.map((i) => i.valor));
  return lista.map((i) => ({
    etiqueta: i.etiqueta,
    ancho: maximo > 0 ? Math.max((i.valor / maximo) * 100, i.valor > 0 ? 3 : 0) : 0,
    texto: formato(i.valor),
    tono: i.tono || tono || "",
  }));
};

/* ------------------------ construcción del reporte ------------------------ */

function construirReporte({ clave, categoria, desde, hasta, productos, movimientos }) {
  const claveCat = normalizar(categoria);

  const items = productos
    .filter((p) => !claveCat || normalizar(p.categoria || SIN_CATEGORIA) === claveCat)
    .map((p) => {
      const stock = Number(p.stock_actual) || 0;
      const umbral = Number(p.umbral_minimo) || 0;
      const precio = Number(p.precio) || 0;
      const sugerido = Math.max(umbral * 2 - stock, 0);
      return {
        id: p.id,
        codigo: p.codigo || "—",
        nombre: p.nombre || "—",
        categoria: p.categoria || SIN_CATEGORIA,
        stock,
        umbral,
        ubicacion: p.ubicacion || "—",
        precio,
        valor: stock * precio,
        estado: estadoDe(stock, umbral),
        sugerido,
        costo: sugerido * precio,
      };
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  switch (clave) {
    case "bajo":
    case "agotados": {
      const esBajo = clave === "bajo";
      const filas = items
        .filter((f) => f.estado === (esBajo ? "Bajo stock" : "Agotado"))
        .sort((a, b) => a.stock / (a.umbral || 1) - b.stock / (b.umbral || 1));
      const inversion = suma(filas, (f) => f.costo);
      const columnas = esBajo
        ? [
            { clave: "codigo", etiqueta: "ID" },
            { clave: "nombre", etiqueta: "Material" },
            { clave: "categoria", etiqueta: "Categoría" },
            { clave: "stock", etiqueta: "Stock", tipo: "numero" },
            { clave: "umbral", etiqueta: "Umbral", tipo: "numero" },
            { clave: "sugerido", etiqueta: "Pedir (sugerido)", tipo: "numero" },
            { clave: "precio", etiqueta: "Precio", tipo: "moneda" },
            { clave: "costo", etiqueta: "Costo estimado", tipo: "moneda" },
          ]
        : [
            { clave: "codigo", etiqueta: "ID" },
            { clave: "nombre", etiqueta: "Material" },
            { clave: "categoria", etiqueta: "Categoría" },
            { clave: "ubicacion", etiqueta: "Ubicación" },
            { clave: "umbral", etiqueta: "Umbral", tipo: "numero" },
            { clave: "sugerido", etiqueta: "Pedir (sugerido)", tipo: "numero" },
            { clave: "precio", etiqueta: "Precio", tipo: "moneda" },
            { clave: "costo", etiqueta: "Costo estimado", tipo: "moneda" },
          ];
      return {
        columnas,
        filas,
        resumen: [
          { etiqueta: esBajo ? "Materiales por reabastecer" : "Materiales agotados", valor: fmtNum(filas.length) },
          { etiqueta: "Unidades sugeridas", valor: fmtNum(suma(filas, (f) => f.sugerido)) },
          { etiqueta: "Inversión estimada", valor: fmtMoneda(inversion) },
        ],
        grafico: {
          titulo: "Materiales por categoría",
          barras: aBarras(agrupar(filas, () => 1), fmtNum, esBajo ? "warn" : "danger"),
        },
        registros: filas.length,
        valorTotal: inversion,
      };
    }

    case "valor": {
      const total = suma(items, (f) => f.valor);
      const mapa = new Map();
      items.forEach((f) => {
        const g = mapa.get(f.categoria) || { categoria: f.categoria, materiales: 0, unidades: 0, valor: 0 };
        g.materiales += 1;
        g.unidades += f.stock;
        g.valor += f.valor;
        mapa.set(f.categoria, g);
      });
      const filas = [...mapa.values()]
        .map((g) => ({ ...g, participacion: total > 0 ? (g.valor / total) * 100 : 0 }))
        .sort((a, b) => b.valor - a.valor);
      const lider = filas[0];
      return {
        columnas: [
          { clave: "categoria", etiqueta: "Categoría" },
          { clave: "materiales", etiqueta: "Materiales", tipo: "numero" },
          { clave: "unidades", etiqueta: "Unidades", tipo: "numero" },
          { clave: "valor", etiqueta: "Valor en inventario", tipo: "moneda" },
          { clave: "participacion", etiqueta: "% del total", tipo: "porcentaje" },
        ],
        filas,
        resumen: [
          { etiqueta: "Valor total", valor: fmtMoneda(total) },
          { etiqueta: "Categorías", valor: fmtNum(filas.length) },
          { etiqueta: "Materiales", valor: fmtNum(items.length) },
          { etiqueta: "Categoría líder", valor: lider ? `${lider.categoria} (${lider.participacion.toFixed(1)} %)` : "—" },
        ],
        grafico: {
          titulo: "Valor por categoría",
          barras: aBarras(filas.map((g) => ({ etiqueta: g.categoria, valor: g.valor })), fmtMoneda),
        },
        registros: filas.length,
        valorTotal: total,
      };
    }

    case "movimientos": {
      const porId = new Map(productos.map((p) => [String(p.id), p]));
      const inicio = desde ? new Date(`${desde}T00:00:00`) : null;
      const fin = hasta ? new Date(`${hasta}T23:59:59`) : null;

      const filas = movimientos
        .map((m) => {
          const p = porId.get(String(m.producto_id));
          const tipo = normalizar(m.tipo);
          return {
            fecha: fechaDeMovimiento(m),
            nombre: p?.nombre || "(producto eliminado)",
            categoria: p ? p.categoria || SIN_CATEGORIA : "—",
            tipo: tipo === "entrada" ? "Entrada" : tipo === "salida" ? "Salida" : m.tipo || "—",
            cantidad: Number(m.cantidad) || 0,
            responsable: m.responsable || "—",
            motivo: m.motivo || "—",
          };
        })
        .filter((f) => {
          const d = f.fecha ? new Date(f.fecha) : null;
          if ((inicio || fin) && !d) return false;
          if (inicio && d < inicio) return false;
          if (fin && d > fin) return false;
          if (claveCat && normalizar(f.categoria) !== claveCat) return false;
          return true;
        })
        .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));

      const entradas = suma(filas.filter((f) => f.tipo === "Entrada"), (f) => f.cantidad);
      const salidas = suma(filas.filter((f) => f.tipo === "Salida"), (f) => f.cantidad);
      const balance = entradas - salidas;
      return {
        columnas: [
          { clave: "fecha", etiqueta: "Fecha", tipo: "fecha" },
          { clave: "nombre", etiqueta: "Material" },
          { clave: "categoria", etiqueta: "Categoría" },
          { clave: "tipo", etiqueta: "Tipo", tipo: "movimiento" },
          { clave: "cantidad", etiqueta: "Cantidad", tipo: "numero" },
          { clave: "responsable", etiqueta: "Responsable" },
          { clave: "motivo", etiqueta: "Motivo" },
        ],
        filas,
        resumen: [
          { etiqueta: "Movimientos", valor: fmtNum(filas.length) },
          { etiqueta: "Unidades que entraron", valor: fmtNum(entradas) },
          { etiqueta: "Unidades que salieron", valor: fmtNum(salidas) },
          { etiqueta: "Balance neto", valor: `${balance > 0 ? "+" : ""}${fmtNum(balance)}` },
        ],
        grafico: {
          titulo: "Entradas vs. salidas (unidades)",
          barras: aBarras(
            [
              { etiqueta: "Entradas", valor: entradas, tono: "entrada" },
              { etiqueta: "Salidas", valor: salidas, tono: "salida" },
            ],
            fmtNum
          ),
        },
        registros: filas.length,
        valorTotal: null,
      };
    }

    case "general":
    default: {
      const valorTotal = suma(items, (f) => f.valor);
      return {
        columnas: [
          { clave: "codigo", etiqueta: "ID" },
          { clave: "nombre", etiqueta: "Material" },
          { clave: "categoria", etiqueta: "Categoría" },
          { clave: "stock", etiqueta: "Stock", tipo: "numero" },
          { clave: "umbral", etiqueta: "Umbral", tipo: "numero" },
          { clave: "ubicacion", etiqueta: "Ubicación" },
          { clave: "precio", etiqueta: "Precio", tipo: "moneda" },
          { clave: "valor", etiqueta: "Valor", tipo: "moneda" },
          { clave: "estado", etiqueta: "Estado", tipo: "estado" },
        ],
        filas: items,
        resumen: [
          { etiqueta: "Materiales", valor: fmtNum(items.length) },
          { etiqueta: "Unidades en stock", valor: fmtNum(suma(items, (f) => f.stock)) },
          { etiqueta: "Valor del inventario", valor: fmtMoneda(valorTotal) },
          { etiqueta: "Requieren atención", valor: fmtNum(items.filter((f) => f.estado !== "Estable").length) },
        ],
        grafico: {
          titulo: "Valor por categoría",
          barras: aBarras(agrupar(items, (f) => f.valor), fmtMoneda),
        },
        registros: items.length,
        valorTotal,
      };
    }
  }
}

/* ----------------------------- exportaciones ----------------------------- */

function descargarCSV(reporte, titulo, archivo) {
  const escapar = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const fila = (celdas) => celdas.map(escapar).join(";");

  const lineas = [
    fila([titulo]),
    fila([`Generado: ${new Date().toLocaleString("es-CO")}`]),
    "",
    ...reporte.resumen.map((r) => fila([r.etiqueta, r.valor])),
    "",
    fila(reporte.columnas.map((c) => c.etiqueta)),
    ...reporte.filas.map((f) => fila(reporte.columnas.map((c) => valorCSV(c, f[c.clave])))),
  ];

  // ﻿ = BOM para que Excel respete tildes y la ñ
  const blob = new Blob(["﻿" + lineas.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = archivo;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}

function imprimirReporte(reporte, titulo, subtitulo) {
  const esc = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const ventana = window.open("", "_blank");
  if (!ventana) {
    Swal.fire({
      icon: "info",
      title: "Ventana bloqueada",
      text: "Permite las ventanas emergentes para este sitio e inténtalo de nuevo.",
      confirmButtonColor: "#E8600C",
    });
    return;
  }

  const numerica = (c) => ["numero", "moneda", "porcentaje"].includes(c.tipo);
  const encabezado = reporte.columnas
    .map((c) => `<th class="${numerica(c) ? "n" : ""}">${esc(c.etiqueta)}</th>`)
    .join("");
  const cuerpo = reporte.filas
    .map(
      (f) =>
        `<tr>${reporte.columnas
          .map((c) => `<td class="${numerica(c) ? "n" : ""}">${esc(valorCelda(c, f[c.clave]))}</td>`)
          .join("")}</tr>`
    )
    .join("");
  const resumen = reporte.resumen
    .map((r) => `<div class="r"><span>${esc(r.etiqueta)}</span><strong>${esc(r.valor)}</strong></div>`)
    .join("");

  ventana.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8">
<title>${esc(titulo)}</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif;color:#1f2937;margin:28px}
  h1{margin:0 0 4px;font-size:22px;color:#E8600C}
  p{margin:0 0 16px;color:#6b7280;font-size:12px}
  .res{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px}
  .r{border:1px solid #e5e7eb;border-radius:8px;padding:8px 12px;min-width:140px}
  .r span{display:block;font-size:11px;color:#6b7280}
  .r strong{font-size:15px}
  table{width:100%;border-collapse:collapse;font-size:12px}
  th{background:#1c1d20;color:#fff;text-align:left;padding:7px 8px}
  td{padding:6px 8px;border-bottom:1px solid #e5e7eb}
  .n{text-align:right}
  tr:nth-child(even) td{background:#f9fafb}
  @media print{body{margin:12px}}
</style></head><body>
<h1>${esc(titulo)}</h1>
<p>${esc(subtitulo)}</p>
<div class="res">${resumen}</div>
<table><thead><tr>${encabezado}</tr></thead><tbody>${cuerpo}</tbody></table>
</body></html>`);
  ventana.document.close();
  ventana.focus();
  setTimeout(() => ventana.print(), 300);
}

/* -------------------------------- componente -------------------------------- */

function S_reportes() {
  const { datos: productos, cargando: cargandoProductos } = useRealtimeTable("productos");
  const { datos: movimientos } = useRealtimeTable("movimientos");
  const { datos: reportes, cargando: cargandoReportes } = useRealtimeTable("reportes_generados", {
    orderBy: "fecha",
    ascending: false,
  });
  const { categorias: categoriasTabla } = useCategorias();

  const [clave, setClave] = useState("general");
  const [categoria, setCategoria] = useState("");
  const [desde, setDesde] = useState(() => aFechaLocal(new Date(Date.now() - 29 * 86400000)));
  const [hasta, setHasta] = useState(() => aFechaLocal(new Date()));
  const [guardando, setGuardando] = useState(false);
  const [busquedaHistorial, setBusquedaHistorial] = useState("");
  const generadorRef = useRef(null);

  const hayProductos = !cargandoProductos && productos.length > 0;
  const tipoActual = TIPOS.find((t) => t.clave === clave) || TIPOS[0];

  /* Categorías: las de la tabla + las que ya usan los productos (sin repetir) */
  const opcionesCategoria = useMemo(() => {
    const mapa = new Map();
    [...categoriasTabla.map((c) => c.nombre), ...productos.map((p) => p.categoria || SIN_CATEGORIA)].forEach((n) => {
      const k = normalizar(n);
      if (k && !mapa.has(k)) mapa.set(k, String(n).trim());
    });
    return [...mapa.values()].sort((a, b) => a.localeCompare(b));
  }, [categoriasTabla, productos]);

  /* Indicadores generales (siempre sobre todo el inventario) */
  const kpis = useMemo(() => {
    let unidades = 0;
    let valor = 0;
    let bajo = 0;
    let agotados = 0;
    productos.forEach((p) => {
      const stock = Number(p.stock_actual) || 0;
      const umbral = Number(p.umbral_minimo) || 0;
      unidades += stock;
      valor += stock * (Number(p.precio) || 0);
      if (stock <= 0) agotados += 1;
      else if (stock <= umbral) bajo += 1;
    });
    return { materiales: productos.length, unidades, valor, bajo, agotados };
  }, [productos]);

  const tarjetas = [
    { id: "mat", clave: "general", icono: "bi-box-seam", etiqueta: "Materiales", valor: fmtNum(kpis.materiales) },
    { id: "uni", clave: "general", icono: "bi-boxes", etiqueta: "Unidades en stock", valor: fmtNum(kpis.unidades) },
    { id: "val", clave: "valor", icono: "bi-cash-coin", etiqueta: "Valor del inventario", valor: fmtMoneda(kpis.valor) },
    { id: "baj", clave: "bajo", icono: "bi-exclamation-triangle", etiqueta: "Bajo stock", valor: fmtNum(kpis.bajo), tono: kpis.bajo > 0 ? "warn" : "" },
    { id: "ago", clave: "agotados", icono: "bi-x-octagon", etiqueta: "Agotados", valor: fmtNum(kpis.agotados), tono: kpis.agotados > 0 ? "danger" : "" },
  ];

  /* Reporte en vivo según lo elegido */
  const reporte = useMemo(
    () => construirReporte({ clave, categoria, desde, hasta, productos, movimientos }),
    [clave, categoria, desde, hasta, productos, movimientos]
  );

  const titulo = tipoActual.etiqueta;
  const subtitulo =
    `Categoría: ${categoria || TODAS}` +
    (clave === "movimientos" ? ` · Del ${desde || "inicio"} al ${hasta || "hoy"}` : "") +
    ` · Generado: ${new Date().toLocaleString("es-CO")}`;
  const nombreArchivo = `reporte-${clave}-${aFechaLocal(new Date())}.csv`;

  const irAlGenerador = () =>
    generadorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const elegirTarjeta = (tarjeta) => {
    setClave(tarjeta.clave);
    setCategoria("");
    irAlGenerador();
  };

  /* Guardar en el historial */
  const guardarReporte = async () => {
    if (reporte.registros === 0) {
      Swal.fire({
        icon: "info",
        title: "No hay datos",
        text: "Con los filtros elegidos el reporte no tiene registros. Cambia la categoría o las fechas.",
        confirmButtonColor: "#E8600C",
      });
      return;
    }

    setGuardando(true);
    try {
      const base = {
        tipo: tipoActual.etiqueta,
        categoria: categoria || TODAS,
        cantidad: reporte.registros,
      };
      const extra = {
        filtros: clave === "movimientos" ? { desde, hasta } : {},
        valor_total: reporte.valorTotal,
      };

      let resultado = await supabase.from("reportes_generados").insert({ ...base, ...extra });
      // Si aún no corriste el SQL de columnas nuevas, guarda lo básico igual
      if (resultado.error && /filtros|valor_total/i.test(resultado.error.message)) {
        resultado = await supabase.from("reportes_generados").insert(base);
      }
      if (resultado.error) throw resultado.error;

      Swal.fire({
        icon: "success",
        title: "Reporte guardado",
        text: "Quedó registrado en el historial.",
        confirmButtonColor: "#37ac1d",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo guardar", text: error.message, confirmButtonColor: "#f44336" });
    } finally {
      setGuardando(false);
    }
  };

  /* Historial */
  const parametrosDe = (r) => {
    const tipo = TIPOS.find((t) => t.etiqueta === r.tipo);
    if (!tipo) return null; // reporte antiguo escrito a mano: no se puede reconstruir
    const filtros = r.filtros && typeof r.filtros === "object" ? r.filtros : {};
    return {
      clave: tipo.clave,
      categoria: r.categoria === TODAS ? "" : r.categoria || "",
      desde: filtros.desde || desde,
      hasta: filtros.hasta || hasta,
    };
  };

  const avisoSinDatos = () =>
    Swal.fire({
      icon: "info",
      title: "Reporte antiguo",
      text: "Este reporte se creó con el formato anterior y no se puede reconstruir. Genera uno nuevo.",
      confirmButtonColor: "#E8600C",
    });

  const verReporte = (r) => {
    const p = parametrosDe(r);
    if (!p) return avisoSinDatos();
    setClave(p.clave);
    setCategoria(p.categoria);
    setDesde(p.desde);
    setHasta(p.hasta);
    irAlGenerador();
  };

  const descargarGuardado = (r) => {
    const p = parametrosDe(r);
    if (!p) return avisoSinDatos();
    const tipo = TIPOS.find((t) => t.clave === p.clave);
    const reconstruido = construirReporte({ ...p, productos, movimientos });
    descargarCSV(reconstruido, `${tipo.etiqueta} · ${r.categoria}`, `reporte-${p.clave}-${aFechaLocal(new Date())}.csv`);
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

  const reportesFiltrados = useMemo(() => {
    const termino = normalizar(busquedaHistorial);
    if (!termino) return reportes;
    return reportes.filter((r) => normalizar(`${r.tipo} ${r.categoria}`).includes(termino));
  }, [reportes, busquedaHistorial]);

  /* Celdas de la vista previa */
  const renderCelda = (columna, valor) => {
    if (columna.tipo === "estado") {
      return <span className={`rep-estado ${CLASE_ESTADO[valor] || ""}`}>{valor}</span>;
    }
    if (columna.tipo === "movimiento") {
      return <span className={`rep-mov ${valor === "Entrada" ? "entrada" : valor === "Salida" ? "salida" : ""}`}>{valor}</span>;
    }
    return valorCelda(columna, valor);
  };

  const esNumerica = (columna) => ["numero", "moneda", "porcentaje"].includes(columna.tipo);

  return (
    <div className="container-fluid reportes-page">
      <header className="rep-header">
        <h1 className="rep-titulo">Reportes de inventario</h1>
        <p>Los reportes se calculan solos con tus productos y movimientos en tiempo real.</p>
      </header>

      {/* ===== INDICADORES ===== */}
      <section className="rep-kpis" aria-label="Indicadores del inventario">
        {tarjetas.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`rep-kpi ${t.tono || ""}`}
            onClick={() => elegirTarjeta(t)}
            disabled={!hayProductos}
            title="Ver el reporte relacionado"
          >
            <span className="rep-kpi-icono"><i className={`bi ${t.icono}`}></i></span>
            <span className="rep-kpi-texto">
              <strong>{t.valor}</strong>
              <small>{t.etiqueta}</small>
            </span>
          </button>
        ))}
      </section>

      {/* ===== GENERADOR ===== */}
      <section className="rep-card rep-generador" ref={generadorRef}>
        <div className="rep-card-titulo">
          <h2><i className="bi bi-sliders2"></i> Generar reporte</h2>
        </div>

        {cargandoProductos ? (
          <div className="rep-vacio">Cargando inventario…</div>
        ) : !hayProductos ? (
          <div className="alert-warning-custom" role="alert">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>No existen productos registrados para generar el reporte</span>
          </div>
        ) : (
          <>
            <div className="rep-tipos" role="tablist" aria-label="Tipo de reporte">
              {TIPOS.map((t) => (
                <button
                  key={t.clave}
                  type="button"
                  role="tab"
                  aria-selected={clave === t.clave}
                  className={`rep-tipo ${clave === t.clave ? "activo" : ""}`}
                  onClick={() => setClave(t.clave)}
                >
                  <i className={`bi ${t.icono}`}></i> {t.etiqueta}
                </button>
              ))}
            </div>
            <p className="rep-tipo-desc">{tipoActual.descripcion}</p>

            <div className="rep-filtros">
              <div>
                <label htmlFor="rep-categoria">Categoría</label>
                <select
                  id="rep-categoria"
                  className="form-select"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                >
                  <option value="">{TODAS}</option>
                  {opcionesCategoria.map((nombre) => (
                    <option key={nombre} value={nombre}>{nombre}</option>
                  ))}
                </select>
              </div>

              {clave === "movimientos" && (
                <>
                  <div>
                    <label htmlFor="rep-desde">Desde</label>
                    <input id="rep-desde" type="date" className="form-control" value={desde} max={hasta || undefined} onChange={(e) => setDesde(e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="rep-hasta">Hasta</label>
                    <input id="rep-hasta" type="date" className="form-control" value={hasta} min={desde || undefined} onChange={(e) => setHasta(e.target.value)} />
                  </div>
                </>
              )}
            </div>

            {/* ----- Vista previa ----- */}
            <div className="rep-previa-barra">
              <div>
                <h3>Vista previa</h3>
                <small>{fmtNum(reporte.registros)} {reporte.registros === 1 ? "registro" : "registros"} · se actualiza solo</small>
              </div>
              <div className="rep-acciones">
                <button type="button" className="btn btn-reporte" onClick={guardarReporte} disabled={guardando}>
                  <i className="bi bi-save"></i> {guardando ? "Guardando…" : "Guardar reporte"}
                </button>
                <button
                  type="button"
                  className="btn btn-rep-sec"
                  onClick={() => descargarCSV(reporte, `${titulo} · ${categoria || TODAS}`, nombreArchivo)}
                  disabled={reporte.registros === 0}
                >
                  <i className="bi bi-file-earmark-spreadsheet"></i> CSV / Excel
                </button>
                <button
                  type="button"
                  className="btn btn-rep-sec"
                  onClick={() => imprimirReporte(reporte, titulo, subtitulo)}
                  disabled={reporte.registros === 0}
                >
                  <i className="bi bi-printer"></i> Imprimir / PDF
                </button>
              </div>
            </div>

            <div className="rep-resumen">
              {reporte.resumen.map((r) => (
                <div key={r.etiqueta} className="rep-resumen-item">
                  <span>{r.etiqueta}</span>
                  <strong>{r.valor}</strong>
                </div>
              ))}
            </div>

            {reporte.grafico && reporte.grafico.barras.length > 0 && (
              <div className="rep-grafico">
                <h4>{reporte.grafico.titulo}</h4>
                {reporte.grafico.barras.map((b) => (
                  <div key={b.etiqueta} className="rep-barra">
                    <span className="rep-barra-etiqueta" title={b.etiqueta}>{b.etiqueta}</span>
                    <div className="rep-barra-pista">
                      <div className={`rep-barra-relleno ${b.tono}`} style={{ width: `${b.ancho}%` }}></div>
                    </div>
                    <span className="rep-barra-valor">{b.texto}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="rep-tabla-scroll">
              <table className="table table-hover align-middle mb-0 rep-tabla">
                <thead>
                  <tr>
                    {reporte.columnas.map((c) => (
                      <th key={c.clave} className={esNumerica(c) ? "num" : ""}>{c.etiqueta}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reporte.filas.length === 0 ? (
                    <tr>
                      <td colSpan={reporte.columnas.length} className="rep-vacio">
                        No hay datos para este reporte con los filtros elegidos.
                      </td>
                    </tr>
                  ) : (
                    reporte.filas.map((fila, i) => (
                      <tr key={i}>
                        {reporte.columnas.map((c) => (
                          <td key={c.clave} className={esNumerica(c) ? "num" : ""}>
                            {renderCelda(c, fila[c.clave])}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* ===== HISTORIAL ===== */}
      <section className="rep-card rep-historial">
        <div className="rep-card-titulo rep-historial-barra">
          <h2><i className="bi bi-clock-history"></i> Reportes generados</h2>
          <div className="rep-buscador">
            <i className="bi bi-search"></i>
            <input
              type="search"
              placeholder="Buscar por tipo o categoría…"
              value={busquedaHistorial}
              onChange={(e) => setBusquedaHistorial(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 rep-tabla" id="tablaReportes">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo de reporte</th>
                <th>Categoría</th>
                <th className="num">Registros</th>
                <th className="num">Valor</th>
                <th>Fecha de generación</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargandoReportes ? (
                <tr><td colSpan={7} className="rep-vacio">Cargando reportes…</td></tr>
              ) : reportesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="rep-vacio">
                    {reportes.length === 0 ? "Aún no se ha guardado ningún reporte." : "Ningún reporte coincide con la búsqueda."}
                  </td>
                </tr>
              ) : (
                reportesFiltrados.map((r) => (
                  <tr key={r.id}>
                    <td><code className="rep-id">#{String(r.id).slice(0, 8).toUpperCase()}</code></td>
                    <td>
                      {r.tipo}
                      {r.filtros?.desde && (
                        <small className="rep-rango">{r.filtros.desde} → {r.filtros.hasta}</small>
                      )}
                    </td>
                    <td>{r.categoria}</td>
                    <td className="num">{fmtNum(r.cantidad)}</td>
                    <td className="num">{r.valor_total != null ? fmtMoneda(r.valor_total) : "—"}</td>
                    <td>{r.fecha ? new Date(r.fecha).toLocaleString("es-CO") : "—"}</td>
                    <td className="text-center rep-fila-acciones">
                      <button type="button" className="btn btn-rep-icono" title="Ver en el generador" onClick={() => verReporte(r)}>
                        <i className="bi bi-eye"></i>
                      </button>{" "}
                      <button type="button" className="btn btn-rep-icono" title="Descargar CSV" onClick={() => descargarGuardado(r)}>
                        <i className="bi bi-download"></i>
                      </button>{" "}
                      <button type="button" className="btn btn-eliminar btn-sm" title="Eliminar" onClick={() => eliminarReporte(r.id)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default S_reportes;