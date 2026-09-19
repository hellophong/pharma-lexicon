import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  Compass,
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
  const [storyStep, setStoryStep] = useState(0);
  const saved = useStoredList("pl:bookmarks:v1");
  const progress = useStoredList("pl:progress:v1");
  const searchRef = useRef<HTMLInputElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const storyRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const hash = () => setRoute(initialRoute());
    window.addEventListener("hashchange", hash);
    return () => window.removeEventListener("hashchange", hash);
  }, []);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!media.matches && innerWidth > 760) {
        heroRef.current?.style.setProperty(
          "--drift",
          `${Math.min(scrollY, 900) * 0.12}px`,
        );
      } else heroRef.current?.style.setProperty("--drift", "0px");
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", scroll, { passive: true });
    media.addEventListener("change", scroll);
    update();
    return () => {
      window.removeEventListener("scroll", scroll);
      media.removeEventListener("change", scroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  useEffect(() => {
    const elements = storyRef.current?.querySelectorAll("[data-story]");
    if (!elements) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting)
            setStoryStep(Number((entry.target as HTMLElement).dataset.story));
        });
      },
      { rootMargin: "-25% 0px -45% 0px", threshold: 0 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
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
  const runSearch = (value: string) => {
    setQuery(value);
    setAll(true);
    setCategory("All categories");
    setLetter("All");
    setOnlySaved(false);
    track("search", { length: value.length });
    document.getElementById("lexicon")?.scrollIntoView({ behavior: "smooth" });
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
          <span className="brand-mark">
            p<span>l</span>
            <i />
          </span>
          <span>
            pharma<span className="brand-light">lexicon</span>
          </span>
        </a>
        <nav aria-label="Main navigation" className={menu ? "nav-open" : ""}>
          <a href="#lexicon" onClick={() => setMenu(false)}>
            The lexicon
          </a>
          <a href="#learning" onClick={() => setMenu(false)}>
            Learning paths
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
        <button
          className="header-saved"
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
        <button
          className="mobile-menu icon-button"
          onClick={() => setMenu(!menu)}
          aria-label="Toggle navigation"
          aria-expanded={menu}
        >
          {menu ? <X /> : <Menu />}
        </button>
      </header>
      <main id="main">
        <section className="hero" ref={heroRef}>
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-topline">
            <span>
              <span className="status-dot" /> THE FIELD GUIDE FOR PHARMA AGENCY
              MINDS
            </span>
            <span>VOL. 01 / THE FOUNDATIONS</span>
          </div>
          <div className="hero-content">
            <div className="hero-copy">
              <h1>
                Pharma moves fast.
                <br />
                Its language shouldn’t
                <br />
                <em>slow you down.</em>
              </h1>
              <p>
                Know the term. Understand the context.
                <br />
                Make your next move with confidence.
              </p>
              <div className="hero-actions">
                <button className="button primary" onClick={browse}>
                  Explore the lexicon <ArrowRight size={18} />
                </button>
                <button
                  className="text-button"
                  onClick={() => startPath("first-mlr")}
                >
                  Start the onboarding path <ArrowUpRight size={16} />
                </button>
              </div>
            </div>
            <div className="acronym-study" aria-hidden="true">
              <span className="study-coordinate">
                FIG. 01 — LANGUAGE, DECODED
              </span>
              <span className="ghost-acronym">Rx</span>
              <div className="study-axis axis-one" />
              <div className="study-axis axis-two" />
              <div className="study-main">
                MLR<span className="study-asterisk">✳</span>
              </div>
              <div className="study-label label-one">
                <i /> REVIEW & COMPLIANCE
              </div>
              <div className="study-label label-two">
                Medical. Legal. Regulatory.
                <span>Three letters. A whole workflow.</span>
              </div>
              <div className="study-caption">
                Acronyms are only the beginning.
                <ArrowDown size={15} />
              </div>
            </div>
          </div>
          <form
            className="hero-search"
            onSubmit={(e) => {
              e.preventDefault();
              runSearch(query);
            }}
          >
            <Search size={25} />
            <label className="sr-only" htmlFor="hero-search">
              Search the lexicon
            </label>
            <input
              id="hero-search"
              ref={searchRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setAll(true);
              }}
              placeholder="What did they just say?"
              autoComplete="off"
            />
            <kbd>/</kbd>
            <button type="submit" aria-label="Search glossary">
              <ArrowRight size={25} />
            </button>
          </form>
          <div className="search-footnote">
            <div>
              TRY A TERM{" "}
              <button onClick={() => runSearch("MLR")}>
                MLR <ArrowUpRight size={12} />
              </button>
              <button onClick={() => runSearch("HEOR")}>
                HEOR <ArrowUpRight size={12} />
              </button>
              <button onClick={() => runSearch("SOW")}>
                SOW <ArrowUpRight size={12} />
              </button>
            </div>
            <span>
              <strong>50</strong> foundational terms. A shared starting point.
            </span>
          </div>
        </section>
        <section className="trust-strip">
          <span>
            BUILT FOR THE PEOPLE
            <br />
            BEHIND THE WORK.
          </span>
          <div>Account minds.</div>
          <div>Creative thinkers.</div>
          <div>Strategic partners.</div>
          <div>Everyone learning.</div>
        </section>
        <section className="friction section-shell">
          <div className="section-heading">
            <span className="eyebrow">01 / THE COST OF NOT KNOWING</span>
            <h2>
              A small gap in language.
              <br />A bigger gap in <em>understanding.</em>
            </h2>
            <p>
              One unfamiliar acronym can change the entire conversation. Shared
              fluency keeps good work moving.
            </p>
          </div>
          <div className="friction-grid">
            <div>
              <span className="friction-number">01</span>
              <h3>The meeting moves on.</h3>
              <p>
                You’re still decoding the sentence.
                <br />
                The next decision is already being made.
              </p>
            </div>
            <div>
              <span className="friction-number">02</span>
              <h3>The brief gets interpreted.</h3>
              <p>
                Same words. Different assumptions.
                <br />A preventable round of rework.
              </p>
            </div>
            <div>
              <span className="friction-number">03</span>
              <h3>The timeline feels it.</h3>
              <p>
                Missed dependencies become missed dates.
                <br />
                Clarity protects time, budget, and trust.
              </p>
            </div>
          </div>
        </section>
        <section className="story" ref={storyRef}>
          <div className="story-inner">
            <div className="story-intro">
              <span className="eyebrow">02 / FROM LANGUAGE TO ACTION</span>
              <h2>
                Don’t just know it.
                <br />
                <em>Know what to do.</em>
              </h2>
              <p>
                A definition gets you started.
                <br />
                Context gets the work moving.
              </p>
              <div className="story-visual" aria-hidden="true">
                <span className="story-big">MLR</span>
                <div className="story-orbit" />
                <span className="story-small">
                  {
                    [
                      "LISTEN FOR THE SIGNAL",
                      "MAKE THE CONNECTION",
                      "MOVE WITH CONFIDENCE",
                    ][storyStep]
                  }
                </span>
                <div className="story-dots">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className={i === storyStep ? "active" : ""} />
                  ))}
                </div>
              </div>
            </div>
            <div className="story-steps">
              <article
                data-story="0"
                className={storyStep === 0 ? "active" : ""}
              >
                <span className="step-number">01 / HEAR IT</span>
                <blockquote>
                  “We need this through
                  <br />
                  <em>MLR by Friday.</em>”
                </blockquote>
                <p>
                  Six words that can shape your whole week.
                  <br />
                  Let’s unpack the three letters that matter.
                </p>
              </article>
              <article
                data-story="1"
                className={storyStep === 1 ? "active" : ""}
              >
                <span className="step-number">02 / DECODE IT</span>
                <h3>
                  Medical. Legal.
                  <br />
                  Regulatory.
                </h3>
                <p>
                  The cross-functional review that helps ensure your materials
                  are accurate, appropriate, and ready for their intended use.
                </p>
                <span className="story-tag">
                  CONTEXT: AGENCY REVIEW WORKFLOW
                </span>
              </article>
              <article
                data-story="2"
                className={storyStep === 2 ? "active" : ""}
              >
                <span className="step-number">03 / ACT ON IT</span>
                <h3>
                  Turn a deadline
                  <br />
                  into a clear plan.
                </h3>
                <ul>
                  <li>
                    <Check size={16} />
                    Confirm the submission cutoff.
                  </li>
                  <li>
                    <Check size={16} />
                    Check references and review requirements.
                  </li>
                  <li>
                    <Check size={16} />
                    Ask: first review or final approval?
                  </li>
                </ul>
                <button
                  className="text-button light"
                  onClick={() => openTerm("mlr")}
                >
                  Read the full MLR field note <ArrowRight size={16} />
                </button>
              </article>
            </div>
          </div>
        </section>
        <section id="lexicon" className="lexicon section-shell">
          <div className="lexicon-heading">
            <div>
              <span className="eyebrow">03 / YOUR EVERYDAY REFERENCE</span>
              <h2>
                The lexicon<span className="title-dot">.</span>
              </h2>
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
        <section className="context-note section-shell">
          <div className="context-symbol" aria-hidden="true">
            A<span>≠</span>A
          </div>
          <div>
            <span className="eyebrow">A NOTE ON CONTEXT</span>
            <h3>Same acronym. Different conversation.</h3>
            <p>
              MLR can mean a review team, a review process, or Medical Loss
              Ratio. We label the context so you can ask the right question—not
              make the wrong assumption.
            </p>
          </div>
          <button className="text-button" onClick={() => openTerm("mlr")}>
            Explore the meanings <ArrowUpRight size={17} />
          </button>
        </section>
        <section id="learning" className="learning-section section-shell">
          <div className="section-heading learning-heading">
            <div>
              <span className="eyebrow">04 / BUILD YOUR FLUENCY</span>
              <h2>
                A head start.
                <br />
                <em>One short path at a time.</em>
              </h2>
            </div>
            <p>
              New to pharma? New to a workstream?
              <br />
              Start with the language you’ll actually use.
            </p>
          </div>
          <div className="paths-grid">
            {learningPaths.map((p, i) => {
              const count = p.terms.filter((id) =>
                progress.items.includes(`${p.id}:${id}`),
              ).length;
              return (
                <button
                  className="path-card"
                  key={p.id}
                  onClick={() => startPath(p.id)}
                >
                  <div className="path-top">
                    <span className="path-number">0{i + 1}</span>
                    {i === 0 ? (
                      <Compass size={29} />
                    ) : i === 1 ? (
                      <Layers3 size={29} />
                    ) : i === 2 ? (
                      <span className="mini-bars">
                        <i />
                        <i />
                        <i />
                        <i />
                      </span>
                    ) : (
                      <ArrowUpRight size={29} />
                    )}
                  </div>
                  <span className="eyebrow">{p.category}</span>
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                  <div className="path-meta">
                    <span>
                      <Clock3 size={13} />
                      {p.minutes} min
                    </span>
                    <span>
                      <BookOpen size={13} />
                      {p.terms.length} terms
                    </span>
                  </div>
                  <div className="progress-track">
                    <span
                      style={{ width: `${(count / p.terms.length) * 100}%` }}
                    />
                  </div>
                  <div className="path-bottom">
                    <span>
                      {count
                        ? `${count} of ${p.terms.length} completed`
                        : "Ready when you are"}
                    </span>
                    <ArrowRight size={18} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>
        <section className="contribute section-shell">
          <div>
            <span className="eyebrow">05 / BETTER TOGETHER</span>
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
        <section className="vision">
          <div className="vision-top">
            <span className="eyebrow">SHARED LANGUAGE. STRONGER TEAMS.</span>
            <div>
              <span>Faster onboarding</span>
              <span>More confident conversations</span>
              <span>Fewer preventable misunderstandings</span>
            </div>
          </div>
          <h2>
            Fluency changes
            <br />
            <em>everything.</em>
            <span aria-hidden="true">✳</span>
          </h2>
          <div className="vision-bottom">
            <p>
              From your first client call to your next product launch.
              <br />A shared language across departments. Knowledge you can
              reuse.
              <br />A foundation for the way your agency learns.
            </p>
            <button className="button citron" onClick={browse}>
              Find your next field note <ArrowRight size={19} />
            </button>
          </div>
        </section>
      </main>
      <footer className="site-footer" id="editorial-policy">
        <div className="footer-top">
          <a className="brand" href="#">
            <span className="brand-mark">
              p<span>l</span>
              <i />
            </span>
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
            release should include named subject-matter review. Editorial source
            check: September 19, 2026.
          </p>
        </details>
      </footer>
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
