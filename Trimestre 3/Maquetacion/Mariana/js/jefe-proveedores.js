$(document).ready(function () {
  $("#tablaProveedores").DataTable({
    language: {
      search: "Buscar",
lengthMenu: "Mostrar _MENU_ registros",
      info: "Mostrar _START_ a _END_ de _TOTAL_ registros",
      infoEmpty: "Mostrando 0 a 0 de 0 registros",
      zeroRecords: "No se encontraron resultados",
      emptyTable: "No hay datos disponibles en la tabla",
      paginate: {
        first: "Primero",
        last: "Último",
        next: "Siguiente",
        previous: "Anterior",
      },
    },
  });
});



document.querySelectorAll(".btn-eliminar").forEach(function(boton){
  boton.addEventListener("click", function(){ 
    
    Swal.fire({
      title: "¿Está seguro?",
      text: "El usuario será eliminado",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#8d86c9",
      cancelButtonColor: "#933c9e",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "No, cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: "success",
          title: "Eliminado",
          text: "El usuario fue eliminado correctamente",
          confirmButtonColor: "#c9e6cb",
        });
      }
    });

  });
});

document.getElementById("btnSalir").addEventListener("click", function (e) {
    e.preventDefault();

    Swal.fire({
        title: "¿Cerrar sesión?",
        text: "¿Estás seguro de que deseas salir?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#505dcd",
        cancelButtonColor: "rgb(62, 6, 64)",
        confirmButtonText: "Sí, cerrar sesión",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = "../indexLoginJefe.html";
        }
    });
});
