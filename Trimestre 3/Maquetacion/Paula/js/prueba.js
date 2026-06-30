document.addEventListener("DOMContentLoaded", function () {
    // Capturamos los elementos del DOM
    const btnCarrito = document.getElementById("btnCarrito");
    const btnCerrarCarrito = document.getElementById("btnCerrarCarrito");
    const carritoSidebar = document.getElementById("carritoSidebar");

    // Función para abrir el carrito
    function abrirCarrito(e) {
        e.preventDefault(); // Evita que el enlace '#' recargue o mueva la página
        carritoSidebar.classList.add("active");

    }

    // Función para cerrar el carrito
    function cerrarCarrito() {
        carritoSidebar.classList.remove("active");

    }

    // Eventos de escucha
    btnCarrito.addEventListener("click", abrirCarrito);
    btnCerrarCarrito.addEventListener("click", cerrarCarrito);
});