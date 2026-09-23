import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import "../../assets/css/M_entradas.css";
import { supabase } from "../../api/supabase";
import { useRealtimeTable } from "../../hooks/useRealtimeTable";
import { useAuth } from "../../context/AuthContext";

/**
 * Movimientos · Registrar entrada de material — ahora con afectación
 * real de stock en Supabase (sección 4 del prompt):
 *
 *   - Si el nombre escrito coincide con un producto ya existente en
 *     `productos`, se SUMA la cantidad a su `stock_actual`.
 *   - Si no existe, se crea un producto nuevo con esa cantidad como
 *     stock inicial (usando marca/modelo/categoría como datos del
 *     nuevo material, ya que el formulario original permitía ambos
 *     casos: reabastecer o dar de alta un material).
 *   - Cada operación queda registrada en `movimientos` con tipo
 *     "entrada", cantidad, motivo, responsable (usuario autenticado)
 *     y fecha.
 *   - Precio unitario y ubicación en bodega:
 *       · Material NUEVO  -> ambos son obligatorios y se guardan en `productos`.
 *       · Material EXISTENTE -> se precargan con los valores actuales; si el
 *         usuario los cambia se actualizan, y si los deja vacíos NO se borra
 *         lo que ya había.
 */

const ESTADO_INICIAL = {
  nombre: "",
  unidad: "Pieza",
  marca: "",
  cantidad: 0,
  precio: "",
  ubicacion: "",
  modelo: "",
  categoria: "Tornillería",
};

