import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  BookOpen,
  Check,
  ChevronRight,
  Layers3,
  Menu,
  Plus,
  Search,
  X,
} from "lucide-react";
import { categories } from "./data/types";
import { publishedTerms } from "./data/terms";
import { learningPaths } from "./data/paths";
import { searchTerms } from "./lib/search";
import { useStoredList } from "./lib/storage";
import { track } from "./lib/analytics";
import { Modal } from "./components/Modal";
import { TermDetail } from "./components/TermDetail";
import { SuggestionForm } from "./components/SuggestionForm";
import { Learning } from "./components/Learning";
const shortCategories = [
  "Review & compliance",
  "Audience & strategy",
  "Channels & engagement",
  "Market access",
  "Measurement & analytics",
  "Launch & agency",
];
const featuredIds = ["mlr", "hcp", "pa", "kpi", "isi", "sow"];
const initialRoute = () =>
  location.hash.startsWith("#term/") ||
  location.hash.startsWith("#path/") ||
  location.hash === "#suggest"
    ? location.hash
    : "";
function App() {
  const [route, setRoute] = useState(initialRoute);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [letter, setLetter] = useState("All");
  const [onlySaved, setOnlySaved] = useState(false);
  const [all, setAll] = useState(false);
  const [menu, setMenu] = useState(false);
  const saved = useStoredList("pl:bookmarks:v1");
  const progress = useStoredList("pl:progress:v1");
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const hash = () => setRoute(initialRoute());
    window.addEventListener("hashchange", hash);
    return () => window.removeEventListener("hashchange", hash);
  }, []);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !document.querySelector("dialog[open]")
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const openTerm = useCallback((id: string) => {
    location.hash = `term/${id}`;
    setRoute(`#term/${id}`);
    track("term_open", { term: id });
  }, []);
  const close = () => {
    history.replaceState(
      null,
      "",
      `${location.pathname}${location.search}#lexicon`,
    );
    setRoute("");
  };
  const toggle = (id: string) => {
    saved.update(
      saved.items.includes(id)
        ? saved.items.filter((item) => item !== id)
        : [...saved.items, id],
    );
    track("bookmark", { term: id, saved: !saved.items.includes(id) });
  };
  const startPath = (id: string) => {
    location.hash = `path/${id}`;
    setRoute(`#path/${id}`);
    track("path_start", { path: id });
  };
  const browse = () => {
    setMenu(false);
    document.getElementById("lexicon")?.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };
  const clear = () => {
    setQuery("");
    setCategory("All categories");
    setLetter("All");
    setOnlySaved(false);
    setAll(false);
  };
  const filtered = searchTerms(
    publishedTerms,
    query,
    category,
    letter,
    onlySaved ? saved.items : undefined,
  );
  const active =
    !!query || category !== "All categories" || letter !== "All" || onlySaved;
  const visible =
    active || all
      ? filtered
      : featuredIds.map((id) => publishedTerms.find((t) => t.id === id)!);
  const term = route.startsWith("#term/")
    ? publishedTerms.find((t) => t.id === route.slice(6))
    : undefined;
  const path = route.startsWith("#path/")
    ? learningPaths.find((p) => p.id === route.slice(6))
    : undefined;
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a className="brand" href="#" aria-label="Pharma Lexicon home">
          <span className="brand-mark" aria-hidden="true" />
          <span>
            pharma<span className="brand-light">lexicon</span>
          </span>
        </a>
        <nav aria-label="Main navigation" className={menu ? "nav-open" : ""}>
          <a href="#lexicon" onClick={() => setMenu(false)}>
            The lexicon
          </a>
          <button
            onClick={() => {
              setMenu(false);
              location.hash = "suggest";
            }}
          >
            Suggest a term <Plus size={14} />
          </button>
        </nav>
        <div className="header-actions">
          <button
            className="header-saved"
            aria-label={`Saved terms (${saved.items.length})`}
            onClick={() => {
              setOnlySaved(true);
              setQuery("");
              setCategory("All categories");
              setLetter("All");
              browse();
            }}
          >
            <Bookmark size={16} />
            <span>Saved</span>
            <span className="saved-count">{saved.items.length}</span>
          </button>
          <a
            className="icon-button hub-link"
            href="https://hellophong.github.io/pharma-lab/"
            aria-label="Back to Pharma Lab"
            title="Back to Pharma Lab"
          >
            <span className="hub-icon" aria-hidden="true" />
          </a>
          <button
            className="mobile-menu icon-button"
            onClick={() => setMenu(!menu)}
            aria-label="Toggle navigation"
            aria-expanded={menu}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main id="main">
        <section id="lexicon" className="lexicon section-shell">
          <div className="lexicon-heading">
            <div>
              <span className="eyebrow">01 / YOUR EVERYDAY REFERENCE</span>
              <h1>
                The lexicon<span className="title-dot">.</span>
              </h1>
            </div>
            <p>
              Find the meaning.
              <br />
              Leave with a next move.
            </p>
          </div>
          <div className="library-toolbar">
            <div className="library-search">
              <Search size={21} />
              <label htmlFor="library-search" className="sr-only">
                Search terms, phrases, or definitions
              </label>
              <input
                id="library-search"
                ref={searchRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setAll(true);
                }}
                placeholder="Search terms, phrases, or definitions…"
              />
              {query && (
                <button
                  className="icon-button"
                  aria-label="Clear search"
                  onClick={() => setQuery("")}
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              className={`saved-filter ${onlySaved ? "selected" : ""}`}
              aria-pressed={onlySaved}
              onClick={() => setOnlySaved(!onlySaved)}
            >
              <Bookmark size={16} /> Saved terms{" "}
              <span>{saved.items.length}</span>
            </button>
          </div>
          <div className="category-filters" aria-label="Filter by category">
            <button
              aria-pressed={category === "All categories"}
              className={category === "All categories" ? "selected" : ""}
              onClick={() => {
                setCategory("All categories");
                setAll(true);
              }}
            >
              All categories <span>50</span>
            </button>
            {categories.map((c, i) => (
              <button
                key={c}
                aria-pressed={category === c}
                className={category === c ? "selected" : ""}
                onClick={() => {
                  setCategory(c);
                  setAll(true);
                  track("filter", { category: c });
                }}
              >
                <i className={`category-dot color-${i}`} />
                {shortCategories[i]}
              </button>
            ))}
          </div>
          <div className="alphabet" aria-label="Browse alphabetically">
            <button
              className={letter === "All" ? "selected" : ""}
              aria-pressed={letter === "All"}
              onClick={() => {
                setLetter("All");
                setAll(true);
              }}
            >
              A–Z
            </button>
            {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((l) => (
              <button
                key={l}
                disabled={!publishedTerms.some((t) => t.acronym.startsWith(l))}
                aria-pressed={letter === l}
                className={letter === l ? "selected" : ""}
                onClick={() => {
                  setLetter(l);
                  setAll(true);
                }}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="results-bar">
            <span role="status">
              {active || all
                ? `${filtered.length} ${filtered.length === 1 ? "term" : "terms"} found`
                : "A FEW GOOD PLACES TO START"}
            </span>
            {active ? (
              <button className="text-button" onClick={clear}>
                Clear all filters <X size={13} />
              </button>
            ) : (
              <span>
                {all ? "ALPHABETICAL ORDER" : "CURATED FOR YOUR FIRST WEEK"}
              </span>
            )}
          </div>
          {visible.length ? (
            <div className="term-grid">
              {visible.map((t) => (
                <article className="term-card" key={t.id}>
                  <div className="term-card-top">
                    <span
                      className={`category-label color-${categories.indexOf(t.category)}`}
                    >
                      <i />
                      {shortCategories[categories.indexOf(t.category)]}
                    </span>
                    <button
                      className={`icon-button ${saved.items.includes(t.id) ? "is-saved" : ""}`}
                      aria-label={
                        saved.items.includes(t.id)
                          ? `Unsave ${t.acronym}`
                          : `Save ${t.acronym}`
                      }
                      aria-pressed={saved.items.includes(t.id)}
                      onClick={() => toggle(t.id)}
                    >
                      <Bookmark
                        size={18}
                        fill={
                          saved.items.includes(t.id) ? "currentColor" : "none"
                        }
                      />
                    </button>
                  </div>
                  <a
                    className="term-main-link"
                    href={`#term/${t.id}`}
                    onClick={() => track("term_open", { term: t.id })}
                  >
                    <h3>{t.acronym}</h3>
                    <h4>{t.expandedPhrase}</h4>
                    <p>{t.definition}</p>
                    <span className="card-bottom">
                      {t.alternateMeanings.length > 0 ? (
                        <span>
                          <Layers3 size={13} /> {t.alternateMeanings.length + 1}{" "}
                          contextual meanings
                        </span>
                      ) : (
                        <span>Definition. Context. Action.</span>
                      )}
                      <ArrowUpRight size={21} />
                    </span>
                  </a>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Search size={32} />
              <h3>
                {onlySaved && !saved.items.length
                  ? "Your field notes start here."
                  : "No exact language barrier we can solve yet."}
              </h3>
              <p>
                {onlySaved && !saved.items.length
                  ? "Save a term with the bookmark icon. It will be waiting here next time."
                  : "Try a shorter phrase, another category, or clear your filters. You can also suggest the term we’re missing."}
              </p>
              <button className="button primary" onClick={clear}>
                Reset the lexicon <ArrowRight size={16} />
              </button>
            </div>
          )}
          {!all && !active && (
            <div className="browse-all">
              <button className="button outline" onClick={() => setAll(true)}>
                Browse all 50 terms <ArrowRight size={17} />
              </button>
              <span>A little curiosity goes a long way.</span>
            </div>
          )}
          {(saved.failed || progress.failed) && (
            <p role="alert" className="error">
              Browser storage is unavailable. Changes work for this session but
              may not be kept when you return.
            </p>
          )}
        </section>
        <section id="contribute" className="contribute section-shell">
          <div>
            <span className="eyebrow">02 / BETTER TOGETHER</span>
            <h2>
              Your team knows things.
              <br />
              <em>Make that knowledge travel.</em>
            </h2>
            <p>
              A phrase from a kickoff. A lesson from a launch. The shorthand
              everyone uses but no one writes down. Give it a place to live.
            </p>
            <button
              className="button primary"
              onClick={() => {
                location.hash = "suggest";
              }}
            >
              Suggest a term <Plus size={17} />
            </button>
          </div>
          <div className="editorial-flow">
            <span className="eyebrow">
              FROM TEAM KNOWLEDGE TO SHARED REFERENCE
            </span>
            {[
              "Submitted",
              "Editorial review",
              "Compliance review",
              "Published",
            ].map((s, i) => (
              <div key={s}>
                <span className="flow-node">
                  {i === 3 ? (
                    <Check size={15} />
                  ) : (
                    String(i + 1).padStart(2, "0")
                  )}
                </span>
                <span>
                  {s}
                  {i === 2 && <small>if needed</small>}
                </span>
                {i === 3 ? <BookOpen size={20} /> : <ChevronRight size={17} />}
              </div>
            ))}
          </div>
        </section>
      </main>
      <div className="footer-surface">
        <footer className="site-footer" id="editorial-policy">
          <div className="footer-top">
            <a className="brand" href="#" aria-label="Pharma Lexicon home">
              <span className="brand-mark" aria-hidden="true" />
              <span>
                pharma<span className="brand-light">lexicon</span>
              </span>
            </a>
            <span>LESS DECODING. MORE DOING.</span>
            <button
              className="text-button"
              onClick={() => startPath("first-mlr")}
            >
              Begin onboarding <ArrowUpRight size={15} />
            </button>
          </div>
          <div className="footer-bottom">
            <p>
              An educational field guide, with a U.S. pharma focus. Not medical,
              legal, or regulatory advice.
              <br />
              Definitions link to references; agency guidance is editorial.
              Confirm local procedures with your team.
            </p>
            <span>
              PROTOTYPE / SEPTEMBER 2026
              <br />
              50 TERMS. ROOM TO GROW.
            </span>
          </div>
          <details className="editorial-policy">
            <summary>Our editorial approach</summary>
            <p>
              Regulatory, clinical, and access entries use public primary or
              professional sources. Agency conventions reflect common usage and
              vary by organization. Examples and suggested actions are original
              educational content. “Published” means visible in this prototype,
              not independently approved by a compliance reviewer. Production
              release should include named subject-matter review. Editorial
              source check: September 19, 2026.
            </p>
          </details>
        </footer>
      </div>
      {term && (
        <Modal title={`${term.acronym} field note`} onClose={close}>
          <TermDetail
            key={term.id}
            term={term}
            saved={saved.items.includes(term.id)}
            toggle={() => toggle(term.id)}
            onOpen={openTerm}
          />
        </Modal>
      )}
      {path && (
        <Modal title={path.title} onClose={close}>
          <Learning
            key={path.id}
            path={path}
            completed={progress.items}
            complete={(id) => {
              if (!progress.items.includes(id))
                progress.update([...progress.items, id]);
            }}
            onExplore={openTerm}
          />
        </Modal>
      )}
      {route === "#suggest" && (
        <Modal title="Suggest a term" onClose={close} wide>
          <SuggestionForm />
        </Modal>
      )}
      {route && !term && !path && route !== "#suggest" && (
        <Modal title="Field note not found" onClose={close}>
          <div className="empty-state">
            <h2>That field note isn’t here.</h2>
            <p>
              The link may be out of date. Explore the library to find a related
              term.
            </p>
            <button className="button primary" onClick={close}>
              Back to the lexicon
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
export default App;
