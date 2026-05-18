import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import './App.css';
import './utils/alerts.css'

// Importación de tus componentes
import Dashboard from "./components/Dashboard";
import Categoria from './components/Categoria.jsx';
import Cliente from './components/Cliente.jsx';
import DetallePedido from './components/DetallePedido.jsx';
import Pago from './components/Pago.jsx';
import Pedido from './components/Pedido.jsx';
import Producto from './components/Producto.jsx';

const navConfig = {
  "/categorias": { color: "#3b82f6", icon: "https://cdn-icons-png.flaticon.com/512/3502/3502688.png" },
  "/productos":  { color: "#10b981", icon: "https://cdn-icons-png.flaticon.com/512/3144/3144456.png" },
  "/clientes":   { color: "#f59e0b", icon: "https://cdn-icons-png.flaticon.com/512/6009/6009864.png" },
  "/pedidos":    { color: "#ef4444", icon: "https://cdn-icons-png.flaticon.com/512/3500/3500833.png" },
  "/pago":       { color: "#8b5cf6", icon: "https://cdn-icons-png.flaticon.com/512/2489/2489756.png" },
  "/detalle-pedido": { color: "#ec4899", icon: "https://cdn-icons-png.flaticon.com/512/2649/2649223.png" },
};

function App() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [clientes, setClientes] = useState([]);

  // Efecto para cargar datos iniciales (necesario para el Dashboard)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resProd, resCat, resCli] = await Promise.all([
          fetch("http://localhost:8082/productos"),
          fetch("http://localhost:8082/categorias"),
          fetch("http://localhost:8082/clientes")
        ]);
        if (resProd.ok) setProductos(await resProd.json());
        if (resCat.ok) setCategorias(await resCat.json());
        if (resCli.ok) setClientes(await resCli.json());
      } catch (error) {
        console.error("Error cargando datos para Dashboard:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <Router>
      <div className="main-layout">
        <header className="business-header">
          <div className="header-content">
            <img src="/logo_y_name.png" alt="NovaTech Logo" className="header-logo" />
            <h1><span>E-commerce</span></h1>
          </div>
        </header>

        <nav className="nav-bar">
          <div className="nav-container">
            <NavLink to="/">Inicio</NavLink>
            <NavLink to="/categorias">Categorías</NavLink>
            <NavLink to="/productos">Productos</NavLink>
            <NavLink to="/clientes">Clientes</NavLink>
            <NavLink to="/pedidos">Pedidos</NavLink>
            <NavLink to="/pago">Pago</NavLink>
            <NavLink to="/detalle-pedido">Detalles</NavLink>
          </div>
        </nav>

        <main className="content-area">
          <Routes>
            <Route path="/" element={<Dashboard productos={productos} categorias={categorias} clientes={clientes}/>} />
            <Route path="/categorias" element={<Categoria />} />
            <Route path="/productos" element={<Producto />} />
            <Route path="/clientes" element={<Cliente/>} />
            <Route path="/pedidos" element={<Pedido/>} />
            <Route path="/pago" element={<Pago/>} />
            <Route path="/detalle-pedido" element={<DetallePedido/>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  const config = navConfig[to] || { color: "#60a5fa", icon: "" };

  return (
    <Link 
      to={to} 
      className={`nav-item ${isActive ? "nav-item--active" : ""}`}
      style={{ "--hover-color": config.color }}
    >
      {children}
      {config.icon && (
        <div className="nav-hover-card">
          <img src={config.icon} alt={children} />
        </div>
      )}
    </Link>
  );
}

export default App;