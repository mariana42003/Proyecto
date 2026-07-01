$(document).ready(function () {
  $(".tablaPersonalizada").DataTable({
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

  $(".tablaPersonalizada").on("click", ".si", function () {
    const fila = $(this).closest("tr");
    const material = fila.find("td:first").text();

    Swal.fire({
      title: "¡Material Aceptado!",
      text: `Has marcado el material "${material}" como disponible.`,
      icon: "success",
      confirmButtonColor: "#8d86c9"
    });
    fila.css("background-color", "rgba(25, 135, 84, 0.1)");
  });

  $(".tablaPersonalizada").on("click", ".no", function () {
    const fila = $(this).closest("tr");
    const material = fila.find("td:first").text();

    Swal.fire({
      title: "¿Rechazar material?",
      text: `Indica que no tienes disponibilidad de "${material}".`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#933c9e",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, rechazar",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Rechazado",
          text: `El material "${material}" ha sido descartado.`,
          icon: "error",
          confirmButtonColor: "#933c9e"
        });
        fila.css("background-color", "rgba(220, 53, 69, 0.1)");
      }
    });
  });

  $(".tablaPersonalizada").on("click", ".btn-eliminar", function () {
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

  $(".confirmaOrden").on("click", function () {
    Swal.fire({
      title: "¿Confirmar Orden #12345?",
      text: "Se notificará al comprador Felipe Diaz que la orden está procesada.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#8d86c9",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, enviar confirmación",
      cancelButtonText: "Revisar de nuevo"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "¡Orden Enviada!",
          text: "La orden ha sido confirmada con éxito.",
          icon: "success",
          confirmButtonColor: "#8d86c9"
        });
      }
    });
  });

  $(".rechazaOrden").on("click", function () {
    Swal.fire({
      title: "¿Cancelar toda la orden?",
      text: "Esta acción rechazará por completo la orden #12345. Escribe el motivo:",
      icon: "error",
      input: "text",
      inputPlaceholder: "Ej. No hay stock de los materiales principales...",
      showCancelButton: true,
      confirmButtonColor: "#933c9e",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, rechazar orden",
      cancelButtonText: "Volver",
      inputValidator: (value) => {
        if (!value) {
          return "¡Debes escribir un motivo para rechazar la orden!";
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Orden Rechazada",
          text: `Se notificó la cancelación por motivo de: "${result.value}"`,
          icon: "info",
          confirmButtonColor: "#933c9e"
        });
      }
    });
  });

  const botonSalir = document.getElementById("btnSalir");
  if (botonSalir) {
    botonSalir.addEventListener("click", function (e) {
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
  }
});
