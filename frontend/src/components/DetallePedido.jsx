import { useState, useEffect, useCallback, useMemo } from "react";
import "./DetallePedido.css";
import { confirmDelete } from "../utils/alerts";

/* ── API endpoints ─────────────────────────────────────────────── */
const API_DETALLES  = "http://localhost:8082/detalles";
const API_PEDIDOS   = "http://localhost:8082/pedidos";
const API_PRODUCTOS = "http://localhost:8082/productos";

/* ── Constantes de stock (deben coincidir con Producto.java) ───── */
const STOCK_MINIMO = 4;
const STOCK_MAXIMO = 30;

/* ── Demo fallback data ────────────────────────────────────────── */
const DEMO_PEDIDOS = [
  { idPedido: 1, estado: "PENDIENTE" },
  { idPedido: 2, estado: "ENVIADO"   },
  { idPedido: 3, estado: "ENTREGADO" },
];

const DEMO_PRODUCTOS = [
  { idProducto: 1, nombre: "Laptop HP Pavilion",    precio: 2800000, stock: 10 },
  { idProducto: 2, nombre: "iPhone 15 Pro",         precio: 4500000, stock: 5 },
  { idProducto: 3, nombre: "Teclado Mecánico RGB",  precio: 320000,  stock: 25 },
];

const DEMO_DETALLES = [
  {
    idDetalle: 1,
    cantidad: 2,
    precioUnitario: 2800000,
    pedido:   { idPedido: 1, estado: "PENDIENTE" },
    producto: { idProducto: 1, nombre: "Laptop HP Pavilion", stock : 10 },
  },
  {
    idDetalle: 2,
    cantidad: 1,
    precioUnitario: 4500000,
    pedido:   { idPedido: 2, estado: "ENVIADO" },
    producto: { idProducto: 2, nombre: "iPhone 15 Pro", stock : 5 },
  },
];

/* ── Helpers ───────────────────────────────────────────────────── */
const fmt = (val) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(val);

const calcSubtotal = (cantidad, precio) => {
  const q = parseFloat(cantidad);
  const p = parseFloat(precio);
  if (!isNaN(q) && !isNaN(p) && q > 0 && p > 0) return q * p;
  return null;
};

/** Unidades realmente disponibles para venta = stock - STOCK_MINIMO */
const stockDisponibleParaVenta = (stock) => Math.max((stock ?? 0) - STOCK_MINIMO, 0);
 
/** Color del indicador según nivel de stock */
const stockColor = (disponible) => {
  if (disponible <= 0)  return "#ef4444"; // rojo  — sin stock vendible
  if (disponible <= 3)  return "#f59e0b"; // ámbar — stock bajo
  return "#10b981";                        // verde — stock OK
};

