let carrito = [];

$('#carruselProductos').on('click', '.agregar-b', function() { 
    const tarjetaProducto = $(this).closest('.producto-card, .card');
    
    const producto = {
        id: $(this).data('id') || Date.now(),
        nombre: tarjetaProducto.find('.producto-titulo, .card-title').text().trim(),
        precio: parseInt(tarjetaProducto.find('.producto-precio, .card-text').data('precio')) || 0,
        imagen: tarjetaProducto.find('.producto-img, .card-img-top').attr('src')
    };

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
            agregarAlCarritoArray(producto);
            Swal.fire({
                title: "¡Añadido!",
                text: "Se añadio el producto al carrito",
                icon: "success"
            });
        }
    });
});

function agregarAlCarritoArray(nuevoProducto) {
    const existe = carrito.find(item => item.nombre === nuevoProducto.nombre);
    if (existe) {
        existe.cantidad++;
    } else {
        nuevoProducto.cantidad = 1;
        carrito.push(nuevoProducto);
    }
    renderizarCarrito();
}

function renderizarCarrito() {
    const contenedorCarrito = document.getElementById("contenedorProductosCarrito");
    const totalCarritoElemento = document.getElementById("totalCarrito");
    
    if (!contenedorCarrito) return;

    if (carrito.length === 0) {
        contenedorCarrito.innerHTML = '<p class="text-center text-muted my-4">El carrito está vacío</p>';
        if (totalCarritoElemento) totalCarritoElemento.textContent = "$0";
        return;
    }

    let total = 0;
    contenedorCarrito.innerHTML = "";

    carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;

        const itemHTML = `
            <div class="d-flex align-items-center justify-content-between border-bottom py-2 gap-2">
                <img src="${item.imagen}" alt="${item.nombre}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                <div class="flex-grow-1">
                    <h6 class="m-0 fw-bold" style="font-size: 0.95rem;">${item.nombre}</h6>
                    <small class="text-muted">${item.cantidad} x $${item.precio.toLocaleString('es-CO')}</small>
                </div>
                <div class="text-end">
                    <span class="fw-bold d-block" style="font-size: 0.9rem;">$${subtotal.toLocaleString('es-CO')}</span>
                    <button class="btn btn-sm text-danger p-0" onclick="eliminarDelCarrito(${index})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
        contenedorCarrito.insertAdjacentHTML('beforeend', itemHTML);
    });

    if (totalCarritoElemento) {
        totalCarritoElemento.textContent = `$${total.toLocaleString('es-CO')}`;
    }
}

window.eliminarDelCarrito = function(index) {
    carrito.splice(index, 1);
    renderizarCarrito();
};

document.addEventListener("DOMContentLoaded", function () {
    const btnCarrito = document.getElementById("btnCarrito");
    const btnCerrarCarrito = document.getElementById("btnCerrarCarrito");
    const carritoSidebar = document.getElementById("carritoSidebar");

    function abrirCarrito(e) {
        e.preventDefault(); 
        carritoSidebar.classList.add("active");
    }

    function cerrarCarrito() {
        carritoSidebar.classList.remove("active");
    }

    btnCarrito.addEventListener("click", abrirCarrito);
    btnCerrarCarrito.addEventListener("click", cerrarCarrito);
    
    renderizarCarrito();
});
