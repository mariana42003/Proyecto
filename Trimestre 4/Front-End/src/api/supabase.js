import { createClient } from "@supabase/supabase-js";

/**
 * Cliente único de Supabase para todo el proyecto.
 *
 * Soporta tanto el nombre de variable "clásico" (VITE_SUPABASE_ANON_KEY)
 * como el nuevo esquema de claves "publishable" de Supabase
 * (VITE_SUPABASE_PUBLISHABLE_KEY), ya que distintas partes del equipo
 * han usado uno u otro nombre en su .env.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  // eslint-disable-next-line no-console
  console.error(
    "Faltan las variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY / VITE_SUPABASE_PUBLISHABLE_KEY en el archivo .env"
  );
}

export const supabase = createClient(supabaseUrl || "", supabaseKey || "");

/**
 * Nombre de la tabla de perfiles donde se guarda el rol de cada usuario.
 * Se asume el siguiente esquema (ajústalo si tu tabla real es distinta):
 *
 *   perfiles
 *     id          uuid  PK, references auth.users(id)
 *     nombre      text
 *     apellido    text
 *     telefono    text
 *     direccion   text
 *     localidad   text
 *     barrio      text
 *     rol         text  -> 'jefe' | 'administrador' | 'empleado' | 'cliente'
 *     creado_en   timestamptz default now()
 */
export const TABLA_PERFILES = "perfiles";

/** Roles válidos reconocidos por la aplicación. */
export const ROLES = {
  JEFE: "jefe",
  ADMINISTRADOR: "administrador",
  EMPLEADO: "empleado",
  CLIENTE: "cliente",
};

/** Roles que tienen acceso al panel interno (/jefe/*). */
export const ROLES_PANEL = [ROLES.JEFE, ROLES.ADMINISTRADOR];
