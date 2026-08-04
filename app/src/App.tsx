import { useEffect, useMemo, useState } from "react";
import { marked } from "marked";
import { TECNICAS, tecnicaPorId } from "@shared/engine/graph.js";
import { armarRuta } from "@shared/engine/path.js";
import type { Dificultad, PerfilUsuario, Receta } from "@shared/types.js";
import {
  defaultPerfil,
  loadPerfil,
  resetPerfil,
  savePerfil,
} from "./storage.js";

function estrellas(n: number): string {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

interface LeccionState {
  recetaId: number;
  loading: boolean;
  contenido: string | null;
  error: string | null;
  tecnica: string;
  evaluacion?: {
    preguntas: Array<{
      pregunta: string;
      opciones: string[];
      correcta: number;
      explicacion: string;
    }>;
  };
  variaciones?: {
    variaciones: Array<{
      nombre: string;
      cambio: string;
      desafio: string;
      nivel: number;
    }>;
  };
  fueCacheada?: boolean;
}

export default function App() {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [mostrarOnboarding, setMostrarOnboarding] = useState(false);
  const [vistaActual, setVistaActual] = useState<'dashboard' | 'ruta' | 'recetas'>('dashboard');
  const [tecnicasSeleccionadas, setTecnicasSeleccionadas] = useState<Set<string>>(new Set());
  const [busqueda, setBusqueda] = useState<string>("");
  const [expandida, setExpandida] = useState<number | null>(null);
  const [leccionModal, setLeccionModal] = useState<LeccionState | null>(null);

  useEffect(() => {
    async function cargar() {
      const perfilGuardado = loadPerfil();
      if (perfilGuardado) {
        setPerfil(perfilGuardado);
      } else {
        setMostrarOnboarding(true);
      }

      try {
        let res = await fetch("/api/recetas");
        if (!res.ok) res = await fetch("/ensulugar.json");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: { recetas: Receta[] } = await res.json();
        setRecetas(data.recetas);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, []);

  function actualizarPerfil(next: PerfilUsuario) {
    setPerfil(next);
    savePerfil(next);
  }

  function completarReceta(r: Receta) {
    if (!perfil) return;
    const tecnicasDominadas = new Set(perfil.tecnicasDominadas);
    for (const t of r.tecnicas) tecnicasDominadas.add(t);
    const recetasCompletadas = new Set(perfil.recetasCompletadas);
    recetasCompletadas.add(r.id);
    const nuevo: PerfilUsuario = {
      ...perfil,
      tecnicasDominadas: Array.from(tecnicasDominadas),
      recetasCompletadas: Array.from(recetasCompletadas),
    };
    actualizarPerfil(nuevo);
  }

  function reiniciarProgreso() {
    if (!confirm("¿Seguro que querés borrar tu progreso?")) return;
    resetPerfil();
    const limpio = defaultPerfil();
    setPerfil(limpio);
    setMostrarOnboarding(true);
  }

  const ruta = useMemo(() => {
    if (!perfil) return [];
    return armarRuta(perfil, recetas);
  }, [recetas, perfil]);

  const tecnicasOrdenadas = useMemo(
    () => TECNICAS.map((t) => t.id).sort(),
    [],
  );

  const recetasFiltradas = useMemo(() => {
    const q = normalizar(busqueda.trim());
    const tecnicasArray = Array.from(tecnicasSeleccionadas);
    return recetas.filter((r) => {
      const matchTecnica =
        tecnicasArray.length === 0 ||
        tecnicasArray.some((t) => r.tecnicas.includes(t));
      const matchBusqueda =
        q === "" ||
        normalizar(r.titulo).includes(q) ||
        normalizar(r.categoria).includes(q) ||
        r.tecnicas.some((t) => normalizar(t).includes(q));
      return matchTecnica && matchBusqueda;
    });
  }, [recetas, tecnicasSeleccionadas, busqueda]);

  function toggleTecnica(id: string) {
    setTecnicasSeleccionadas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function limpiarFiltros() {
    setTecnicasSeleccionadas(new Set());
    setBusqueda("");
  }

  function renderLeccionMarkdown(texto: string) {
    const html = marked.parse(texto, { async: false }) as string;
    return { __html: html };
  }

  function renderLeccionMarkdown(texto: string) {
    const html = marked.parse(texto, { async: false }) as string;
    return { __html: html };
  }

  async function generarLeccionParaReceta(receta: Receta) {
    setLeccionModal({
      recetaId: receta.id,
      loading: true,
      contenido: null,
      error: null,
      tecnica: receta.tecnicas[0] ?? "Técnica",
    });
    try {
      const bodyPerfil = perfil ?? defaultPerfil();
      const res = await fetch("/api/leccion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recetaId: receta.id, perfil: bodyPerfil }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? data.detail ?? `HTTP ${res.status}`);
      setLeccionModal({
        recetaId: receta.id,
        loading: false,
        contenido: data.leccion.contenido,
        error: null,
        tecnica: data.leccion.tecnica,
        evaluacion: data.leccion.evaluacion,
        variaciones: data.leccion.variaciones,
        fueCacheada: data.fueCacheada,
      });
    } catch (err) {
      setLeccionModal({
        recetaId: receta.id,
        loading: false,
        contenido: null,
        error: err instanceof Error ? err.message : String(err),
        tecnica: receta.tecnicas[0] ?? "Técnica",
      });
    }
  }

  function guardarOnboarding(p: PerfilUsuario) {
    actualizarPerfil(p);
    setMostrarOnboarding(false);
  }

  if (mostrarOnboarding) {
    return (
      <OnboardingScreen
        tecnicas={TECNICAS}
        onGuardar={guardarOnboarding}
        onSaltar={() => guardarOnboarding(defaultPerfil())}
      />
    );
  }

  if (loading) return <div className="loading">Cargando recetas…</div>;
  if (error)
    return (
      <div className="error">
        Error cargando recetas: {error}. Asegurate de tener el server corriendo{" "}
        <code>npm run dev:server</code> y de haber corrido{" "}
        <code>npm run build:content</code>.
      </div>
    );

  const perfilActivo = perfil ?? defaultPerfil();
  const progresoTecnicas = perfilActivo.tecnicasDominadas.length;
  const progresoRecetas = perfilActivo.recetasCompletadas.length;
  const siguientePaso = ruta[0];

  if (vistaActual === 'dashboard') {
    return (
      <DashboardView
        perfil={perfilActivo}
        ruta={ruta}
        recetas={recetas}
        siguientePaso={siguientePaso}
        onContinuar={() => {
          if (siguientePaso) {
            setTecnicasSeleccionadas(new Set([siguientePaso.tecnicaId]));
            setVistaActual('recetas');
          }
        }}
        onVerRuta={() => setVistaActual('ruta')}
        onVerRecetas={() => setVistaActual('recetas')}
        onReiniciar={reiniciarProgreso}
      />
    );
  }

  if (vistaActual === 'ruta') {
    return (
      <>
        <header className="app-header">
          <h1>Tu Ruta de Aprendizaje</h1>
          <button className="btn-link" onClick={() => setVistaActual('dashboard')}>← Volver al dashboard</button>
        </header>
        <RutaView ruta={ruta} perfil={perfilActivo} onSeleccionarTecnica={(id) => {
          setTecnicasSeleccionadas(new Set([id]));
          setVistaActual('recetas');
        }} />
      </>
    );
  }

  // vistaActual === 'recetas'
  return (
    <>
      <header className="app-header">
        <h1>Recetas</h1>
        <button className="btn-link" onClick={() => setVistaActual('dashboard')}>← Volver al dashboard</button>
      </header>
      <RecetasView
        recetasFiltradas={recetasFiltradas}
        tecnicasSeleccionadas={tecnicasSeleccionadas}
        toggleTecnica={toggleTecnica}
        limpiarFiltros={limpiarFiltros}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        perfilActivo={perfilActivo}
        completarReceta={completarReceta}
        expandida={expandida}
        setExpandida={setExpandida}
        leccionModal={leccionModal}
        generarLeccionParaReceta={generarLeccionParaReceta}
        tecnicasOrdenadas={tecnicasOrdenadas}
        renderLeccionMarkdown={renderLeccionMarkdown}
      />
    </>
  );
}

interface DashboardProps {
  perfil: PerfilUsuario;
  ruta: PasoRuta[];
  recetas: Receta[];
  siguientePaso: PasoRuta | undefined;
  onContinuar: () => void;
  onVerRuta: () => void;
  onVerRecetas: () => void;
  onReiniciar: () => void;
}

function DashboardView({ perfil, ruta, recetas, siguientePaso, onContinuar, onVerRuta, onVerRecetas, onReiniciar }: DashboardProps) {
  const progresoTecnicas = perfil.tecnicasDominadas.length;
  const progresoRecetas = perfil.recetasCompletadas.length;
  const porcentajeTecnicas = Math.round((progresoTecnicas / TECNICAS.length) * 100);
  const porcentajeRecetas = Math.round((progresoRecetas / recetas.length) * 100);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Bienvenido{perfil.objetivo ? `, ${perfil.objetivo.split(' ')[0]}` : ''} 👋</h1>
        <p className="dashboard-subtitle">Tu progreso hacia el nivel {perfil.nivel}</p>
      </header>

      <section className="progress-cards">
        <div className="progress-card">
          <div className="progress-value">{progresoTecnicas}/{TECNICAS.length}</div>
          <div className="progress-label">Técnicas dominadas</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${porcentajeTecnicas}%` }} />
          </div>
        </div>
        <div className="progress-card">
          <div className="progress-value">{progresoRecetas}/{recetas.length}</div>
          <div className="progress-label">Recetas completadas</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${porcentajeRecetas}%` }} />
          </div>
        </div>
        <div className="progress-card">
          <div className="progress-value">Nivel {perfil.nivel}</div>
          <div className="progress-label">Objetivo</div>
          <div className="level-stars">{estrellas(perfil.nivel)}</div>
        </div>
      </section>

      {siguientePaso && (
        <section className="next-step-card">
          <h2>¿Qué sigue?</h2>
          <div className="next-step-content">
            <div className="next-step-icon">🎯</div>
            <div className="next-step-info">
              <div className="next-step-title">{tecnicaPorId.get(siguientePaso.tecnicaId)?.nombre ?? siguientePaso.nombre}</div>
              <div className="next-step-meta">Nivel {siguientePaso.nivel} {estrellas(siguientePaso.nivel)}</div>
              <div className="next-step-actions">
                <button className="btn-primary" onClick={onContinuar}>Continuar aprendiendo</button>
                <button className="btn-secondary" onClick={onVerRuta}>Ver toda tu ruta ({ruta.length} técnicas)</button>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="quick-actions">
        <h2>Accesos rápidos</h2>
        <div className="action-grid">
          <button className="action-card" onClick={onVerRecetas}>
            <div className="action-icon">📖</div>
            <div className="action-label">Explorar recetas</div>
          </button>
          <button className="action-card" onClick={onVerRuta}>
            <div className="action-icon">🗺️</div>
            <div className="action-label">Ver ruta completa</div>
          </button>
          <button className="action-card" onClick={onReiniciar}>
            <div className="action-icon">🔄</div>
            <div className="action-label">Reiniciar progreso</div>
          </button>
        </div>
      </section>
    </div>
  );
}

interface RutaViewProps {
  ruta: PasoRuta[];
  perfil: PerfilUsuario;
  onSeleccionarTecnica: (id: string) => void;
}

function RutaView({ ruta, perfil, onSeleccionarTecnica }: RutaViewProps) {
  if (ruta.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🎉</div>
        <h2>¡Completaste todas las técnicas!</h2>
        <p>No quedan técnicas por aprender a este nivel. Subí el nivel objetivo o agregá más contenido.</p>
      </div>
    );
  }

  return (
    <section className="ruta-section">
      <ol className="path-list-numbered">
        {ruta.map((paso, i) => {
          const t = tecnicaPorId.get(paso.tecnicaId);
          return (
            <li
              key={paso.tecnicaId}
              className="path-item-numbered"
              onClick={() => onSeleccionarTecnica(paso.tecnicaId)}
              title="Click para ver recetas de esta técnica"
            >
              <span className="path-number">{i + 1}</span>
              <span className="path-name">{t?.nombre ?? paso.tecnicaId}</span>
              <span className="path-level">{estrellas(paso.nivel)}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

interface QuizQuestionProps {
  question: {
    pregunta: string;
    opciones: string[];
    correcta: number;
    explicacion: string;
  };
}

function QuizQuestion({ question }: QuizQuestionProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  
  const isCorrect = selected !== null && selected === question.correcta;
  
  function handleSelect(idx: number) {
    if (selected !== null) return; // ya seleccionó
    setSelected(idx);
    setShowExplanation(true);
  }
  
  return (
    <div className="quiz-question">
      <div className="question-text">{question.pregunta}</div>
      <div className="options-grid">
        {question.opciones.map((opcion, idx) => {
          let stateClass = "";
          if (selected !== null) {
            if (idx === question.correcta) stateClass = " correct";
            else if (idx === selected) stateClass = " incorrect";
          }
          
          return (
            <button
              key={idx}
              className={`option-btn${stateClass}`}
              onClick={() => handleSelect(idx)}
              disabled={selected !== null}
            >
              {opcion}
            </button>
          );
        })}
      </div>
      {showExplanation && (
        <div className={`explanation ${isCorrect ? "correct" : "incorrect"}`}>
          {isCorrect ? "✅ ¡Correcto! " : "❌ Incorrecto. "}
          {question.explicacion}
        </div>
      )}
    </div>
  );
}

interface RecetasViewProps {
  recetasFiltradas: Receta[];
  tecnicasSeleccionadas: Set<string>;
  toggleTecnica: (id: string) => void;
  limpiarFiltros: () => void;
  busqueda: string;
  setBusqueda: (s: string) => void;
  perfilActivo: PerfilUsuario;
  completarReceta: (r: Receta) => void;
  expandida: number | null;
  setExpandida: (id: number | null) => void;
  leccionModal: LeccionState | null;
  generarLeccionParaReceta: (r: Receta) => void;
  tecnicasOrdenadas: string[];
  renderLeccionMarkdown: (texto: string) => { __html: string };
}

function RecetasView({
  recetasFiltradas,
  tecnicasSeleccionadas,
  toggleTecnica,
  limpiarFiltros,
  busqueda,
  setBusqueda,
  perfilActivo,
  completarReceta,
  expandida,
  setExpandida,
  leccionModal,
  generarLeccionParaReceta,
  tecnicasOrdenadas,
  renderLeccionMarkdown,
}: RecetasViewProps) {
  return (
    <div>
      <div className="filters">
        <div className="filter-group">
          <label htmlFor="nivel">Nivel objetivo</label>
          <select
            id="nivel"
            value={perfilActivo.nivel}
            onChange={(e) => {
              // actualizarPerfil se maneja en el padre
            }}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                Nivel {n} {estrellas(n)}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group filter-wide">
          <label htmlFor="busqueda">Buscar receta, categoría o técnica</label>
          <input
            id="busqueda"
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="ej. arroz, cuchillo, salsa..."
          />
        </div>
      </div>

      <section className="tecnica-filter">
        <div className="tecnica-filter-header">
          <span>Filtrar por técnica</span>
          {tecnicasSeleccionadas.size > 0 && (
            <button className="btn-link" onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
          )}
        </div>
        <div className="tecnica-chips">
          {tecnicasOrdenadas.map((id) => {
            const t = tecnicaPorId.get(id);
            const seleccionada = tecnicasSeleccionadas.has(id);
            const dominada = perfilActivo.tecnicasDominadas.includes(id);
            return (
              <button
                key={id}
                className={
                  "tecnica-chip" +
                  (seleccionada ? " selected" : "") +
                  (dominada ? " mastered" : "")
                }
                onClick={() => toggleTecnica(id)}
                title={t?.descripcion ?? id}
              >
                {t?.nombre ?? id}
                {dominada && <span className="mastered-badge">✓</span>}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2>
          Recetas{" "}
          <span className="count">({recetasFiltradas.length})</span>
        </h2>
        {recetasFiltradas.length === 0 ? (
          <p className="empty">
            No hay recetas que coincidan. Probá con otros filtros.
          </p>
        ) : (
          <div className="recipe-grid">
            {recetasFiltradas.map((r) => {
              const completada = perfilActivo.recetasCompletadas.includes(r.id);
              return (
                <article
                  key={r.id}
                  className={"recipe-card" + (completada ? " completed" : "")}
                >
                  <h2>
                    {completada && <span className="completed-badge">✓</span>}
                    {r.titulo}
                  </h2>
                  <div className="recipe-meta">
                    <span>{estrellas(r.dificultad)}</span>
                    <span>{r.tiempoTotalMinutos} min</span>
                    <span>{r.porciones} porciones</span>
                    <span className="recipe-category">{r.categoria}</span>
                  </div>
                  <div className="recipe-tags">
                    {r.tecnicas.map((t) => {
                      const info = tecnicaPorId.get(t);
                      const seleccionada = tecnicasSeleccionadas.has(t);
                      return (
                        <button
                          key={t}
                          className={
                            "tag tecnica-tag" + (seleccionada ? " selected" : "")
                          }
                          onClick={() => toggleTecnica(t)}
                          title={info?.descripcion ?? t}
                        >
                          {info?.nombre ?? t}
                        </button>
                      );
                    })}
                  </div>
                  <p className="recipe-description">{r.descripcionCorta}</p>

                  <div className="recipe-actions">
                    <button
                      className="btn-toggle"
                      onClick={() =>
                        setExpandida(expandida === r.id ? null : r.id)
                      }
                    >
                      {expandida === r.id
                        ? "Ocultar detalles ▲"
                        : "Ver detalles ▼"}
                    </button>
                    <button
                      className="btn-lesson"
                      onClick={() => generarLeccionParaReceta(r)}
                      disabled={leccionModal?.recetaId === r.id && leccionModal?.loading}
                    >
                      {leccionModal?.recetaId === r.id && leccionModal?.loading
                        ? "Generando lección…"
                        : "Generar lección con IA"}
                    </button>
                    <button
                      className={
                        "btn-complete" + (completada ? " completed" : "")
                      }
                      onClick={() => completarReceta(r)}
                      disabled={completada}
                    >
                      {completada ? "Completada" : "Marcar como completada"}
                    </button>
                  </div>

                  {expandida === r.id && (
                    <>
                      <div className="ingredients">
                        <h3>Ingredientes</h3>
                        <ul>
                          {r.ingredientes.map((ing, i) => (
                            <li key={i}>
                              {ing.cantidad} {ing.nombre}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="steps">
                        <h3>Pasos</h3>
                        <ol>
                          {r.pasos.map((p) => (
                            <li key={p.orden} className="step">
                              {p.instruccion}
                              {p.nota && (
                                <span className="step-note">{p.nota}</span>
                              )}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal de Lección IA */}
      {leccionModal && (
        <div className="modal-overlay" onClick={() => setLeccionModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setLeccionModal(null)} aria-label="Cerrar modal">
              ✕
            </button>
            <div className="modal-header">
              <h2>
                Lección: {leccionModal.tecnica}
                {leccionModal.fueCacheada && (
                  <span className="badge-cached" title="Lección cacheada">⚡</span>
                )}
              </h2>
              {leccionModal.loading && (
                <span className="loading-inline">Generando…</span>
              )}
            </div>
            {leccionModal.error && (
              <div className="lesson-error">{leccionModal.error}</div>
            )}
            {leccionModal.contenido && (
              <div
                className="lesson-content markdown-body"
                dangerouslySetInnerHTML={renderLeccionMarkdown(leccionModal.contenido)}
              />
            )}
            
            {leccionModal.evaluacion && !leccionModal.loading && (
              <div className="quiz-section">
                <h4>📝 Ponete a prueba</h4>
                {leccionModal.evaluacion.preguntas.map((q, idx) => (
                  <QuizQuestion key={idx} question={q} />
                ))}
              </div>
            )}
            
            {leccionModal.variaciones && !leccionModal.loading && (
              <div className="variations-section">
                <h4>🔀 Variaciones para practicar</h4>
                <div className="variations-grid">
                  {leccionModal.variaciones.variaciones.map((v, idx) => (
                    <div key={idx} className="variation-card">
                      <div className="variation-name">{v.nombre}</div>
                      <div className="variation-change">{v.cambio}</div>
                      <div className="variation-challenge">{v.desafio}</div>
                      <div className="variation-level">Nivel {v.nivel} {estrellas(v.nivel)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface OnboardingProps {
  tecnicas: { id: string; nombre: string; descripcion: string; nivelBase: Dificultad }[];
  onGuardar: (p: PerfilUsuario) => void;
  onSaltar: () => void;
}

function OnboardingScreen({ tecnicas, onGuardar, onSaltar }: OnboardingProps) {
  const [nombre, setNombre] = useState("");
  const [nivel, setNivel] = useState<Dificultad>(1);
  const [dominadas, setDominadas] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setDominadas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function guardar() {
    onGuardar({
      nivel,
      tecnicasDominadas: Array.from(dominadas),
      recetasCompletadas: [],
      objetivo: nombre ? `Aprender a cocinar mejor, ${nombre}` : undefined,
    });
  }

  return (
    <div className="onboarding">
      <h1>Bienvenido a EnSuLugar</h1>
      <p className="onboarding-sub">
        Armá tu perfil para que la ruta de aprendizaje se adapte a vos.
      </p>

      <div className="onboarding-section">
        <label htmlFor="nombre">Tu nombre (opcional)</label>
        <input
          id="nombre"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Gonzo"
        />
      </div>

      <div className="onboarding-section">
        <label htmlFor="nivel-obj">¿Hasta qué nivel querés llegar?</label>
        <select
          id="nivel-obj"
          value={nivel}
          onChange={(e) => setNivel(Number(e.target.value) as Dificultad)}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              Nivel {n} {estrellas(n)} —{" "}
              {n === 1
                ? "Principiante"
                : n === 3
                  ? "Intermedio"
                  : n === 5
                    ? "Avanzado"
                    : "En progreso"}
            </option>
          ))}
        </select>
      </div>

      <div className="onboarding-section">
        <label>¿Qué técnicas ya dominás? ( marcá las que sepas hacer con confianza )</label>
        <div className="tecnica-chips">
          {tecnicas.map((t) => (
            <button
              key={t.id}
              className={
                "tecnica-chip" + (dominadas.has(t.id) ? " selected" : "")
              }
              onClick={() => toggle(t.id)}
              title={t.descripcion}
            >
              {t.nombre} {estrellas(t.nivelBase)}
            </button>
          ))}
        </div>
      </div>

      <div className="onboarding-actions">
        <button className="btn-lesson" onClick={guardar}>
          Empezar a aprender
        </button>
        <button className="btn-link" onClick={onSaltar}>
          Saltear por ahora
        </button>
      </div>
    </div>
  );
}
