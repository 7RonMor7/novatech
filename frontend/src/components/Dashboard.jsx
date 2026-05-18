import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ResenaSection from './ResenaSection';
import SocialBar from './Socialbar';

// Definimos la URL base usando la variable de entorno de Vite
const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function Dashboard() {
  const location = useLocation();

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [clientes, setClientes] = useState([]);

  // Se ejecuta cada vez que entras al Dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [resProd, resCat, resCli] = await Promise.all([
          fetch(`${API_BASE_URL}/productos`),
          fetch(`${API_BASE_URL}/categorias`),
          fetch(`${API_BASE_URL}/clientes`)
        ]);

        if (resProd.ok) setProductos(await resProd.json());
        if (resCat.ok) setCategorias(await resCat.json());
        if (resCli.ok) setClientes(await resCli.json());

      } catch (error) {
        console.error("Error actualizando Dashboard:", error);
      }
    };

    fetchDashboardData();
  }, [location.pathname]); // Se refresca cada vez que cambia la ruta

  const totalStock = productos.reduce((acc, p) => acc + (p.stock || 0), 0);
  const productosActivos = productos.filter(p => p.activo).length;
  const totalClientes = clientes.filter(c => c.activo).length;

  return (
    <div className="cat-shell">
      <header className="cat-header">
        <div className="cat-icon">📊</div>
        <div>
          <div className="cat-title">Panel de Control</div>
          <div className="cat-subtitle">Resumen general de NovaTech</div>
        </div>
      </header>

      <div className="cat-grid dashboard-grid">
        <div className="cat-panel stat-card" style={{ "--card-color": "#3b82f6" }}>
          <div className="stat-icon">📦</div>
          <h3>Total Productos</h3>
          <p className="stat-number">{productos.length}</p>
          <span className="stat-detail">{productosActivos} activos actualmente</span>
        </div>

        <div className="cat-panel stat-card" style={{ "--card-color": "#10b981" }}>
          <div className="stat-icon">🏷️</div>
          <h3>Categorías</h3>
          <p className="stat-number">{categorias.length}</p>
          <span className="stat-detail">Organización del inventario</span>
        </div>

        <div className="cat-panel stat-card" style={{ "--card-color": "#ef4444" }}>
          <div className="stat-icon">👥</div>
          <h3>Clientes</h3>
          <p className="stat-number">{clientes.length}</p>
          <span className="stat-detail">Usuarios registrados</span>
        </div>

        <div className="cat-panel stat-card" style={{ "--card-color": "#f59e0b" }}>
          <div className="stat-icon">📈</div>
          <h3>Stock Total</h3>
          <p className="stat-number">{totalStock}</p>
          <span className="stat-detail">Unidades en almacén</span>
        </div>
      </div>

      <ResenaSection clientes={clientes} />
      <SocialBar />
    </div>
  );
}