import { useEffect, useMemo, useState } from "react";
import { marked } from "marked";
import { TECNICAS, tecnicaPorId } from "@shared/engine/graph.js";
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
  const [tecnicasSeleccionadas, setTecnicasSeleccionadas] = useState<Set<string>>(new Set());
  const [busqueda, setBusqueda] = useState<string>("");
  const [nivelObjetivo, setNivelObjetivo] = useState<Dificultad>(0);
  const [expandida, setExpandida] = useState<number | null>(null);
  const [leccionPagina, setLeccionPagina] = useState<LeccionState | null>(null);

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
        tecnicasArray.every((t) => r.tecnicas.includes(t));
      const matchBusqueda =
        q === "" ||
        normalizar(r.titulo).includes(q) ||
        normalizar(r.categoria).includes(q) ||
        r.tecnicas.some((t) => normalizar(t).includes(q));
      const matchNivel = nivelObjetivo === 0 || r.dificultad === nivelObjetivo;
      return matchTecnica && matchBusqueda && matchNivel;
    });
  }, [recetas, tecnicasSeleccionadas, busqueda, nivelObjetivo]);

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
    setLeccionPagina({
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
      setLeccionPagina({
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
      setLeccionPagina({
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

  // Si hay una lección activa, mostrar la página de lección
  if (leccionPagina) {
    return (
      <div id="root-inner">
        <LeccionPage
          leccion={leccionPagina}
          onVolver={() => setLeccionPagina(null)}
          renderLeccionMarkdown={renderLeccionMarkdown}
        />
      </div>
    );
  }

  const perfilActivo = perfil ?? defaultPerfil();

  return (
    <>
      <RecetasView
        recetasFiltradas={recetasFiltradas}
        tecnicasSeleccionadas={tecnicasSeleccionadas}
        toggleTecnica={toggleTecnica}
        limpiarFiltros={limpiarFiltros}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        nivelObjetivo={nivelObjetivo}
        setNivelObjetivo={setNivelObjetivo}
        perfilActivo={perfilActivo}
        completarReceta={completarReceta}
        expandida={expandida}
        setExpandida={setExpandida}
        leccionPagina={leccionPagina}
        generarLeccionParaReceta={generarLeccionParaReceta}
        tecnicasOrdenadas={tecnicasOrdenadas}
        renderLeccionMarkdown={renderLeccionMarkdown}
      />
    </>
  );
}

interface RecetasViewProps {
  recetasFiltradas: Receta[];
  tecnicasSeleccionadas: Set<string>;
  toggleTecnica: (id: string) => void;
  limpiarFiltros: () => void;
  busqueda: string;
  setBusqueda: (s: string) => void;
  nivelObjetivo: Dificultad;
  setNivelObjetivo: (n: Dificultad) => void;
  perfilActivo: PerfilUsuario;
  completarReceta: (r: Receta) => void;
  expandida: number | null;
  setExpandida: (id: number | null) => void;
  leccionPagina: LeccionState | null;
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
  nivelObjetivo,
  setNivelObjetivo,
  perfilActivo,
  completarReceta,
  expandida,
  setExpandida,
  leccionPagina,
  generarLeccionParaReceta,
  tecnicasOrdenadas,
  renderLeccionMarkdown,
}: RecetasViewProps) {
  const [busquedaTecnica, setBusquedaTecnica] = useState('');
  
  return (
    <div>
      <div className="search-bar">
        <div className="search-item search-nivel">
          <select
            id="nivel"
            className="search-select"
            value={nivelObjetivo}
            onChange={(e) => setNivelObjetivo(Number(e.target.value) as Dificultad)}
          >
            <option value={0}>Todas</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                Nivel {n} {estrellas(n)}
              </option>
            ))}
          </select>
        </div>

        <div className="search-item search-texto">
          <input
            type="text"
            className="search-input"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar receta…"
          />
        </div>

        <div className="search-item search-tecnica">
          <div className="search-tecnica-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Técnica…"
              value={busquedaTecnica}
              onChange={(e) => setBusquedaTecnica(e.target.value)}
            />
            {busquedaTecnica && (
              <div className="tecnica-suggestions">
                {tecnicasOrdenadas
                  .filter(id => {
                    const t = tecnicaPorId.get(id);
                    const nombre = t?.nombre ?? id;
                    return nombre.toLowerCase().includes(busquedaTecnica.toLowerCase());
                  })
                  .slice(0, 8)
                  .map(id => {
                    const t = tecnicaPorId.get(id);
                    const seleccionada = tecnicasSeleccionadas.has(id);
                    const dominada = perfilActivo.tecnicasDominadas.includes(id);
                    return (
                      <button
                        key={id}
                        className={
                          "tecnica-suggestion" +
                          (seleccionada ? " selected" : "") +
                          (dominada ? " mastered" : "")
                        }
                        onClick={() => {
                          toggleTecnica(id);
                          setBusquedaTecnica('');
                        }}
                      >
                        <span>{t?.nombre ?? id}</span>
                        {dominada && <span className="mastered-badge">✓</span>}
                        {seleccionada && <span className="check-icon">✓</span>}
                      </button>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {tecnicasSeleccionadas.size > 0 && (
          <div className="search-tags">
            {Array.from(tecnicasSeleccionadas).map(id => {
              const t = tecnicaPorId.get(id);
              return (
                <span key={id} className="tecnica-tag-selected">
                  {t?.nombre ?? id}
                  <button
                    className="tecnica-tag-remove"
                    onClick={() => toggleTecnica(id)}
                    aria-label={`Quitar ${t?.nombre ?? id}`}
                  >
                    ✕
                  </button>
                </span>
              );
            })}
            <button className="btn-link search-clear" onClick={limpiarFiltros}>
              Limpiar
            </button>
          </div>
        )}
      </div>

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
                      disabled={leccionPagina?.recetaId === r.id && leccionPagina?.loading}
                    >
                      {leccionPagina?.recetaId === r.id && leccionPagina?.loading
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
    </div>
  );
}

interface LeccionPageProps {
  leccion: LeccionState;
  onVolver: () => void;
  renderLeccionMarkdown: (texto: string) => { __html: string };
}

function LeccionPage({ leccion, onVolver, renderLeccionMarkdown }: LeccionPageProps) {
  return (
    <div className="leccion-page">
      <div className="leccion-header">
        <button 
          className="btn-back"
          onClick={onVolver}
          type="button"
        >
          ← Volver a recetas
        </button>
        {leccion.fueCacheada && (
          <span className="badge-cached" title="Lección cacheada">⚡ Cacheado</span>
        )}
      </div>
      
      {leccion.loading && (
        <div className="leccion-loading">
          <div className="loading-spinner"></div>
          <p>Generando lección personalizada…</p>
        </div>
      )}
      
      {leccion.error && (
        <div className="lesson-error">{leccion.error}</div>
      )}
      
      {leccion.contenido && (
        <div
          className="lesson-content markdown-body"
          dangerouslySetInnerHTML={renderLeccionMarkdown(leccion.contenido)}
        />
      )}
      
      {leccion.evaluacion && !leccion.loading && (
        <div className="quiz-section">
          <h4>📝 Ponete a prueba</h4>
          {leccion.evaluacion.preguntas.map((q, idx) => (
            <QuizQuestion key={idx} question={q} />
          ))}
        </div>
      )}
      
      {leccion.variaciones && !leccion.loading && (
        <div className="variations-section">
          <h4>🔀 Variaciones para practicar</h4>
          <div className="variations-grid">
            {leccion.variaciones.variaciones.map((v, idx) => (
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
      
      <div className="leccion-footer">
        <button 
          className="btn-back"
          onClick={onVolver}
          type="button"
        >
          ← Volver a recetas
        </button>
      </div>
    </div>
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

  function handleClick(idx: number) {
    if (selected !== null) return; // ya seleccionó
    setSelected(idx);
  }

  return (
    <div className="quiz-question">
      <div className="question-text">{question.pregunta}</div>
      <div className="options-grid">
        {question.opciones.map((opcion, idx) => {
          const isCorrect = idx === question.correcta;
          const isSelected = selected === idx;
          let clase = "option-btn";
          if (selected !== null) {
            if (isCorrect) clase += " correct";
            else if (isSelected) clase += " incorrect";
          }
          return (
            <button
              key={idx}
              className={clase}
              onClick={() => handleClick(idx)}
              disabled={selected !== null}
            >
              {opcion}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <div
          className={
            "explanation" +
            (selected === question.correcta ? " correct" : " incorrect")
          }
        >
          {question.explicacion}
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
