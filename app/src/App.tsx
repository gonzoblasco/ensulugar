import { useEffect, useMemo, useState } from "react";
import { TECNICAS } from "@shared/engine/graph.js";
import { armarRuta } from "@shared/engine/path.js";
import type { Receta } from "@shared/types.js";

type Perfil = "principiante" | "intermedio" | "avanzado";

const perfilANivel: Record<Perfil, number> = {
  principiante: 1,
  intermedio: 3,
  avanzado: 5,
};

function estrellas(n: number): string {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

export default function App() {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [perfil, setPerfil] = useState<Perfil>("principiante");
  const [tecnicaFiltro, setTecnicaFiltro] = useState<string>("");
  const [busqueda, setBusqueda] = useState<string>("");
  const [expandida, setExpandida] = useState<number | null>(null);

  useEffect(() => {
    fetch("/ensulugar.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: { recetas: Receta[] }) => {
        setRecetas(data.recetas);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      });
  }, []);

  const ruta = useMemo(
    () => armarRuta({ tecnicasDominadas: [], nivel: perfilANivel[perfil] }, recetas),
    [recetas, perfil],
  );

  const tecnicasUnicas = useMemo(() => {
    const set = new Set<string>();
    for (const t of TECNICAS) set.add(t.id);
    return Array.from(set).sort();
  }, []);

  const recetasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return recetas.filter((r) => {
      const matchTecnica =
        tecnicaFiltro === "" || r.tecnicas.includes(tecnicaFiltro);
      const matchBusqueda =
        q === "" ||
        r.titulo.toLowerCase().includes(q) ||
        r.categoria.toLowerCase().includes(q);
      return matchTecnica && matchBusqueda;
    });
  }, [recetas, tecnicaFiltro, busqueda]);

  if (loading) return <div className="loading">Cargando recetas…</div>;
  if (error)
    return (
      <div className="error">
        Error cargando recetas: {error}. Asegurate de haber corrido{" "}
        <code>npm run build:content</code>.
      </div>
    );

  return (
    <div>
      <header className="app-header">
        <h1>EnSuLugar</h1>
        <p>Tutor de cocina adaptativo — {recetas.length} recetas cargadas</p>
      </header>

      <div className="filters">
        <div className="filter-group">
          <label htmlFor="perfil">Perfil</label>
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

        <div className="filter-group">
          <label htmlFor="tecnica">Técnica</label>
          <select
            id="tecnica"
            value={tecnicaFiltro}
            onChange={(e) => setTecnicaFiltro(e.target.value)}
          >
            <option value="">Todas</option>
            {tecnicasUnicas.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="busqueda">Buscar</label>
          <input
            id="busqueda"
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="título o categoría"
          />
        </div>
      </div>

      <section className="path-section">
        <h3>Ruta de aprendizaje sugerida — {perfil}</h3>
        {ruta.length === 0 ? (
          <p className="empty">No hay técnicas recomendadas para este perfil.</p>
        ) : (
          <ol className="path-list">
            {ruta.map((paso) => (
              <li key={paso.tecnicaId} className="path-item">
                {paso.nombre} ({estrellas(paso.nivel)})
              </li>
            ))}
          </ol>
        )}
      </section>

      <section>
        <h2>Recetas</h2>
        {recetasFiltradas.length === 0 ? (
          <p className="empty">No hay recetas que coincidan.</p>
        ) : (
          recetasFiltradas.map((r) => (
            <article key={r.id} className="recipe-card">
              <h2>{r.titulo}</h2>
              <div className="recipe-meta">
                <span>{estrellas(r.dificultad)}</span>
                <span>{r.tiempoTotalMinutos} min</span>
                <span>{r.porciones} porciones</span>
                <span>{r.categoria}</span>
              </div>
              <div className="recipe-tags">
                <span className="tag category">{r.categoria}</span>
                {r.tecnicas.map((t) => (
                  <span key={t} className="tag technique">
                    {t}
                  </span>
                ))}
              </div>
              <p className="recipe-description">{r.descripcionCorta}</p>

              <button
                onClick={() =>
                  setExpandida(expandida === r.id ? null : r.id)
                }
              >
                {expandida === r.id ? "Ocultar detalles" : "Ver detalles"}
              </button>

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
          ))
        )}
      </section>
    </div>
  );
}
