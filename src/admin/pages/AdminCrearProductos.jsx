import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../tienda/contexts/AuthContext";
import { createProducto } from "../../tienda/services/productos";
import { getCategoriasByTienda } from "../../tienda/services/categorias";
import { useNotifications } from "../../contexts/NotificationContext";
import "../styles/AdminProductos.css";

/**
 * Página de creación de productos
 * * Permite crear productos para la tienda del vendedor autenticado
 */
function AdminCrearProductos() {
    const { usuario, tiendaUsuario, loading: authLoading, isAuthenticated } = useAuth();
    const { nombreTienda } = useParams();
    const navigate = useNavigate();
    const { success: showSuccess, error: showError } = useNotifications();
    const [loading, setLoading] = useState(false);
    const [cargandoCategorias, setCargandoCategorias] = useState(true);
    const [categorias, setCategorias] = useState([]);
    
    // Estados del formulario
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [precio, setPrecio] = useState("");
    const [stock, setStock] = useState("");
    const [categoriaId, setCategoriaId] = useState("");
    
    // Modificado para soportar múltiples imágenes
    const [imagenes, setImagenes] = useState([]);
    const [imagenesPreview, setImagenesPreview] = useState([]);
    
    // Redirigir si no está autenticado o si aún está cargando
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate("/login");
        }
    }, [authLoading, isAuthenticated, navigate]);

    // Cargar categorías de la tienda
    useEffect(() => {
        const cargarCategorias = async () => {
            if (!tiendaUsuario?.nombreUrl) {
                setCargandoCategorias(false);
                return;
            }

            try {
                setCargandoCategorias(true);
                const categoriasData = await getCategoriasByTienda(tiendaUsuario.nombreUrl);
                setCategorias(categoriasData);
                
                // Si no hay categoría seleccionada, buscar "otros" y seleccionarla por defecto
                if (!categoriaId) {
                    const otros = categoriasData.find(cat => cat.nombre.toLowerCase() === "otros");
                    if (otros) {
                        setCategoriaId(otros.id.toString());
                    }
                }
            } catch (error) {
                console.error("Error cargando categorías:", error);
                showError("Error", "No se pudieron cargar las categorías. Asegúrate de tener categorías creadas en tu tienda.");
            } finally {
                setCargandoCategorias(false);
            }
        };

        if (tiendaUsuario?.nombreUrl) {
            cargarCategorias();
        }
    }, [tiendaUsuario, showError]);

    const handleImagenesChange = (e) => {
        const files = Array.from(e.target.files);
        
        if (files.length > 0) {
            const validFiles = [];

            // Validar cada archivo
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                
                // Validar tipo de archivo
                if (!file.type.startsWith("image/")) {
                    showError("Error", `El archivo ${file.name} no es una imagen`);
                    continue;
                }
                
                // Validar tamaño (máximo 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    showError("Error", `La imagen ${file.name} supera los 5MB`);
                    continue;
                }

                validFiles.push(file);
                
                // Crear preview
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagenesPreview(prev => [...prev, reader.result]);
                };
                reader.readAsDataURL(file);
            }

            setImagenes(prev => [...prev, ...validFiles]);
        }
    };

    // Función para remover una imagen seleccionada antes de subir
    const removeImagen = (index) => {
        setImagenes(prev => prev.filter((_, i) => i !== index));
        setImagenesPreview(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validaciones
        if (!nombre.trim()) {
            showError("Error", "El nombre del producto es obligatorio");
            setLoading(false);
            return;
        }

        if (nombre.trim().length < 3 || nombre.trim().length > 100) {
            showError("Error", "El nombre debe tener entre 3 y 100 caracteres");
            setLoading(false);
            return;
        }

        const precioNum = parseInt(precio);
        if (!precio || isNaN(precioNum) || precioNum < 1) {
            showError("Error", "El precio debe ser un número entero mayor o igual a 1");
            setLoading(false);
            return;
        }

        const stockNum = parseInt(stock);
        if (stock === "" || isNaN(stockNum) || stockNum < 1) {
            showError("Error", "El stock debe ser un número mayor o igual a 1");
            setLoading(false);
            return;
        }

        // Validar que al menos una imagen sea obligatoria
        if (imagenes.length === 0) {
            showError("Error", "La imagen del producto es obligatoria");
            setLoading(false);
            return;
        }

        if (descripcion && descripcion.length > 500) {
            showError("Error", "La descripción no puede superar los 500 caracteres");
            setLoading(false);
            return;
        }

        if (!tiendaUsuario?.nombreUrl) {
            showError("Error", "No se pudo obtener la información de la tienda. Por favor, recarga la página.");
            setLoading(false);
            return;
        }

        try {
            // Si no hay categoría seleccionada, buscar "otros"
            let categoriaIdFinal = categoriaId;
            if (!categoriaIdFinal) {
                const otros = categorias.find(cat => cat.nombre.toLowerCase() === "otros");
                if (otros) {
                    categoriaIdFinal = otros.id.toString();
                } else {
                    showError("Error", "No se encontró la categoría 'Otros'. Por favor, crea categorías en la sección de categorías.");
                    setLoading(false);
                    return;
                }
            }

            // Crear FormData para multipart/form-data
            const formData = new FormData();
            // Crear objeto JSON con los datos del producto
            const productoData = {
                categoriaId: parseInt(categoriaIdFinal),
                nombre: nombre.trim(),
                descripcion: descripcion.trim() || null,
                precio: precioNum,
                stock: stockNum
            };
            // Agregar el JSON como string en el campo "producto"
            formData.append("producto", JSON.stringify(productoData));
            
            // Agregar los archivos de imagen a la lista "files" que espera el backend
            imagenes.forEach((file) => {
                formData.append("files", file);
            });

            const productoCreado = await createProducto(tiendaUsuario.nombreUrl, formData);
            
            // Limpiar formulario
            setNombre("");
            setDescripcion("");
            setPrecio("");
            setStock("");
            setCategoriaId("");
            setImagenes([]);
            setImagenesPreview([]);
            
            // Limpiar el input de archivo
            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput) {
                fileInput.value = '';
            }

            showSuccess("Producto Creado", `El producto "${productoCreado.nombre}" ha sido creado exitosamente`);
        } catch (error) {
            console.error("Error al crear producto:", error);
            // Mensajes de error más específicos
            let mensajeError = "Error al crear el producto. Intenta nuevamente.";
            if (error.response?.status === 400) {
                mensajeError = error.response?.data?.message || "Los datos enviados no son válidos. Verifica todos los campos.";
            } else if (error.response?.status === 404) {
                mensajeError = "La tienda o categoría no fue encontrada. Verifica que la categoría pertenezca a tu tienda.";
            } else if (error.response?.status === 403) {
                mensajeError = "No tienes permisos para crear productos en esta tienda.";
            } else if (error.response?.data?.message) {
                mensajeError = error.response.data.message;
            } else if (error.message) {
                mensajeError = error.message;
            }
            
            showError("Error al crear producto", mensajeError);
        } finally {
            setLoading(false);
        }
    };

    // Mostrar carga mientras se obtiene el usuario
    if (authLoading) {
        return (
            <div className="productos-loading">
                <div className="productos-loading-content">
                    <div className="productos-loading-title">
                        Cargando...
                    </div>
                    <div className="productos-loading-text">
                        Obteniendo información del usuario
                    </div>
                </div>
            </div>
        );
    }

    // Si no hay usuario después de cargar, mostrar error
    if (!usuario || !usuario.dni) {
        return (
            <div className="productos-error">
                <h2 className="productos-error-title">
                    Error
                </h2>
                <div className="productos-error-container">
                    <div className="productos-error-alert">
                        <strong>No se pudo obtener la información del usuario.</strong>
                        <br />
                        <small className="productos-error-text">
                            Por favor, inicia sesión nuevamente.
                        </small>
                    </div>
                    <div className="productos-error-actions">
                        <button
                            onClick={() => {
                                localStorage.clear();
                                navigate("/login");
                            }}
                            className="productos-error-btn productos-error-btn-primary"
                        >
                            Ir a Iniciar Sesión
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Si no hay tienda, mostrar mensaje
    if (!tiendaUsuario) {
        return (
            <div className="productos-error">
                <h2 className="productos-error-title">
                    Tienda no encontrada
                </h2>
                <div className="productos-error-container">
                    <div className="productos-error-alert">
                        <strong>No tienes una tienda asociada.</strong>
                        <br />
                        <small className="productos-error-text">
                            Debes crear una tienda antes de poder agregar productos.
                        </small>
                    </div>
                    <div className="productos-error-actions">
                        <button
                            onClick={() => {
                                const tiendaActual = nombreTienda || "tienda";
                                navigate(`/admin/${tiendaActual}/configuracion`);
                            }}
                            className="productos-error-btn productos-error-btn-primary"
                        >
                            Crear Mi Tienda
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="productos-container">
            <h2 className="productos-title">
                Crear Nuevo Producto
            </h2>

            {cargandoCategorias ? (
                <div className="productos-loading-categorias">
                    Cargando categorías...
                </div>
            ) : categorias.length === 0 ? (
                <div className="productos-alert productos-alert-warning">
                    <strong>No hay categorías disponibles.</strong>
                    <p>Debes crear al menos una categoría antes de poder agregar productos.</p>
                    <button
                        onClick={() => {
                            const tiendaActual = nombreTienda || tiendaUsuario?.nombreUrl || "tienda";
                            navigate(`/admin/${tiendaActual}/categorias`);
                        }}
                        className="productos-btn productos-btn-secondary"
                    >
                        Crear Categoría
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="productos-form">
                    <div className="productos-form-group">
                        <label className="productos-label">
                            Nombre del Producto *
                        </label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej: Helado de Vainilla"
                            required
                            minLength={3}
                            maxLength={100}
                            disabled={loading}
                            className="productos-input"
                        />
                        <small className="productos-help-text">
                            Entre 3 y 100 caracteres
                        </small>
                    </div>

                    <div className="productos-form-group">
                        <label className="productos-label">
                            Descripción
                        </label>
                        <textarea
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="Describe el producto..."
                            rows="4"
                            maxLength={500}
                            disabled={loading}
                            className="productos-textarea"
                        />
                        <small className="productos-help-text">
                            Máximo 500 caracteres ({descripcion.length}/500)
                        </small>
                    </div>

                    <div className="productos-form-row">
                        <div className="productos-form-group">
                            <label className="productos-label">
                                Precio *
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={precio}
                                onChange={(e) => setPrecio(e.target.value)}
                                placeholder="0"
                                required
                                disabled={loading}
                                className="productos-input"
                            />
                            <small className="productos-help-text">
                                Precio en pesos (solo números enteros)
                            </small>
                        </div>

                        <div className="productos-form-group">
                            <label className="productos-label">
                                Stock *
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                placeholder="1"
                                required
                                disabled={loading}
                                className="productos-input"
                            />
                            <small className="productos-help-text">
                                Cantidad disponible (mínimo 1).
                                Se descontará automáticamente al realizar una compra.
                            </small>
                        </div>
                    </div>

                    <div className="productos-form-group">
                        <label className="productos-label">
                            Categoría
                        </label>
                        <select
                            value={categoriaId}
                            onChange={(e) => setCategoriaId(e.target.value)}
                            disabled={loading || cargandoCategorias}
                            className="productos-select"
                        >
                            <option value="">Selecciona una categoría (por defecto: Otros)</option>
                            {categorias.map((categoria) => (
                                <option key={categoria.id} value={categoria.id}>
                                    {categoria.nombre}
                                </option>
                            ))}
                        </select>
                        <small className="productos-help-text">
                            Si no seleccionas una categoría, se usará automáticamente "Otros"
                        </small>
                    </div>

                    <div className="productos-form-group">
                        <label className="productos-label">
                            Imágenes del Producto *
                        </label>
                        
                        {/* Preview de imágenes múltiples */}
                        {imagenesPreview.length > 0 && (
                            <div className="productos-imagen-preview" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                {imagenesPreview.map((src, index) => (
                                    <div key={index} style={{ position: 'relative', width: '100px', height: '100px' }}>
                                        <img
                                            src={src}
                                            alt={`Preview ${index}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '5px', border: '1px solid #ddd' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImagen(index)}
                                            style={{
                                                position: 'absolute',
                                                top: '-5px',
                                                right: '-5px',
                                                background: 'red',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '20px',
                                                height: '20px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                fontSize: '12px'
                                            }}
                                        >
                                            X
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <input
                            type="file"
                            accept="image/*"
                            multiple // Permite seleccionar múltiples archivos
                            onChange={handleImagenesChange}
                            disabled={loading}
                            className="productos-file-input"
                        />
                        <small className="productos-help-text">
                            Formato: JPG, PNG, GIF.
                            Tamaño máximo por imagen: 5MB. La imagen es obligatoria.
                        </small>
                    </div>

                    <div className="productos-form-actions">
                        <button
                            type="submit"
                            disabled={loading || cargandoCategorias}
                            className="productos-btn productos-btn-submit"
                        >
                            {loading ?
                                "Creando..." : "Crear Producto"}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const tiendaActual = nombreTienda ||
                                    tiendaUsuario?.nombreUrl || "tienda";
                                navigate(`/admin/${tiendaActual}/dashboard`);
                            }}
                            disabled={loading}
                            className="productos-btn productos-btn-cancel"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default AdminCrearProductos;