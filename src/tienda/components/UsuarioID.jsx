import { useState } from "react";
import { getUsuarioByDni } from "../services/usuarios";

/**
* Componente BuscarUsuario
* 
* Permite buscar un usuario por su DNI.
* Muestra un campo de entrada para el DNI y un botón de búsqueda.
* Cuando se encuentra un usuario, muestra su información (apellido, nombre y email).
*/

function BuscarUsuario() {
    // Estado para almacenar el DNI ingresado
    const [dni, setDni] = useState("");
    // Estado para almacenar los datos del usuario encontrado
    const [usuario, setUsuario] = useState(null);

    /**
    * Función que busca un usuario por DNI en la API
    * y actualiza el estado con los datos del usuario encontrado
    */
    const buscar = () => {
        getUsuarioByDni(dni)
        .then(setUsuario)
        .catch(console.error);
    };

    return (
        <div>
            {/* Campo de entrada para el DNI */}
            <input
                type="text"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                placeholder="Ingrese DNI"
            />
            {/* Botón que ejecuta la búsqueda del usuario */}
            <button onClick={buscar}>Buscar</button>

            {/* Muestra la información del usuario si fue encontrado */}
            {usuario && (
                <div>
                    {/* Nombre completo del usuario */}
                    <h2>{usuario.apellido} {usuario.nombre}</h2>
                    {/* Email del usuario */}
                    <p>Email: {usuario.email}</p>
                </div>
            )}
        </div>
    );
}

export default BuscarUsuario;
