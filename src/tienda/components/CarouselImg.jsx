import { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../styles/CarouselImg.css";

/**
 * Componente CarouselImg
 * Reutilizado para banners principales y ahora para imágenes de productos.
 * * @param {Array<string>} images - URLs de las imágenes
 * @param {boolean} isProduct - Indica si se usa en una tarjeta de producto (deshabilita auto-slide)
 */
function CarouselImg({ images = [], isProduct = false }) {
    const [index, setIndex] = useState(0);

    // Cambio automático solo si NO es un producto
    useEffect(() => {
        if (isProduct) return;
        
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 8000);

        return () => clearInterval(interval);
    }, [images.length, isProduct]);

    // Estilos dinámicos para la imagen
    const imageStyle = isProduct ? { 
        // Productos: Usamos 'contain' para NO deformar
        objectFit: 'contain' 
    } : {
        // Banner Principal: Usamos 'cover' para que se vea bien en móvil sin deformarse tanto,
        // o 'fill' si prefieres que se estire a la fuerza.
        objectFit: 'fill' 
    };

    return (
        // FIX: Usamos clases en lugar de estilos inline para poder hacer responsive el height
        <div className={`carousel-container ${isProduct ? 'product-mode' : 'banner-mode'}`}>
            <div
                className="carousel-track"
                style={{ 
                    transform: `translateX(-${index * 100}%)`,
                    height: '100%'
                }}
            >
                {images.map((src, i) => (
                    <div className="carousel-slide" key={i}>
                        <img 
                            src={src} 
                            alt={`slide-${i}`}
                            style={imageStyle}
                            onError={(e) => {
                                // Fallback para imágenes
                                if (!e.target.dataset.fallback) {
                                    e.target.dataset.fallback = "true";
                                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23ddd' width='200' height='200'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='14' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ESin imagen%3C/text%3E%3C/svg%3E";
                                }
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Botones izquierda/derecha */}
            {images.length > 1 && (
                <>
                    <button
                        className="carousel-btn left"
                        onClick={() => setIndex((index - 1 + images.length) % images.length)}
                    >
                        <FaChevronLeft />
                    </button>

                    <button
                        className="carousel-btn right"
                        onClick={() => setIndex((index + 1) % images.length)}
                    >
                        <FaChevronRight />
                    </button>
                </>
            )}
            
            {/* Indicadores de posición (opcional, pero útil) */}
            {images.length > 1 && (
                <div className="carousel-indicators">
                    {images.map((_, i) => (
                        <div 
                            key={i} 
                            className={`indicator ${i === index ? 'active' : ''}`}
                            onClick={() => setIndex(i)}
                        ></div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CarouselImg;