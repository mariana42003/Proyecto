import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import logoImg from "../../assets/img/logo.png";
import { supabase } from "../../api/supabase";
import "../../assets/css/M_index.css";
import "../../assets/css/recuperacion.css";

/**
 * Recuperación de contraseña · paso final: nueva contraseña
 * (convertido desde pagesLogin/cambiarContra.html).
 *
 * Esta es la página a la que Supabase redirige de verdad (ver
 * `redirectTo` en OlvidoContra.jsx) cuando la persona hace clic en el
 * enlace de su correo. En ese momento ya queda con una sesión de
 * recuperación activa — por eso el HTML original pedía "Usuario" y
 * "PIN" (para identificar a la persona), pero aquí Supabase YA sabe
 * quién es gracias a esa sesión, así que esos dos campos sobraban y
 * se quitaron. Solo falta pedir la contraseña nueva y llamar a
 * `supabase.auth.updateUser({ password })`.
 */
export default function CambiarContra() {
  const navigate = useNavigate();
  const [nuevaContra, setNuevaContra] = useState("");
  const [confirmarContra, setConfirmarContra] = useState("");
  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async (evento) => {
    evento.preventDefault();

    if (nuevaContra.length < 6) {
      Swal.fire({
        title: "Contraseña muy corta",
        text: "Usa al menos 6 caracteres.",
        icon: "warning",
        confirmButtonColor: "#E8600C",
        confirmButtonText: "Entendido",
      });
      return;
    }

    if (nuevaContra !== confirmarContra) {
      Swal.fire({
        title: "Las contraseñas no coinciden",
        text: "Revisa que ambos campos sean iguales.",
        icon: "warning",
        confirmButtonColor: "#E8600C",
        confirmButtonText: "Entendido",
      });
      return;
    }

    setGuardando(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: nuevaContra });
      if (error) throw error;

      await Swal.fire({
        title: "¡Contraseña actualizada!",
        text: "Ya puedes usarla para iniciar sesión.",
        icon: "success",
        confirmButtonColor: "#E8600C",
        confirmButtonText: "Entendido",
      });
      navigate("/");
    } catch (error) {
      Swal.fire({
        title: "No se pudo cambiar la contraseña",
        text:
          error.message ||
          "El enlace pudo haber expirado. Vuelve a solicitar la recuperación.",
        icon: "error",
        confirmButtonColor: "#E8600C",
        confirmButtonText: "Entendido",
      });
    } finally {
      setGuardando(false);
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

        <hr />

        <div className="recuperacion-encabezado">
          <h1>Restablecimiento de contraseña</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="campo">
            <label htmlFor="nuevaContra"><i className="bi bi-key-fill"></i> Nueva contraseña</label>
            <input
              type="password"
              id="nuevaContra"
              value={nuevaContra}
              onChange={(e) => setNuevaContra(e.target.value)}
              minLength={6}
              placeholder="Ingrese su nueva contraseña"
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="confirmarContra"><i className="bi bi-key-fill"></i> Confirmar nueva contraseña</label>
            <input
              type="password"
              id="confirmarContra"
              value={confirmarContra}
              onChange={(e) => setConfirmarContra(e.target.value)}
              minLength={6}
              placeholder="Repita su nueva contraseña"
              required
            />
          </div>

          <button type="submit" className="btn-primario--full" disabled={guardando}>
            {guardando ? "Guardando…" : "Confirmar cambios"}
          </button>
        </form>
      </div>
    </div>
  );
}
