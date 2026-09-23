import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import logoImg from "../../assets/img/logo.png";
import { useAuth } from "../../context/AuthContext";
import { supabase, TABLA_PERFILES } from "../../api/supabase";
import "../../assets/css/M_index.css";

/**
 * Login real (Supabase Auth) migrado desde el proyecto de referencia
 * (Index_incorporado_con_funcionesLOGINY_REGISTRAR_vistacliente.zip),
 * donde el formulario existía visualmente pero `handleSubmit` estaba
 * vacío ("Lógica de inicio de sesión con Supabase si la necesitas").
 *
 * Aquí sí se implementa esa lógica:
 *   - supabase.auth.signInWithPassword vía AuthContext.iniciarSesion.
 *   - Al autenticar, se lee el rol desde la tabla `perfiles` y se
 *     redirige automáticamente:
 *       jefe / administrador -> /jefe/panel
 *       cliente               -> /cliente/pedidos
 *       empleado              -> / (aún no existe una vista propia)
 *
 * Se conserva el modo "modal" original (props abierto/alCerrar, usado
 * desde M_index.jsx) y además funciona como página completa cuando se
 * navega directamente a /login (abierto=true por defecto).
 */
export default function Login({ abierto = true, alCerrar }) {
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);

  if (!abierto) return null;

  const cerrar = () => {
    if (alCerrar) alCerrar();
    else navigate("/");
  };

  const redirigirSegunRol = (rol) => {
    const destinoPrevio = location.state?.desde;
    if (destinoPrevio && destinoPrevio !== "/login") {
      navigate(destinoPrevio, { replace: true });
      return;
    }
    if (rol === "jefe" || rol === "administrador") navigate("/jefe/panel", { replace: true });
    else if (rol === "cliente") navigate("/cliente/pedidos", { replace: true });
    else navigate("/", { replace: true });
  };

  const handleSubmit = async (evento) => {
    evento.preventDefault();
    setCargando(true);
    try {
      const { user } = await iniciarSesion(correo, password);

      // El perfil se carga de forma asíncrona dentro de AuthContext;
      // lo volvemos a pedir aquí para poder redirigir de inmediato
      // sin depender de un segundo render.
      const { data: perfil } = await supabase
        .from(TABLA_PERFILES)
        .select("rol")
        .eq("id", user.id)
        .maybeSingle();

      Swal.fire({
        title: "¡Bienvenido de nuevo!",
        text: "Has iniciado sesión correctamente.",
        icon: "success",
        confirmButtonColor: "#E8600C",
        timer: 1400,
        showConfirmButton: false,
      });

      cerrar();
      redirigirSegunRol(perfil?.rol);
    } catch (error) {
      Swal.fire({
        title: "No se pudo iniciar sesión",
        text: error.message || "Revisa tu correo y contraseña e inténtalo de nuevo.",
        icon: "error",
        confirmButtonColor: "#E8600C",
        confirmButtonText: "Entendido",
      });
    } finally {
      setCargando(false);
    }
  };

  const contenido = (
    <div className={`kr-modal modal--login ${abierto ? "activo" : ""}`}>
      <button className="btn-cerrar btn-cerrar--modal" type="button" onClick={cerrar} aria-label="Cerrar">
        <IconX size={20} />
      </button>
      <div className="acceso-brand">
        <img src={logoImg} alt="Kronos" className="acceso-brand__logo" />
      </div>
      <div className="modal__encabezado">
        <h2>Inicia sesión</h2>
      </div>
      <form className="modal__form" onSubmit={handleSubmit} autoComplete="off">
        <div className="campo">
          <label htmlFor="loginCorreo">Correo electrónico</label>
          <input
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            type="email"
            id="loginCorreo"
            placeholder="nombre@kronos.com"
            autoComplete="off"
            required
          />
        </div>
        <div className="campo">
          <label htmlFor="loginContrasena">Contraseña</label>
          <div className="campo-password">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={mostrarPassword ? "text" : "password"}
              id="loginContrasena"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="btn-mostrar-password"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              <IconEye size={18} />
            </button>
          </div>
        </div>
        <button type="submit" className="btn-primario btn-primario--full" disabled={cargando}>
          {cargando ? "Ingresando…" : "Inicia sesión"} <IconArrowRightToBracket size={16} />
        </button>
        <div className="modal__enlaces modal__enlaces--login">
          <a href="/recuperar-contrasena">¿Olvidaste tu contraseña?</a>
        </div>
      </form>
    </div>
  );

  // Modo modal (renderizado dentro de M_index.jsx): sin fondo propio,
  // el overlay lo pone la página que lo contiene.
  if (alCerrar) return contenido;

  // Modo página completa (ruta /login): centrado sobre el fondo del tema.
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg, #15171B)",
      }}
    >
      {contenido}
    </div>
  );
}

function IconX({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  );
}

function IconEye({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconArrowRightToBracket({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" />
    </svg>
  );
}