function M_entrada() {
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [guardando, setGuardando] = useState(false);
  const { datos: productos } = useRealtimeTable("productos");
  const { perfil, usuario } = useAuth();

  const actualizarCampo = (campo) => (evento) => {
    setForm((actual) => ({ ...actual, [campo]: evento.target.value }));
  };

  const normalizar = (texto) => (texto || "").trim().toLowerCase();

  // Producto ya registrado que coincide con el nombre escrito (si existe).
  const productoExistente = useMemo(
    () => productos.find((p) => normalizar(p.nombre) === normalizar(form.nombre)),
    [productos, form.nombre]
  );

  // Ubicaciones ya usadas: se sugieren al escribir para evitar variantes
  // como "H1-A3", "h1 a3" o "H1A3" del mismo lugar.
  const ubicacionesUsadas = useMemo(
    () => [...new Set(productos.map((p) => (p.ubicacion || "").trim()).filter(Boolean))],
    [productos]
  );

  // Al elegir/escribir un material que ya existe, se precargan su precio y
  // ubicación actuales para que el usuario solo los corrija si cambiaron.
  const cambiarNombre = (evento) => {
    const valor = evento.target.value;
    const existente = productos.find((p) => normalizar(p.nombre) === normalizar(valor));
    setForm((actual) => ({
      ...actual,
      nombre: valor,
      ...(existente
        ? {
            precio: existente.precio != null ? String(existente.precio) : "",
            ubicacion: existente.ubicacion || "",
          }
        : {}),
    }));
  };

  const registrarEntrada = async (evento) => {
    evento.preventDefault();

    const cantidad = Number(form.cantidad);
    if (!form.nombre.trim() || !cantidad || cantidad <= 0) {
      Swal.fire({
        title: "Datos incompletos",
        text: "Indica el nombre del material y una cantidad mayor a cero.",
        icon: "warning",
        confirmButtonColor: "#E8600C",
      });
      return;
    }

    const precio = form.precio === "" ? null : Number(form.precio);
    const ubicacion = form.ubicacion.trim();

    if (precio !== null && (Number.isNaN(precio) || precio < 0)) {
      Swal.fire({
        title: "Precio no válido",
        text: "El precio unitario debe ser un número igual o mayor a cero.",
        icon: "warning",
        confirmButtonColor: "#E8600C",
      });
      return;
    }

    // Un material nuevo nace con precio y ubicación; si no, quedaría "$0" y
    // sin lugar en bodega, que es justo lo que se quiere evitar.
    if (!productoExistente && (precio === null || !ubicacion)) {
      Swal.fire({
        title: "Faltan datos del material nuevo",
        text: "Para dar de alta un material nuevo indica su precio unitario y su ubicación en bodega.",
        icon: "warning",
        confirmButtonColor: "#E8600C",
      });
      return;
    }

    setGuardando(true);
    try {
      let productoId = productoExistente?.id;

      if (productoExistente) {
        const cambios = { stock_actual: (productoExistente.stock_actual || 0) + cantidad };
        // Solo se actualiza lo que el usuario realmente indicó y cambió.
        if (precio !== null && precio !== Number(productoExistente.precio)) cambios.precio = precio;
        if (ubicacion && ubicacion !== (productoExistente.ubicacion || "")) cambios.ubicacion = ubicacion;

        const { error } = await supabase
          .from("productos")
          .update(cambios)
          .eq("id", productoExistente.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("productos")
          .insert({
            nombre: form.nombre.trim(),
            categoria: form.categoria,
            stock_actual: cantidad,
            umbral_minimo: 5,
            ubicacion,
            precio,
            codigo: form.modelo || null,
          })
          .select()
          .single();
        if (error) throw error;
        productoId = data.id;
      }

      const detalles = ["Entrada de material"];
      if (form.marca) detalles.push(`Marca: ${form.marca}`);
      if (form.modelo) detalles.push(`Modelo: ${form.modelo}`);
      if (precio !== null) detalles.push(`Precio unitario: $${precio.toLocaleString("es-CO")}`);
      if (ubicacion) detalles.push(`Ubicación: ${ubicacion}`);

      const responsable = perfil?.nombre || usuario?.email || "Jefe";
      const { error: errorMovimiento } = await supabase.from("movimientos").insert({
        producto_id: productoId,
        tipo: "entrada",
        cantidad,
        motivo: detalles.join(" · "),
        responsable,
      });
      if (errorMovimiento) throw errorMovimiento;

      Swal.fire({
        title: "¡Entrada registrada!",
        text: `Se registró la entrada de ${cantidad} unidad(es) de "${form.nombre}".`,
        icon: "success",
        confirmButtonColor: "#E8600C",
        confirmButtonText: "Entendido",
      });

      setForm(ESTADO_INICIAL);
    } catch (error) {
      Swal.fire({ title: "No se pudo registrar", text: error.message, icon: "error", confirmButtonColor: "#E8600C" });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="dashboard-main">
      <div className="titulo">
        <i className="fa-solid fa-box-open"></i> Registrar entrada de material
      </div>

      <div className="formulario">
        <form onSubmit={registrarEntrada}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label" htmlFor="ent-nombre">Nombre del material</label>
              <input
                id="ent-nombre"
                type="text"
                className="form-control"
                placeholder="Ej. Tornillo M8x20"
                list="listaProductosEntrada"
                value={form.nombre}
                onChange={cambiarNombre}
              />
              <datalist id="listaProductosEntrada">
                {productos.map((p) => (
                  <option key={p.id} value={p.nombre} />
                ))}
              </datalist>
              <div className="form-text">
                {productoExistente
                  ? `Material existente (stock actual: ${productoExistente.stock_actual ?? 0}). Se sumará la cantidad; revisa que el precio y la ubicación sigan vigentes.`
                  : "Si el material ya existe, se sumará la cantidad a su stock actual; si no, se dará de alta como nuevo."}
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label" htmlFor="ent-unidad">Unidad de medida</label>
              <select
                id="ent-unidad"
                className="form-select"
                value={form.unidad}
                onChange={actualizarCampo("unidad")}
              >
                <option>Pieza</option>
                <option>Metros</option>
                <option>Kilogramos</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label" htmlFor="ent-marca">Marca</label>
              <input
                id="ent-marca"
                type="text"
                className="form-control"
                placeholder="Ej. Bosch"
                value={form.marca}
                onChange={actualizarCampo("marca")}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label" htmlFor="ent-cantidad">Cantidad a ingresar</label>
              <input
                id="ent-cantidad"
                type="number"
                className="form-control"
                min="0"
                value={form.cantidad}
                onChange={actualizarCampo("cantidad")}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label" htmlFor="ent-precio">Precio unitario (COP)</label>
              <input
                id="ent-precio"
                type="number"
                className="form-control"
                placeholder="Ej. 15000"
                min="0"
                step="any"
                value={form.precio}
                onChange={actualizarCampo("precio")}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label" htmlFor="ent-ubicacion">Ubicación en bodega</label>
              <input
                id="ent-ubicacion"
                type="text"
                className="form-control"
                placeholder="Ej. Estantería A-12"
                list="listaUbicacionesEntrada"
                value={form.ubicacion}
                onChange={actualizarCampo("ubicacion")}
              />
              <datalist id="listaUbicacionesEntrada">
                {ubicacionesUsadas.map((u) => (
                  <option key={u} value={u} />
                ))}
              </datalist>
            </div>

            <div className="col-12">
              <label className="form-label" htmlFor="ent-modelo">Modelo o referencia</label>
              <input
                id="ent-modelo"
                type="text"
                className="form-control"
                placeholder="Ej. REF-1029"
                value={form.modelo}
                onChange={actualizarCampo("modelo")}
              />
            </div>

            <div className="col-12">
              <label className="form-label" htmlFor="ent-categoria">Categoría</label>
              <select
                id="ent-categoria"
                className="form-select"
                value={form.categoria}
                onChange={actualizarCampo("categoria")}
              >
                <option>Tornillería</option>
                <option>Herramientas</option>
                <option>Medición</option>
                <option>Varios</option>
              </select>
            </div>
          </div>

          <div className="contenedor-acciones">
            <button type="submit" className="confirmarRegistro" disabled={guardando}>
              <i className="fa-solid fa-check"></i> {guardando ? "Registrando…" : "Registrar entrada"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default M_entrada;
