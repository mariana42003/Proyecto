$('#carrusel').on('click', '.agregar-b', function() { 
    
    Swal.fire({
        title: "¿Quieres añadir al carrito?",
        text: "Asegurate de que quieres añadir este producto",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#7a61e6", 
        cancelButtonColor: "rgb(221, 153, 51)",
        confirmButtonText: "Añadir",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {

            Swal.fire({
                title: "¡Añadido!",
                text: "Se añadio el producto al carrito",
                icon: "success"
            });
        }
    });

});

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



