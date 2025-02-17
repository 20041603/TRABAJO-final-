// Simulador Tienda Havanna
// Javascript | Coderhouse | PROYECTO FINAL |

// Este es el proyecto final del curso: recrear la tienda "Havanna" online.
// Intencionalmente aplico los conceptos que aprendimos hasta ahora en las clases...
// (Condicionales; ciclos; funciones; objetos; arrays; high-order functions;
// DOM; Eventos; localStorage; JSON; Sugar Syntax; Librerías; Asincronía; AJAX)
// ergo es probable que hayan formas más óptimas de escalar el código a futuro.


// #region GLOBALES ---------------------------------------------------------------------
let productos = [];

let indicesSeleccionados = [];  //  Array con el que compruebo los productos que ya estén
                                //  en el carrito.

let carrito = [];   //  Array auxiliar para manipular el DOM correctamente.

//IMPUESTOS
//Valores expresados en % (al usarse se opera convirtiendo a su expresión decimal)
const IVA = 21;

// #region CARGA INICIAL ----------------------------------------------------------------
function cargarListadoProductos(productos)
{
    const LISTADO_PRODUCTOS = document.getElementById("listadoProductos");
    LISTADO_PRODUCTOS.textContent = ""; //  Limpio el mensaje de error para cargar los
                                        //  productos (estoy asumiendo que siempre voy a
                                        //  tener productos disponibles para mostrar...)

    productos.forEach(producto => {
        const LI = document.createElement("li");

        const IMG = document.createElement("img");
        IMG.setAttribute("src", producto.img.default);

        const DIV_NOMBRE = document.createElement("div");
        DIV_NOMBRE.textContent = producto.nombre;
        
        const DIV_PRECIO = document.createElement("div");
        DIV_PRECIO.textContent = `$ ${producto.precio}`;

        const AGREGAR_AL_CARRITO = document.createElement("input");
        AGREGAR_AL_CARRITO.setAttribute("type", "button");
        AGREGAR_AL_CARRITO.setAttribute("value", "Agregar al carrito");

        AGREGAR_AL_CARRITO.addEventListener("click", () => agregarCarrito(producto.id));
        
        LI.appendChild(IMG);
        LI.appendChild(DIV_NOMBRE);
        LI.appendChild(DIV_PRECIO);
        LI.appendChild(AGREGAR_AL_CARRITO);
        LISTADO_PRODUCTOS.appendChild(LI);
    });
};

function cargarCarrito()
{
    const BACKUP_CARRITO = JSON.parse(localStorage.getItem("carrito"));
    
    if (BACKUP_CARRITO !== null)
    {   
        carrito = BACKUP_CARRITO;

        const CARRITO_PRODUCTOS = document.getElementById("carritoProductos");
        CARRITO_PRODUCTOS.textContent = "";
        CARRITO_PRODUCTOS.classList.toggle("carritoVacio");

        carrito.forEach((producto) => {
            indicesSeleccionados.push(producto.id);

            const LI = document.createElement("li");
            LI.id = `carritoProducto${producto.id}`;

            const IMG = document.createElement("img");
            IMG.setAttribute("src", producto.img.thumbnail);
            LI.appendChild(IMG);
            
            const DIV_NOMBRE = document.createElement("div");
            DIV_NOMBRE.textContent = producto.nombre;
            LI.appendChild(DIV_NOMBRE);
            
            const DIV_CANTIDAD_LABEL = document.createElement("div");
            DIV_CANTIDAD_LABEL.textContent = "Cantidad: ";
            LI.appendChild(DIV_CANTIDAD_LABEL);
            
            const DIV_CANTIDAD_CONTAINER = document.createElement("div");

            const BUTTON_REDUCIR = document.createElement("input");
            BUTTON_REDUCIR.setAttribute("type", "button");
            BUTTON_REDUCIR.setAttribute("value","➖");
            BUTTON_REDUCIR.addEventListener("click", () => {
                let cantidad = parseInt(DIV_CANTIDAD.textContent);
                
                if (cantidad > 1)
                {
                    DIV_CANTIDAD.textContent = cantidad - 1;
                    carrito[carrito.findIndex((e) => e.id === producto.id)].cantidad--;
                    calcularTotal();
                    localStorage.setItem("carrito", JSON.stringify(carrito));
                };
            });
            DIV_CANTIDAD_CONTAINER.appendChild(BUTTON_REDUCIR);
            
            const DIV_CANTIDAD = document.createElement("div");
            DIV_CANTIDAD.textContent = carrito[indicesSeleccionados.indexOf(producto.id)].cantidad;
            DIV_CANTIDAD_CONTAINER.appendChild(DIV_CANTIDAD);

            const BUTTON_AUMENTAR = document.createElement("input");
            BUTTON_AUMENTAR.setAttribute("type", "button");
            BUTTON_AUMENTAR.setAttribute("value","➕");
            BUTTON_AUMENTAR.addEventListener("click", () => {
                let cantidad = parseInt(DIV_CANTIDAD.textContent);
                DIV_CANTIDAD.textContent = cantidad + 1;
                carrito[carrito.findIndex((e) => e.id === producto.id)].cantidad++;
                calcularTotal();
                localStorage.setItem("carrito", JSON.stringify(carrito));
            });
            DIV_CANTIDAD_CONTAINER.appendChild(BUTTON_AUMENTAR);

            LI.appendChild(DIV_CANTIDAD_CONTAINER);
    
            const BUTTON_ELIMINAR = document.createElement("input");
            BUTTON_ELIMINAR.setAttribute("type", "button");
            BUTTON_ELIMINAR.setAttribute("value", "❎");
    
            BUTTON_ELIMINAR.addEventListener("click", () => eliminarCarrito(producto.id));
    
            LI.appendChild(BUTTON_ELIMINAR);
    
            CARRITO_PRODUCTOS.appendChild(LI);
        });

        calcularTotal();
    };
};

