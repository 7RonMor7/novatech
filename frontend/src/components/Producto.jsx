import { useState, useEffect, useCallback, useMemo } from "react";
import "./Producto.css";
import { confirmDelete } from "../utils/alerts";

const API_URL_PROD = `${import.meta.env.VITE_API_URL}/productos`;
const API_URL_CAT = `${import.meta.env.VITE_API_URL}/categorias`;

/* ── Toast helper ──────────────────────────────────────────────── */
function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.type}`}>
          <span className="toast-dot" />
          {t.message}
        </div>
      ))}
    </div>
  );
}

export default function Producto() {
  const [productos, setProductos]     = useState([]);
  const [categorias, setCategorias]   = useState([]);
  const [loading, setLoading]         = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [toasts, setToasts]           = useState([]);
  const [buscar, setBuscar]           = useState("");

  // Form state
  const [editId, setEditId]           = useState(null);
  const [formData, setFormData]       = useState({
    nombre: "",
    descripcion: "",
    imagenUrl: "",
    precio: "",
    stock: "",
    activo: true,
    idCategoria: ""
  });

  // Validation state
  const [errors, setErrors] = useState({});

  /* ── Toast util ─────────────────────────────────────────────── */
  const showToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);

  /* ── Load data (With DEMO mode) ─────────────────────────────── */
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [resProd, resCat] = await Promise.all([
        fetch(API_URL_PROD),
        fetch(API_URL_CAT)
      ]);
      
      if (resProd.ok && resCat.ok) {
        setProductos(await resProd.json());
        setCategorias(await resCat.json());
      } else {
        throw new Error();
      }

    } catch {
      showToast("Backend no disponible · Mostrando datos de demo", "info");
      // Constantes DEMO basadas en tu entidad Producto
      setCategorias([
        { idCategoria: 1, nombre: "Laptops" },
        { idCategoria: 2, nombre: "Periféricos" }
      ]);
      setProductos([
        { 
          idProducto: 101, 
          nombre: "MacBook Pro M2", 
          descripcion: "Laptop de alto rendimiento para desarrollo", 
          precio: 2500.00, 
          stock: 15, 
          activo: true,
          categoria: { idCategoria: 1, nombre: "Laptops" }
        },
        { 
          idProducto: 102, 
          nombre: "Teclado Mecánico RGB", 
          descripcion: "Switches Blue, distribución español", 
          precio: 85.50, 
          stock: 3, 
          activo: true,
          categoria: { idCategoria: 2, nombre: "Periféricos" }
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadData(); }, [loadData]);

  /* ── Validation ─────────────────────────────────────────────── */
  const validate = () => {
    let newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!formData.precio || formData.precio <= 0) newErrors.precio = "Precio debe ser > 0";
    if (formData.stock === "" || formData.stock < 4 || formData.stock > 30) newErrors.stock = "El stock debe estar entre 4 y 30 unidades";
    if (!formData.idCategoria) newErrors.categoria = "Selecciona una categoría";
    if (formData.imagenUrl.trim().length > 500) newErrors.imagenUrl = "La URL de la imagen no puede superar los 500 caracteres";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ── Submit ─────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);

    const payload = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim(),
      imagenUrl: formData.imagenUrl.trim(),
      precio: parseFloat(formData.precio),
      stock: parseInt(formData.stock),
      activo: formData.activo,
      categoria: { idCategoria: parseInt(formData.idCategoria) }
    };

    try {
      const url = editId ? `${API_URL_PROD}/${editId}` : API_URL_PROD;
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      showToast(editId ? "Producto actualizado correctamente" : "Producto creado correctamente", "success");
      resetForm();
      loadData();
    } catch {
      showToast("Error al conectar con el backend", "error");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Actions ────────────────────────────────────────────────── */
  const handleEdit = (prod) => {
    setEditId(prod.idProducto);
    setFormData({
      nombre: prod.nombre,
      descripcion: prod.descripcion || "",
      imagenUrl: prod.imagenUrl || "",
      precio: prod.precio,
      stock: prod.stock,
      activo: prod.activo,
      idCategoria: prod.categoria?.idCategoria || ""
    });
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, nombre) => {
    const confirmed = await confirmDelete(nombre); // ← reemplaza window.confirm
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_URL_PROD}/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast(`"${nombre}" eliminado`, "success");
        loadData();
      } else throw new Error();
    } catch {
      showToast("Error al eliminar. ¿Backend activo?", "error");
    }
  };

  const resetForm = () => {
    setEditId(null);
    setFormData({ nombre: "", descripcion: "", imagenUrl: "", precio: "", stock: "", activo: true, idCategoria: "" });
    setErrors({});
  };

  const filtrados = useMemo(() =>
    productos.filter((p) => {
      const q = buscar.toLowerCase();
      return (
        p.nombre.toLowerCase().includes(q) ||
        (p.descripcion         || "").toLowerCase().includes(q) ||
        (p.categoria?.nombre   || "").toLowerCase().includes(q) ||
        String(p.precio).includes(q)
      );
    }), [productos, buscar]);

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="pro-shell">
      <header className="pro-header">
        <div className="pro-icon">
          <svg viewBox="0 0 24 24">
            <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.09-.36.14-.57.14s-.41-.05-.57-.14l-7.9-4.44c-.31-.17-.53-.5-.53-.88V7.5c0-.38.21-.71.53-.88l7.9-4.44c.16-.09.36-.14.57-.14s.41.05.57.14l7.9 4.44c.31.17.53.5.53.88v9z" />
          </svg>
        </div>
        <div>
          <div className="pro-title">Gestión de Productos</div>
          <div className="pro-subtitle">NovaTech E-commerce ®</div>
        </div>
        <span className="pro-badge">{productos.length} registros</span>
      </header>

      <div className="pro-grid">

        {/* PANEL DE FORMULARIO */}
        <div className="pro-panel">
          <div className="pro-panel-title">Formulario</div>
          <span className={`mode-indicator ${editId ? "mode-edit" : "mode-create"}`}>
            {editId ? `✎ EDITANDO ID ${editId}` : "● NUEVO REGISTRO"}
          </span>

          <div className={`field-group ${errors.nombre ? "field-group--error" : ""}`}>
            <label className="field-label">Nombre del Producto <span className="field-required">*</span></label>
            <input
              className="pro-input"
              value={formData.nombre}
              onChange={e => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Teclado Mecánico RGB"
            />
            {errors.nombre && <p className="error-msg">{errors.nombre}</p>}
          </div>

          <div className="prod-row">
            <div className={`field-group ${errors.precio ? "field-group--error" : ""}`}>
              <label className="field-label">Precio ($) <span className="field-required">*</span></label>
              <input
                className="pro-input"
                type="number"
                value={formData.precio}
                onChange={e => setFormData({ ...formData, precio: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className={`field-group ${errors.stock ? "field-group--error" : ""}`}>
              <label className="field-label">Stock <span className="field-required">*</span></label>
              <input
                className="pro-input"
                type="number"
                min={4}        
                max={30}
                value={formData.stock}
                onChange={e => setFormData({ ...formData, stock: e.target.value })}
                placeholder="Mín. 4 – Máx. 30"
              />
              {errors.stock && <p className="error-msg">{errors.stock}</p>}
            </div>
          </div>

          <div className={`field-group ${errors.categoria ? "field-group--error" : ""}`}>
            <label className="field-label">Categoría <span className="field-required">*</span></label>
            <select
              className="pro-input"
              value={formData.idCategoria}
              onChange={e => setFormData({ ...formData, idCategoria: e.target.value })}
            >
              <option value="">Seleccione una categoría...</option>
              {categorias.map(c => (
                <option key={c.idCategoria} value={c.idCategoria}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label className="field-label">Descripción</label>
            <textarea
              className="pro-textarea"
              value={formData.descripcion}
              onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Detalles técnicos del producto..."
              maxLength={300}
            />
            <p className="char-counter">{formData.descripcion.length} / 300</p>
          </div>

          <div className="form-group">
            <label className="field-label">URL de la Imagen <span className="field-required">*</span></label>
            <input
              className={`pro-input ${errors.imagenUrl ? "field-group--error" : ""}`}
              type="text"
              placeholder="https://ejemplo.com/imagen.jpg"
              value={formData.imagenUrl}
              onChange={(e) => setFormData({ ...formData, imagenUrl: e.target.value })}
            />
            {errors.imagenUrl && <p className="error-msg">{errors.imagenUrl}</p>}
            {formData.imagenUrl && (
              <img src={formData.imagenUrl} alt="Vista previa" className="image-preview-mini" />
            )}
          </div>

          <div className="btn-row">
            <button className="btn btn--primary" onClick={handleSubmit} disabled={submitting}>
              {submitting && <span className="spinner" />}
              {submitting ? "Guardando..." : editId ? "Actualizar producto" : "Guardar producto"}
            </button>
            <button className="btn btn--secondary" onClick={resetForm}>Limpiar</button>
          </div>
        </div>

        {/* PANEL DE INFORMACIÓN */}
        <div className="pro-panel pro-panel--alt">
          <div className="pro-panel-title">Información</div>
          <div className="info-text">
            <hr className="info-divider" />
            <div className="info-rule">
              <span className="info-rule-dot">●</span>
              <span><b>Precio:</b> mayor a 0</span>
            </div>
            <div className="info-rule">
              <span className="info-rule-dot">●</span>
              <span><b>Stock:</b> no negativo</span>
            </div>
            <div className="info-rule">
              <span className="info-rule-dot">●</span>
              <span><b>Descripción:</b> máx. 300 caracteres</span>
            </div>
            <div className="info-rule">
              <span className="info-rule-dot">●</span>
              <span><b>Categoría:</b> obligatoria</span>
            </div>
          </div>
          <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid rgba(37,99,235,0.12)" }}>
            <button className="btn btn--secondary btn--full" onClick={loadData}>
              ↻ Actualizar lista
            </button>
          </div>
        </div>

        <div className="pro-panel--full">
          <div className="pro-panel-title">Productos registrados</div>
          <input
            className="pro-input"
            type="text"
            placeholder="Buscar por nombre, descripción o categoría…"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            style={{ marginBottom: "1rem" }}
          />
        </div>

        {/* GALERÍA DE PRODUCTOS */}
        <div className="product-gallery pro-panel--full">
          
          {filtrados.map(p => (
            <div className="product-card" key={p.idProducto}>
              <div className="product-image-container">
                <img
                  src={p.imagenUrl || "https://dummyimage.com/300x200/071427/60a5fa.png&text=Sin+Imagen"}
                  alt={p.nombre}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://dummyimage.com/300x200/450a0a/f87171.png&text=Error";
                  }}
                />
                <span className="product-price-tag">${p.precio}</span>
              </div>
              <div className="product-card-info">
                <span className="pro-tag">{p.categoria?.nombre || "Sin categoría"}</span>
                <h4>{p.nombre}</h4>
                <p>{p.descripcion}</p>
                <div className="card-actions">
                  <button className="btn small edit" onClick={() => handleEdit(p)}>✏️</button>
                  <button className="btn small delete" onClick={() => handleDelete(p.idProducto, p.nombre)}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
      <ToastContainer toasts={toasts} />
    </div>
  );
}