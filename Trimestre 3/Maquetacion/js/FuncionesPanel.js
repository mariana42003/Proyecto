$(document).ready(function() {

    // CORREGIDO: Agregamos el punto (.) antes del nombre de la clase
    $('.confirmarRegistro').on('click', function() { 
        Swal.fire({
           title: "Material Registrado",
           icon: "success",
           draggable: true
        });
    });

});

$('#boton').on('click', '.confirmarSalida', function() { 
    
    $('.confirmarSalida').on('click', function() { 
        Swal.fire({
           title: "Venta Confirmada",
           icon: "success",
           draggable: true
        });
    
    
    });

    $('.cancelarSalida').on('click', function() { 
        Swal.fire({
          icon: "error",
          title: "Venta Cancelada",
        });
    });
});
