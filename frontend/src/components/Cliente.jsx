import { useState, useEffect, useCallback, useMemo } from "react";
import "./Cliente.css";
import { confirmDelete } from "../utils/alerts";

// Uso de la variable de entorno de Vite para produccion y desarrollo
const API_URL = `${import.meta.env.VITE_API_URL}/clientes`;

/* ── Helpers ───────────────────────────────────────────────────── */
const today = () => new Date().toISOString().split("T")[0];

const DEMO_DATA = [
  {
    idCliente: 1,
    nombre: "Valentina Torres",
    email: "v.torres@email.com",
    telefono: "+573001234567",
    direccion: "Calle 80 #45-12, Medellín",
    fechaRegistro: "2024-01-15",
  },
  {
    idCliente: 2,
    nombre: "Andrés Ramírez",
    email: "a.ramirez@email.com",
    telefono: "+573109876543",
    direccion: "Av. El Poblado #23-8, Medellín",
    fechaRegistro: "2024-03-22",
  },
  {
    idCliente: 3,
    nombre: "Camila Gómez",
    email: "c.gomez@email.com",
    telefono: "+573205551234",
    direccion: "Carrera 65 #12-34, Medellín",
    fechaRegistro: "2024-06-10",
  },
];

/* ── Validation rules (mirrors backend constraints) ────────────── */
const PHONE_REGEX = /^\+?[0-9]{7,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(fields, editId, clientes) {
  const errors = {};
  if (!fields.nombre.trim()) errors.nombre = "El nombre es obligatorio.";
  if (!fields.email.trim()) {
    errors.email = "El email es obligatorio.";
  } else if (!EMAIL_REGEX.test(fields.email)) {
    errors.email = "Formato de email inválido.";
  } else {
    // Unique email check (client-side, backend also validates)
    const duplicate = clientes.find(
      (c) =>
        c.email.toLowerCase() === fields.email.toLowerCase() &&
        c.idCliente !== editId
    );
    if (duplicate) errors.email = `El email ya está registrado (ID #${duplicate.idCliente}).`;
  }
  if (fields.telefono && !PHONE_REGEX.test(fields.telefono)) {
    errors.telefono = "Formato inválido. Ej: +573001234567 (7-20 dígitos).";
  }
  if (!fields.direccion.trim()) errors.direccion = "La dirección es obligatoria.";
  if (!fields.fechaRegistro) errors.fechaRegistro = "La fecha de registro es obligatoria.";
  return errors;
}

/* ── Toast container ───────────────────────────────────────────── */
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

/* ── Empty form state ──────────────────────────────────────────── */
const emptyForm = () => ({
  nombre: "",
  email: "",
  telefono: "",
  direccion: "",
  fechaRegistro: today(),
});

/* ── Main component ────────────────────────────────────────────── */
export default function Cliente() {
  const [clientes, setClientes]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts]         = useState([]);

  const [buscar, setBuscar]     = useState("");

  const [editId, setEditId]   = useState(null);
  const [fields, setFields]   = useState(emptyForm());
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});

  /* ── Toast util ─────────────────────────────────────────────── */
  const showToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3400);
  }, []);

  /* ── Field change ───────────────────────────────────────────── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  /* ── Live validation on change ──────────────────────────────── */
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      setErrors(validate(fields, editId, clientes));
    }
  }, [fields, editId, clientes, touched]);

  /* ── Load clientes ──────────────────────────────────────────── */
  const loadClientes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setClientes(data);
    } catch {
      showToast("Backend no disponible · Mostrando datos de demo", "info");
      setClientes(DEMO_DATA);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadClientes(); }, [loadClientes]);

  /* ── Submit ─────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    // Mark all fields as touched to show all errors
    setTouched({ nombre: true, email: true, telefono: true, direccion: true, fechaRegistro: true });
    const currentErrors = validate(fields, editId, clientes);
    setErrors(currentErrors);
    if (Object.keys(currentErrors).length > 0) return;

    setSubmitting(true);
    const payload = {
      nombre:         fields.nombre.trim(),
      email:          fields.email.trim(),
      telefono:       fields.telefono.trim() || null,
      direccion:      fields.direccion.trim(),
      fechaRegistro:  fields.fechaRegistro,
    };

    try {
      const url    = editId ? `${API_URL}/${editId}` : API_URL;
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 400) {
        const body = await res.json();
        const msg = body.error || "Error de validación en el servidor.";
        setErrors((prev) => ({ ...prev, email: msg }));
        showToast(msg, "error");
        return;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      showToast(
        editId ? "Cliente actualizado correctamente" : "Cliente registrado correctamente",
        "success"
      );
      resetForm();
      await loadClientes();
    } catch {
      showToast("Error al conectar con el backend. ¿Está corriendo en :8082?", "error");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Edit ───────────────────────────────────────────────────── */
  const handleEdit = (cli) => {
    setEditId(cli.idCliente);
    setFields({
      nombre:        cli.nombre,
      email:         cli.email,
      telefono:      cli.telefono || "",
      direccion:     cli.direccion,
      fechaRegistro: cli.fechaRegistro,
    });
    setErrors({});
    setTouched({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── Delete ─────────────────────────────────────────────────── */
  const handleDelete = async (id, nombre) => {
    const confirmed = await confirmDelete(nombre); // ← reemplaza window.confirm
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast(`"${nombre}" eliminado`, "success");
        loadClientes();
      } else throw new Error();
    } catch {
      showToast("Error al eliminar. ¿Backend activo?", "error");
    }
  };

  /* ── Reset ──────────────────────────────────────────────────── */
  const resetForm = () => {
    setEditId(null);
    setFields(emptyForm());
    setErrors({});
    setTouched({});
  };

  const filtrados = useMemo(() =>
    clientes.filter((c) =>
      c.nombre.toLowerCase().includes(buscar.toLowerCase()) ||
      c.email.toLowerCase().includes(buscar.toLowerCase()) ||
      (c.telefono  || "").toLowerCase().includes(buscar.toLowerCase()) ||
      (c.direccion || "").toLowerCase().includes(buscar.toLowerCase())
    ), [clientes, buscar]);

  const isEditMode = editId !== null;

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="cli-shell">

      {/* ── Header ── */}
      <header className="cli-header">
        <div className="cli-icon">
          <svg viewBox="0 0 24 24">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
          </svg>
        </div>
        <div>
          <div className="cli-title">Gestión de Clientes</div>
          <div className="cli-subtitle">NovaTech E-commerce ®</div>
        </div>
        <span className="cli-badge">{clientes.length} registros</span>
      </header>

      <div className="cli-grid">

        {/* ── Form panel ── */}
        <div className="cli-panel">
          <div className="cli-panel-title">Formulario</div>

          <span className={`mode-indicator ${isEditMode ? "mode-edit" : "mode-create"}`}>
            {isEditMode ? `✎ EDITANDO ID ${editId}` : "● NUEVO CLIENTE"}
          </span>

          {/* Nombre + Fecha row */}
          <div className="form-row-2">
            <div className="field-group">
              <label className="field-label">
                Nombre <span className="field-required">*</span>
              </label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  className={`cli-input${errors.nombre && touched.nombre ? " cli-input--error" : ""}`}
                  type="text"
                  name="nombre"
                  placeholder="Nombre completo"
                  value={fields.nombre}
                  onChange={handleChange}
                />
              </div>
              {errors.nombre && touched.nombre && (
                <p className="error-msg">✕ {errors.nombre}</p>
              )}
            </div>

            <div className="field-group">
              <label className="field-label">
                Fecha de Registro <span className="field-required">*</span>
              </label>
              <input
                className={`cli-input${errors.fechaRegistro && touched.fechaRegistro ? " cli-input--error" : ""}`}
                type="date"
                name="fechaRegistro"
                value={fields.fechaRegistro}
                onChange={handleChange}
              />
              {errors.fechaRegistro && touched.fechaRegistro && (
                <p className="error-msg">✕ {errors.fechaRegistro}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="field-group">
            <label className="field-label">
              Email <span className="field-required">*</span>
            </label>
            <div className="input-wrapper">
              <span className="input-icon">✉</span>
              <input
                className={`cli-input${errors.email && touched.email ? " cli-input--error" : ""}`}
                type="email"
                name="email"
                placeholder="correo@ejemplo.com"
                value={fields.email}
                onChange={handleChange}
              />
            </div>
            {errors.email && touched.email ? (
              <p className="error-msg">✕ {errors.email}</p>
            ) : fields.email && !errors.email && touched.email ? (
              <p className="valid-msg">✓ Email disponible</p>
            ) : null}
          </div>

          {/* Teléfono + Dirección row */}
          <div className="form-row-2">
            <div className="field-group">
              <label className="field-label">Teléfono</label>
              <div className="input-wrapper">
                <span className="input-icon">📞</span>
                <input
                  className={`cli-input${errors.telefono && touched.telefono ? " cli-input--error" : ""}`}
                  type="tel"
                  name="telefono"
                  placeholder="+573001234567"
                  value={fields.telefono}
                  onChange={handleChange}
                />
              </div>
              {errors.telefono && touched.telefono ? (
                <p className="error-msg">✕ {errors.telefono}</p>
              ) : (
                <p className="field-hint">Opcional · +? seguido de 7-20 dígitos</p>
              )}
            </div>

            <div className="field-group">
              <label className="field-label">
                Dirección <span className="field-required">*</span>
              </label>
              <div className="input-wrapper">
                <span className="input-icon">📍</span>
                <input
                  className={`cli-input${errors.direccion && touched.direccion ? " cli-input--error" : ""}`}
                  type="text"
                  name="direccion"
                  placeholder="Calle, número, ciudad"
                  value={fields.direccion}
                  onChange={handleChange}
                />
              </div>
              {errors.direccion && touched.direccion && (
                <p className="error-msg">✕ {errors.direccion}</p>
              )}
            </div>
          </div>

          <div className="btn-row">
            <button
              className="btn btn--primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting && <span className="spinner" />}
              {submitting
                ? "Guardando..."
                : isEditMode
                ? "Actualizar cliente"
                : "Registrar cliente"}
            </button>
            <button className="btn btn--secondary" onClick={resetForm}>
              Limpiar
            </button>
          </div>
        </div>

        {/* ── Info panel ── */}
        <div className="cli-panel cli-panel--alt">
          <div className="cli-panel-title">Información</div>
          <div className="info-text">
            <hr className="info-divider" />
            <div className="info-rule">
              <span className="info-rule-dot">●</span>
              <span><b>Nombre:</b> obligatorio</span>
            </div>
            <div className="info-rule">
              <span className="info-rule-dot">●</span>
              <span><b>Email:</b> obligatorio en formato válido</span>
            </div>
            <div className="info-rule">
              <span className="info-rule-dot">●</span>
              <span><b>Teléfono:</b> opcional </span>
            </div>
            <div className="info-rule">
              <span className="info-rule-dot">●</span>
              <span><b>Dirección:</b> obligatoria</span>
            </div>
            <div className="info-rule">
              <span className="info-rule-dot">●</span>
              <span><b>Fecha registro:</b> obligatoria · se auto-completa con hoy</span>
            </div>
          </div>
          <button className="btn btn--secondary btn--full" onClick={loadClientes}>
            ↻ Actualizar lista
          </button>
        </div>

        {/* ── Table panel ── */}
        <div className="cli-panel cli-panel--full">
          <div className="cli-panel-title">Clientes registrados</div>
          <input
            className="cli-input"
            type="text"
            placeholder="Buscar por nombre, email, teléfono o dirección…"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
          <div className="cli-table-wrapper">
            <table className="cli-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Dirección</th>
                  <th>Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="loading-cell">Cargando clientes...</td>
                  </tr>
                ) : clientes.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state">No hay clientes registrados aún.</div>
                    </td>
                  </tr>
                ) : (
                  filtrados.map((cli) => (
                    <tr key={cli.idCliente}>
                      <td><span className="id-badge">#{cli.idCliente}</span></td>
                      <td className="nombre-cell">{cli.nombre}</td>
                      <td className="email-cell">{cli.email}</td>
                      <td className="muted-cell">{cli.telefono || <span style={{ color: "#2d4a6e" }}>—</span>}</td>
                      <td className="muted-cell">{cli.direccion}</td>
                      <td className="date-cell">{cli.fechaRegistro}</td>
                      <td>
                        <div className="action-cell">
                          <button className="act-btn act-btn--edit" onClick={() => handleEdit(cli)}>
                            Editar
                          </button>
                          <button
                            className="act-btn act-btn--delete"
                            onClick={() => handleDelete(cli.idCliente, cli.nombre)}
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
      </div>

      <ToastContainer toasts={toasts} />
    </div>
  );
}