import { useState, useEffect, useCallback, useMemo } from "react";
import "./Categoria.css";
import { confirmDelete } from "../utils/alerts";
import SearchBar from './SearchBar'
import './shared.css'

// Uso de la variable de entorno de Vite para produccion y desarrollo
const API_URL = `${import.meta.env.VITE_API_URL}/categorias`;

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

/* ── Main component ────────────────────────────────────────────── */
export default function Categoria() {
  const [categorias, setCategorias]   = useState([]);
  const [loading, setLoading]         = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [toasts, setToasts]           = useState([]);
  const [buscar, setBuscar]           = useState("");

  // Form state
  const [editId, setEditId]           = useState(null);
  const [nombre, setNombre]           = useState("");
  const [descripcion, setDescripcion] = useState("");

  // Validation
  const [nombreError, setNombreError] = useState(false);

  /* ── Toast util ─────────────────────────────────────────────── */
  const showToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);

  /* ── Load data ──────────────────────────────────────────────── */
  const loadCategorias = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCategorias(data);
    } catch {
      showToast("Backend no disponible · Mostrando datos de demo", "info");
      setCategorias([
        { idCategoria: 1, nombre: "Laptops",      descripcion: "Computadoras portátiles de alto rendimiento" },
        { idCategoria: 2, nombre: "Smartphones",  descripcion: "Teléfonos inteligentes de última generación" },
        { idCategoria: 3, nombre: "Accesorios",   descripcion: "Periféricos y complementos tecnológicos" },
      ]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadCategorias(); }, [loadCategorias]);

  /* ── Validation ─────────────────────────────────────────────── */
  const validate = () => {
    if (!nombre.trim()) { setNombreError(true); return false; }
    setNombreError(false);
    return true;
  };

  /* ── Submit (create / update) ───────────────────────────────── */
  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);

    const payload = { nombre: nombre.trim(), descripcion: descripcion.trim() };

    try {
      const url    = editId ? `${API_URL}/${editId}` : API_URL;
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      showToast(
        editId ? "Categoría actualizada correctamente" : "Categoría creada correctamente",
        "success"
      );
      resetForm();
      await loadCategorias();
    } catch {
      showToast("Error al conectar con el backend. ¿Está corriendo en :8082?", "error");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Edit ───────────────────────────────────────────────────── */
  const handleEdit = (cat) => {
    setEditId(cat.idCategoria);
    setNombre(cat.nombre);
    setDescripcion(cat.descripcion || "");
    setNombreError(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── Delete ─────────────────────────────────────────────────── */
  const handleDelete = async (id, nombreCat) => {
    const confirmed = await confirmDelete(nombreCat); // ← reemplaza window.confirm
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast(`"${nombreCat}" eliminado`, "success");
        loadCategorias();
      } else throw new Error();
    } catch {
      showToast("Error al eliminar. ¿Backend activo?", "error");
    }
  };

  /* ── Reset form ─────────────────────────────────────────────── */
  const resetForm = () => {
    setEditId(null);
    setNombre("");
    setDescripcion("");
    setNombreError(false);
  };

  /* ── Derived ────────────────────────────────────────────────── */
  const charCount    = descripcion.length;
  const isEditMode   = editId !== null;

  const filtrados = useMemo(() =>
  categorias.filter(c =>
    c.nombre.toLowerCase().includes(buscar.toLowerCase()) ||
    (c.descripcion || "").toLowerCase().includes(buscar.toLowerCase())
  ), [categorias, buscar]);

  const charClass =
    charCount >= 200 ? "char-counter char-counter--over"
    : charCount > 180 ? "char-counter char-counter--warn"
    : "char-counter";

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="cat-shell">
      {/* ── Header ── */}
      <header className="cat-header">
        <div className="cat-icon">
          <svg viewBox="0 0 24 24">
            <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" />
          </svg>
        </div>
        <div>
          <div className="cat-title">Gestión de Categorías</div>
          <div className="cat-subtitle">NovaTech E-commerce ®</div>
        </div>
        <span className="cat-badge">{categorias.length} registros</span>
      </header>

      <div className="cat-grid"> 
        {/* ── Form panel ── */}
        <div className="cat-panel">
          <div className="cat-panel-title">Formulario</div>

          <span className={`mode-indicator ${isEditMode ? "mode-edit" : "mode-create"}`}>
            {isEditMode ? `✎ EDITANDO ID ${editId}` : "● NUEVO REGISTRO"}
          </span>

          {/* Nombre */}
          <div className={`field-group${nombreError ? " field-group--error" : ""}`}>
            <label className="field-label">
              Nombre <span className="field-required">*</span>
            </label>
            <input
              className="cat-input"
              type="text"
              placeholder="Ej. Laptops, Smartphones..."
              maxLength={100}
              value={nombre}
              onChange={(e) => { setNombre(e.target.value); if (e.target.value.trim()) setNombreError(false); }}
            />
            {nombreError && <p className="error-msg">El nombre de la categoría es obligatorio.</p>}
          </div>

          {/* Descripción */}
          <div className="field-group">
            <label className="field-label">Descripción</label>
            <textarea
              className="cat-textarea"
              placeholder="Describe brevemente esta categoría..."
              maxLength={200}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
            <p className={charClass}>{charCount} / 200</p>
          </div>

          <div className="btn-row">
            <button
              className="btn btn--primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting && <span className="spinner" />}
              {submitting ? "Guardando..." : isEditMode ? "Actualizar categoría" : "Guardar categoría"}
            </button>
            <button className="btn btn--secondary" onClick={resetForm}>
              Limpiar
            </button>
          </div>
        </div>

        {/* ── Info panel ── */}
        <div className="cat-panel cat-panel--alt">
          <div className="cat-panel-title">Información</div>
          <div className="info-text">
            <hr className="info-divider" />
            <div className="info-rule">
              <span className="info-rule-dot">●</span>
              <span><b>Nombre:</b> obligatorio</span>
            </div>
            <div className="info-rule">
              <span className="info-rule-dot">●</span>
              <span><b>Descripción:</b> máx. 200 caracteres</span>
            </div>
          </div>
          <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid rgba(37,99,235,0.12)" }}>
            <button className="btn btn--secondary btn--full" onClick={loadCategorias}>
              ↻ Actualizar lista
            </button>
          </div>
        </div>

        {/* ── Table panel ── */}
        <div className="cat-panel cat-panel--full">
          <div className="cat-panel-title">Categorías activas</div>
          <input
            className="cat-input"
            type="text"
            placeholder="Buscar por nombre o descripción…"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
          <table className="cat-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="loading-cell">Cargando categorías...</td>
                </tr>
              ) : categorias.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state">No hay categorías registradas aún.</div>
                  </td>
                </tr>
              ) : (
                filtrados.map((cat) => (
                  <tr key={cat.idCategoria}>
                    <td><span className="id-badge">#{cat.idCategoria}</span></td>
                    <td className="nombre-cell">{cat.nombre}</td>
                    <td>
                      <span className="desc-cell" title={cat.descripcion || ""}>
                        {cat.descripcion || <span style={{ color: "#2d4a6e" }}>—</span>}
                      </span>
                    </td>
                    <td>
                      <div className="action-cell">
                        <button className="act-btn act-btn--edit" onClick={() => handleEdit(cat)}>
                          Editar
                        </button>
                        <button
                          className="act-btn act-btn--delete"
                          onClick={() => handleDelete(cat.idCategoria, cat.nombre)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Toasts ── */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}