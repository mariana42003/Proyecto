$(document).ready(function(){
    $('#tablaHistorial').DataTable({
        language:{
            search: "Buscar",
            lengthMenu: "Mostrar _MENU_ Registros",
            info: "Mostrar _START_ a _END_ de _TOTAL_ registros",
            infoEmpty: "Mostrando 0 a 0 de 0 registros",
            zeroRecords: "No se encontraron resultados",
            emptyTable: "No hay datos disponibles en la tabla",
            paginate:{
                first: "Primero",
                last: "Ultimo",
                next: "Siguiente",
                previous: "Anterior"
            }
        }
    });
});