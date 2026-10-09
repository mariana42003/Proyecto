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
