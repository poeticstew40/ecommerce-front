import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./tienda/contexts/AuthContext";
import { TiendaWrapper } from "./tienda/contexts/TiendaWrapper";
import { CarritoProvider } from "./tienda/contexts/CarritoContext";
import { NotificationProvider } from "./contexts/NotificationContext";

// Rutas de protected
import ProtectedRoute from "./components/ProtectedRoute";

// Rutas de landing
import Landing from "./landing/pages/Landing.jsx";
import Login from "./landing/pages/Login.jsx";
import ExplorarTiendas from "./landing/pages/ExplorarTiendas.jsx";
import SolicitarRecuperacion from "./landing/pages/SolicitarRecuperacion.jsx";
import RestablecerContrasenia from "./landing/pages/RestablecerContrasenia.jsx";
import InfoPages from "./landing/pages/InfoPages.jsx";

// Rutas de comprador
import BuyerLayout from "./landing/components/BuyerLayout.jsx";
import BuyerCompras from "./landing/pages/BuyerCompras.jsx";
import PerfilSeguridad from "./components/PerfilSeguridad.jsx";

// Rutas de admin
import AdminLayout from "./admin/layouts/AdminLayout.jsx";
import AdminDashboard from "./admin/pages/AdminDashboard.jsx";
import AdminConfiguracion from "./admin/pages/AdminConfiguracion.jsx";
import AdminCrearProductos from "./admin/pages/AdminCrearProductos.jsx";
import AdminEditarProductos from "./admin/pages/AdminEditarProductos.jsx";
import AdminPedidos from "./admin/pages/AdminPedidos.jsx";
import AdminCategorias from "./admin/pages/AdminCategorias.jsx";

// Rutas de tienda
import Home from "./tienda/pages/Home.jsx";
import HomeCategoria from "./tienda/pages/HomeCategoria.jsx";
import Catalogo from "./tienda/pages/Catalogo.jsx";
import Carrito from "./tienda/pages/Carrito.jsx";
import Checkout from "./tienda/pages/Checkout.jsx";
import VerUsuarios from "./tienda/pages/VerUsuarios.jsx";

// IMPORTANTE: Verifica que este archivo exista en ESTA carpeta
import EstadoPago from "./tienda/pages/EstadoPago.jsx";

function App() {
    return (
        <Router>
            <NotificationProvider>
                <AuthProvider>
                    <TiendaWrapper>
                        <CarritoProvider>
                            <Routes>
                                {/* --- RUTAS PÚBLICAS Y DE SISTEMA --- */}
                                <Route path="/" element={<Landing />} />
                                <Route path="/info/:pagina" element={<InfoPages />} />
                                <Route path="/tiendas" element={<ExplorarTiendas />} />
                                
                                <Route path="/login" element={<Login />} />
                                <Route path="/forgot-password" element={<SolicitarRecuperacion />} />
                                <Route path="/reset-password" element={<RestablecerContrasenia />} />

                                {/* --- RUTAS DE ESTADO DE PAGO (SOLUCIÓN A PRUEBA DE ERRORES) --- */}
                                {/* Cubrimos los nombres en español */}
                                <Route path="/compra-exitosa" element={<EstadoPago estado="exito" />} />
                                <Route path="/compra-fallida" element={<EstadoPago estado="fallo" />} />
                                <Route path="/compra-pendiente" element={<EstadoPago estado="pendiente" />} />
                                
                                {/* Cubrimos los nombres en inglés (por defecto de muchas configuraciones) */}
                                <Route path="/success" element={<EstadoPago estado="exito" />} />
                                <Route path="/failure" element={<EstadoPago estado="fallo" />} />
                                <Route path="/pending" element={<EstadoPago estado="pendiente" />} />

                                {/* --- PANEL DE COMPRADOR --- */}
                                <Route path="/perfil" element={
                                    <ProtectedRoute>
                                        <BuyerLayout />
                                    </ProtectedRoute>
                                }>
                                    <Route index element={<BuyerCompras />} />
                                    <Route path="compras" element={<BuyerCompras />} />
                                    <Route path="seguridad" element={<PerfilSeguridad />} />
                                </Route>

                                {/* --- PANEL DE VENDEDOR (ADMIN) --- */}
                                <Route path="/admin/:nombreTienda" element={
                                    <ProtectedRoute requireVendedor={true}>
                                        <AdminLayout />
                                    </ProtectedRoute>
                                }>
                                    <Route index element={<AdminDashboard />} />
                                    <Route path="dashboard" element={<AdminDashboard />} />
                                    <Route path="configuracion" element={<AdminConfiguracion />} />
                                    <Route path="productos/crear" element={<AdminCrearProductos />} />
                                    <Route path="productos/editar" element={<AdminEditarProductos />} />
                                    <Route path="pedidos" element={<AdminPedidos />} />
                                    <Route path="categorias" element={<AdminCategorias />} />
                                    <Route path="seguridad" element={<PerfilSeguridad />} />
                                </Route>

                                <Route path="/admin/*" element={
                                    <ProtectedRoute requireVendedor={true}>
                                        <AdminLayout />
                                    </ProtectedRoute>
                                }>
                                    <Route path="dashboard" element={<AdminDashboard />} />
                                    <Route path="seguridad" element={<PerfilSeguridad />} />
                                </Route>

                                {/* --- RUTAS DE TIENDA --- */}
                                <Route path="/tienda/:nombreTienda/home" element={<Home />} />
                                <Route path="/tienda/:nombreTienda/categoria/:categoriaNombre" element={<HomeCategoria />} />
                                <Route path="/tienda/:nombreTienda/login" element={<Login />} />
                                <Route path="/tienda/:nombreTienda/catalogo" element={<Catalogo />} />
                                <Route path="/tienda/:nombreTienda/carrito" element={<Carrito />} />
                                <Route path="/tienda/:nombreTienda/checkout" element={<Checkout />} />
                                <Route path="/tienda/:nombreTienda/usuarios" element={<VerUsuarios />} />
                            </Routes>
                        </CarritoProvider>
                    </TiendaWrapper>
                </AuthProvider>
            </NotificationProvider>
        </Router>
    );
}

export default App;