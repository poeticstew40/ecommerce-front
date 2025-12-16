import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './MainStyles.css'

/**
* Punto de entrada principal de la aplicación React
* 
* Crea el root de React y renderiza la aplicación dentro del elemento
* con id "root" del HTML. Utiliza StrictMode para detectar problemas
* potenciales durante el desarrollo.
* 
* El componente App contiene toda la configuración de rutas y estructura
* principal de la aplicación.
*/
// StrictMode ayuda a identificar problemas durante el desarrollo
// Componente principal de la aplicación con configuración de rutas

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
