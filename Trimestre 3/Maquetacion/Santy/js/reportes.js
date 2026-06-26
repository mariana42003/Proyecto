document.addEventListener("DOMContentLoaded", () => {
    const formReporte = document.getElementById("formReporte");
    const cuerpoTabla = document.querySelector("#tablaReportes tbody");

    if (!formReporte || !cuerpoTabla) {
        console.error("Error: No se encontró el formulario #formReporte o la tabla #tablaReportes.");
        return;
    }

    // FUNCIÓN DINÁMICA: Modifica la alerta y la posición del botón según los reportes
    function actualizarInterfazReportes() {
        const alertaAmarilla = document.querySelector(".alert-warning-custom");
        const contenedorBoton = document.querySelector(".zona-boton-reporte");
        const botonMorado = contenedorBoton ? contenedorBoton.querySelector(".btn-reporte") : null;
        const filas = cuerpoTabla.querySelectorAll("tr");

        if (!alertaAmarilla || !contenedorBoton || !botonMorado) return;

        if (filas.length > 0) {
            // 1. Ocultar la alerta amarilla por completo
            alertaAmarilla.style.setProperty("display", "none", "important");
            
            // 2. Mover el botón a la izquierda de forma lineal reemplazando el espacio
            contenedorBoton.style.display = "block";
            contenedorBoton.style.textAlign = "left";
            botonMorado.style.padding = "10px 20px";
            botonMorado.innerHTML = '<i class="fa-solid fa-plus me-2"></i> Generar reporte';
        } else {
            // Si eliminas todos los reportes, todo vuelve a su diseño original
            alertaAmarilla.style.setProperty("display", "block", "important");
            contenedorBoton.style.textAlign = "";
            botonMorado.style.padding = ""; 
            botonMorado.innerHTML = '<i class="fa-solid fa-plus"></i><br>Generar reporte';
        }
    }

    formReporte.addEventListener("submit", (e) => {
        e.preventDefault(); 

        const inputTipo = formReporte.querySelector("input[type='text']");
        const selectCategoria = formReporte.querySelector("select");
        const inputCantidad = formReporte.querySelector("input[type='number']");

        const tipoReporte = inputTipo.value.trim();
        const categoriaTexto = selectCategoria.options[selectCategoria.selectedIndex].text;
        const cantidadValue = inputCantidad.value.trim();

        let siguienteId = 1;
        const filasExistentes = cuerpoTabla.querySelectorAll("tr");
        if (filasExistentes.length > 0) {
            const ids = Array.from(filasExistentes).map(tr => parseInt(tr.cells[0].textContent) || 0);
            siguienteId = Math.max(...ids) + 1;
        }

        const fechaActual = new Date().toLocaleString();

        const nuevaFila = document.createElement("tr");
        nuevaFila.innerHTML = `
            <td>${siguienteId}</td>
            <td>${tipoReporte}</td>
            <td>${categoriaTexto}</td>
            <td>${cantidadValue}</td>
            <td>${fechaActual}</td>
            <td>
                <button type="button" class="btn btn-eliminar btn-sm" style="background-color: #f44336; padding: 6px 10px; border: none; border-radius: 4px; cursor: pointer;">
                    <svg xmlns="http://w3.org" width="16" height="16" fill="white" viewBox="0 0 16 16" style="pointer-events: none;">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
                        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/>
                    </svg>
                </button>
            </td>
        `;

        cuerpoTabla.insertBefore(nuevaFila, cuerpoTabla.firstChild);
        formReporte.reset();

        // Aplicar cambios visuales inmediatamente
        actualizarInterfazReportes();

        const modalPadre = document.getElementById("modalReporte");
        if (modalPadre) {
            const botonCerrar = modalPadre.querySelector(".btn-close");
            if (botonCerrar) botonCerrar.click();
        }
    });

    cuerpoTabla.addEventListener("click", (e) => {
        const botonEliminar = e.target.closest(".btn-eliminar");
        
        if (botonEliminar) {
            const filaSeleccionada = botonEliminar.closest("tr");

            if (typeof Swal !== "undefined") {
                Swal.fire({
                    icon: "warning",
                    title: "¿Eliminar reporte?",
                    text: "Esta acción no se puede deshacer",
                    showCancelButton: true,
                    confirmButtonColor: "#f44336", 
                    cancelButtonColor: "#6c757d",  
                    confirmButtonText: "Sí, eliminar",
                    cancelButtonText: "Cancelar"
                }).then((result) => {
                    if (result.isConfirmed) {
                        filaSeleccionada.remove();
                        actualizarInterfazReportes(); // Evaluar si la tabla quedó vacía

                        Swal.fire({
                            icon: "success",
                            title: "Eliminado",
                            text: "El reporte ha sido borrado con éxito.",
                            confirmButtonColor: "#37ac1d"
                        });
                    }
                });
            } else {
                if (confirm("¿Estás seguro de que deseas eliminar este reporte?")) {
                    filaSeleccionada.remove();
                    actualizarInterfazReportes();
                }
            }
        }
    });

    // Evaluar el estado de la tabla al cargar la página por primera vez
    actualizarInterfazReportes();
});
