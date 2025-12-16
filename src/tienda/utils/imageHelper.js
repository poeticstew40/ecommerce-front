export const getImagenPrincipal = (producto) => {
    if (producto.imagenes && Array.isArray(producto.imagenes) && producto.imagenes.length > 0) {
        return producto.imagenes[0]; 
    }
    
    if (producto.images && Array.isArray(producto.images) && producto.images.length > 0) {
        return producto.images[0];
    }

    if (producto.imagen && typeof producto.imagen === 'string' && producto.imagen.trim() !== "") {
        return producto.imagen;
    }

    return "/default-product.png";
};