/* ── Validation (mirrors backend constraints) ──────────────────── */
function validate(fields, selectedProducto) {
  const errors = {};
 
  if (!fields.idPedido)
    errors.idPedido = "Debe seleccionar un pedido.";
 
  if (!fields.idProducto)
    errors.idProducto = "Debe seleccionar un producto.";
 
  const qty = parseInt(fields.cantidad, 10);
  if (!fields.cantidad || isNaN(qty))
    errors.cantidad = "La cantidad es obligatoria.";
  else if (qty < 1)
    errors.cantidad = "La cantidad debe ser al menos 1.";
  // Validación de stock mínimo en el frontend (espejo de la regla del backend)
  else if (selectedProducto) {
    const disponible = stockDisponibleParaVenta(selectedProducto.stock);
    if (qty > disponible)
      errors.cantidad = `Stock insuficiente. Máx. disponible para venta: ${disponible} unidad(es) (se reservan ${STOCK_MINIMO} unidades mínimas).`;
  }
 
  const price = parseFloat(fields.precioUnitario);
  if (!fields.precioUnitario || isNaN(price))
    errors.precioUnitario = "El precio unitario es obligatorio.";
  else if (price <= 0)
    errors.precioUnitario = "El precio debe ser mayor a 0.";
  else if (!/^\d{1,8}(\.\d{0,2})?$/.test(fields.precioUnitario))
    errors.precioUnitario = "Máximo 8 dígitos enteros y 2 decimales.";
 
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

/* ── Indicador de stock disponible ────────────────────────────── */
function StockIndicator({ producto }) {
  if (!producto) return null;
 
  const disponible = stockDisponibleParaVenta(producto.stock);
  const color      = stockColor(disponible);
  const porcentaje = Math.min((disponible / (STOCK_MAXIMO - STOCK_MINIMO)) * 100, 100);
 
  return (
    <div className="stock-indicator">
      <div className="stock-indicator__header">
        <span className="stock-indicator__label">Stock disponible para venta</span>
        <span className="stock-indicator__value" style={{ color }}>
          {disponible} ud.
        </span>
      </div>
 
      {/* Barra de progreso */}
      <div className="stock-bar">
        <div
          className="stock-bar__fill"
          style={{ width: `${porcentaje}%`, backgroundColor: color }}
        />
      </div>
 
      <div className="stock-indicator__meta">
        <span>Stock total: {producto.stock}</span>
        <span>Reserva mínima: {STOCK_MINIMO} · Máx: {STOCK_MAXIMO}</span>
      </div>
 
      {disponible === 0 && (
        <p className="stock-indicator__warning">
          ⛔ Sin unidades disponibles para la venta (stock en nivel mínimo de reserva).
        </p>
      )}
      {disponible > 0 && disponible <= 3 && (
        <p className="stock-indicator__warning stock-indicator__warning--amber">
          ⚠ Stock bajo. Solo quedan {disponible} unidad(es) disponibles.
        </p>
      )}
    </div>
  );
}

/* ── Empty form ────────────────────────────────────────────────── */
const emptyForm = () => ({
  idPedido:       "",
  idProducto:     "",
  cantidad:       "",
  precioUnitario: "",
});

/* ── Main component ────────────────────────────────────────────── */
export default function DetallePedido() {
  const [detalles,   setDetalles]   = useState([]);
  const [pedidos,    setPedidos]    = useState([]);
  const [productos,  setProductos]  = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toasts,     setToasts]     = useState([]);
  const [demoMode,   setDemoMode]   = useState(false);
  const [buscar,     setBuscar]     = useState("");

  const [editId,   setEditId]   = useState(null);
  const [fields,   setFields]   = useState(emptyForm());
  const [errors,   setErrors]   = useState({});
  const [touched,  setTouched]  = useState({});

  /* ── Toast util ─────────────────────────────────────────────── */
  const showToast = useCallback((message, type = "info", duration = 4500) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  /* ── Field change ───────────────────────────────────────────── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  /* ── Derived: producto seleccionado en el formulario ─────────── */
  const selectedProducto = productos.find((p) => String(p.idProducto) === fields.idProducto);
  const selectedPedido   = pedidos.find((p)   => String(p.idPedido)   === fields.idPedido);

  /* ── Auto-fill price from selected product ──────────────────── */
  useEffect(() => {
    if (fields.idProducto && !editId) {
      const prod = productos.find((p) => String(p.idProducto) === String(fields.idProducto));
      if (prod?.precio) {
        setFields((prev) => ({ ...prev, precioUnitario: String(prod.precio) }));
      }
    }
  }, [fields.idProducto, productos, editId]);

  /* ── Live validation ────────────────────────────────────────── */
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      setErrors(validate(fields, selectedProducto));
    }
  }, [fields, touched, selectedProducto]);

  /* ── Fetch all needed data ──────────────────────────────────── */
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [rDet, rPed, rProd] = await Promise.all([
        fetch(API_DETALLES),
        fetch(API_PEDIDOS),
        fetch(API_PRODUCTOS),
      ]);

      if (!rDet.ok || !rPed.ok || !rProd.ok) throw new Error();

      const [det, ped, prod] = await Promise.all([
        rDet.json(),
        rPed.json(),
        rProd.json(),
      ]);

      setDetalles(det);
      setPedidos(ped);
      setProductos(prod);
      setDemoMode(false);
    } catch {
      showToast("Backend no disponible · Mostrando datos de demo", "info");
      setDetalles(DEMO_DETALLES);
      setPedidos(DEMO_PEDIDOS);
      setProductos(DEMO_PRODUCTOS);
      setDemoMode(true);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadAll(); }, [loadAll]);

  /* ── Submit ─────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    const allTouched = { idPedido: true, idProducto: true, cantidad: true, precioUnitario: true };
    setTouched(allTouched);
    const currentErrors = validate(fields, selectedProducto);
    setErrors(currentErrors);
    if (Object.keys(currentErrors).length > 0) return;

    setSubmitting(true);

    // Backend expects nested objects with just the ID
    const payload = {
      cantidad:       parseInt(fields.cantidad, 10),
      precioUnitario: parseFloat(parseFloat(fields.precioUnitario).toFixed(2)),
      pedido:         { idPedido:   parseInt(fields.idPedido,   10) },
      producto:       { idProducto: parseInt(fields.idProducto, 10) },
    };

    try {
      const url    = editId ? `${API_DETALLES}/${editId}` : API_DETALLES;
      const method = editId ? "PUT" : "POST";

      // On edit, backend only updates cantidad and precioUnitario
      const editPayload = editId
        ? { cantidad: payload.cantidad, precioUnitario: payload.precioUnitario }
        : payload;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editPayload),
      });

      // ── 404: pedido o producto no encontrado ─────────────────
      if (res.status === 404) {
        const body = await res.json().catch(() => ({}));
        showToast(body.error || "Pedido o producto no encontrado en BD.", "error");
        return;
      }

      // ── 409: stock insuficiente (StockInsuficienteException) ─
      if (res.status === 409) {
        const body = await res.json().catch(() => ({}));
        showToast(body.error || "Stock insuficiente para realizar el detalle.", "error", 6000);
        return;
      }

      if (res.status === 400) {
        const body = await res.json().catch(() => ({}));
        showToast(body.error || body.message || "Error de validación. Revisa los datos enviados.", "error");
        return;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // ── Éxito: el backend devuelve { detalle, mensaje } ──────
      // (POST → 201, PUT → 200)
      const data = await res.json();

      // El campo "mensaje" trae el stock restante informativo del backend
      const mensajeBackend = data.mensaje || (editId ? "Detalle actualizado correctamente" : "Detalle creado correctamente");
      showToast(mensajeBackend, "success", 6000);

      resetForm();
      await loadAll();

    } catch {
      showToast("Error al conectar con el backend. ¿Está corriendo en :8082?", "error");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Edit ───────────────────────────────────────────────────── */
  const handleEdit = (det) => {
    setEditId(det.idDetalle);
    setFields({
      idPedido:       String(det.pedido?.idPedido   ?? ""),
      idProducto:     String(det.producto?.idProducto ?? ""),
      cantidad:       String(det.cantidad),
      precioUnitario: String(det.precioUnitario),
    });
    setErrors({});
    setTouched({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── Delete ─────────────────────────────────────────────────── */
  const handleDelete = async (id) => {
    const confirmed = await confirmDelete(`Detalle #${id}`); // ← reemplaza window.confirm
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_DETALLES}/${id}`, { method: "DELETE" });

      if (res.status === 404) {
        const body = await res.json().catch(() => ({}));
        showToast(body.error || `Detalle #${id} no encontrado.`, "error");
        return;
      }
 
      if (res.ok) {
        showToast(`Detalle #${id} eliminado y stock devuelto al producto.`, "success");
        await loadAll();
      } else {
        throw new Error();
      }
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
  const isEditMode = editId !== null;
  const subtotal   = calcSubtotal(fields.cantidad, fields.precioUnitario);

  const filtrados = useMemo(() =>
    detalles.filter((d) => {
      const q = buscar.toLowerCase();
      return (
        String(d.idDetalle).includes(q) ||
        String(d.pedido?.idPedido ?? "").includes(q) ||
        (d.producto?.nombre ?? "").toLowerCase().includes(q) ||
        String(d.cantidad).includes(q)
      );
    }), [detalles, buscar]);

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="dp-shell">

      {/* ── Header ── */}
      <header className="dp-header">
        <div className="dp-icon">
          <svg viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
          </svg>
        </div>
        <div>
          <div className="dp-title">Gestión de Detalles de Pedido</div>
          <div className="dp-subtitle">NovaTech E-commerce ®</div>
        </div>
        <span className="dp-badge">{detalles.length} registros</span>
      </header>

      <div className="dp-grid">

        {/* ── Form panel ── */}
        <div className="dp-panel">
          <div className="dp-panel-title">Formulario</div>

          <span className={`mode-indicator ${isEditMode ? "mode-edit" : "mode-create"}`}>
            {isEditMode ? `✎ EDITANDO DETALLE #${editId}` : "● NUEVO DETALLE"}
          </span>

          {demoMode && (
            <div className="fk-warning">
              ⚠ Los selectores muestran datos de demo. Conecta el backend para usar IDs reales.
            </div>
          )}

          {/* FK selectors row */}
          <div className="form-row-2">

            {/* Pedido selector */}
            <div className="field-group">
              <label className="field-label">
                Pedido <span className="field-required">*</span>
              </label>
              <select
                className={`dp-select${errors.idPedido && touched.idPedido ? " dp-select--error" : ""}`}
                name="idPedido"
                value={fields.idPedido}
                onChange={handleChange}
                disabled={isEditMode}
              >
                <option value="">— Seleccionar pedido —</option>
                {pedidos.map((p) => (
                  <option key={p.idPedido} value={p.idPedido}>
                    #{p.idPedido} · {p.estado ?? "Pedido"}
                  </option>
                ))}
              </select>
              {errors.idPedido && touched.idPedido && (
                <p className="error-msg">✕ {errors.idPedido}</p>
              )}
              {selectedPedido && (
                <div className="select-preview">
                  <span className="select-preview-dot" />
                  Pedido #{selectedPedido.idPedido} — {selectedPedido.estado}
                </div>
              )}
              {isEditMode && (
                <p className="field-hint">FK no editable — crea un nuevo detalle para cambiar el pedido</p>
              )}
            </div>

            {/* Producto selector */}
            <div className="field-group">
              <label className="field-label">
                Producto <span className="field-required">*</span>
              </label>
              <select
                className={`dp-select${errors.idProducto && touched.idProducto ? " dp-select--error" : ""}`}
                name="idProducto"
                value={fields.idProducto}
                onChange={handleChange}
                disabled={isEditMode}
              >
                <option value="">— Seleccionar producto —</option>
                {productos.map((p) => (
                  <option key={p.idProducto} value={p.idProducto}>
                    #{p.idProducto} · {p.nombre}
                  </option>
                ))}
              </select>
              {errors.idProducto && touched.idProducto && (
                <p className="error-msg">✕ {errors.idProducto}</p>
              )}
              {selectedProducto && (
                <div className="select-preview">
                  <span className="select-preview-dot" />
                  {selectedProducto.nombre}
                  {selectedProducto.precio && ` · ${fmt(selectedProducto.precio)}`}
                </div>
              )}
              {isEditMode && (
                <p className="field-hint">FK no editable — crea un nuevo detalle para cambiar el producto</p>
              )}
            </div>
          </div>

          {/* ── Indicador de stock ──────────────────────────────── */}
          {selectedProducto && !isEditMode && (
            <StockIndicator producto={selectedProducto} />
          )}

          {/* Cantidad + Precio row */}
          <div className="form-row-2">
            <div className="field-group">
              <label className="field-label">
                Cantidad <span className="field-required">*</span>
              </label>
              <input
                className={`dp-input${errors.cantidad && touched.cantidad ? " dp-input--error" : ""}`}
                type="number"
                name="cantidad"
                placeholder="Ej. 2"
                min="1"
                // Limitar el máximo en el input al stock disponible para venta
                max={selectedProducto ? stockDisponibleParaVenta(selectedProducto.stock) : undefined}
                step="1"
                value={fields.cantidad}
                onChange={handleChange}
              />
              {errors.cantidad && touched.cantidad && (
                <p className="error-msg">✕ {errors.cantidad}</p>
              )}
              <p className="field-hint">
                Mínimo 1 unidad 
                {selectedProducto && !isEditMode
                  ? ` · Máx. disponible: ${stockDisponibleParaVenta(selectedProducto.stock)} ud.`
                  : " · @Min(1)"}
              </p>
            </div>

            <div className="field-group">
              <label className="field-label">
                Precio Unitario <span className="field-required">*</span>
              </label>
              <input
                className={`dp-input${errors.precioUnitario && touched.precioUnitario ? " dp-input--error" : ""}`}
                type="number"
                name="precioUnitario"
                placeholder="Ej. 2800000.00"
                min="0.01"
                step="0.01"
                value={fields.precioUnitario}
                onChange={handleChange}
              />
              {errors.precioUnitario && touched.precioUnitario && (
                <p className="error-msg">✕ {errors.precioUnitario}</p>
              )}
              <p className="field-hint">Auto-completado desde producto · máx 8 enteros, 2 decimales</p>
            </div>
          </div>

          {/* Subtotal preview */}
          <div className="subtotal-card">
            <span className="subtotal-label">Subtotal calculado</span>
            {subtotal !== null ? (
              <span className="subtotal-value">{fmt(subtotal)}</span>
            ) : (
              <span className="subtotal-empty">—</span>
            )}
          </div>

          <div className="btn-row">
            <button
              className="btn btn--primary"
              onClick={handleSubmit}
              disabled={submitting || (!isEditMode && selectedProducto && stockDisponibleParaVenta(selectedProducto.stock) === 0)}
            >
              {submitting && <span className="spinner" />}
              {submitting
                ? "Guardando..."
                : isEditMode
                ? "Actualizar detalle"
                : "Crear detalle"}
            </button>
            <button className="btn btn--secondary" onClick={resetForm}>
              Limpiar
            </button>
          </div>
        </div>

        {/* ── Info panel ── */}
        <div className="dp-panel dp-panel--alt">
          <div className="dp-panel-title">Información</div>
          <div className="info-text">
            <hr className="info-divider" />
            <div className="info-rule">
              <span className="info-rule-dot">●</span>
              <span><b>Pedido:</b> debe existir en BD</span>
            </div>
            <div className="info-rule">
              <span className="info-rule-dot">●</span>
              <span><b>Producto:</b> debe existir en BD</span>
            </div>
            <div className="info-rule">
              <span className="info-rule-dot">●</span>
              <span><b>Cantidad:</b> debe ser un entero positivo</span>
            </div>
            <div className="info-rule">
              <span className="info-rule-dot" style={{ color: "#ef4444" }}>●</span>
              <span><b>Stock mínimo de reserva:</b> {STOCK_MINIMO} unidades</span>
            </div>
            <div className="info-rule">
              <span className="info-rule-dot">●</span>
              <span>Al editar solo se actualizan <b>cantidad</b> y <b>precioUnitario</b></span>
            </div>
            <div className="info-rule">
              <span className="info-rule-dot">●</span>
              <span>El precio se auto-completa al seleccionar un producto</span>
            </div>
          </div>
          <button className="btn btn--secondary btn--full" onClick={loadAll}>
            ↻ Actualizar todo
          </button>
        </div>

        {/* ── Table panel ── */}
        <div className="dp-panel dp-panel--full">
          <div className="dp-panel-title">Detalles registrados</div>
          <input
            className="dp-input"
            type="text"
            placeholder="Buscar por ID, pedido, producto o cantidad…"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
          <div className="dp-table-wrapper">
            <table className="dp-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Pedido</th>
                  <th>Producto</th>
                  <th>Stock disp.</th>
                  <th>Cantidad</th>
                  <th>Precio Unit.</th>
                  <th>Subtotal</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="loading-cell">Cargando detalles...</td>
                  </tr>
                ) : detalles.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="empty-state">No hay detalles de pedido registrados aún.</div>
                    </td>
                  </tr>
                ) : (
                  filtrados.map((det) => {
                    const sub = det.cantidad * parseFloat(det.precioUnitario);
                    const disponible = stockDisponibleParaVenta(det.producto?.stock);
                    const color      = stockColor(disponible);
                    return (
                      <tr key={det.idDetalle}>
                        <td><span className="id-badge">#{det.idDetalle}</span></td>
                        <td>
                          <span className="ref-badge">
                            Pedido #{det.pedido?.idPedido ?? "—"}
                          </span>
                        </td>
                        <td>
                          <span className="ref-badge">
                            {det.producto?.nombre ?? `#${det.producto?.idProducto}`}
                          </span>
                        </td>
                        {/* Columna de stock disponible actual del producto */}
                        <td style={{ textAlign: "center" }}>
                          <span
                            style={{
                              fontWeight: 600,
                              color,
                              fontSize: "0.85rem",
                            }}
                          >
                            {det.producto?.stock !== undefined ? `${disponible} ud.` : "—"}
                          </span>
                        </td>
                        <td className="qty-cell">×{det.cantidad}</td>
                        <td className="price-cell">{fmt(det.precioUnitario)}</td>
                        <td className="subtotal-cell">{fmt(sub)}</td>
                        <td>
                          <div className="action-cell">
                            <button className="act-btn act-btn--edit" onClick={() => handleEdit(det)}>
                              Editar
                            </button>
                            <button
                              className="act-btn act-btn--delete"
                              onClick={() => handleDelete(det.idDetalle)}
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