async function cargarProductos()
{
    const RESPONSE = await fetch("./data/productos.json");  //  Agarro JSON de productos.
    const DATA = await RESPONSE.json();                     //  Convierto en array de objetos,

    productos = DATA;                                       //  y lo cargo globalmente.
    
    cargarListadoProductos(productos);                      //  Una vez terminado, ejecuto
    cargarCarrito();                                        //  las demás cargas iniciales.
};


// #region CARRITO ----------------------------------------------------------------------
function agregarCarrito(producto_id)
{   
    const CARRITO_PRODUCTOS = document.getElementById("carritoProductos");

    if (carrito.length === 0)
    {
        CARRITO_PRODUCTOS.textContent = "";
        CARRITO_PRODUCTOS.classList.toggle("carritoVacio");
    };

    if (indicesSeleccionados.includes(producto_id))
    {  
        carrito[carrito.findIndex((e) => e.id === producto_id)].cantidad += 1;

        const LI_PRODUCTO = document.getElementById(`carritoProducto${producto_id}`);
       
        let cantidadProducto = parseInt(LI_PRODUCTO.children[3].children[1].textContent);
        LI_PRODUCTO.children[3].children[1].textContent = cantidadProducto + 1;
    }
    else
    {
        indicesSeleccionados.push(producto_id);

        carrito.push(
            {
                //  Hago una copia del producto traido del JSON, y agrego la propiedad "cantidad"
                ...productos[productos.findIndex((e) => e.id === producto_id)],
                cantidad: 1
            }
        );

        const LI = document.createElement("li");
        LI.id = `carritoProducto${producto_id}`;

        const IMG = document.createElement("img");
        IMG.setAttribute("src", carrito[carrito.length - 1].img.thumbnail);
        LI.appendChild(IMG);
        
        const DIV_NOMBRE = document.createElement("div");
        DIV_NOMBRE.textContent = carrito[carrito.length - 1].nombre;
        LI.appendChild(DIV_NOMBRE);
        
        const DIV_CANTIDAD_LABEL = document.createElement("div");
        DIV_CANTIDAD_LABEL.textContent = "Cantidad: ";
        LI.appendChild(DIV_CANTIDAD_LABEL);

        const DIV_CANTIDAD_CONTAINER = document.createElement("div");

        const BUTTON_REDUCIR = document.createElement("input");
        BUTTON_REDUCIR.setAttribute("type", "button");
        BUTTON_REDUCIR.setAttribute("value","➖");
        BUTTON_REDUCIR.addEventListener("click", () => {
            let cantidad = parseInt(DIV_CANTIDAD.textContent);

            //  Parece tentador guardar el resultado del findIndex() en una constante,
            //  pero dado que el carrito es dinámico, el índice del elemento puede
            //  cambiar. Para evitar búsquedas constantes, necesitaría asegurarme de
            //  que la longitud del carrito siempre sea igual a la de los productos, lo
            //  cual parece más costoso que simplemente realizar la búsqueda en un array
            //  probablemente mucho más pequeño en la gran mayoría de casos.

            if (cantidad > 1)
            {
                DIV_CANTIDAD.textContent = cantidad - 1;
                carrito[productos.findIndex((e) => e.id === producto_id)].cantidad--;
                calcularTotal();
                localStorage.setItem("carrito", JSON.stringify(carrito));
            };
        });
        DIV_CANTIDAD_CONTAINER.appendChild(BUTTON_REDUCIR);
        
        const DIV_CANTIDAD = document.createElement("div");
        DIV_CANTIDAD.textContent = 1;
        DIV_CANTIDAD_CONTAINER.appendChild(DIV_CANTIDAD);

        const BUTTON_AUMENTAR = document.createElement("input");
        BUTTON_AUMENTAR.setAttribute("type", "button");
        BUTTON_AUMENTAR.setAttribute("value","➕");
        BUTTON_AUMENTAR.addEventListener("click", () => {
            let cantidad = parseInt(DIV_CANTIDAD.textContent);

    

            DIV_CANTIDAD.textContent = cantidad + 1;
            carrito[productos.findIndex((e) => e.id === producto_id)].cantidad++;
            calcularTotal();
            localStorage.setItem("carrito", JSON.stringify(carrito));
        });
        DIV_CANTIDAD_CONTAINER.appendChild(BUTTON_AUMENTAR);

        LI.appendChild(DIV_CANTIDAD_CONTAINER);

        const BUTTON_ELIMINAR = document.createElement("input");
        BUTTON_ELIMINAR.setAttribute("type", "button");
        BUTTON_ELIMINAR.setAttribute("value","❎");

        BUTTON_ELIMINAR.addEventListener("click", () => eliminarCarrito(producto_id));

        LI.appendChild(BUTTON_ELIMINAR);

        CARRITO_PRODUCTOS.appendChild(LI);
    }

    calcularTotal();
    localStorage.setItem("carrito", JSON.stringify(carrito));

    const Toast = Swal.mixin({
        toast: true,
        position: "bottom-start",
        showConfirmButton: false,
        showCloseButton: true,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
    });
    
    Toast.fire({
        icon: "success",
        title: "¡Producto agregado al carrito!"
    });
};

