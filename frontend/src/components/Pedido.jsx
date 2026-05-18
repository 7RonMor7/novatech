import { useState, useEffect, useCallback, useMemo } from "react";
import "./Pedido.css";
import { confirmDelete } from "../utils/alerts";

/* ── API endpoints ─────────────────────────────────────────────── */
const API_PEDIDOS  = `${import.meta.env.VITE_API_URL}/pedidos`;
const API_CLIENTES = `${import.meta.env.VITE_API_URL}/clientes`;

/* ── Enums (mirrors backend EstadoPedido) ──────────────────────── */
const ESTADOS = ["PENDIENTE", "CONFIRMADO", "ENTREGADO", "CANCELADO"];

/* ── Demo data ─────────────────────────────────────────────────── */
const DEMO_CLIENTES = [
  { idCliente: 1, nombre: "Valentina Torres", email: "v.torres@email.com" },
  { idCliente: 2, nombre: "Andrés Ramírez",   email: "a.ramirez@email.com" },
  { idCliente: 3, nombre: "Camila Gómez",     email: "c.gomez@email.com" },
];

const DEMO_PEDIDOS = [
  {
    idPedido: 1,
    fecha: "2024-03-10",
    total: 2800000,
    estado: "CONFIRMADO",
    cliente: { idCliente: 1, nombre: "Valentina Torres" },
  },
  {
    idPedido: 2,
    fecha: "2024-04-15",
    total: 320000,
    estado: "PENDIENTE",
    cliente: { idCliente: 3, nombre: "Camila Gómez" },
  },
  {
    idPedido: 3,
    fecha: "2024-05-02",
    total: 4500000,
    estado: "ENTREGADO",
    cliente: { idCliente: 2, nombre: "Andrés Ramírez" },
  },
];

/* ── Helpers ───────────────────────────────────────────────────── */
const today = () => new Date().toISOString().split("T")[0];

const fmt = (val) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(val);

