import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import logoImg from "../../assets/img/logo.png";
import { supabase } from "../../api/supabase";
import "../../assets/css/M_index.css";
import "../../assets/css/recuperacion.css";

/**
 * Recuperación de contraseña · paso 1 (convertido desde
 * pagesLogin/olvidoContra.html).
 *
 * El HTML original pedía el correo y "enviaba" a
 * restablecimientoContra.html sin hacer nada de verdad. Aquí sí se
 * llama a Supabase: `resetPasswordForEmail` le manda al correo un
 * enlace real de recuperación. Supabase NO tiene el flujo "PIN de 4
 * dígitos" del diseño original (eso requeriría un backend propio que
 * genere y valide ese PIN); el enlace que llega hace lo mismo pero
 * sin PIN, así que la página siguiente (RestablecimientoContra) se
 * ajustó para hablar de "enlace" en vez de "PIN".
 *
 * `redirectTo` apunta a /cambiar-contrasena: ahí es donde Supabase
 * deja al usuario ya autenticado temporalmente (sesión de
 * recuperación) para que ponga su nueva contraseña.
 */
export default function OlvidoContra() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (evento) => {
    evento.preventDefault();
    setEnviando(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(correo, {
        redirectTo: `${window.location.origin}/cambiar-contrasena`,
      });
      if (error) throw error;
      navigate("/restablecimiento-contrasena", { state: { correo } });
    } catch (error) {
      Swal.fire({
        title: "No se pudo enviar el correo",
        text: error.message || "Revisa el correo e inténtalo de nuevo.",
        icon: "error",
        confirmButtonColor: "#E8600C",
        confirmButtonText: "Entendido",
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="pantalla-recuperacion pantalla-recuperacion--olvido">
      <div className="tarjeta-olvido">
        <div className="olvido-form">
          <img src={logoImg} alt="Kronos" className="olvido-form__logo" />

          <h1>Recuperación de contraseña</h1>
          <p className="olvido-form__texto">
            Ingresa tu correo corporativo/personal y te enviaremos el enlace de acceso.
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="correo">Correo electrónico</label>
            <input
              type="email"
              id="correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="nombre@kronos.com"
              required
            />

            <button type="submit" className="btn-primario--full" disabled={enviando}>
              {enviando ? "Enviando…" : "Enviar instrucciones"} <i className="bi bi-arrow-right"></i>
            </button>
          </form>

          <Link to="/" className="olvido-form__volver">
            <i className="bi bi-arrow-left"></i> Volver al inicio
          </Link>
        </div>

        {/* OJO: no usar <aside> aquí: panel-base.css le pone ancho 250px y alto 500vh a todos los <aside> de la app. */}
        <div className="olvido-panel">
          <div className="olvido-panel__icono" aria-hidden="true">
            <i className="fa-solid fa-shield"></i>
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <h2>Kronos Security</h2>
          <p>Recuperación segura de cuentas para operarios y administradores.</p>
        </div>
      </div>
    </div>
  );
}
