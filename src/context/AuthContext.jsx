import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase, TABLA_PERFILES } from "../api/supabase";


const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  const cargarPerfil = async (usuario) => {
    if (!usuario) {
      setPerfil(null);
      return;
    }
    try {
      const { data, error } = await supabase
        .from(TABLA_PERFILES)
        .select("*")
        .eq("id", usuario.id)
        .maybeSingle();

      if (error) throw error;
      setPerfil(data || null);
    } catch (error) {
      // No tumbamos la sesión si falla la lectura del perfil: el usuario
      // sigue autenticado, solo no conocemos aún su rol.
      console.error("No se pudo cargar el perfil del usuario:", error.message);
      setPerfil(null);
    }
  };

  useEffect(() => {
    let activo = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!activo) return;
      setSesion(data.session);
      cargarPerfil(data.session?.user).finally(() => setCargandoSesion(false));
    });

    const { data: suscripcion } = supabase.auth.onAuthStateChange(
      (_evento, nuevaSesion) => {
        setSesion(nuevaSesion);
        cargarPerfil(nuevaSesion?.user);
      }
    );

    return () => {
      activo = false;
      suscripcion.subscription.unsubscribe();
    };
  }, []);

  const iniciarSesion = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    await cargarPerfil(data.user);
    return data;
  };

  const registrarse = async ({ email, password, ...datosPerfil }) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    // Si Supabase requiere confirmación de correo, data.user existe pero
    // aún no hay sesión activa: igual intentamos crear el perfil.
    if (data.user) {
      const { error: errorPerfil } = await supabase.from(TABLA_PERFILES).insert({
        id: data.user.id,
        rol: "cliente",
        ...datosPerfil,
      });
      if (errorPerfil) throw errorPerfil;
    }

    return data;
  };

  const cerrarSesion = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSesion(null);
    setPerfil(null);
  };

  // Refresca el perfil en memoria (p. ej. después de editarlo desde el
  // modal "Mi perfil"), sin tener que cerrar y volver a iniciar sesión
  // para ver el nombre actualizado en el navbar.
  const recargarPerfil = async () => {
    await cargarPerfil(sesion?.user);
  };

  const valor = useMemo(
    () => ({
      sesion,
      usuario: sesion?.user || null,
      perfil,
      rol: perfil?.rol || null,
      cargandoSesion,
      iniciarSesion,
      registrarse,
      cerrarSesion,
      recargarPerfil,
    }),
    [sesion, perfil, cargandoSesion]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (contexto === undefined) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return contexto;
}
