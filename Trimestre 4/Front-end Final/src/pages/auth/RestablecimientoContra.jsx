import { Link, useLocation } from "react-router-dom";
import logoImg from "../../assets/img/logo.png";
import "../../assets/css/M_index.css";
import "../../assets/css/recuperacion.css";

/**
 * Recuperación de contraseña · paso 2 ("revisa tu correo").
 *
 * Convertido desde pagesLogin/restablecimientoContra.html. El diseño
 * original hablaba de un "PIN" — se ajustó el texto a "enlace" porque
 * es lo que Supabase realmente envía (ver OlvidoContra.jsx). El botón
 * "Restablecer contraseña" lleva a /cambiar-contrasena, que es la
 * pantalla donde se escribe la nueva clave (a la que Supabase también
 * manda directamente desde el enlace del correo).
 *
 * Los estilos viven en recuperacion.css.
 */
export default function RestablecimientoContra() {
  const location = useLocation();
  const correo = location.state?.correo;

  return (
    <div className="pantalla-recuperacion">
      <div className="tarjeta-recuperacion">
        <div className="acceso-brand">
          <img src={logoImg} alt="Kronos" className="acceso-brand__logo" />
        </div>

        <Link to="/recuperar-contrasena" className="enlace-boton">
          <i className="bi bi-chevron-double-left"></i> Volver
        </Link>

        <div className="recuperacion-encabezado">
          <h1>Restablecimiento en progreso</h1>
          <p>
            {correo
              ? <>Hemos enviado un enlace a <strong>{correo}</strong> para restablecer su contraseña.</>
              : "Hemos enviado un enlace a su correo para restablecer su contraseña."}
          </p>
        </div>

        <hr />

        <p className="rec-pregunta">¿No tiene acceso al correo?</p>

        <div className="bloque-ayuda">
          <i className="bi bi-chat-dots"></i>
          <p>En caso de no recordar el correo electrónico o haber perdido el acceso, se puede actualizar la dirección aquí.</p>
          <Link to="/modificar-correo" className="btn-primario--full btn-primario--compacto">
            → Modificar correo electrónico ←
          </Link>
        </div>

        <div className="bloque-ayuda bloque-ayuda--acero">
          <i className="bi bi-chat-left-dots-fill"></i>
          <p>Si el correo es correcto y se tiene acceso al mismo, no es necesario realizar ninguna actualización</p>
        </div>

        <Link to="/cambiar-contrasena" className="btn-rec-contorno">
          <i className="bi bi-exclamation-diamond-fill"></i> Restablecer contraseña <i className="bi bi-exclamation-diamond-fill"></i>
        </Link>
      </div>
    </div>
  );
}
