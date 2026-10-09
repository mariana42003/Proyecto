import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import logoImg from "../../assets/img/logo.png";
import { supabase } from "../../api/supabase";
import { useAuth } from "../../context/AuthContext";
import "../../assets/css/M_index.css";
import "../../assets/css/recuperacion.css";

/**
 * Recuperación de contraseña·
 */
export default function ModificarCorreo() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [correo, setCorreo] = useState("");
  const [correoConfirmar, setCorreoConfirmar] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (evento) => {
    evento.preventDefault();

    if (!usuario) {
      Swal.fire({
        title: "Necesitas una sesión activa",
        text: "Inicia sesión, o entra desde el enlace de recuperación que te llegó por correo, para poder cambiar tu correo.",
        icon: "warning",
        confirmButtonColor: "#E8600C",
        confirmButtonText: "Entendido",
      });
      return;
    }

    if (correo !== correoConfirmar) {
      Swal.fire({
        title: "Los correos no coinciden",
        text: "Revisa que ambos campos tengan la misma dirección.",
        icon: "warning",
        confirmButtonColor: "#E8600C",
        confirmButtonText: "Entendido",
      });
      return;
    }

    setEnviando(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: correo });
      if (error) throw error;
      await Swal.fire({
        title: "Revisa tu nuevo correo",
        text: "Te enviamos un enlace de confirmación a la nueva dirección. El cambio queda hecho cuando lo confirmes desde ahí.",
        icon: "success",
        confirmButtonColor: "#E8600C",
        confirmButtonText: "Entendido",
      });
      navigate("/");
    } catch (error) {
      Swal.fire({
        title: "No se pudo actualizar el correo",
        text: error.message || "Inténtalo de nuevo en unos minutos.",
        icon: "error",
        confirmButtonColor: "#E8600C",
        confirmButtonText: "Entendido",
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="pantalla-recuperacion">
      <div className="tarjeta-recuperacion">
        <div className="acceso-brand">
          <img src={logoImg} alt="Kronos" className="acceso-brand__logo" />
        </div>

        <Link to="/restablecimiento-contrasena" className="enlace-boton">
          <i className="bi bi-chevron-double-left"></i> Volver
        </Link>

        <div className="recuperacion-encabezado">
          <h1>Actualizar correo electrónico</h1>
          <p className="subtitulo-fuerte">
            Si ya no tiene acceso a su correo electrónico, complete el formulario para actualizar la dirección de correo asociada a su cuenta.
          </p>
        </div>

        {!usuario && (
          <div className="bloque-ayuda">
            <i className="bi bi-exclamation-triangle"></i>
            <p>
              No tiene una sesión activa. Inicie sesión o use el enlace de recuperación que le llegó por correo antes de continuar.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="campo">
            <label htmlFor="correo"><i className="bi bi-envelope-plus"></i> Nuevo correo electrónico</label>
            <input
              type="email"
              id="correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="Ingrese su correo electrónico"
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="correoConfirmar"><i className="bi bi-envelope-exclamation-fill"></i> Confirmar nuevo correo electrónico</label>
            <input
              type="email"
              id="correoConfirmar"
              value={correoConfirmar}
              onChange={(e) => setCorreoConfirmar(e.target.value)}
              placeholder="Ingrese su correo electrónico"
              required
            />
          </div>

          <button type="submit" className="btn-primario--full" disabled={enviando}>
            {enviando
              ? "Actualizando…"
              : <><i className="fa-solid fa-arrow-rotate-right"></i> Actualización de correo electrónico <i className="fa-solid fa-arrow-rotate-left"></i></>}
          </button>
        </form>
      </div>
    </div>
  );
}
