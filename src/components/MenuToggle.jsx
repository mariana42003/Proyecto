// Botón hamburguesa del menú lateral (solo visible en pantallas <= 768px).
// Debe renderizarse ANTES y AFUERA del <div className="contenedor">,
// porque el CSS depende de esa posición de hermano:
//   #menu:checked ~ .contenedor aside
//
// Uso en el layout:
//   <MenuToggle abierto={menuAbierto} onCambiar={setMenuAbierto} />
//   <Proveedorheader />
//   <div className="contenedor">...</div>

export default function MenuToggle({ abierto, onCambiar }) {
  return (
    <>
      <input
        type="checkbox"
        id="menu"
        checked={abierto}
        onChange={(e) => onCambiar(e.target.checked)}
      />

      {/* Botón: hamburguesa cuando está cerrado, X cuando está abierto */}
      <label htmlFor="menu" className="menus" title={abierto ? "Cerrar menú" : "Abrir menú"}>
        <i className={`bi ${abierto ? "bi-x-lg" : "bi-list"}`}></i>
      </label>

      {/* Fondo oscuro: tocar afuera del menú lo cierra */}
      <label htmlFor="menu" className="menu-fondo" aria-hidden="true"></label>
    </>
  );
}
