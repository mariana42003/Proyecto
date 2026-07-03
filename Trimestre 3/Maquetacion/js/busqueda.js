$(document).ready(function () {
    $('#tablaProductos').DataTable({
        language: {

            search: "Buscar",
            lengthMenu: "Mostrar_MENU_registros",
            info: "Mostrar_START_a_END_de_TOTAL_registros",
            infoEmpty: "mOSTRANDO 0 a 0 de 0 registros " ,
            emptyTable: "No hay datos disponibles en tabla",
            paginate: {
                first: "Primero",
                lasta: " Ultimo",
                next: "Siguiente",
                previous: "Anterior"
            },
        },



    });
});