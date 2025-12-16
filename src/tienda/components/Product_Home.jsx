import { useEffect, useState } from "react";
import { getProductoById } from "../services/productos";
// --- FIX BACKEND: Importamos el carrusel para soportar múltiples imágenes ---
import { MdOutlineAddShoppingCart } from "react-icons/md";
import CarouselImg from "./CarouselImg";
import "../styles/Productos.css";

/* Función para formatear precios con puntos como separadores de miles  */
function formatearPrecio(precio) {
    const precioRedondeado = Math.round(precio || 0);
    return precioRedondeado.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
} 

/**
* Componente ProductoHome
* Muestra productos para la pagina pricipal con su imagen, descripcion, precio, nombre por ID
*/

function ProductoHome({ id }) {
    // Estado para almacenar los datos del producto
    const [producto, setProducto] = useState(null);
    // Efecto que obtiene el producto por ID cuando cambia el id
    useEffect(() => {
        getProductoById(id)
        .then(setProducto)
        .catch(console.error);
    }, [id]);
    // Muestra mensaje de carga mientras se obtienen los datos
    if (!producto) return <p>Cargando productos...</p>;

    // --- FIX BACKEND: Normalizar las imagenes a un array ---
    let listaImagenes = [];
    if (producto.imagenes && Array.isArray(producto.imagenes) && producto.imagenes.length > 0) {
        listaImagenes = producto.imagenes;
    } else if (producto.imagen && typeof producto.imagen === 'string' && producto.imagen.trim() !== "") {
        listaImagenes = [producto.imagen];
    } else {
        listaImagenes = ["/default-product.png"];
    }
    // -------------------------------------------------------

    return (
        
        <div className="prod-home-container">
            {/* Imagen del producto (O Carrusel si hay varias) */}
            {listaImagenes.length > 1 ? (
                 <div style={{ width: '100%', marginBottom: '15px' }}>
                    <CarouselImg images={listaImagenes} />
                </div>
            ) : (
                <img 
                    src={listaImagenes[0]} 
                    alt={producto.nombre} 
                    className="prod-home-image"
                    onError={(e) => {
                        // Si la imagen falla al cargar, evitar bucle infinito
                        if (!e.target.dataset.fallback) {
                            e.target.dataset.fallback = 
                            "true";
                            // Usar una imagen placeholder SVG
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23ddd' width='200' height='200'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='14' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ESin imagen%3C/text%3E%3C/svg%3E";
                        }
            
                    }}
                />
            )}
            
            {/* Nombre del producto */}
            <h2 className="prod-home-nombre">{producto.nombre}</h2>
            {/* Precio del producto */}
            <p className="prod-home-precio">Precio: ${formatearPrecio(producto.precio)}</p>
            {/* Stock disponible del producto */}
            <p className="prod-home-stock">Stock: {producto.stock}</p>
            {/* Descripción del producto */}
            <p className="prod-home-descripcion">Descripción: {producto.descripcion}</p>
            {/* Botón para agregar el producto al carrito */}
            <button className="prod-home-btn-carrito"><MdOutlineAddShoppingCart size={25}/> Agreggar al carrito</button>
        </div>
    );
}

export default ProductoHome;
