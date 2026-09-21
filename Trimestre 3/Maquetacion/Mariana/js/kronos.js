document.querySelector(".btn-iniciarSesion")
    .addEventListener("click", function (event) {

        event.preventDefault();

        const usuarioI = document.getElementById("usuarioI").value.trim();
        const contraseña = document.getElementById("contraseña").value.trim();

        if (usuarioI === "" || contraseña === "") {

            Swal.fire({
                icon: "warning",
                title: "Campos vacíos",
                text: "Por favor, complete todos los campos.",
                confirmButtonText: "Aceptar",

                customClass: {
                    popup: "alertaU",
                    title: "tituloU",
                    htmlContainer: "textoU",
                    confirmButton: "botonU",
                    icon: "iconoExclamacion",
                },
                
            });

            return;
        }


        if(usuarioI === "proveedor@kronos.com" &&  contraseña === "123"){
           
        window.location.href = "pagesPaginaProveedor/principalProveedor.html";
           
        }else if(usuarioI === "jefe@kronos.com" && contraseña === "123"){
            window.location.href = "Panel.html";

        }else if(usuarioI === "cliente@kronos.com" && contraseña === "123"){
            window.location.href = "index.html";

        }else {
      Swal.fire({
        icon: "error",
        title: "Credenciales incorrectas",
        text: "Usuario o contraseña invalidos",
        confirmButtonColor: "Ok",
        

          customClass: {
                    popup: "alertaU",
                    title: "tituloU",
                    htmlContainer: "textoU",
                    confirmButton: "botonU",
                  
                },




      });
    }



    });