/* ── Validation (mirrors backend constraints) ──────────────────── */
function validate(fields) {
  const errors = {};

  if (!fields.idCliente)
    errors.idCliente = "Debe seleccionar un cliente.";

  if (!fields.fecha)
    errors.fecha = "La fecha del pedido es obligatoria.";

  const total = parseFloat(fields.total);
  if (!fields.total || isNaN(total))
    errors.total = "El total es obligatorio.";
  else if (total <= 0)
    errors.total = "El total debe ser mayor a 0.";
  else if (!/^\d{1,8}(\.\d{0,2})?$/.test(fields.total))
    errors.total = "Máximo 8 dígitos enteros y 2 decimales. @Digits(8,2)";

  if (!fields.estado)
    errors.estado = "El estado del pedido es obligatorio.";

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

/* ── Empty form ────────────────────────────────────────────────── */
const emptyForm = () => ({
  idCliente: "",
  fecha:     today(),
  total:     "",
  estado:    "PENDIENTE",
});

/* ── Main component ────────────────────────────────────────────── */
export default function Pedido() {
  const [pedidos,    setPedidos]    = useState([]);
  const [clientes,   setClientes]   = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toasts,     setToasts]     = useState([]);
  const [buscar,     setBuscar]     = useState("");

  const [editId,  setEditId]  = useState(null);
  const [fields,  setFields]  = useState(emptyForm());
  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});

  /* ── Toast util ─────────────────────────────────────────────── */
  const showToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3400);
  }, []);

  /* ── Live validation ────────────────────────────────────────── */
  useEffect(() => {
    if (Object.keys(touched).length > 0) setErrors(validate(fields));
  }, [fields, touched]);

  /* ── Load all data ──────────────────────────────────────────── */
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [rPed, rCli] = await Promise.all([
        fetch(API_PEDIDOS),
        fetch(API_CLIENTES),
      ]);
      if (!rPed.ok || !rCli.ok) throw new Error();
      const [ped, cli] = await Promise.all([rPed.json(), rCli.json()]);
      setPedidos(ped);
      setClientes(cli);
    } catch {
      showToast("Backend no disponible · Mostrando datos de demo", "info");
      setPedidos(DEMO_PEDIDOS);
      setClientes(DEMO_CLIENTES);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadAll(); }, [loadAll]);

  /* ── Field change ───────────────────────────────────────────── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const setEstado = (value) => {
    setFields((prev) => ({ ...prev, estado: value }));
    setTouched((prev) => ({ ...prev, estado: true }));
  };

  /* ── Submit ─────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    const allTouched = { idCliente: true, fecha: true, total: true, estado: true };
    setTouched(allTouched);
    const currentErrors = validate(fields);
    setErrors(currentErrors);
    if (Object.keys(currentErrors).length > 0) return;

    setSubmitting(true);

    // On create: send cliente as nested object (backend resolves FK)
    // On edit:   only fecha, total, estado are updated → PUT keeps existing cliente
    const payload = editId
      ? {
          fecha:  fields.fecha,
          total:  parseFloat(parseFloat(fields.total).toFixed(2)),
          estado: fields.estado,
          // backend PUT re-uses found.setXxx so cliente not needed, but we send it for safety
          cliente: { idCliente: parseInt(fields.idCliente, 10) },
        }
      : {
          fecha:   fields.fecha,
          total:   parseFloat(parseFloat(fields.total).toFixed(2)),
          estado:  fields.estado,
          cliente: { idCliente: parseInt(fields.idCliente, 10) },
        };

    // Reemplaza tu bloque try/catch del handleSubmit por este
    try {
        const url    = editId ? `${API_PEDIDOS}/${editId}` : API_PEDIDOS;
        const method = editId ? "PUT" : "POST";

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        // ── Mostrar el cuerpo del error en consola ──────────────────
        if (!res.ok) {
            const errorBody = await res.text(); // text() en vez de json() por si no es JSON
            console.error("❌ Error del backend:", res.status, errorBody);
            showToast(`Error ${res.status}: ${errorBody}`, "error");
            return;
        }

        showToast(
            editId ? "Pedido actualizado correctamente" : "Pedido creado correctamente",
            "success"
        );
        resetForm();
        await loadAll();

    } catch (err) {
        console.error("❌ Error de red:", err);
        showToast("Error al conectar con el backend.", "error");
    } finally {
        setSubmitting(false);
    }
  };

  /* ── Edit ───────────────────────────────────────────────────── */
  const handleEdit = (ped) => {
    setEditId(ped.idPedido);
    setFields({
      idCliente: String(ped.cliente?.idCliente ?? ""),
      fecha:     ped.fecha ?? today(),
      total:     String(ped.total),
      estado:    ped.estado ?? "PENDIENTE",
    });
    setErrors({});
    setTouched({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── Delete ─────────────────────────────────────────────────── */
  const handleDelete = async (id) => {
    const confirmed = await confirmDelete(`Pedido #${id}`); // ← reemplaza window.confirm
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_URL_PROD}/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast(`Pedido #${id} eliminado`, "success");
        loadData();
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

  /* ── Derived ────────────────────────────────────────────────── */
  const isEditMode      = editId !== null;
  const selectedCliente = clientes.find((c) => String(c.idCliente) === String(fields.idCliente));
  const totalNum        = parseFloat(fields.total);
  const totalValido     = !isNaN(totalNum) && totalNum > 0;

  // Stats for summary card
  const totalPedidos   = pedidos.length;
  const totalFacturado = pedidos.reduce((acc, p) => acc + parseFloat(p.total ?? 0), 0);
  const pendientes     = pedidos.filter((p) => p.estado === "PENDIENTE").length;

  const filtrados = useMemo(() =>
    pedidos.filter((p) => {
      const q = buscar.toLowerCase();
      return (
        String(p.idPedido).includes(q) ||
        (p.cliente?.nombre || "").toLowerCase().includes(q) ||
        (p.estado  || "").toLowerCase().includes(q) ||
        (p.fecha   || "").toLowerCase().includes(q) ||
        String(p.total).includes(q)
      );
    }), [pedidos, buscar]);

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="ped-shell">

      {/* ── Header ── */}
      <header className="ped-header">
        <div className="ped-icon">
          <svg viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" />
          </svg>
        </div>
        <div>
          <div className="ped-title">Gestión de Pedidos</div>
          <div className="ped-subtitle">NovaTech E-commerce ®</div>
        </div>
        <span className="ped-badge">{pedidos.length} registros</span>
      </header>

      <div className="ped-grid">

        {/* ── Form panel ── */}
        <div className="ped-panel">
          <div className="ped-panel-title">Formulario</div>

          <span className={`mode-indicator ${isEditMode ? "mode-edit" : "mode-create"}`}>
            {isEditMode ? `✎ EDITANDO PEDIDO #${editId}` : "● NUEVO PEDIDO"}
          </span>

          {/* Cliente selector */}
          <div className="field-group">
            <label className="field-label">
              Cliente <span className="field-required">*</span>
            </label>
            <select
              className={`ped-select${errors.idCliente && touched.idCliente ? " ped-select--error" : ""}`}
              name="idCliente"
              value={fields.idCliente}
              onChange={handleChange}
              disabled={isEditMode}
            >
              <option value="">— Seleccionar cliente —</option>
              {clientes.map((c) => (
                <option key={c.idCliente} value={c.idCliente}>
                  #{c.idCliente} · {c.nombre}
                </option>
              ))}
            </select>

            {errors.idCliente && touched.idCliente && (
              <p className="error-msg">✕ {errors.idCliente}</p>
            )}

            {selectedCliente && (
              <div className="cliente-preview">
                <span className="cliente-preview-name">👤 {selectedCliente.nombre}</span>
                <span className="cliente-preview-meta">
                  ✉ {selectedCliente.email}
                  {selectedCliente.telefono ? ` · 📞 ${selectedCliente.telefono}` : ""}
                </span>
              </div>
            )}

            {isEditMode && (
              <p className="field-hint">FK no editable — el cliente no puede cambiar en un pedido existente</p>
            )}
          </div>

          {/* Fecha + Total row */}
          <div className="form-row-2">
            <div className="field-group">
              <label className="field-label">
                Fecha del Pedido <span className="field-required">*</span>
              </label>
              <input
                className={`ped-input${errors.fecha && touched.fecha ? " ped-input--error" : ""}`}
                type="date"
                name="fecha"
                value={fields.fecha}
                onChange={handleChange}
              />
              {errors.fecha && touched.fecha && (
                <p className="error-msg">✕ {errors.fecha}</p>
              )}
              <p className="field-hint">@CreationTimestamp · auto-set en creación</p>
            </div>

            <div className="field-group">
              <label className="field-label">
                Total <span className="field-required">*</span>
              </label>
              <div className="total-wrapper">
                <span className="total-prefix">$</span>
                <input
                  className={`ped-input${errors.total && touched.total ? " ped-input--error" : ""}`}
                  type="number"
                  name="total"
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  value={fields.total}
                  onChange={handleChange}
                />
              </div>
              {errors.total && touched.total && (
                <p className="error-msg">✕ {errors.total}</p>
              )}
              {totalValido && !errors.total && (
                <p className="field-hint">{fmt(totalNum)}</p>
              )}
            </div>
          </div>

          {/* Estado stepper */}
          <div className="field-group">
            <label className="field-label">
              Estado del Pedido <span className="field-required">*</span>
            </label>
            <div className="estado-stepper">
              {ESTADOS.map((est) => (
                <div
                  key={est}
                  className={`estado-step estado-step--${est}${fields.estado === est ? " active" : ""}`}
                  onClick={() => setEstado(est)}
                >
                  {est}
                </div>
              ))}
            </div>
            {errors.estado && touched.estado && (
              <p className="error-msg">✕ {errors.estado}</p>
            )}
          </div>

          {/* Summary card */}
          <div className="summary-card">
            <div>
              <div className="summary-item-label">Total pedidos</div>
              <div className="summary-item-value">{totalPedidos}</div>
            </div>
            <div>
              <div className="summary-item-label">Pendientes</div>
              <div className="summary-item-value">{pendientes}</div>
            </div>
            <div>
              <div className="summary-item-label">Facturado</div>
              <div className="summary-item-value" style={{ fontSize: "11px" }}>
                {fmt(totalFacturado)}
              </div>
            </div>
          </div>

          <div className="btn-row">
            <button
                className="btn btn--primary"
                onClick={handleSubmit}
                disabled={submitting}
            >
                {submitting ? (
                    <>
                        <span className="spinner" />
                        Guardando...
                    </>
                ) : (
                    isEditMode ? "Actualizar pedido" : "Crear pedido"
                )}
            </button>
            <button className="btn btn--secondary" onClick={resetForm}>
              Limpiar
            </button>
          </div>
        </div>

        {/* ── Info panel ── */}
        <div className="ped-panel ped-panel--alt">
          <div className="ped-panel-title">Información</div>
          <div className="info-text">
            <hr className="info-divider" />
            <div className="info-rule">
              <span className="info-rule-dot">●</span>
              <span><b>Cliente:</b> debe existir en BD</span>
            </div>
            <div className="info-rule">
              <span className="info-rule-dot">●</span>
              <span><b>Fecha:</b> se auto-completa con hoy</span>
            </div>
            <div className="info-rule">
              <span className="info-rule-dot">●</span>
              <span><b>Estado:</b> PENDIENTE · CONFIRMADO · ENTREGADO · CANCELADO</span>
            </div>
          </div>
          <button className="btn btn--secondary btn--full" onClick={loadAll}>
            ↻ Actualizar todo
          </button>
        </div>

        {/* ── Table panel ── */}
        <div className="ped-panel ped-panel--full">
          <div className="ped-panel-title">Pedidos registrados</div>
          <input
            className="ped-input"
            type="text"
            placeholder="Buscar por cliente, estado, fecha o total…"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
          <div className="ped-table-wrapper">
            <table className="ped-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="loading-cell">Cargando pedidos...</td>
                  </tr>
                ) : pedidos.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state">No hay pedidos registrados aún.</div>
                    </td>
                  </tr>
                ) : (
                  filtrados.map((ped) => (
                    <tr key={ped.idPedido}>
                      <td><span className="id-badge">#{ped.idPedido}</span></td>
                      <td>
                        <span className="ref-badge">
                          {ped.cliente?.nombre ?? `#${ped.cliente?.idCliente}`}
                        </span>
                      </td>
                      <td className="date-cell">{ped.fecha}</td>
                      <td className="total-cell">{fmt(ped.total)}</td>
                      <td>
                        <span className={`estado-badge estado-badge--${ped.estado}`}>
                          {ped.estado}
                        </span>
                      </td>
                      <td>
                        <div className="action-cell">
                          <button className="act-btn act-btn--edit" onClick={() => handleEdit(ped)}>
                            Editar
                          </button>
                          <button
                            className="act-btn act-btn--delete"
                            onClick={() => handleDelete(ped.idPedido)}
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