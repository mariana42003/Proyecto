import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { supabase, TABLA_PERFILES } from "../api/supabase";
import { useAuth } from "../context/AuthContext";

const CAMPOS_INICIALES = {
  nombre: "",
  apellido: "",
  telefono: "",
  direccion: "",
  localidad: "",
  barrio: "",
};

/**
 * Modal "Mi perfil" del portal del cliente.
 *
 * Reutiliza las mismas clases CSS que ya existen para el modal de
 * "Mis Pedidos" (kr-modal / modal--pedidos / modal-pedidos__header /
 * modal-pedidos__body / btn-cerrar-header), definidas en M_index.css,
 * así que no requiere agregar ni tocar reglas de CSS: no interfiere
 * con el modal del carrito ni con el de registro/login.
 *
 * Actualiza directamente la tabla `perfiles` en Supabase
 * (auth.uid() = id), y refresca el AuthContext al guardar para que el
 * nombre se vea actualizado de inmediato en el navbar.
 */
export default function ModalPerfilCliente({ abierto, alCerrar }) {
  const { usuario, perfil, recargarPerfil } = useAuth();
  const [form, setForm] = useState(CAMPOS_INICIALES);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (perfil) {
      setForm({
        nombre: perfil.nombre || "",
        apellido: perfil.apellido || "",
        telefono: perfil.telefono || "",
        direccion: perfil.direccion || "",
        localidad: perfil.localidad || "",
        barrio: perfil.barrio || "",
      });
    }
  }, [perfil, abierto]);

  if (!usuario) return null;

  const actualizarCampo = (campo) => (evento) => {
    setForm((actual) => ({ ...actual, [campo]: evento.target.value }));
  };

  const handleGuardar = async (evento) => {
    evento.preventDefault();
    setGuardando(true);
    try {
      const { error } = await supabase
        .from(TABLA_PERFILES)
        .update(form)
        .eq("id", usuario.id);

      if (error) throw error;

      await recargarPerfil();

      Swal.fire({
        icon: "success",
        title: "Perfil actualizado",
        text: "Tus datos se guardaron correctamente.",
        confirmButtonColor: "#E8600C",
      });
      alCerrar();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo guardar",
        text: error.message,
        confirmButtonColor: "#933c9e",
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className={`kr-modal modal--pedidos ${abierto ? "activo" : ""}`}>
      <div className="modal-pedidos__header">
        <div className="d-flex align-items-center gap-2">
          <span style={{ fontSize: "1.2rem" }}>👤</span>
          <h2
            className="text-white m-0 fs-5"
            style={{ fontFamily: "var(--fuente-texto)", fontWeight: 600 }}
          >
            Mi perfil
          </h2>
        </div>
        <button className="btn-cerrar-header" type="button" onClick={alCerrar}>
          ✕
        </button>
      </div>

      <div className="modal-pedidos__body">
        <form onSubmit={handleGuardar} className="row g-3">
          <div className="col-12">
            <label className="form-label">Correo</label>
            <input type="email" className="form-control" value={usuario.email || ""} disabled />
          </div>

          <div className="col-md-6">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              className="form-control"
              value={form.nombre}
              onChange={actualizarCampo("nombre")}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Apellido</label>
            <input
              type="text"
              className="form-control"
              value={form.apellido}
              onChange={actualizarCampo("apellido")}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Teléfono</label>
            <input
              type="tel"
              className="form-control"
              value={form.telefono}
              onChange={actualizarCampo("telefono")}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Localidad</label>
            <input
              type="text"
              className="form-control"
              value={form.localidad}
              onChange={actualizarCampo("localidad")}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Barrio</label>
            <input
              type="text"
              className="form-control"
              value={form.barrio}
              onChange={actualizarCampo("barrio")}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Dirección</label>
            <input
              type="text"
              className="form-control"
              value={form.direccion}
              onChange={actualizarCampo("direccion")}
            />
          </div>

          <div className="col-12 d-flex justify-content-end gap-2 pt-2">
            <button type="button" className="btn btn-outline-secondary" onClick={alCerrar}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={guardando}>
              {guardando ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
