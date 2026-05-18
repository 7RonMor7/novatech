import { useState, useEffect, useCallback,useMemo } from "react";
import "./Pago.css";
import { confirmDelete } from "../utils/alerts";

/* ── API endpoints ─────────────────────────────────────────────── */
const API_PAGOS   = `${import.meta.env.VITE_API_URL}/pagos`;
const API_PEDIDOS = `${import.meta.env.VITE_API_URL}/pedidos`;

/* ── Enums (mirrors backend) ───────────────────────────────────── */
const METODOS_PAGO = [
  { value: "TARJETA_CREDITO", label: "Tarjeta Crédito", icon: "💳" },
  { value: "TARJETA_DEBITO",  label: "Tarjeta Débito",  icon: "🏧" },
  { value: "EFECTIVO",        label: "Efectivo",        icon: "💵" },
];

const ESTADOS_PAGO = ["PENDIENTE", "APROBADO", "RECHAZADO", "REEMBOLSADO"];

/* ── Demo data ─────────────────────────────────────────────────── */
const DEMO_PEDIDOS = [
  { idPedido: 1, estado: "PENDIENTE",  total: 2800000 },
  { idPedido: 2, estado: "CONFIRMADO", total: 4500000 },
  { idPedido: 3, estado: "ENVIADO",    total: 320000  },
];

const DEMO_PAGOS = [
  {
    idPago: 1,
    fechaPago: "2024-03-10",
    metodoPago: "TARJETA_CREDITO",
    estadoPago: "APROBADO",
    pedido: { idPedido: 2, estado: "CONFIRMADO" },
  },
  {
    idPago: 2,
    fechaPago: "2024-04-01",
    metodoPago: "EFECTIVO",
    estadoPago: "PENDIENTE",
    pedido: { idPedido: 3, estado: "ENVIADO" },
  },
];

/* ── Helpers ───────────────────────────────────────────────────── */
const today = () => new Date().toISOString().split("T")[0];

/* ── Validation ────────────────────────────────────────────────── */
function validate(fields) {
  const errors = {};
  if (!fields.idPedido)    errors.idPedido    = "Debe seleccionar un pedido.";
  if (!fields.metodoPago)  errors.metodoPago  = "Debe seleccionar un método de pago.";
  if (!fields.estadoPago)  errors.estadoPago  = "Debe seleccionar un estado de pago.";
  if (!fields.fechaPago)   errors.fechaPago   = "La fecha de pago es obligatoria.";
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
  idPedido:   "",
  metodoPago: "",
  estadoPago: "PENDIENTE",
  fechaPago:  today(),
});

