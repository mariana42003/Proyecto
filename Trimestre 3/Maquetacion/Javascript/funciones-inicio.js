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

