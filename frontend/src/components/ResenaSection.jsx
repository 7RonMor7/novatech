import { useState, useEffect } from 'react';
import './ResenaSection.css';

function Estrellas({ valor, soloLectura = false, onChange }) {
  const [hover, setHover] = useState(0);

  if (soloLectura) {
    return (
      <div className="estrellas">
        {[1, 2, 3, 4, 5].map((e) => (
          <span key={e} className={`estrella estrella--sm ${e <= valor ? 'estrella--on' : ''}`}>★</span>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="estrellas-picker">
        {[1, 2, 3, 4, 5].map((e) => (
          <span
            key={e}
            className={`estrella-pick ${e <= (hover || valor) ? 'estrella-pick--on' : ''}`}
            onClick={() => onChange(e)}
            onMouseEnter={() => setHover(e)}
            onMouseLeave={() => setHover(0)}
          >★</span>
        ))}
      </div>
      <div className="pick-hint">
        {valor > 0 ? `${valor} / 5 seleccionado` : 'Sin calificación'}
      </div>
    </div>
  );
}

const iniciales = (nombre) =>
  nombre ? nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '?';

export default function ResenaSection({ clientes = [] }) {
  const [resenas, setResenas]           = useState([]);
  const [resumen, setResumen]           = useState(null);
  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario]     = useState('');
  const [idCliente, setIdCliente]       = useState('');
  const [enviando, setEnviando]         = useState(false);
  const [mensaje, setMensaje]           = useState('');

  const cargar = async () => {
    try {
      const [r1, r2] = await Promise.all([
        fetch('http://localhost:8082/resenas'),
        fetch('http://localhost:8082/resenas/resumen'),
      ]);
      if (r1.ok) setResenas(await r1.json());
      if (r2.ok) setResumen(await r2.json());
    } catch {
      console.error('Error cargando reseñas');
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleEnviar = async () => {
    if (calificacion === 0) return setMensaje('⚠️ Selecciona una calificación');
    if (!idCliente)         return setMensaje('⚠️ Selecciona tu nombre');
    setEnviando(true);
    try {
      const res = await fetch('http://localhost:8082/resenas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calificacion, comentario, idCliente: Number(idCliente) }),
      });
      if (res.ok) {
        setMensaje('✅ Reseña publicada correctamente');
        setCalificacion(0);
        setComentario('');
        setIdCliente('');
        cargar();
      } else {
        const err = await res.json();
        setMensaje(`❌ ${err.message || 'Error al publicar la reseña'}`);
      }
    } catch {
      setMensaje('❌ Error de conexión con el servidor');
    } finally {
      setEnviando(false);
      setTimeout(() => setMensaje(''), 4000);
    }
  };

  const getDistribucion = (estrella) => {
    if (!resumen?.distribucion || resumen.total === 0) return 0;
    const fila = resumen.distribucion.find(d => d[0] === estrella);
    return fila ? Math.round((Number(fila[1]) / resumen.total) * 100) : 0;
  };

  const tipoMensaje = mensaje.startsWith('✅') ? 'toast-inline--success'
                    : mensaje.startsWith('⚠️') ? 'toast-inline--warn'
                    : 'toast-inline--error';

  return (
    <section className="resena-section">

      {/* ── Encabezado ── */}
      <div className="resena-header">
        <div className="resena-icon">⭐</div>
        <div>
          <div className="resena-title">Calificaciones y opiniones</div>
          <div className="resena-subtitle">Lo que dicen nuestros clientes</div>
        </div>
        <span className="resena-badge">{resumen?.total ?? 0} reseñas</span>
      </div>

      <div className="resena-grid">

        {/* ── Panel resumen ── */}
        <div className="resena-panel">
          <div className="resena-panel-title">Resumen general</div>
          <div className="resena-resumen">

            <div>
              <div className="resena-promedio-num">{resumen?.promedio ?? '—'}</div>
              <Estrellas valor={Math.round(resumen?.promedio ?? 0)} soloLectura />
              <div className="resena-promedio-label">de 5 posibles</div>
            </div>

            <div className="barra-dist">
              {[5, 4, 3, 2, 1].map((n) => (
                <div key={n} className="barra-fila">
                  <span className="barra-label">{n}</span>
                  <span className="barra-estrella">★</span>
                  <div className="barra-track">
                    <div className="barra-fill" style={{ width: `${getDistribucion(n)}%` }} />
                  </div>
                  <span className="barra-pct">{getDistribucion(n)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Panel formulario ── */}
        <div className="resena-panel">
          <div className="resena-panel-title">Dejar una reseña</div>

          <div className="field-group">
            <label className="field-label">
              Calificación <span style={{ color: 'var(--red-400)' }}>*</span>
            </label>
            <Estrellas valor={calificacion} onChange={setCalificacion} />
          </div>

          <div className="field-group">
            <label className="field-label">
              Cliente <span style={{ color: 'var(--red-400)' }}>*</span>
            </label>
            <select
              className="cat-select"
              value={idCliente}
              onChange={e => setIdCliente(e.target.value)}
            >
              <option value="">— Selecciona tu nombre —</option>
              {clientes.map(c => (
                <option key={c.idCliente} value={c.idCliente}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label className="field-label">Comentario</label>
            <textarea
              className="cat-textarea"
              value={comentario}
              onChange={e => setComentario(e.target.value)}
              placeholder="Escribe tu opinión (opcional)..."
              maxLength={500}
            />
            <div className="char-counter">{comentario.length} / 500</div>
          </div>

          <div className="btn-row">
            <button
              className="btn btn--secondary"
              onClick={() => { setCalificacion(0); setComentario(''); setIdCliente(''); setMensaje(''); }}
            >
              Limpiar
            </button>
            <button
              className="btn btn--primary"
              onClick={handleEnviar}
              disabled={enviando}
            >
              {enviando ? 'Publicando...' : 'Publicar reseña'}
            </button>
          </div>

          {mensaje && (
            <div className={`toast-inline ${tipoMensaje}`}>
              <span className="toast-dot" />
              {mensaje.replace(/^[✅❌⚠️]\s*/, '')}
            </div>
          )}
        </div>

        {/* ── Panel lista de reseñas ── */}
        <div className="resena-panel resena-panel--full">
          <div className="resena-panel-title">Opiniones recientes</div>

          {resenas.length === 0 ? (
            <div className="resena-empty">Aún no hay reseñas. ¡Sé el primero en opinar!</div>
          ) : (
            <div className="resena-lista">
              {resenas.slice(0, 5).map(r => (
                <div key={r.idResena} className="resena-item">
                  <div className="resena-item-header">
                    <div className="resena-cliente">
                      <div className="resena-avatar">{iniciales(r.cliente?.nombre)}</div>
                      <span className="resena-nombre">{r.cliente?.nombre}</span>
                      <Estrellas valor={r.calificacion} soloLectura />
                    </div>
                    <span className="resena-fecha">
                      {new Date(r.fechaResena).toLocaleDateString('es-CO')}
                    </span>
                  </div>
                  {r.comentario && (
                    <p className="resena-comentario">{r.comentario}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}