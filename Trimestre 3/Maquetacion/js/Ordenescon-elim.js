document.addEventListener("DOMContentLoaded", () => {
    // Selectores para la tabla y los botones principales de abajo
    const tablaDetalle = document.querySelector(".detalleDeLaOrden table");
    const btnConfirmarOrdenCompleta = document.querySelector(".confirmaOrden");
    const btnRechazarOrdenCompleta = document.querySelector(".rechazaOrden");

    // ==========================================================================
    // 1. Acciones individuales dentro de la Tabla (Aceptar / Cancelar ítem)
    // ==========================================================================
    if (tablaDetalle) {
        tablaDetalle.addEventListener("click", (e) => {
            // Acción: Confirmar un material individual (Botón verde con clase .si)
            const botonSi = e.target.closest(".si");
            if (botonSi) {
                e.preventDefault(); // Frena la navegación automática al HTML
                const fila = botonSi.closest("tr");
                const material = fila.cells[0].textContent;

                Swal.fire({
                    icon: "question",
                    title: "¿Confirmar material?",
                    text: `¿Estás seguro de confirmar el ítem: ${material}?`,
                    showCancelButton: true,
                    confirmButtonColor: "#37ac1d", // Verde Maskot
                    cancelButtonColor: "#6c757d",
                    confirmButtonText: "Sí, confirmar",
                    cancelButtonText: "Cancelar"
                }).then((result) => {
                    if (result.isConfirmed) {
                        Swal.fire({
                            icon: "success",
                            title: "Ítem Confirmado",
                            text: `El material ${material} ha sido validado correctamente.`,
                            confirmButtonColor: "#37ac1d"
                        }).then(() => {
                            // Si deseas que navegue después de la alerta, descomenta la siguiente línea:
                            // window.location.href = botonSi.getAttribute("href");
                        });
                    }
                });
                return;
            }

            // Acción: Cancelar un material individual (Botón rojo con clase .no)
            const botonNo = e.target.closest(".no");
            if (botonNo) {
                e.preventDefault(); // Frena la navegación automática al HTML
                const fila = botonNo.closest("tr");
                const material = fila.cells[0].textContent;

                Swal.fire({
                    icon: "warning",
                    title: "¿Cancelar material?",
                    text: `¿Estás seguro de cancelar el ítem: ${material}?`,
                    showCancelButton: true,
                    confirmButtonColor: "#f44336", // Rojo eliminar
                    cancelButtonColor: "#6c757d",
                    confirmButtonText: "Sí, cancelar",
                    cancelButtonText: "Volver"
                }).then((result) => {
                    if (result.isConfirmed) {
                        Swal.fire({
                            icon: "error",
                            title: "Ítem Cancelado",
                            text: `El material ${material} fue rechazado de la orden.`,
                            confirmButtonColor: "#f44336"
                        }).then(() => {
                            // Si deseas que navegue después de la alerta, descomenta la siguiente línea:
                            // window.location.href = botonNo.getAttribute("href");
                        });
                    }
                });
                return;
            }
        });
    }

    // ==========================================================================
    // 2. Acciones globales de la orden (Botones inferiores de la caja .confirmaRechaza)
    // ==========================================================================
    
    // Botón: Confirmar Orden Completa
    if (btnConfirmarOrdenCompleta) {
        btnConfirmarOrdenCompleta.addEventListener("click", () => {
            Swal.fire({
                icon: "success",
                title: "¡Confirmar Orden Completa!",
                text: "¿Estás seguro de enviar la aprobación total de esta orden de compra?",
                showCancelButton: true,
                confirmButtonColor: "#37ac1d",
                cancelButtonColor: "#6c757d",
                confirmButtonText: "Sí, despachar orden",
                cancelButtonText: "Revisar de nuevo"
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        icon: "success",
                        title: "Orden Despachada",
                        text: "La orden completa ha cambiado a estado: Confirmada.",
                        confirmButtonColor: "#37ac1d"
                    });
                }
            });
        });
    }

    // Botón: Rechazar Orden Completa
    if (btnRechazarOrdenCompleta) {
        btnRechazarOrdenCompleta.addEventListener("click", () => {
            Swal.fire({
                icon: "error",
                title: "¿Rechazar toda la orden?",
                text: "Esta acción marcará toda la solicitud como cancelada definitivamente.",
                showCancelButton: true,
                confirmButtonColor: "#f44336",
                cancelButtonColor: "#6c757d",
                confirmButtonText: "Sí, rechazar todo",
                cancelButtonText: "Cancelar"
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        icon: "info",
                        title: "Orden Rechazada",
                        text: "Se ha notificado al jefe de compras sobre el rechazo de la orden.",
                        confirmButtonColor: "#f44336"
                    });
                }
            });
        });
    }
});
