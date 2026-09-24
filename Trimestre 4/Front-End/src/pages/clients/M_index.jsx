import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/css/M_index.css';
import logoImg from "../../assets/img/logo.png";
import bannerActualizadoImg from "../../assets/img/Banner-actualizado.png";
import bannerOfertasImg from "../../assets/img/BannerOfertas.png";
import TaladroInalambrico20V from "../../assets/img/TaladroInalambrico20V.jpg";
import Kitherramientas from "../../assets/img/Kit herramientas.jpeg";
import AmoladoraesEsmeril from "../../assets/img/AmoladoraesEsmeril.jpeg";
import SetbrocasImg from "../../assets/img/Setbrocas.jpg";
import KitProteccionImg from "../../assets/img/KitdeProteccion.webp"; 
import cajaGrandeImg from "../../assets/img/Caja de Herramientas Grande.jpg";
import TaladroElectrico from "../../assets/img/Taladro Electrico.webp";
import Login from '../auth/login';
import Registrarse from '../auth/Registrarse';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../api/supabase';
import ModalPerfilCliente from '../../components/ModalPerfilCliente';

const PRODUCTOS_BASE = [
  {
    id: 1,
    nombre: "Taladro inalámbrico 12 V",
    categoria: "Herramienta Eléctrica",
    spec: "1 batería · 1.350 rpm",
    precio: 44600,
    precioAntes: 55900,
    etiqueta: "Oferta",
    estado: "oferta",
    imagen: TaladroInalambrico20V
  },
  {
    id: 2,
    nombre: "Juego de herramientas 85 piezas",
    categoria: "Herramientas",
    spec: "Estuche reforzado Pretul",
    precio: 94600,
    precioAntes: null,
    etiqueta: "Nuevo",
    estado: "nuevo",
    imagen: Kitherramientas
  },
  {
    id: 3,
    nombre: "Amoladoraes Esmeril",
    categoria: "Herramienta Eléctrica",
    spec: "Potencia para obra y taller",
    precio: 128900,
    precioAntes: 149900,
    etiqueta: "Oferta",
    estado: "oferta",
    imagen: AmoladoraesEsmeril 
  },
  {
    id: 4,
    nombre: "Set de brocas multipropósito",
    categoria: "Accesorios",
    spec: "Metal, madera y concreto",
    precio: 32900,
    precioAntes: null,
    etiqueta: "Nuevo",
    estado: "nuevo",
    imagen: SetbrocasImg
  },
  {
    id: 5,
    nombre: "Kit de protección personal",
    categoria: "Seguridad Industrial",
    spec: "Guantes, gafas y casco",
    precio: 67900,
    precioAntes: null,
    etiqueta: "Destacado",
    estado: "destacado",
    imagen: KitProteccionImg
  },
  {
    id: 6,
    nombre: "Tornillería surtida",
    categoria: "Fijaciones",
    spec: "Caja de 500 unidades",
    precio: 28700,
    precioAntes: null,
    etiqueta: "Nuevo",
    estado: "nuevo",
    imagen: cajaGrandeImg
  },
  {
    id: 7,
    nombre: "Llave de impacto inalámbrica brushless Einhell",
    categoria: "Herramienta Electrica",
    spec: "Caja de 500 unidades",
    precio: 30700,
    precioAntes: null,
    etiqueta: "Nuevo",
    estado: "nuevo",
    imagen: TaladroElectrico
  }
];

