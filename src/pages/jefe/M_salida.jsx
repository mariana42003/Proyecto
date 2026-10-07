import { useState } from "react";
import Swal from "sweetalert2";
import "../../assets/css/M_salidas.css";
import { supabase } from "../../api/supabase";
import { useRealtimeTable } from "../../hooks/useRealtimeTable";
import { useAuth } from "../../context/AuthContext";

/**
 * Movimientos · Registrar salida de material — con afectación real de
 * stock y la validación de seguridad pedida en la sección 4:
 * "Impedir registrar salidas si la cantidad a retirar supera el
 * stock_actual disponible."
 */

const ESTADO_INICIAL = {
  nombre: "",
  unidad: "Pieza",
  marca: "",
  cantidad: 0,
  modelo: "",
  categoria: "Tornillería",
  responsable: "",
};

function M_salida() {
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [guardando, setGuardando] = useState(false);
  const { datos: productos } = useRealtimeTable("productos");
  const { perfil, usuario } = useAuth();

  const actualizarCampo = (campo) => (evento) => {
    setForm((actual) => ({ ...actual, [campo]: evento.target.value }));
  };

  const cancelarSalida = () => setForm(ESTADO_INICIAL);

  const registrarSalida = async (evento) => {
    evento.preventDefault();

    const cantidad = Number(form.cantidad);
    const nombreBuscado = form.nombre.trim().toLowerCase();
    const producto = productos.find((p) => (p.nombre || "").trim().toLowerCase() === nombreBuscado);

    if (!form.nombre.trim() || !cantidad || cantidad <= 0) {
      Swal.fire({
        title: "Datos incompletos",
        text: "Indica el nombre del material y una cantidad mayor a cero.",
        icon: "warning",
        confirmButtonColor: "#E8600C",
      });
      return;
    }

    if (!producto) {
      Swal.fire({
        title: "Material no encontrado",
        text: "El material indicado no existe en el inventario. Verifica el nombre o regístralo primero desde Entradas.",
        icon: "error",
        confirmButtonColor: "#E8600C",
      });
      return;
    }

    if (cantidad > producto.stock_actual) {
      Swal.fire({
        title: "Stock insuficiente",
        text: `Solo hay ${producto.stock_actual} unidad(es) disponibles de "${producto.nombre}". No es posible retirar ${cantidad}.`,
        icon: "error",
        confirmButtonColor: "#E8600C",
      });
      return;
    }

    setGuardando(true);
    try {
      const { error: errorUpdate } = await supabase
        .from("productos")
        .update({ stock_actual: producto.stock_actual - cantidad })
        .eq("id", producto.id);
      if (errorUpdate) throw errorUpdate;

      const responsable = form.responsable.trim() || perfil?.nombre || usuario?.email || "Jefe";
      const { error: errorMovimiento } = await supabase.from("movimientos").insert({
        producto_id: producto.id,
        tipo: "salida",
        cantidad,
        motivo: `Salida de material${form.marca ? ` · Marca: ${form.marca}` : ""}${form.modelo ? ` · Modelo: ${form.modelo}` : ""}`,
        responsable,
      });
      if (errorMovimiento) throw errorMovimiento;

      Swal.fire({
        title: "¡Salida registrada!",
        text: `Se registró la salida de ${cantidad} unidad(es) de "${form.nombre}".`,
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
        <i className="fa-solid fa-box-open"></i> Registrar salida de material
      </div>

      <div className="formulario">
        <form onSubmit={registrarSalida}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label" htmlFor="sal-nombre">Nombre del material</label>
              <input
                id="sal-nombre"
                type="text"
                className="form-control"
                placeholder="Ej. Llave inglesa"
                list="listaProductosSalida"
                value={form.nombre}
                onChange={actualizarCampo("nombre")}
              />
              <datalist id="listaProductosSalida">
                {productos.map((p) => (
                  <option key={p.id} value={p.nombre}>{`Disponibles: ${p.stock_actual}`}</option>
                ))}
              </datalist>
            </div>

            <div className="col-md-6">
              <label className="form-label" htmlFor="sal-unidad">Unidad de medida</label>
              <select
                id="sal-unidad"
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
              <label className="form-label" htmlFor="sal-marca">Marca</label>
              <input
                id="sal-marca"
                type="text"
                className="form-control"
                placeholder="Ej. Stanley"
                value={form.marca}
                onChange={actualizarCampo("marca")}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label" htmlFor="sal-cantidad">Cantidad a retirar</label>
              <input
                id="sal-cantidad"
                type="number"
                className="form-control"
                min="0"
                value={form.cantidad}
                onChange={actualizarCampo("cantidad")}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label" htmlFor="sal-modelo">Modelo o referencia</label>
              <input
                id="sal-modelo"
                type="text"
                className="form-control"
                placeholder="Ej. REF-1029"
                value={form.modelo}
                onChange={actualizarCampo("modelo")}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label" htmlFor="sal-categoria">Categoría</label>
              <select
                id="sal-categoria"
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

            <div className="col-12">
              <label className="form-label" htmlFor="sal-responsable">Responsable del retiro</label>
              <input
                id="sal-responsable"
                type="text"
                className="form-control"
                placeholder="Nombre de quien retira"
                value={form.responsable}
                onChange={actualizarCampo("responsable")}
              />
            </div>
          </div>

          <div className="contenedor-acciones">
            <button type="button" className="cancelarSalida" onClick={cancelarSalida}>
              <i className="fa-solid fa-xmark"></i> Cancelar
            </button>
            <button type="submit" className="confirmarRegistro" disabled={guardando}>
              <i className="fa-solid fa-check"></i> {guardando ? "Registrando…" : "Registrar salida"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default M_salida;
