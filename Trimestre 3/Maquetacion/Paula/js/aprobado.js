$(document).ready(function() {
    $(document).on('click', '#btnAprobarGarantia', function(e) {
        e.preventDefault(); 
        $('#modalGarantiaAprobada').modal('show'); 
    });
});

$(document).ready(function() {
    // Evento para Aprobar
    $(document).on('click', '#btnAprobarGarantia', function(e) {
        e.preventDefault(); 
        $('#modalGarantiaAprobada').modal('show'); 
    });

    // Evento para Rechazar
    $(document).on('click', '#btnRechazarGarantia', function(e) {
        e.preventDefault(); 
        $('#modalGarantiaRechazada').modal('show'); 
    });
});