export default function M_index() {
  const navigate = useNavigate();
  const onNavegarAPedidos = () => navigate("/cliente/pedidos");
  const { usuario, perfil, rol, cerrarSesion } = useAuth();
  const [tema, setTema] = useState(() => localStorage.getItem("kronos-theme") || "dark");
  const [modalLoginAbierto, setModalLoginAbierto] = useState(false);
  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false);
  const [modalPedidosAbierto, setModalPedidosAbierto] = useState(false);
  const [modalPerfilAbierto, setModalPerfilAbierto] = useState(false);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  
  const [filtroActivo, setFiltroActivo] = useState('todos');
  const [carruselIndex, setCarruselIndex] = useState(0);
  const [carrito, setCarrito] = useState([]);
  const [busquedaCatalogo, setBusquedaCatalogo] = useState('');
  const [enviandoCompra, setEnviandoCompra] = useState(false);

  const banners = [bannerActualizadoImg, bannerOfertasImg];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem('kronos-theme', tema);
  }, [tema]);

  // Bloquea el scroll de fondo mientras el carrito (o cualquier otro
  // overlay) está abierto. La clase "modal-activo" ya existía en
  // M_index.css (body.modal-activo { overflow: hidden; }) pero nunca
  // se llegaba a aplicar desde aquí, así que con el carrito abierto la
  // página de atrás seguía haciendo scroll detrás del panel.
  useEffect(() => {
    const hayOverlayAbierto =
      carritoAbierto || modalLoginAbierto || modalRegistroAbierto || modalPedidosAbierto || modalPerfilAbierto;
    document.body.classList.toggle('modal-activo', hayOverlayAbierto);
    return () => document.body.classList.remove('modal-activo');
  }, [carritoAbierto, modalLoginAbierto, modalRegistroAbierto, modalPedidosAbierto, modalPerfilAbierto]);

  // Icono de usuario: si hay sesión de cliente activa, abre "Mi perfil";
  // si no, abre el login (comportamiento anterior).
  const alPulsarIconoUsuario = () => {
    if (usuario) {
      setModalPerfilAbierto(true);
    } else {
      setModalLoginAbierto(true);
    }
  };

  // Botón/enlace "Garantía": antes era un <a href="/garantias">, una
  // ruta que no existe en App.jsx (la real es "/cliente/garantias"),
  // así que el navegador hacía una recarga completa a esa URL, caía en
  // la ruta comodín "*" y terminaba devolviendo al usuario a "/" sin
  // avisar nada. Por eso "no dejaba entrar a garantías directamente".
  // Ahora navega por React Router a la ruta protegida real, pidiendo
  // login primero si hace falta (igual que ya se hace para comprar).
  const irAGarantias = () => {
    setMenuMovilAbierto(false);
    if (!usuario) {
      Swal.fire({
        title: "Inicia sesión para continuar",
        text: "Necesitas una cuenta de cliente para ver tus garantías.",
        icon: "info",
        confirmButtonColor: "#E8600C",
      });
      setModalLoginAbierto(true);
      return;
    }
    if (rol && rol !== "cliente") {
      Swal.fire({
        title: "Cuenta no habilitada",
        text: "Esta cuenta tiene un rol interno (jefe/administrador/proveedor); usa una cuenta de cliente para radicar garantías.",
        icon: "warning",
        confirmButtonColor: "#E8600C",
      });
      return;
    }
    navigate("/cliente/garantias");
  };

  const alCerrarSesion = () => {
    Swal.fire({
      title: "¿Cerrar sesión?",
      text: "¿Estás seguro de que deseas salir de tu cuenta?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E8600C",
      cancelButtonColor: "#6C7278",
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
    }).then(async (resultado) => {
      if (resultado.isConfirmed) {
        try {
          await cerrarSesion();
          setMenuMovilAbierto(false);
        } catch (error) {
          Swal.fire({ title: "No se pudo cerrar sesión", text: error.message, icon: "error", confirmButtonColor: "#E8600C" });
        }
      }
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCarruselIndex((prev) => (prev + 1) % banners.length);
    }, 15000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const agregarAlCarrito = (producto) => {
    setCarrito((prevCarrito) => {
      const existe = prevCarrito.find((item) => item.id === producto.id);
      if (existe) {
        return prevCarrito.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prevCarrito, { ...producto, cantidad: 1 }];
    });
  };

  const cambiarCantidad = (id, delta) => {
    setCarrito((prevCarrito) =>
      prevCarrito
        .map((item) => {
          if (item.id === id) {
            const nuevaCantidad = item.cantidad + delta;
            return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const eliminarDelCarrito = (id) => {
    setCarrito((prevCarrito) => prevCarrito.filter((item) => item.id !== id));
  };

  const totalCantidadItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  const subtotalPrecio = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  const confirmarCompra = async () => {
    if (carrito.length === 0) return;

    if (!usuario) {
      setCarritoAbierto(false);
      Swal.fire({
        title: "Inicia sesión para continuar",
        text: "Necesitas una cuenta para confirmar tu compra.",
        icon: "info",
        confirmButtonColor: "#E8600C",
      });
      setModalLoginAbierto(true);
      return;
    }

    if (rol && rol !== "cliente") {
      Swal.fire({
        title: "Cuenta no habilitada para compras",
        text: "Esta cuenta tiene un rol interno (jefe/administrador/empleado); usa una cuenta de cliente para comprar.",
        icon: "warning",
        confirmButtonColor: "#E8600C",
      });
      return;
    }

    setEnviandoCompra(true);
    try {
      const filas = carrito.map((item) => ({
        codigo: `PED-${Date.now().toString().slice(-6)}-${item.id}`,
        producto_nombre: item.nombre,
        cantidad: item.cantidad,
        cliente_id: usuario.id,
        cliente_nombre: perfil?.nombre ? `${perfil.nombre} ${perfil.apellido || ""}`.trim() : usuario.email,
        precio_unitario: item.precio,
        origen: "cliente",
        estado: "pendiente",
      }));

      const { error } = await supabase.from("ordenes_compra").insert(filas);
      if (error) throw error;

      // La salida de material (descuento de stock + fila en "movimientos")
      // la registra la base de datos con un trigger sobre "ordenes_compra"
      // (ver salida-automatica.sql), porque las políticas RLS no dejan
      // escribir en "productos"/"movimientos" desde la sesión del cliente.
      // El jefe la ve en Panel de Control > Historial de Movimientos.
      setCarrito([]);
      setCarritoAbierto(false);
      Swal.fire({
        title: "¡Compra confirmada!",
        text: "Tu pedido fue registrado. Puedes seguir su estado en \"Mis Pedidos\".",
        icon: "success",
        confirmButtonColor: "#E8600C",
        confirmButtonText: "Ver mis pedidos",
        showCancelButton: true,
        cancelButtonText: "Seguir comprando",
      }).then((resultado) => {
        if (resultado.isConfirmed) navigate("/cliente/pedidos");
      });
    } catch (error) {
      Swal.fire({ title: "No se pudo confirmar la compra", text: error.message, icon: "error", confirmButtonColor: "#E8600C" });
    } finally {
      setEnviandoCompra(false);
    }
  };

  const productosFiltrados = PRODUCTOS_BASE.filter((producto) => {
    const coincideBusqueda = producto.nombre.toLowerCase().includes(busquedaCatalogo.trim().toLowerCase());
    if (!coincideBusqueda) return false;
    if (filtroActivo === 'oferta') return producto.estado === 'oferta';
    if (filtroActivo === 'destacado') return producto.estado === 'destacado';
    return true;
  });

  return (
    <>
      <a className="salto-contenido" href="#contenido-principal">
        Ir al contenido
      </a>

      {/* ENCABEZADO */}
      <header className="site-header">
        <div className="barra-superior">
          <div className="barra-superior__inner">
            <span>
              <IconTruck size={14} /> Envíos a toda Bogotá · Retiro en Usme el mismo día
            </span>
            <span className="barra-superior__tel">
              <IconPhone size={14} /> (601) 745 20 18
            </span>
          </div>
        </div>

        <nav className="nav-principal">
          <div className="nav-principal__inner">
            <a href="/" className="logo" aria-label="Kronos, inicio">
              <img src={logoImg} alt="Kronos" className="logo__imagen" />
            </a>

            <div className="buscador">
              <input
                type="text"
                id="inputBuscar"
                placeholder="Buscar taladros, tornillería, pintura…"
                aria-label="Buscar productos"
                value={busquedaCatalogo}
                onChange={(e) => setBusquedaCatalogo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setFiltroActivo("todos");
                    document.getElementById("contenido-principal")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              />
              <button
                type="button"
                id="btnBuscar"
                aria-label="Buscar"
                onClick={() => {
                  setFiltroActivo("todos");
                  document.getElementById("contenido-principal")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <IconSearch size={18} />
              </button>
            </div>

            <div className="nav-principal__acciones">
              <button
                className="btn-icono"
                type="button"
                title="Cambiar tema"
                onClick={() => setTema(tema === 'dark' ? 'light' : 'dark')}
              >
                {tema === 'dark' ? <IconMoon size={18} /> : <IconSun size={18} />}
              </button>

              <button
                className="btn-icono btn-icono--cuenta"
                type="button"
                onClick={alPulsarIconoUsuario}
                title={usuario ? "Mi perfil" : "Mi cuenta"}
                aria-label={usuario ? "Mi perfil" : "Iniciar sesión"}
              >
                <IconUser size={18} />
                {usuario && (
                  <span className="btn-icono--cuenta__nombre">
                    {perfil?.nombre || usuario.email}
                  </span>
                )}
              </button>

              <button
                className="btn-icono btn-icono--carrito"
                id="btnCarrito"
                type="button"
                title="Carrito"
                onClick={() => setCarritoAbierto(true)}
              >
                <IconCart size={18} />
                <span className="badge-carrito">{totalCantidadItems}</span>
              </button>

              {usuario ? (
                <button
                  className="btn-primario btn-primario--nav"
                  type="button"
                  onClick={alCerrarSesion}
                >
                  Cerrar sesión
                </button>
              ) : (
                <>
                  <button
                    className="btn-primario btn-primario--nav"
                    type="button"
                    onClick={() => setModalLoginAbierto(true)}
                  >
                    Iniciar sesión
                  </button>
                  <button
                    className="btn-primario btn-primario--nav"
                    type="button"
                    onClick={() => setModalRegistroAbierto(true)}
                  >
                    Regístrate
                  </button>
                </>
              )}

              <button
                className="nav-toggle"
                aria-label="Abrir menú"
                onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
              >
                <IconMenu size={20} />
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* MENÚ MÓVIL */}
      <div className={`menu-movil ${menuMovilAbierto ? 'activo' : ''}`}>
        <button
          type="button"
          className="menu-movil__accion"
          onClick={() => { setModalLoginAbierto(true); setMenuMovilAbierto(false); }}
        >
          <IconUserTie size={16} /> Acceso Jefe / Proveedor
        </button>
        <a href="#contenido-principal"><IconTags size={16} /> Categorías</a>
        <button
          type="button"
          className="menu-movil__accion"
          onClick={() => { setModalPedidosAbierto(true); setMenuMovilAbierto(false); }}
        >
          <IconBox size={16} /> Mis pedidos
        </button>
        <button type="button" className="menu-movil__accion" onClick={irAGarantias}>
          <IconShield size={16} /> Garantía
        </button>

        {usuario ? (
          <>
            <button
              type="button"
              className="menu-movil__accion"
              onClick={() => { setModalPerfilAbierto(true); setMenuMovilAbierto(false); }}
            >
              <IconUser size={16} /> Mi perfil
            </button>
            <button
              type="button"
              className="menu-movil__accion"
              onClick={alCerrarSesion}
            >
              <IconUser size={16} /> Cerrar sesión
            </button>
          </>
        ) : (
          <button
            type="button"
            className="menu-movil__accion"
            onClick={() => { setModalLoginAbierto(true); setMenuMovilAbierto(false); }}
          >
            <IconUser size={16} /> Iniciar sesión
          </button>
        )}
      </div>

      <main id="contenido-principal">
        {/* CARRUSEL DE BANNERS */}
        <section className="banner-carrusel" aria-label="Promociones">
          <div className="banner-carrusel__pista">
            {banners.map((img, idx) => (
              <div
                key={idx}
                className={`banner-carrusel__slide ${idx === carruselIndex ? 'activo' : ''}`}
              >
                <div
                  className="banner-carrusel__fondo"
                  style={{ backgroundImage: `url(${img})` }}
                ></div>
                <img
                  src={img}
                  alt={`Promoción Kronos ${idx + 1}`}
                  className="banner-carrusel__img"
                />
              </div>
            ))}
          </div>

          <button
            className="banner-carrusel__flecha banner-carrusel__flecha--prev"
            type="button"
            onClick={() => setCarruselIndex((carruselIndex - 1 + banners.length) % banners.length)}
          >
            <IconChevronLeft size={24} />
          </button>
          <button
            className="banner-carrusel__flecha banner-carrusel__flecha--next"
            type="button"
            onClick={() => setCarruselIndex((carruselIndex + 1) % banners.length)}
          >
            <IconChevronRight size={24} />
          </button>

          <div className="banner-carrusel__puntos">
            {banners.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`punto ${idx === carruselIndex ? 'activo' : ''}`}
                onClick={() => setCarruselIndex(idx)}
              />
            ))}
          </div>
        </section>

        {/* HERO */}
        <section className="hero">
          <div className="hero__contenido">
            <p className="hero__kicker">Ferretería industrial · Bogotá</p>
            <h1 className="hero__titulo">
              Herramienta que aguanta<br />el turno completo.
            </h1>
            <p className="hero__texto">
              Del taller a la obra: taladros, tornillería, pintura y equipo de seguridad, listos para retirar hoy o recibir mañana en tu barrio.
            </p>
            <div className="hero__acciones">
              <a href="#catalogo" className="btn-primario">Ver catálogo</a>
              <button
                className="btn-fantasma"
                type="button"
                onClick={() => setFiltroActivo('oferta')}
              >
                Ofertas de la semana
              </button>
            </div>
            <dl className="hero__cifras">
              <div>
                <dt>2.400+</dt>
                <dd>referencias en bodega</dd>
              </div>
              <div>
                <dt>24 h</dt>
                <dd>entrega en Bogotá</dd>
              </div>
              <div>
                <dt>12 años</dt>
                <dd>surtiendo talleres</dd>
              </div>
            </dl>
          </div>

          <div className="hero__panel">
            <img src={Kitherramientas} alt="Maletín de herramientas Kronos" />
          </div>
        </section>

        {/* LAYOUT TIENDA Y FILTROS */}
        <div className="tienda">
          <aside className="barra-lateral">
            <nav className="menu-lateral" aria-label="Categorías">
              <a href="#catalogo" className="opcion opcion--activa">
                <IconTags size={16} /> Categorías
              </a>
              <button type="button" className={`opcion ${modalPedidosAbierto ? 'opcion--activa' : ''}`}
                 onClick={() => setModalPedidosAbierto(true)}>
                <IconBoxOpen size={16} /> Mis pedidos
              </button>
              <button type="button" className="opcion" onClick={irAGarantias}>
                <IconShield size={16} /> Garantía
              </button>
            </nav>
            <div className="tarjeta-oferta">
              <p className="tarjeta-oferta__eyebrow"><IconBolt size={14} /> Esta semana</p>
              <p className="tarjeta-oferta__titulo">Hasta 30% en herramienta eléctrica</p>
              <a href="#catalogo" onClick={() => setFiltroActivo('oferta')} className="tarjeta-oferta__link">
                Ver ofertas <IconArrowRight size={14} />
              </a>
            </div>

            <div className="bloque-info">
              <h3>Información</h3>
              <a href="#">Política de privacidad</a>
              <a href="#">Términos y condiciones</a>
              <a href="#">Contáctanos</a>
            </div>

            <div className="bloque-redes">
              <h3>Síguenos</h3>
              <div className="redes">
                <a href="#" aria-label="Facebook"><IconFacebook size={16} /></a>
                <a href="#" aria-label="Instagram"><IconInstagram size={16} /></a>
                <a href="#" aria-label="X"><IconTwitter size={16} /></a>
              </div>
            </div>
          </aside>

          <div className="zona-principal">
            <div className="tabs" role="tablist">
              <button
                type="button"
                className={`tab ${filtroActivo === 'todos' ? 'tab--activa' : ''}`}
                onClick={() => setFiltroActivo('todos')}
              >
                Novedades
              </button>
              <button
                type="button"
                className={`tab ${filtroActivo === 'oferta' ? 'tab--activa' : ''}`}
                onClick={() => setFiltroActivo('oferta')}
              >
                Ofertas
              </button>
              <button
                type="button"
                className={`tab ${filtroActivo === 'destacado' ? 'tab--activa' : ''}`}
                onClick={() => setFiltroActivo('destacado')}
              >
                Destacados
              </button>
            </div>

            <div className="encabezado-seccion" id="catalogo">
              <h2>
                {filtroActivo === 'todos' && 'Productos nuevos'}
                {filtroActivo === 'oferta' && 'Productos en oferta'}
                {filtroActivo === 'destacado' && 'Productos destacados'}
              </h2>
              <span className="linea"></span>
            </div>

            <div className="grilla-productos" id="grillaProductos">
              {productosFiltrados.map((prod) => (
                <article key={prod.id} className="tarjeta-producto">
                  <div className="tarjeta-producto__visual">
                    <span className="tarjeta-producto__etiqueta">{prod.etiqueta}</span>
                    <img src={prod.imagen} alt={prod.nombre} />
                  </div>
                  <div className="tarjeta-producto__cuerpo">
                    <span className="tarjeta-producto__categoria">{prod.categoria}</span>
                    <h3 className="tarjeta-producto__nombre">{prod.nombre}</h3>
                    <p className="tarjeta-producto__spec">{prod.spec}</p>
                    <div className="tarjeta-producto__precio-fila">
                      <span className="tarjeta-producto__precio">
                        $ {prod.precio.toLocaleString('es-CO')}
                      </span>
                      {prod.precioAntes && (
                        <span className="tarjeta-producto__precio-antes">
                          $ {prod.precioAntes.toLocaleString('es-CO')}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="tarjeta-producto__btn"
                      onClick={() => agregarAlCarrito(prod)}
                    >
                      🛒 Agregar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        {/* FRANJA DE CONFIANZA */}
        <section className="franja-confianza">
          <div>
            <IconTruck size={24} />
            <div>
              <strong>Entrega en 24 h</strong>
              <span>Pedidos antes de las 3:00 p. m.</span>
            </div>
          </div>
          <div>
            <IconRotateCcw size={24} />
            <div>
              <strong>Cambios en 30 días</strong>
              <span>Con factura y empaque original</span>
            </div>
          </div>
          <div>
            <IconShield size={24} />
            <div>
              <strong>Garantía de fábrica</strong>
              <span>En toda la herramienta eléctrica</span>
            </div>
          </div>
          <div>
            <IconCreditCard size={24} />
            <div>
              <strong>Pago contraentrega</strong>
              <span>Disponible en Bogotá y Soacha</span>
            </div>
          </div>
        </section>
      </main>

      {/* CARRITO LATERAL SLIDE */}
      <div
        className={`fondo-panel ${carritoAbierto ? 'activo' : ''}`}
        onClick={() => setCarritoAbierto(false)}
      ></div>

      <aside className={`carrito-panel ${carritoAbierto ? 'activo' : ''}`}>
        <div className="carrito-panel__header">
          <h2>Tu carrito</h2>
          <button
            className="btn-cerrar"
            type="button"
            onClick={() => setCarritoAbierto(false)}
          >
            <IconX size={20} />
          </button>
        </div>

        <div className="carrito-panel__cuerpo">
          {carrito.length === 0 ? (
            <p className="carrito-vacio">
              Tu carrito está vacío. Explora el catálogo y agrega lo que necesites.
            </p>
          ) : (
            carrito.map((item) => (
              <div key={item.id} className="item-carrito">
                <div className="item-carrito__icono">
                  <img src={item.imagen} alt={item.nombre} />
                </div>
                <div>
                  <div className="item-carrito__nombre">{item.nombre}</div>
                  <div className="item-carrito__precio">
                    $ {item.precio.toLocaleString('es-CO')}
                  </div>
                  <div className="item-carrito__cantidad">
                    <button type="button" onClick={() => cambiarCantidad(item.id, -1)}>-</button>
                    <span>{item.cantidad}</span>
                    <button type="button" onClick={() => cambiarCantidad(item.id, 1)}>+</button>
                  </div>
                </div>
                <button
                  type="button"
                  className="item-carrito__quitar"
                  onClick={() => eliminarDelCarrito(item.id)}
                >
                  <IconTrash size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="carrito-panel__footer">
          <div className="carrito-subtotal">
            <span>Subtotal</span>
            <span>$ {subtotalPrecio.toLocaleString('es-CO')}</span>
          </div>
          <button className="btn-primario btn-primario--full" type="button" onClick={confirmarCompra} disabled={carrito.length === 0 || enviandoCompra}>
            {enviandoCompra ? "Confirmando…" : "Confirmar compra"}
          </button>
        </div>
      </aside>

      {/* OVERLAY FONDO MODAL */}
      {(modalLoginAbierto || modalRegistroAbierto || modalPedidosAbierto || modalPerfilAbierto) && (
        <div
          className="fondo-modal activo"
          onClick={() => {
            setModalLoginAbierto(false);
            setModalRegistroAbierto(false);
            setModalPedidosAbierto(false);
            setModalPerfilAbierto(false);
          }}
        ></div>
      )}

      {/* COMPONENTES DE MODAL INTEGRADOS */}
      <Login
        abierto={modalLoginAbierto}
        alCerrar={() => setModalLoginAbierto(false)}
      />

      <Registrarse
        abierto={modalRegistroAbierto}
        alCerrar={() => setModalRegistroAbierto(false)}
      />

      {/* MODAL MI PERFIL (solo si hay sesión de cliente) */}
      <ModalPerfilCliente
        abierto={modalPerfilAbierto}
        alCerrar={() => setModalPerfilAbierto(false)}
      />

      {/* MODAL MIS PEDIDOS */}
      <div className={`kr-modal modal--pedidos ${modalPedidosAbierto ? 'activo' : ''}`}>
        <div className="modal-pedidos__header">
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: '1.2rem' }}>📦</span>
            <h2 className="text-white m-0 fs-5" style={{ fontFamily: 'var(--fuente-texto)', fontWeight: 600 }}>
              Mis Pedidos Realizados
            </h2>
          </div>
          <button
            className="btn-cerrar-header"
            type="button"
            onClick={() => setModalPedidosAbierto(false)}
          >
            ✕
          </button>
        </div>

        <div className="modal-pedidos__body">
          <div className="card-pedido">
            <div className="card-pedido__header">
              <span className="card-pedido__fecha">
                📋 Entregado el 25 de junio, 2026
              </span>
              <span className="badge-estado badge-completado">Completado</span>
            </div>

            <div className="card-pedido__content">
              <div className="miniaturas-grid">
                <div className="miniatura-wrapper">
                  <img src={AmoladoraesEsmeril} alt="Pulidora" />
                  <span className="badge-cantidad">x1</span>
                </div>
                <div className="miniatura-wrapper">
                  <img src={TaladroInalambrico20V} alt="Taladro" />
                  <span className="badge-cantidad">x2</span>
                </div>
              </div>

              <div className="card-pedido__precios">
                <span className="precio-antes">$627.000</span>
                <span className="precio-total">$539.500</span>
                <span className="cantidad-articulos">3 artículos</span>
              </div>
            </div>

            <div className="card-pedido__footer">
              <button
                type="button"
                className="btn-ver-detalles"
                onClick={() => {
                  setModalPedidosAbierto(false);
                  if (onNavegarAPedidos) onNavegarAPedidos();
                }}
              >
                🛒 Ver Detalles
              </button>
            </div>
          </div>

          <div className="card-pedido">
            <div className="card-pedido__header">
              <span className="card-pedido__fecha">
                📋 Entregado el 12 de mayo, 2026
              </span>
              <span className="badge-estado badge-completado">Completado</span>
            </div>

            <div className="card-pedido__content">
              <div className="miniaturas-grid">
                <div className="miniatura-wrapper">
                  <img src={Kitherramientas} alt="Kit de herramientas" />
                  <span className="badge-cantidad">x1</span>
                </div>
              </div>

              <div className="card-pedido__precios">
                <span className="precio-total">$248.100</span>
                <span className="cantidad-articulos">1 artículo</span>
              </div>
            </div>

            <div className="card-pedido__footer">
              <button
                type="button"
                className="btn-ver-detalles"
                onClick={() => {
                  setModalPedidosAbierto(false);
                  if (onNavegarAPedidos) onNavegarAPedidos();
                }}
              >
                🛒 Ver Detalles
              </button>
            </div>
          </div>
        </div>

        <div className="modal-pedidos__footer">
          <button
            type="button"
            className="btn-cerrar-footer"
            onClick={() => setModalPedidosAbierto(false)}
          >
            Cerrar
          </button>
        </div>
      </div>

      <footer className="site-footer">
        <p>© 2026 Kronos Ferretería. Todos los derechos reservados.</p>
      </footer>
    </>
  );
}

/* COMPONENTES DE ICONOS SVG */
function IconTruck({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}>
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14v10"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>
    </svg>
  );
}

function IconPhone({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}

function IconSearch({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
  );
}

function IconMoon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
    </svg>
  );
}

function IconSun({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
  );
}

function IconUser({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function IconCart({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
    </svg>
  );
}

function IconMenu({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
    </svg>
  );
}

function IconUserTie({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

function IconTags({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H2v7l11.29 11.29a2.83 2.83 0 0 0 4 0l4.71-4.71a2.83 2.83 0 0 0 0-4L9 5Z"/><path d="M6 9h.01"/>
    </svg>
  );
}

function IconBox({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
    </svg>
  );
}

function IconShield({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"/>
    </svg>
  );
}

function IconChevronLeft({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6"/>
    </svg>
  );
}

function IconChevronRight({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}

function IconBolt({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  );
}

function IconArrowRight({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
  );
}

function IconFacebook({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

function IconInstagram({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

function IconTwitter({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
    </svg>
  );
}

function IconRotateCcw({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
    </svg>
  );
}

function IconCreditCard({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>
    </svg>
  );
}

function IconX({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}

function IconTrash({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
    </svg>
  );
}

function IconBoxOpen({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>
    </svg>
  );
}