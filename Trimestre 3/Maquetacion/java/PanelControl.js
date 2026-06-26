//---Tabla-datos-Panel---
$(document).ready(function () {

    $('#tablaProductos').DataTable({

        language: {
            url: 'https://cdn.datatables.net/plug-ins/2.3.4/i18n/es-ES.json'
        },
        pageLength: 5,
        lengthChange: false,
        info: false,
        responsive: true,
        ordering: true
    });

});

//---Tabla-datos-Panel---

$(document).ready(function () {
    
    $('#tablaGarantias').DataTable({
        language: {
            url: 'https://cdn.datatables.net/plug-ins/2.3.4/i18n/es-ES.json'
        },
        pageLength: 5,
        lengthChange: false,
        info: false,
        responsive: true,
        ordering: true,
        
        columnDefs: [
            { 
                targets: 0,    
                className: 'dt-left text-start'
            }
        ]
        
    });
});




//---Modal-Reportes---

$('.opcion-formato').on('click', function() {

    $('.opcion-formato').removeClass('opcion-formato-seleccionada');
    $(this).addClass('opcion-formato-seleccionada');
});

$('.btn-exportar').on('click', function() {
    let totalProductosAlerta = $('.table-preview tbody tr').length;
    let formatoSeleccionado = $('.opcion-formato-seleccionada').data('formato').toUpperCase();
    if (totalProductosAlerta > 0) {
     
        Swal.fire({
            title: '¡Reporte generado!',
            text: `El informe de abastecimiento en formato ${formatoSeleccionado} se ha exportado con éxito.`,
            icon: 'success',
            confirmButtonColor: '#7b2cbf',
            confirmButtonText: 'Entendido'
        }).then((result) => {
         
            if (result.isConfirmed) {
                $('#modalGenerarReporte').modal('hide');
            }
        });
    } else {
        
        Swal.fire({
            title: 'No se pudo exportar',
            text: 'No hay productos en alerta para exportar en este momento.',
            icon: 'warning',
            confirmButtonColor: '#a34b73',
            confirmButtonText: 'Regresar'
        });
    }
});

//---Modal-Configurar-Alerta---

function validarLimite() {
    let valor = $('#inputNuevoLimite').val();

    let regexEnteroPositivo = /^[1-9]\d*$/;

    if (!regexEnteroPositivo.test(valor)) {
        
        $('#inputNuevoLimite').addClass('is-invalid-custom');
        $('#errorLimite').fadeIn(150); 
        return false;
    } else {
       
        $('#inputNuevoLimite').removeClass('is-invalid-custom');
        $('#errorLimite').fadeOut(150);
        return true;
    }
}


$('#inputNuevoLimite').on('input', function() {
    validarLimite();
});


$('#modalConfigurarAlerta').on('shown.bs.modal', function () {
    validarLimite();
});


$('.btn-guardar-umbrales').on('click', function() {
    if (validarLimite()) {
        Swal.fire({
            title: '¡Cambios guardados!',
            text: 'El nuevo límite mínimo ha sido configurado correctamente.',
            icon: 'success',
            confirmButtonColor: '#7d7dd8'
        });
        $('#modalConfigurarAlerta').modal('hide');
    }
});



$('#btnModificarUmbralFicha').on('click', function() { 
    $('#modalDetalleProducto').modal('hide');
    $('#modalDetalleProducto').one('hidden.bs.modal', function () { 
        $('#modalConfigurarAlerta').modal('show');
    });
});

//---HISTORIAL-MOVIMIENTOS---

$('.btn-aplicar-filtros-historial').on('click', function() {
    let filtroSeleccionado = $('#selectTipoMovimiento').val();
    $('.table-historial-content tbody tr').each(function() {
        let tipoFila = $(this).data('tipo');
        if (filtroSeleccionado === 'todos') {
            $(this).fadeIn(200);
        } else if (tipoFila === filtroSeleccionado) {
            $(this).fadeIn(200);
        } else {
            $(this).fadeOut(200);
        }
    });
});

//---Modal-Detalle-Garantías---

$(document).on('click', '.btn-ver-solicitud', function(e) {
    e.preventDefault();

    let fila = $(this).closest('tr');

    let nOrden  = fila.find('td:nth-child(1)').text().trim();
    let cliente = fila.find('td:nth-child(2)').text().trim();
    let producto = fila.find('td:nth-child(3)').text().trim();
    let fecha   = fila.find('td:nth-child(4)').text().trim();
    $('#modalDetalleSolicitud .seccion-info-cliente p:nth-child(1) strong').nextSibling === null 
        ? $('#modalDetalleSolicitud .seccion-info-cliente p:nth-child(1)').html(`<strong>Cliente:</strong> ${cliente}`)
        : null;   
    $('#modalDetalleSolicitud .seccion-info-cliente p:nth-child(2)').html(`<strong>Pedido:</strong> #${nOrden}`);
    $('#modalDetalleSolicitud .seccion-info-cliente p:nth-child(3)').text(`Realizado el: ${fecha}`);  
    $('#modalDetalleSolicitud .nombre-producto-solicitud').text(producto);
    $('#modalDetalleSolicitud .contenedor-resumen-pedido h6').text(producto);
    $('#modalDetalleSolicitud').modal('show');
});