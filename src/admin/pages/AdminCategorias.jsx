import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../tienda/contexts/AuthContext";
import { getCategoriasByTienda, createCategoria, updateCategoria, deleteCategoria } from "../../tienda/services/categorias";
import { getProductosByCategoria } from "../../tienda/services/productos";
import { useNotifications } from "../../contexts/NotificationContext";
import "../styles/AdminCategorias.css";

/**
 * Página de gestión de categorías
 * * Permite crear y editar categorías para la tienda del vendedor autenticado
 * - Límite de 5 categorías personalizadas (sin contar "otros")
 * - Categoría "otros" se crea automáticamente y no se puede editar/eliminar
 */
function AdminCategorias() {
    const { usuario, tiendaUsuario, loading: authLoading, isAuthenticated } = useAuth();
    const { nombreTienda } = useParams();
    const navigate = useNavigate();
    const { success: showSuccess, error: showError } = useNotifications();
    const [loading, setLoading] = useState(false);
    const [cargandoCategorias, setCargandoCategorias] = useState(true);
    const [categorias, setCategorias] = useState([]);
    const [categoriaOtros, setCategoriaOtros] = useState(null);
    // Estados del formulario
    const [nombre, setNombre] = useState("");
    const [editandoId, setEditandoId] = useState(null);
    const [nombreEditando, setNombreEditando] = useState("");
    
    // Redirigir si no está autenticado o si aún está cargando
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate("/login");
        }
    }, [authLoading, isAuthenticated, navigate]);

    // Función para cargar categorías (extraída para poder reutilizarla)
    const cargarCategorias = useCallback(async () => {
        if (!tiendaUsuario?.nombreUrl) {
            setCargandoCategorias(false);
            return;
        }

        try {
            setCargandoCategorias(true);
            // NOTA: El backend ahora trae TODAS las categorías (eliminación física)
            const categoriasData = await getCategoriasByTienda(tiendaUsuario.nombreUrl);
            
            // Separar "otros" de las demás categorías
            const otros = categoriasData.find(cat => cat.nombre.toLowerCase() === "otros");
            const otrasCategorias = categoriasData.filter(cat => cat.nombre.toLowerCase() !== "otros");
            
            setCategoriaOtros(otros || null);
            setCategorias(otrasCategorias);
            
            // Si no existe "otros", crearla automáticamente
            if (!otros) {
                try {
                    const otrosCreada = await createCategoria(tiendaUsuario.nombreUrl, { nombre: "Otros" });
                    setCategoriaOtros(otrosCreada);
                } catch (error) {
                    console.error("Error creando categoría 'Otros':", error);
                    // Si falla, continuar sin ella (se creará en el próximo intento)
                }
            }
        } catch (error) {
            console.error("Error cargando categorías:", error);
            showError("Error", "No se pudieron cargar las categorías.");
        } finally {
            setCargandoCategorias(false);
        }
    }, [tiendaUsuario?.nombreUrl, showError]);

    // Cargar categorías de la tienda y asegurar que existe "otros"
    useEffect(() => {
        if (tiendaUsuario?.nombreUrl) {
            cargarCategorias();
        }
    }, [tiendaUsuario?.nombreUrl, cargarCategorias]);

    const guardarCategoria = async (nombreAUsar = null) => {
        // Usar el nombre proporcionado o el del estado
        const nombreFinal = nombreAUsar !== null ? nombreAUsar : nombre;
        
        if (!nombreFinal.trim()) {
            showError("Error", "El nombre de la categoría es obligatorio");
            return;
        }

        // Validar que no sea "otros" (reservado)
        if (nombreFinal.trim().toLowerCase() === "otros") {
            showError("Error", "El nombre 'Otros' está reservado y se crea automáticamente");
            return;
        }

        // Validar límite de 5 categorías (sin contar "otros")
        if (categorias.length >= 5 && !editandoId) {
            showError("Error", "Has alcanzado el límite de 5 categorías personalizadas. Edita o elimina una existente para crear una nueva.");
            return;
        }

        // Validar que no exista otra categoría con el mismo nombre (la API lo hará, pero la validación local es útil)
        if (editandoId) {
            // Si estamos editando, verificar si el nombre cambió
            const categoriaOriginal = categorias.find(cat => cat.id === editandoId);
            const nombreCambio = categoriaOriginal && categoriaOriginal.nombre.toLowerCase() !== nombreFinal.trim().toLowerCase();
            
            // Solo validar duplicados si el nombre cambió
            if (nombreCambio) {
                const nombreNormalizado = nombreFinal.trim().toLowerCase();
                const existe = categorias.some(cat => 
                    cat.nombre.toLowerCase() === nombreNormalizado && cat.id !== editandoId
                );
                if (existe) {
                    showError("Error", "Ya existe una categoría con ese nombre");
                    return;
                }
            }
        } else {
            // Si estamos creando, siempre validar duplicados
            const nombreNormalizado = nombreFinal.trim().toLowerCase();
            const existe = categorias.some(cat => 
                cat.nombre.toLowerCase() === nombreNormalizado
            );
            if (existe) {
                showError("Error", "Ya existe una categoría con ese nombre");
                return;
            }
        }

        if (!tiendaUsuario?.nombreUrl) {
            showError("Error", "No se pudo obtener la información de la tienda.");
            return;
        }

        setLoading(true);
        try {
            if (editandoId) {
                // Editar categoría existente
                console.log("Actualizando categoría:", { id: editandoId, nombre: nombreFinal.trim(), nombreTienda: tiendaUsuario.nombreUrl });
                const categoriaActualizada = await updateCategoria(tiendaUsuario.nombreUrl, editandoId, {
                    nombre: nombreFinal.trim()
                });
                console.log("Categoría actualizada desde servidor:", categoriaActualizada);
                
                // Recargar categorías desde el servidor para asegurar datos actualizados
                await cargarCategorias();
                showSuccess("Categoría Actualizada", `La categoría "${categoriaActualizada.nombre}" ha sido actualizada exitosamente`);
            } else {
                // Crear nueva categoría
                await createCategoria(tiendaUsuario.nombreUrl, {
                    nombre: nombreFinal.trim()
                });
                // Recargar categorías desde el servidor
                await cargarCategorias();
                showSuccess("Categoría Creada", `La categoría ha sido creada exitosamente`);
            }

            // Limpiar formulario
            setNombre("");
            setEditandoId(null);
            setNombreEditando("");
        } catch (error) {
            console.error("Error al guardar categoría:", error);
            console.error("Detalles del error:", {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message,
                request: error.config
            
            });
            
            let mensajeError = "Error al guardar la categoría. Intenta nuevamente.";
            if (error.response?.status === 400) {
                mensajeError = error.response?.data?.message || "Los datos enviados no son válidos.";
            } else if (error.response?.status === 403) {
                mensajeError = "No tienes permisos para realizar esta acción. Verifica que seas el dueño de la tienda.";
            } else if (error.response?.status === 404) {
                mensajeError = "La categoría no fue encontrada. Puede haber sido eliminada.";
            } else if (error.response?.data?.message) {
                mensajeError = error.response.data.message;
            } else if (error.message) {
                mensajeError = error.message;
            }
            
            showError("Error al guardar categoría", mensajeError);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await guardarCategoria();
    };

    const iniciarEdicion = (categoria) => {
        setEditandoId(categoria.id);
        setNombreEditando(categoria.nombre);
        setNombre(categoria.nombre);
    };

    const cancelarEdicion = () => {
        setEditandoId(null);
        setNombreEditando("");
        setNombre("");
    };

    const eliminarCategoria = async (categoriaId, nombreCategoria) => {
        if (!tiendaUsuario?.nombreUrl) {
            showError("Error", "No se pudo obtener la información de la tienda.");
            return;
        }

        setLoading(true);
        try {
            // **IMPORTANTE: En el nuevo diseño, la API ya se encarga de:
            // 1. Reasignar productos a "Otros".
            // 2. Realizar la eliminación física (liberando el nombre).**
            
            if (!window.confirm(`¿Estás seguro de que deseas ELIMINAR la categoría "${nombreCategoria}"? Todos los productos asociados serán movidos a "Otros". Esta acción es permanente y libera el nombre para su reutilización.`)) {
                setLoading(false);
                return;
            }

            await deleteCategoria(tiendaUsuario.nombreUrl, categoriaId);
            // Recargar categorías desde el servidor
            await cargarCategorias();
            showSuccess("Categoría Eliminada", `La categoría "${nombreCategoria}" ha sido eliminada exitosamente y sus productos reasignados a "Otros".`);
        } catch (error) {
            console.error("Error al eliminar categoría:", error);
            console.error("Detalles del error:", {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message,
                request: error.config
            
            });
            
            let mensajeError = "Error al eliminar la categoría. Intenta nuevamente.";
            if (error.response?.status === 403) {
                mensajeError = "No tienes permisos para realizar esta acción. Verifica que seas el dueño de la tienda.";
            } else if (error.response?.status === 404) {
                mensajeError = "La categoría no fue encontrada. Puede haber sido eliminada.";
            } else if (error.response?.status === 500) {
                const serverMessage = error.response?.data?.message || error.response?.data?.error || "";
                mensajeError = `Error del servidor: ${serverMessage || "Ocurrió un error inesperado. Contacta al administrador."}`;
            } else if (error.response?.data?.message) {
                mensajeError = error.response.data.message;
            } else if (error.message) {
                mensajeError = error.message;
            }
            
            showError("Error al eliminar categoría", mensajeError);
        } finally {
            setLoading(false);
        }
    };

    // Mostrar carga mientras se obtiene el usuario
    if (authLoading) {
        return (
            <div className="categorias-loading">
                <div className="categorias-loading-content">
                    <div className="categorias-loading-title">
                        Cargando...
                    </div>
                    <div className="categorias-loading-text">
                        Obteniendo información del usuario
                    </div>
               </div>
            </div>
        );
    }

    // Si no hay usuario después de cargar, mostrar error
    if (!usuario || !usuario.dni) {
        return (
            <div className="categorias-error">
                <h2 className="categorias-error-title">
                    Error
                </h2>
    
                <div className="categorias-error-container">
                    <div className="categorias-error-alert">
                        <strong>No se pudo obtener la información del usuario.</strong>
                        <br />
          
                        <small className="categorias-error-text">
                            Por favor, inicia sesión nuevamente.
                        </small>
                    </div>
         
                    <div className="categorias-error-actions">
                        <button
                            onClick={() => {
                                localStorage.clear();
  
                                navigate("/login");
                            }}
                            className="categorias-error-btn categorias-error-btn-primary"
             
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
            <div className="categorias-error">
                <h2 className="categorias-error-title">
                    Tienda no encontrada
                </h2>
       
                <div className="categorias-error-container">
                    <div className="categorias-error-alert">
                        <strong>No tienes una tienda asociada.</strong>
                        <br />
                
                        <small className="categorias-error-text">
                            Debes crear una tienda antes de poder agregar categorías.
                        </small>
                    </div>
           
                    <div className="categorias-error-actions">
                        <button
                            onClick={() => {
                                const tiendaActual = nombreTienda || "tienda";
                                navigate(`/admin/${tiendaActual}/configuracion`);
                            }}
                            className="categorias-error-btn categorias-error-btn-primary"
                        >
                            Crear Mi Tienda
                 
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const categoriasPersonalizadas = categorias.filter(cat => cat.nombre.toLowerCase() !== "otros");
    const puedeCrear = categoriasPersonalizadas.length < 5;
    
    return (
        <div className="categorias-container">
            <h2 className="categorias-title">
                Gestión de Categorías
            </h2>

            {cargandoCategorias ? (
                <div className="categorias-loading-categorias">
                
                    Cargando categorías...
                </div>
            ) : (
                <>
                    {/* Formulario de crear/editar */}
                    <div className="categorias-form-container">
    
                        <h3 className="categorias-subtitle">
                            {editandoId ? "Editar Categoría" : "Crear Nueva Categoría"}
                        </h3>
                    
                        <form onSubmit={handleSubmit} className="categorias-form">
                            <div className="categorias-form-group">
                                <label className="categorias-label">
                                
                                    Nombre de la Categoría *
                                </label>
                                <input
                            
                                    type="text"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                  
                                    placeholder="Ej: Herramientas"
                                    required
                                    disabled={loading || (!puedeCrear && !editandoId)}
                                    className="categorias-input"
                                    maxLength={100}
                          
                                    />
                                <small className="categorias-help-text">
                                    {editandoId 
                        
                                        ? "Modifica el nombre de la categoría. Los productos con esta categoría se actualizarán automáticamente."
                                        : `Puedes crear hasta 5 categorías personalizadas. (${categoriasPersonalizadas.length}/5)`
                                    }
                                </small>
                         
                                {!puedeCrear && !editandoId && (
                                    <div className="categorias-alert categorias-alert-warning">
                                        Has alcanzado el límite de 5 categorías. Edita o elimina una existente para crear una nueva.
                                    </div>
                                )}
                            
                            </div>

                            <div className="categorias-form-actions">
                                {editandoId ?
                                (
                                    <>
                                        <button
                        
                                            type="submit"
                                            disabled={loading}
                                    
                                            className="categorias-btn categorias-btn-submit"
                                        >
                                            {loading ? "Actualizando..." : "Actualizar Categoría"}
  
                                        </button>
                                        <button
                      
                                            type="button"
                                            onClick={cancelarEdicion}
                                  
                                            disabled={loading}
                                            className="categorias-btn categorias-btn-cancel"
                                        >
     
                                            Cancelar
                                        </button>
                     
                                </>
                                ) : (
                                    <button
               
                                        type="submit"
                                        disabled={loading || !puedeCrear}
                                        className="categorias-btn categorias-btn-submit"
                                    >
                       
                                        {loading ? "Creando..." : "Crear Categoría"}
                                    </button>
                                )}
                            </div>
 
                        </form>
                    </div>

                    {/* Lista de categorías */}
                    <div className="categorias-list-container">
            
                        <h3 className="categorias-subtitle">
                            Categorías Existentes
                        </h3>
                        
          
                        {/* Categoría "Otros" (especial) */}
                        {categoriaOtros && (
                            <div className="categorias-item categorias-item-otros">
                          
                                <div className="categorias-item-info">
                                    <span className="categorias-item-nombre">{categoriaOtros.nombre}</span>
                                    <span className="categorias-item-badge">Automática</span>
                   
                                </div>
                                <div className="categorias-item-actions">
                                    <span className="categorias-item-locked">No editable</span>
                
                                </div>
                            </div>
                        )}

                        {/* Categorías personalizadas */}
     
                        {categoriasPersonalizadas.length === 0 ?
                        (
                            <div className="categorias-empty">
                                <p>No hay categorías personalizadas. Crea tu primera categoría arriba.</p>
                            </div>
   
                        ) : (
                            categoriasPersonalizadas.map((categoria) => (
                                <div key={categoria.id} className="categorias-item">
             
                                    <div className="categorias-item-info">
                                        <span className="categorias-item-nombre">
                                   
                                            {editandoId === categoria.id ? (
                                                <input
                                       
                                                    type="text"
                                                    value={nombreEditando}
                                   
                                                    onChange={(e) => setNombreEditando(e.target.value)}
                                                    className="categorias-edit-input"
                             
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
               
                                                            e.preventDefault();
                                                            guardarCategoria(nombreEditando);
                                                        }
                                                    }}
                                               
                                                />
                                            ) : (
                                                categoria.nombre
     
                                            )}
                                        </span>
                     
                                    </div>
                                    <div className="categorias-item-actions">
                                        {editandoId === categoria.id ?
                                        (
                                            <>
                                                <button
        
                                                    onClick={async () => {
                                                     
                                                        await guardarCategoria(nombreEditando);
                                                    }}
                                            
                                                    disabled={loading}
                                                    className="categorias-btn-icon categorias-btn-save"
                                       
                                                    title="Guardar"
                                                >
                                       
                                                    ✓
                                                </button>
                                       
                                                <button
                                                    onClick={cancelarEdicion}
                                       
                                                    disabled={loading}
                                                    className="categorias-btn-icon categorias-btn-cancel"
                                  
                                                    title="Cancelar"
                                                >
                                  
                                                    ×
                                                </button>
                                  
                                            </>
                                        ) : (
                                            <>
    
                                                <button
                                                    onClick={() => iniciarEdicion(categoria)}
  
                                                    disabled={loading || editandoId !== null}
                                                    className="categorias-btn categorias-btn-edit"
                                             
                                                    >
                                                    Editar
                                             
                                                    </button>
                                                <button
                                                 
                                                    onClick={() => eliminarCategoria(categoria.id, categoria.nombre)}
                                                    disabled={loading || editandoId !== null}
                                                    className="categorias-btn categorias-btn-delete"
                                             
                                                    style={{ marginLeft: '10px', backgroundColor: '#dc3545', color: 'white' }}
                                                >
                                      
                                                    Eliminar
                                                </button>
                                      
                                            </>
                                        )}
                                    </div>
                  
                                </div>
                            ))
                        )}
                    </div>

              
                    <div className="categorias-info">
                        <p><strong>Nota:</strong> Al eliminar una categoría, sus productos se reasignan automáticamente a la categoría "Otros". El nombre queda libre para crear una nueva categoría.</p>
                    </div>
                </>
            )}
  
        </div>
    );
}

export default AdminCategorias;