/* ── Main component ────────────────────────────────────────────── */
export default function Pago() {
  const [pagos,      setPagos]      = useState([]);
  const [pedidos,    setPedidos]    = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toasts,     setToasts]     = useState([]);
  const [demoMode,   setDemoMode]   = useState(false);
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
      const [rPagos, rPedidos] = await Promise.all([
        fetch(API_PAGOS),
        fetch(API_PEDIDOS),
      ]);
      if (!rPagos.ok || !rPedidos.ok) throw new Error();
      const [pag, ped] = await Promise.all([rPagos.json(), rPedidos.json()]);
      setPagos(pag);
      setPedidos(ped);
      setDemoMode(false);
    } catch {
      showToast("Backend no disponible · Mostrando datos de demo", "info");
      setPagos(DEMO_PAGOS);
      setPedidos(DEMO_PEDIDOS);
      setDemoMode(true);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadAll(); }, [loadAll]);

  /* ── Derived: pedidos que ya tienen pago (para deshabilitar en select) ── */
  const pedidosConPago = new Set(
    pagos
      .filter((p) => p.pedido?.idPedido && (!editId || p.idPago !== editId))
      .map((p) => p.pedido.idPedido)
  );

  const selectedPedido = pedidos.find(
    (p) => String(p.idPedido) === String(fields.idPedido)
  );

  const pedidoYaTienePago =
    fields.idPedido &&
    !editId &&
    pedidosConPago.has(parseInt(fields.idPedido, 10));

  /* ── Field change ───────────────────────────────────────────── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const setMetodo = (value) => {
    setFields((prev) => ({ ...prev, metodoPago: value }));
    setTouched((prev) => ({ ...prev, metodoPago: true }));
  };

  const setEstado = (value) => {
    setFields((prev) => ({ ...prev, estadoPago: value }));
    setTouched((prev) => ({ ...prev, estadoPago: true }));
  };

  /* ── Submit ─────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    const allTouched = { idPedido: true, metodoPago: true, estadoPago: true, fechaPago: true };
    setTouched(allTouched);
    const currentErrors = validate(fields);
    setErrors(currentErrors);
    if (Object.keys(currentErrors).length > 0) return;

    if (pedidoYaTienePago) {
      showToast("Este pedido ya tiene un pago registrado (relación 1:1).", "error");
      return;
    }

    setSubmitting(true);

    // On create: backend expects pedido as nested object with idPedido
    // On edit: only fechaPago, metodoPago, estadoPago are updated (pedido FK stays)
    const payload = editId
      ? {
          fechaPago:  fields.fechaPago,
          metodoPago: fields.metodoPago,
          estadoPago: fields.estadoPago,
          // backend savePago re-validates pedido on PUT — keep the existing one
          pedido: { idPedido: parseInt(fields.idPedido, 10) },
        }
      : {
          fechaPago:  fields.fechaPago,
          metodoPago: fields.metodoPago,
          estadoPago: fields.estadoPago,
          pedido:     { idPedido: parseInt(fields.idPedido, 10) },
        };

    try {
      const url    = editId ? `${API_PAGOS}/${editId}` : API_PAGOS;
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 400) {
        const body = await res.json().catch(() => ({}));
        showToast(body.error || "Error de negocio: revisa los datos.", "error");
        return;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      showToast(
        editId ? "Pago actualizado correctamente" : "Pago registrado correctamente",
        "success"
      );
      resetForm();
      await loadAll();
    } catch {
      showToast("Error al conectar con el backend. ¿Está corriendo en :8082?", "error");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Edit ───────────────────────────────────────────────────── */
  const handleEdit = (pago) => {
    setEditId(pago.idPago);
    setFields({
      idPedido:   String(pago.pedido?.idPedido ?? ""),
      metodoPago: pago.metodoPago ?? "",
      estadoPago: pago.estadoPago ?? "PENDIENTE",
      fechaPago:  pago.fechaPago  ?? today(),
    });
    setErrors({});
    setTouched({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── Delete ─────────────────────────────────────────────────── */
  const handleDelete = async (id) => {
    const confirmed = await confirmDelete(`Pago #${id}`); // ← reemplaza window.confirm
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_PAGOS}/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast(`Pago #${id} eliminado`, "success");
        await loadAll();
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

  const isEditMode = editId !== null;

  const filtrados = useMemo(() =>
    pagos.filter((p) => {
      const q = buscar.toLowerCase();
      return (
        String(p.idPago).includes(q) ||
        String(p.pedido?.idPedido ?? "").includes(q) ||
        (p.metodoPago  || "").toLowerCase().includes(q) ||
        (p.estadoPago  || "").toLowerCase().includes(q) ||
        (p.fechaPago   || "").toLowerCase().includes(q)
      );
    }), [pagos, buscar]);

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="pago-shell">

      {/* ── Header ── */}
      <header className="pago-header">
        <div className="pago-icon">
          <svg viewBox="0 0 24 24">
            <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
          </svg>
        </div>
        <div>
          <div className="pago-title">Gestión de Pagos</div>
          <div className="pago-subtitle">NovaTech E-commerce ®</div>
        </div>
        <span className="pago-badge">{pagos.length} registros</span>
      </header>

      <div className="pago-grid">

        {/* ── Form panel ── */}
        <div className="pago-panel">
          <div className="pago-panel-title">Formulario</div>

          <span className={`mode-indicator ${isEditMode ? "mode-edit" : "mode-create"}`}>
            {isEditMode ? `✎ EDITANDO PAGO #${editId}` : "● NUEVO PAGO"}
          </span>

          {/* Pedido selector */}
          <div className="field-group">
            <label className="field-label">
              Pedido <span className="field-required">*</span>
            </label>
            <select
              className={`pago-select${errors.idPedido && touched.idPedido ? " pago-select--error" : ""}`}
              name="idPedido"
              value={fields.idPedido}
              onChange={handleChange}
              disabled={isEditMode}
            >
              <option value="">— Seleccionar pedido —</option>
              {pedidos.map((p) => {
                const yaTienePago = pedidosConPago.has(p.idPedido);
                return (
                  <option
                    key={p.idPedido}
                    value={p.idPedido}
                    disabled={yaTienePago}
                  >
                    #{p.idPedido} · {p.estado}
                    {yaTienePago ? " ✓ (ya tiene pago)" : ""}
                  </option>
                );
              })}
            </select>

            {errors.idPedido && touched.idPedido && (
              <p className="error-msg">✕ {errors.idPedido}</p>
            )}

            {/* Pedido ya tiene pago warning */}
            {pedidoYaTienePago && (
              <div className="pedido-already-paid">
                ⛔ Este pedido ya tiene un pago registrado. La relación es 1:1.
              </div>
            )}

            {/* Pedido preview */}
            {selectedPedido && !pedidoYaTienePago && (
              <div className="pedido-preview">
                <span className="pedido-preview-dot" />
                Pedido #{selectedPedido.idPedido} — Estado: {selectedPedido.estado}
                {selectedPedido.total ? ` · Total: $${selectedPedido.total?.toLocaleString("es-CO")}` : ""}
              </div>
            )}

            {isEditMode && (
              <p className="field-hint">FK no editable — el pedido asociado no puede cambiar</p>
            )}
          </div>

          {/* Fecha pago + Estado row */}
          <div className="form-row-2">
            <div className="field-group">
              <label className="field-label">
                Fecha de Pago <span className="field-required">*</span>
              </label>
              <input
                className={`pago-input${errors.fechaPago && touched.fechaPago ? " pago-input--error" : ""}`}
                type="date"
                name="fechaPago"
                value={fields.fechaPago}
                onChange={handleChange}
              />
              {errors.fechaPago && touched.fechaPago && (
                <p className="error-msg">✕ {errors.fechaPago}</p>
              )}
            </div>

            <div className="field-group">
              <label className="field-label">
                Estado del Pago <span className="field-required">*</span>
              </label>
              <div className="estado-pills">
                {ESTADOS_PAGO.map((est) => (
                  <button
                    key={est}
                    type="button"
                    className={`estado-pill estado-pill--${est}${fields.estadoPago === est ? " selected" : ""}`}
                    onClick={() => setEstado(est)}
                  >
                    {est}
                  </button>
                ))}
              </div>
              {errors.estadoPago && touched.estadoPago && (
                <p className="error-msg">✕ {errors.estadoPago}</p>
              )}
            </div>
          </div>

          {/* Método de pago cards */}
          <div className="field-group">
            <label className="field-label">
              Método de Pago <span className="field-required">*</span>
            </label>
            <div className="method-cards">
              {METODOS_PAGO.map((m) => (
                <div
                  key={m.value}
                  className={`method-card${fields.metodoPago === m.value ? " selected" : ""}`}
                  onClick={() => setMetodo(m.value)}
                >
                  <span className="method-card-icon">{m.icon}</span>
                  <span className="method-card-label">{m.label}</span>
                </div>
              ))}
            </div>
            {errors.metodoPago && touched.metodoPago && (
              <p className="method-error">✕ {errors.metodoPago}</p>
            )}
          </div>

          <div className="btn-row">
            <button
              className="btn btn--primary"
              onClick={handleSubmit}
              disabled={submitting || pedidoYaTienePago}
            >
              {submitting && <span className="spinner" />}
              {submitting
                ? "Guardando..."
                : isEditMode
                ? "Actualizar pago"
                : "Registrar pago"}
            </button>
            <button className="btn btn--secondary" onClick={resetForm}>
              Limpiar
            </button>
          </div>
        </div>

        {/* ── Info panel ── */}
        <div className="pago-panel pago-panel--alt">
          <div className="pago-panel-title">Información</div>
          <div className="info-text">
            <hr className="info-divider" />
            <div className="info-rule">
              <span className="info-rule-dot">●</span>
              <span>Un pedido solo puede tener un pago</span>
            </div>
            <div className="info-rule">
              <span className="info-rule-dot">●</span>
              <span>Los pedidos <b>ya pagados</b> aparecen deshabilitados en el selector</span>
            </div>
            <div className="info-rule">
              <span className="info-rule-dot">●</span>
              <span><b>Metodo de Pago:</b> TARJETA DE CREDITO · TARJETA DE DEBITO · EFECTIVO</span>
            </div>
            <div className="info-rule">
              <span className="info-rule-dot">●</span>
              <span><b>Estado de Pago:</b> PENDIENTE · APROBADO · RECHAZADO · REEMBOLSADO</span>
            </div>
            <div className="info-rule">
              <span className="info-rule-dot">●</span>
              <span>Fecha de pago se auto-completa con la fecha de hoy</span>
            </div>
          </div>
          <button className="btn btn--secondary btn--full" onClick={loadAll}>
            ↻ Actualizar todo
          </button>
        </div>

        {/* ── Table panel ── */}
        <div className="pago-panel pago-panel--full">
          <div className="pago-panel-title">Pagos registrados</div>
          <input
            className="pago-input"
            type="text"
            placeholder="Buscar por pedido, método, estado o fecha…"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />

          <div className="pago-table-wrapper">
            <table className="pago-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Pedido</th>
                  <th>Fecha Pago</th>
                  <th>Método</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="loading-cell">Cargando pagos...</td>
                  </tr>
                ) : pagos.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state">No hay pagos registrados aún.</div>
                    </td>
                  </tr>
                ) : (
                  filtrados.map((pago) => {
                    const metodoInfo = METODOS_PAGO.find((m) => m.value === pago.metodoPago);
                    return (
                      <tr key={pago.idPago}>
                        <td><span className="id-badge">#{pago.idPago}</span></td>
                        <td>
                          <span className="ref-badge">
                            Pedido #{pago.pedido?.idPedido ?? "—"}
                          </span>
                        </td>
                        <td className="date-cell">{pago.fechaPago}</td>
                        <td>
                          <span className="method-badge">
                            {metodoInfo?.icon ?? "💰"} {metodoInfo?.label ?? pago.metodoPago}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge status-badge--${pago.estadoPago}`}>
                            {pago.estadoPago}
                          </span>
                        </td>
                        <td>
                          <div className="action-cell">
                            <button className="act-btn act-btn--edit" onClick={() => handleEdit(pago)}>
                              Editar
                            </button>
                            <button
                              className="act-btn act-btn--delete"
                              onClick={() => handleDelete(pago.idPago)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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