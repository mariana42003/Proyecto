import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import logoImg from "../../assets/img/logo.png";
import { useAuth } from "../../context/AuthContext";
import "../../assets/css/M_index.css";

/**
 * Registro real (Supabase Auth + tabla `perfiles`) migrado desde el
 * proyecto de referencia, donde `handleSubmit` estaba vacío.
 *
 * Todo usuario que se registra aquí queda con rol "cliente" (es el
 * formulario público de "Regístrate para comprar"); los roles jefe /
 * administrador / empleado se asignan manualmente desde Supabase, no
 * desde este formulario público.
 */
export default function Registrarse({ abierto = true, alCerrar }) {
  const { registrarse } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    email: "",
    localidad: "",
    barrio: "",
    direccion: "",
    password: "",
  });
  const [cargando, setCargando] = useState(false);

  if (!abierto) return null;

  const cerrar = () => {
    if (alCerrar) alCerrar();
    else navigate("/");
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 8) {
      Swal.fire({
        title: "Contraseña muy corta",
        text: "La contraseña debe tener al menos 8 caracteres.",
        icon: "warning",
        confirmButtonColor: "#E8600C",
      });
      return;
    }

    setCargando(true);
    try {
      const { nombre, apellido, telefono, email, localidad, barrio, direccion, password } = formData;
      await registrarse({
        email,
        password,
        nombre,
        apellido,
        telefono,
        localidad,
        barrio,
        direccion,
      });

      Swal.fire({
        title: "¡Cuenta creada!",
        text: "Si tu proyecto requiere confirmación por correo, revisa tu bandeja de entrada antes de iniciar sesión.",
        icon: "success",
        confirmButtonColor: "#E8600C",
        confirmButtonText: "Entendido",
      }).then(() => {
        cerrar();
        navigate("/login");
      });
    } catch (error) {
      Swal.fire({
        title: "No se pudo completar el registro",
        text: error.message || "Inténtalo de nuevo en unos minutos.",
        icon: "error",
        confirmButtonColor: "#E8600C",
      });
    } finally {
      setCargando(false);
    }
  };

  const contenido = (
    <div className={`kr-modal ${abierto ? "activo" : ""}`}>
      <button className="btn-cerrar btn-cerrar--modal" type="button" onClick={cerrar} aria-label="Cerrar">
        <IconX size={20} />
      </button>
      <div className="acceso-brand">
        <img src={logoImg} alt="Kronos" className="acceso-brand__logo" />
      </div>
      <div className="modal__encabezado">
        <h2>Regístrate para comprar</h2>
      </div>
      <form className="modal__form" onSubmit={handleSubmit} autoComplete="off">
        <div className="campo">
          <label htmlFor="reg_nombre">Nombre</label>
          <input type="text" id="reg_nombre" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre" required />
        </div>
        <div className="campo">
          <label htmlFor="reg_apellido">Apellido</label>
          <input type="text" id="reg_apellido" name="apellido" value={formData.apellido} onChange={handleChange} placeholder="Apellido" required />
        </div>
        <div className="campo">
          <label htmlFor="reg_telefono">Número de teléfono</label>
          <input type="tel" id="reg_telefono" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="+57" />
        </div>
        <div className="campo">
          <label htmlFor="reg_email">Correo electrónico</label>
          <input type="email" id="reg_email" name="email" value={formData.email} onChange={handleChange} placeholder="nombre@correo.com" autoComplete="new-password" required />
        </div>
        <div className="campo campo--doble">
          <div>
            <label htmlFor="reg_localidad">Localidad</label>
            <input type="text" id="reg_localidad" name="localidad" value={formData.localidad} onChange={handleChange} placeholder="Usme" />
          </div>
          <div>
            <label htmlFor="reg_barrio">Barrio</label>
            <input type="text" id="reg_barrio" name="barrio" value={formData.barrio} onChange={handleChange} placeholder="Santa Martha" />
          </div>
        </div>
        <div className="campo">
          <label htmlFor="reg_direccion">Dirección</label>
          <input type="text" id="reg_direccion" name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Calle 78b #8A-09" />
        </div>
        <div className="campo">
          <label htmlFor="reg_password">Contraseña</label>
          <input type="password" id="reg_password" name="password" value={formData.password} onChange={handleChange} placeholder="Mínimo 8 caracteres" autoComplete="new-password" required />
        </div>
        <button type="submit" className="btn-primario btn-primario--full" disabled={cargando}>
          {cargando ? "Creando cuenta…" : "Registrarse"}
        </button>
      </form>
    </div>
  );

  if (alCerrar) return contenido;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg, #15171B)",
        padding: "24px 0",
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
