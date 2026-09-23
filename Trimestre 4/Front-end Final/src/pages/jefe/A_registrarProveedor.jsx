import { useMemo, useState } from "react";
import { Modal } from "bootstrap";
import Swal from "sweetalert2";
import "../../assets/css/A_registrarPorveedor-jefe.css";
import { supabase } from "../../api/supabase";
import { useRealtimeTable } from "../../hooks/useRealtimeTable";

/**
 * Proveedores · CRUD completo conectado a la tabla `proveedores` de
 * Supabase (sección 5 del prompt):
 *   - Crear: modal con insert.
 *   - Leer / Buscar: tabla + buscador en tiempo real (client-side,
 *     sobre datos ya sincronizados por postgres_changes).
 *   - Actualizar: el botón de editar ahora sí abre el modal
 *     precargado y hace un update (antes no tenía lógica).
 *   - Eliminar: igual que antes, con confirmación de SweetAlert2.
 */

const REGISTROS_POR_PAGINA = 5;
const FORM_INICIAL = { nombre: "", nit: "", telefono: "", direccion: "", correo: "", tipo_producto: "" };

function A_registrarProveedor() {
  const { datos: proveedores, cargando, error } = useRealtimeTable("proveedores", {
    orderBy: "nombre",
    ascending: true,
  });

  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [form, setForm] = useState(FORM_INICIAL);
  const [editandoId, setEditandoId] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return proveedores;
    return proveedores.filter((proveedor) =>
      Object.values(proveedor).join(" ").toLowerCase().includes(termino)
    );
  }, [proveedores, busqueda]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / REGISTROS_POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const paginados = filtrados.slice(
    (paginaSegura - 1) * REGISTROS_POR_PAGINA,
    paginaSegura * REGISTROS_POR_PAGINA
  );

  const actualizarCampo = (campo) => (evento) => {
    setForm((actual) => ({ ...actual, [campo]: evento.target.value }));
  };

  const cerrarModal = () => {
    document.querySelector("#modalUsuario .btn-close")?.click();
  };

  const abrirNuevo = () => {
    setEditandoId(null);
    setForm(FORM_INICIAL);
  };

  const abrirEdicion = (proveedor) => {
    setEditandoId(proveedor.id);
    setForm({
      nombre: proveedor.nombre || "",
      nit: proveedor.nit || "",
      telefono: proveedor.telefono || "",
      direccion: proveedor.direccion || "",
      correo: proveedor.correo || "",
      tipo_producto: proveedor.tipo_producto || "",
    });
    const modalEl = document.getElementById("modalUsuario");
    Modal.getOrCreateInstance(modalEl).show();
  };

  const guardarProveedor = async (evento) => {
    evento.preventDefault();
    setGuardando(true);
    try {
      if (editandoId) {
        const { error: errorUpdate } = await supabase
          .from("proveedores")
          .update(form)
          .eq("id", editandoId);
        if (errorUpdate) throw errorUpdate;

        Swal.fire({
          icon: "success",
          title: "Proveedor actualizado",
          text: `Los datos de "${form.nombre}" se guardaron correctamente.`,
          confirmButtonColor: "#8d86c9",
        });
      } else {
        const { error: errorInsert } = await supabase.from("proveedores").insert({ ...form, activo: true });
        if (errorInsert) throw errorInsert;

        Swal.fire({
          icon: "success",
          title: "Proveedor registrado",
          text: `"${form.nombre}" fue agregado correctamente.`,
          confirmButtonColor: "#8d86c9",
        });
      }

      setForm(FORM_INICIAL);
      setEditandoId(null);
      cerrarModal();
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo guardar", text: error.message, confirmButtonColor: "#933c9e" });
    } finally {
      setGuardando(false);
    }
  };

  const eliminarProveedor = (id, nombre) => {
    Swal.fire({
      title: "¿Está seguro?",
      text: "El proveedor será eliminado",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#8d86c9",
      cancelButtonColor: "#933c9e",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "No, cancelar",
    }).then(async (resultado) => {
      if (!resultado.isConfirmed) return;
      try {
        const { error: errorDelete } = await supabase.from("proveedores").delete().eq("id", id);
        if (errorDelete) throw errorDelete;
        Swal.fire({
          icon: "success",
          title: "Eliminado",
          text: `El proveedor "${nombre}" fue eliminado correctamente`,
          confirmButtonColor: "#c9e6cb",
        });
      } catch (error) {
        Swal.fire({ icon: "error", title: "No se pudo eliminar", text: error.message, confirmButtonColor: "#933c9e" });
      }
    });
  };

  return (
    <>
      <section className="panelTabla">
        <div className="cabecera-tabla">
          <div className="tituloProveedores">
            <h1><i className="bi bi-person-plus-fill"></i> Proveedores</h1>
            <p>Gestion de proveedores CRUD</p>
          </div>
        </div>

        {error && <div className="alert alert-danger">No se pudo conectar con la tabla "proveedores": {error}</div>}

        <div className="buscarOrden">
          <i className="bi bi-search"></i>
          <input
            type="search"
            placeholder="Buscar proveedor..."
            value={busqueda}
            onChange={(evento) => {
              setBusqueda(evento.target.value);
              setPagina(1);
            }}
          />
        </div>

        <div className="btn-añadir">
          <button className="btn btn-guardarPv" data-bs-toggle="modal" data-bs-target="#modalUsuario" onClick={abrirNuevo}>
            <i className="bi bi-plus"></i> Añadir
          </button>
        </div>

        <div className="table-responsive">
          <table id="tablaProveedores" className="table align-middle tablaPersonalizada">
            <thead>
              <tr>
                <th>Nombre del proveedor</th>
                <th>NIT o Cédula</th>
                <th>Telefono</th>
                <th>Direccion</th>
                <th>Correo electronico</th>
                <th>Tipo de producto</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan={7} className="text-center py-4">Cargando proveedores…</td></tr>
              ) : paginados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">No se encontraron resultados</td>
                </tr>
              ) : (
                paginados.map((proveedor) => (
                  <tr key={proveedor.id}>
                    <td>{proveedor.nombre}</td>
                    <td>{proveedor.nit}</td>
                    <td>{proveedor.telefono}</td>
                    <td>{proveedor.direccion}</td>
                    <td>{proveedor.correo}</td>
                    <td>{proveedor.tipo_producto}</td>
                    <td className="d-flex flex-column gap-2 align-items-center">
                      <button className="btn btn-sm btn-editar w-100" type="button" onClick={() => abrirEdicion(proveedor)}>
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-eliminar btnEliminar w-100"
                        type="button"
                        onClick={() => eliminarProveedor(proveedor.id, proveedor.nombre)}
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

        <div className="tabla-paginacion">
          <button type="button" onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={paginaSegura === 1}>
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
      </section>

      <div className="modal fade" id="modalUsuario" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content modal-login">
            <div className="modal-header border-0">
              <h2 className="modal-tittle w-100 text-center">
                {editandoId ? "Editar proveedor" : "Nuevo proveedor"} <i className="bi bi-person-fill-add"></i>
              </h2>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <form id="formUsuario" onSubmit={guardarProveedor}>
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Nombre del proveedor"
                  required
                  value={form.nombre}
                  onChange={actualizarCampo("nombre")}
                />
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="NIT o Cédula"
                  minLength={3}
                  maxLength={50}
                  required
                  value={form.nit}
                  onChange={actualizarCampo("nit")}
                />
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Telefono"
                  minLength={3}
                  maxLength={20}
                  required
                  value={form.telefono}
                  onChange={actualizarCampo("telefono")}
                />
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Direccion"
                  minLength={3}
                  maxLength={40}
                  required
                  value={form.direccion}
                  onChange={actualizarCampo("direccion")}
                />
                <input
                  type="email"
                  className="form-control mb-3"
                  placeholder="Correo electronico"
                  required
                  value={form.correo}
                  onChange={actualizarCampo("correo")}
                />
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Tipo de producto"
                  minLength={3}
                  maxLength={30}
                  required
                  value={form.tipo_producto}
                  onChange={actualizarCampo("tipo_producto")}
                />

                <button type="submit" className="btn btn-guardarP w-100" disabled={guardando}>
                  {guardando ? "Guardando…" : editandoId ? "Actualizar Proveedor" : "Guardar Proveedor"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default A_registrarProveedor;