function eliminarCarrito(producto_id)
{
    const ELEMENTO = document.getElementById(`carritoProducto${producto_id}`);

    ELEMENTO.remove();

    indicesSeleccionados.splice(indicesSeleccionados.indexOf(producto_id), 1);

    const INDICE_CARRITO = carrito.findIndex((elemento_actual) => elemento_actual.id === producto_id);
    carrito.splice(INDICE_CARRITO, 1);

    if (carrito.length === 0)
    {
        const CARRITO_PRODUCTOS = document.getElementById("carritoProductos");
        CARRITO_PRODUCTOS.textContent = "¡Carrito vacío! Selecciona algún producto para comprar 😁";
        CARRITO_PRODUCTOS.classList.toggle("carritoVacio");
        localStorage.removeItem("carrito");
    }
    else
    {
        localStorage.setItem("carrito", JSON.stringify(carrito));
    };

    calcularTotal();

    const Toast = Swal.mixin({
        toast: true,
        position: "bottom-start",
        showConfirmButton: false,
        showCloseButton: true,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
    });
    
    Toast.fire({
        icon: "success",
        title: "¡Producto eliminado del carrito!"
    });
};

function calcularTotal()
{
    const TOTAL = document.getElementById("totalCarrito");
    
    if (carrito.length === 0)
    {
        TOTAL.textContent = "0.00";
        return;
    };

    let precio_total = 0.0;
    
    carrito.forEach((producto) => {
        let subtotal = 0.0;
       
        let descuento = ((100 - producto.descuento) / 100);

        subtotal = producto.precio * descuento;
        
        subtotal *= producto.cantidad;   //NOTA: NO contemplo casos del tipo "2da unidad al 50%" en este algoritmo.

        precio_total += subtotal;
    });

    precio_total *= 1 + (IVA / 100);   //Agrego impuestos (IVA).

    TOTAL.textContent = precio_total;
};

// #region COMPRA -----------------------------------------------------------------------
function iniciarCompra()
{
    const TOTAL = document.getElementById("totalCarrito");

    Swal.fire({
        title: '¿Continuar con la compra?',
        text: `El costo total es de $${parseFloat(TOTAL.textContent)}`,
        icon: 'question',
        showDenyButton: 'true',
        denyButtonText: 'No, continuar comprando',
        confirmButtonText: 'Si, terminar compra'
    }).then((respuesta) => {
        if (respuesta.isConfirmed)
        {
            window.location.href += "checkout.html";

            // const Toast = Swal.mixin({
            //     toast: true,
            //     position: "bottom-start",
            //     showConfirmButton: false,
            //     showCloseButton: true,
            //     timer: 3000,
            //     timerProgressBar: true,
            //     didOpen: (toast) => {
            //       toast.onmouseenter = Swal.stopTimer;
            //       toast.onmouseleave = Swal.resumeTimer;
            //     }
            // });
            
            // Toast.fire({
            //     icon: "success",
            //     title: "¡Compra realizada con éxito!"
            // });

            // vaciarCarrito();
            // vaciarListadoProductos();
            // cargarListadoProductos(productos);
        };
    });
};

