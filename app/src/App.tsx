import { useEffect, useMemo, useState } from "react";
import { marked } from "marked";
import { TECNICAS, tecnicaPorId } from "@shared/engine/graph.js";
import { armarRuta } from "@shared/engine/path.js";
import type { Dificultad, Receta } from "@shared/types.js";

type Perfil = "principiante" | "intermedio" | "avanzado";

const perfilANivel: Record<Perfil, Dificultad> = {
  principiante: 1 as Dificultad,
  intermedio: 3 as Dificultad,
  avanzado: 5 as Dificultad,
};

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
}

export default function App() {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [perfil, setPerfil] = useState<Perfil>("principiante");
  const [tecnicasSeleccionadas, setTecnicasSeleccionadas] = useState<Set<string>>(new Set());
  const [busqueda, setBusqueda] = useState<string>("");
  const [expandida, setExpandida] = useState<number | null>(null);
  const [leccion, setLeccion] = useState<LeccionState | null>(null);

  useEffect(() => {
    async function cargar() {
      try {
        let res = await fetch("/api/recetas");
        if (!res.ok) {
          // Fallback: leer JSON estático si el backend no está corriendo
          res = await fetch("/ensulugar.json");
        }
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

  function renderLeccionMarkdown(texto: string) {
    const html = marked.parse(texto, { async: false }) as string;
    return { __html: html };
  }

  const ruta = useMemo(
    () => armarRuta({ tecnicasDominadas: [], recetasCompletadas: [], nivel: perfilANivel[perfil] }, recetas),
    [recetas, perfil],
  );

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

  function seleccionarSoloTecnica(id: string) {
    setTecnicasSeleccionadas(new Set([id]));
  }

  function limpiarFiltros() {
    setTecnicasSeleccionadas(new Set());
    setBusqueda("");
  }

  async function generarLeccionParaReceta(receta: Receta) {
    setLeccion({
      recetaId: receta.id,
      loading: true,
      contenido: null,
      error: null,
      tecnica: receta.tecnicas[0] ?? "Técnica",
    });
    try {
      const res = await fetch("/api/leccion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recetaId: receta.id, perfilNombre: perfil }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? data.detail ?? `HTTP ${res.status}`);
      setLeccion({
        recetaId: receta.id,
        loading: false,
        contenido: data.leccion.contenido,
        error: null,
        tecnica: data.leccion.tecnica,
      });
    } catch (err) {
      setLeccion({
        recetaId: receta.id,
        loading: false,
        contenido: null,
        error: err instanceof Error ? err.message : String(err),
        tecnica: receta.tecnicas[0] ?? "Técnica",
      });
    }
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

  return (
    <div>
      <header className="app-header">
        <h1>EnSuLugar</h1>
        <p>
          Tutor de cocina adaptativo — {recetas.length} recetas /{" "}
          {TECNICAS.length} técnicas
        </p>
      </header>

      <div className="filters">
        <div className="filter-group">
          <label htmlFor="perfil">Perfil de aprendizaje</label>
          <select
            id="perfil"
            value={perfil}
            onChange={(e) => setPerfil(e.target.value as Perfil)}
          >
            <option value="principiante">Principiante</option>
            <option value="intermedio">Intermedio</option>
            <option value="avanzado">Avanzado</option>
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
            return (
              <button
                key={id}
                className={
                  "tecnica-chip" + (seleccionada ? " selected" : "")
                }
                onClick={() => toggleTecnica(id)}
                title={t?.descripcion ?? id}
              >
                {t?.nombre ?? id}
              </button>
            );
          })}
        </div>
      </section>

      <section className="path-section">
        <h3>
          Ruta sugerida para {perfil}{" "}
          <span className="count">({ruta.length} técnicas)</span>
        </h3>
        {ruta.length === 0 ? (
          <p className="empty">No hay técnicas recomendadas para este perfil.</p>
        ) : (
          <ol className="path-list-numbered">
            {ruta.map((paso, i) => {
              const t = tecnicaPorId.get(paso.tecnicaId);
              return (
                <li
                  key={paso.tecnicaId}
                  className="path-item-numbered"
                  onClick={() => seleccionarSoloTecnica(paso.tecnicaId)}
                  title="Click para ver recetas de esta técnica"
                >
                  <span className="path-number">{i + 1}</span>
                  <span className="path-name">{t?.nombre ?? paso.tecnicaId}</span>
                  <span className="path-level">{estrellas(paso.nivel)}</span>
                </li>
              );
            })}
          </ol>
        )}
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
          recetasFiltradas.map((r) => (
            <article key={r.id} className="recipe-card">
              <h2>{r.titulo}</h2>
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
                  {expandida === r.id ? "Ocultar detalles ▲" : "Ver detalles ▼"}
                </button>
                <button
                  className="btn-lesson"
                  onClick={() => generarLeccionParaReceta(r)}
                  disabled={leccion?.recetaId === r.id && leccion?.loading}
                >
                  {leccion?.recetaId === r.id && leccion?.loading
                    ? "Generando lección…"
                    : "Generar lección con IA"}
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

              {leccion?.recetaId === r.id && (
                <div className="lesson-panel">
                  <h3>
                    Lección: {leccion.tecnica}{" "}
                    {leccion.loading && <span className="loading-inline">Generando…</span>}
                  </h3>
                  {leccion.error && (
                    <div className="lesson-error">{leccion.error}</div>
                  )}
                  {leccion.contenido && (
                    <div
                      className="lesson-content markdown-body"
                      dangerouslySetInnerHTML={renderLeccionMarkdown(leccion.contenido)}
                    />
                  )}
                </div>
              )}
            </article>
          ))
        )}
      </section>
    </div>
  );
}
