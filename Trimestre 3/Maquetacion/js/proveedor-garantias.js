function mostrarAlerta(){
   Swal.fire({
    html: `
        <div class="aprobado-alert">

            <img src="/img/logo.png" class="logo-kronos">

            <div class="barra-aprobado">
                <i class="bi bi-megaphone-fill"></i>

                <span>Solicitud de garantía aprobada.</span>

                <i class="bi bi-wrench"></i>
            </div>

            <p class="mensaje-aprobado">
                La solicitud de garantía ha sido aprobada,
                se le notificará al comprador.
            </p>

            <div class="icono-aprobado">
                <i class="bi bi-check-lg"></i>
            </div>

        </div>
    `,
    showConfirmButton: true,
    confirmButtonText: "Volver al inicio",
    buttonsStyling: false,
    customClass:{
        popup:"popup-aprobado",
        confirmButton:"btn-aprobado"
    }
}).then((result) =>{
    if(result.isConfirmed){
        window.location.href = "/pagesPaginaProveedor/garan-aprobada.html"
    }
})
}


function mostrarRechazada(){
    Swal.fire({
    html: `
        <div class="rechazo-alert">

            <img src="/img/logo.png" class="logo-kronos">

            <div class="barra-rechazo">
                <i class="bi bi-bell-fill"></i>

                <span>Solicitud de garantía rechazada.</span>

                <i class="bi bi-wrench"></i>
            </div>

            <p class="mensaje-rechazo">
                La solicitud de garantía ha sido rechazada,
                se le notificará al comprador.
            </p>

            <div class="icono-rechazo">
                <i class="bi bi-x-lg"></i>
            </div>

        </div>
    `,
    showConfirmButton: true,
    confirmButtonText: "Volver al inicio",
    buttonsStyling: false,
    customClass:{
        popup:"popup-rechazo",
        confirmButton:"btn-rechazo"
    }
}).then((result) =>{
    if(result.isConfirmed){
        window.location.href = "/pagesPaginaProveedor/garan-rechazada.html"
    }
})
}