function vaciarCarrito()
{
    const CARRITO_PRODUCTOS = document.getElementById("carritoProductos");

    for (elemento of CARRITO_PRODUCTOS.children)
    {
        elemento.remove();  //  Elimino todos los productos del carrito.
    };

    CARRITO_PRODUCTOS.textContent = "¡Carrito vacío! Selecciona algún producto para comprar 😁";
    CARRITO_PRODUCTOS.classList.toggle("carritoVacio");
    
    //  Vacío tanto el localStorage como los array indicesSeleccionados y carrito.
    localStorage.removeItem("carrito");
    indicesSeleccionados = [];
    carrito = [];

    //  Reinicio el valor de TOTAL en el carrito.
    const TOTAL = document.getElementById("totalCarrito");
    TOTAL.textContent = "0.00";
};

function confirmarVaciarCarrito()
{
    Swal.fire({
        title: '¿Vaciar carrito?',
        icon: 'question',
        showDenyButton: 'true',                             //  Invertí los textos para
        denyButtonText: 'Si, vaciar carrito',               //  aprovechar UX del alert
        confirmButtonText: 'No, continuar comprando'        //  (botón rojo en "deny" sin
    }).then((respuesta) => {                                //  agregar CSS específico)
        if (respuesta.isDenied)
        {
            if (carrito.length === 0)
                return;
            
            vaciarCarrito();
    
            const Toast = Swal.mixin({
                toast: true,
                position: "bottom-start",
                showConfirmButton: false,
                showCloseButton: true,
                timer: 3000,
                timerProgressBar: true,
                didOpen: (toast) => {
                  toast.onmouseenter = Swal.stopTimer;
                  toast.onmouseleave = Swal.resumeTimer;
                }
            });
            
            Toast.fire({
                icon: "success",
                title: "¡Carrito vaciado!"
            });
        };
    });
}

// #region BUSCADOR ---------------------------------------------------------------------

function chequearBuscador(nombre_producto)
{
    //  Uso "aux" para hacer más legible la línea de código donde cargo RESULTADO con los resultados
    //  de la búsqueda... filter realiza una BÚSQUEDA LINEAL, por lo que no escala bien, pero para
    //  este proyecto es correcto dada la poca cantidad de productos que uso.

    //  Uso toUpperCase() para no hacer la búsqueda case-sensitive; uso trim() para ignorar el padding.

    let aux = nombre_producto.toUpperCase().trim();

    const RESULTADO = productos.filter(producto => producto.nombre.toUpperCase().includes(aux));

    if(RESULTADO.length === 0)
    {
        const Toast = Swal.mixin({
            toast: true,
            position: "bottom-start",
            showConfirmButton: false,
            showCloseButton: true,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.onmouseenter = Swal.stopTimer;
              toast.onmouseleave = Swal.resumeTimer;
            }
        });
        
        Toast.fire({
            icon: "error",
            title: "No tenemos un producto con ese nombre... 😢"
        });

        return;
    };

    vaciarListadoProductos();

    cargarListadoProductos(RESULTADO);
};

function vaciarListadoProductos()
{
    const LISTADO_PRODUCTOS = document.getElementById("listadoProductos");

    while (LISTADO_PRODUCTOS.firstChild)
    {
        LISTADO_PRODUCTOS.removeChild(LISTADO_PRODUCTOS.firstChild);
    };
};

// #region SimuladorHavanna -------------------------------------------------------------

function simuladorHavannaGUI()
{
    cargarProductos();

    const VACIAR_BUTTON = document.getElementById("vaciarCarrito");

    VACIAR_BUTTON.addEventListener("click", () => confirmarVaciarCarrito());

    const COMPRAR_BUTTON = document.getElementById("comprarCarrito");

    COMPRAR_BUTTON.addEventListener("click", () => (carrito.length === 0) || iniciarCompra());

    const BUSCADOR_INPUT = document.getElementById('buscadorInput');

    BUSCADOR_INPUT.focus();
    
    BUSCADOR_INPUT.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" || BUSCADOR_INPUT.value.trim() === "")
            return;
        
        e.preventDefault();
        chequearBuscador(BUSCADOR_INPUT.value);
    });
    
    const BUSCADOR_BUTTON = document.getElementById('buscadorButton');

    BUSCADOR_BUTTON.addEventListener("click", () => chequearBuscador(BUSCADOR_INPUT.value));

    const BACK_TO_TOP = document.getElementById("headerBackToTop");
    BACK_TO_TOP.addEventListener("click", () => window.scrollTo({top: 0}));

    const GO_TO_CARRITO = document.getElementById("headerGoToCarrito");
    const CARRITO_CONTAINER = document.getElementById("carritoProductos");
    GO_TO_CARRITO.addEventListener("click", () => CARRITO_CONTAINER.scrollIntoView());
};

simuladorHavannaGUI();