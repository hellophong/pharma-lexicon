import {
  ArrowRight,
  Bookmark,
  Check,
  ExternalLink,
  Link as LinkIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Term } from "../data/types";
import { publishedTerms } from "../data/terms";
export function TermDetail({
  term,
  saved,
  toggle,
  onOpen,
}: {
  term: Term;
  saved: boolean;
  toggle: () => void;
  onOpen: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const articleRef = useRef<HTMLElement>(null);
  useEffect(() => {
    setCopied(false);
    articleRef.current
      ?.closest("dialog")
      ?.scrollTo({ top: 0, behavior: "instant" });
    document.title = `${term.acronym}: ${term.expandedPhrase} — Pharma Lexicon`;
    return () => {
      document.title = "Pharma Lexicon — A field guide for agency minds";
    };
  }, [term]);
  async function copy() {
    try {
      await navigator.clipboard.writeText(
        `${location.origin}${location.pathname}#term/${term.id}`,
      );
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }
  return (
    <article className="term-detail" ref={articleRef}>
      <div className="eyebrow">FIELD NOTE / {term.category}</div>
      <div className="detail-heading">
        <h2>{term.acronym}</h2>
        <button
          className={`icon-button ${saved ? "is-saved" : ""}`}
          aria-label={saved ? `Unsave ${term.acronym}` : `Save ${term.acronym}`}
          aria-pressed={saved}
          onClick={toggle}
        >
          <Bookmark fill={saved ? "currentColor" : "none"} size={23} />
        </button>
      </div>
      <h3>{term.expandedPhrase}</h3>
      <span className="source-badge">
        {term.sourceType === "authoritative"
          ? "Authoritative reference · editorial summary"
          : term.sourceType === "agency usage"
            ? "Common agency usage · confirm with your client"
            : "Industry reference · editorial summary"}
      </span>
      <p className="definition">{term.definition}</p>
      <div className="detail-context">
        <span className="eyebrow">WHY IT MATTERS TO YOUR TEAM</span>
        <p>{term.whyItMatters}</p>
      </div>
      <div className="meeting">
        <span className="eyebrow">IN THE MEETING</span>
        <blockquote>“{term.meetingExample}”</blockquote>
      </div>
      <div className="action-box">
        <span className="eyebrow">
          <ArrowRight size={15} /> YOUR NEXT MOVE
        </span>
        <p>{term.accountAction}</p>
      </div>
      {term.alternateMeanings.length > 0 && (
        <section className="alternate">
          <h4>Same letters. Different context.</h4>
          {term.alternateMeanings.map((meaning) => (
            <div key={meaning.phrase}>
              <span className="eyebrow">{meaning.context}</span>
              <h5>{meaning.phrase}</h5>
              <p>{meaning.definition}</p>
              {meaning.sourceUrl && (
                <a href={meaning.sourceUrl} target="_blank" rel="noreferrer">
                  {meaning.sourceName} <ExternalLink size={13} />
                </a>
              )}
            </div>
          ))}
        </section>
      )}
      {term.clientNote && (
        <p className="client-note">Client note: {term.clientNote}</p>
      )}
      <div className="related">
        <span className="eyebrow">CONNECT THE DOTS</span>
        <div>
          {term.relatedTerms.map((id) => {
            const related = publishedTerms.find((t) => t.id === id);
            return related ? (
              <button className="chip" key={id} onClick={() => onOpen(id)}>
                {related.acronym}
                <ArrowRight size={14} />
              </button>
            ) : null;
          })}
        </div>
      </div>
      <footer className="detail-footer">
        <a
          href={term.sourceUrl}
          target={term.sourceUrl.startsWith("http") ? "_blank" : undefined}
          rel="noreferrer"
        >
          {term.sourceName}
          <ExternalLink size={13} />
        </a>
        <span>
          Editorially checked {term.lastReviewed} · Published prototype entry
        </span>
        <p>
          For education, not medical, legal, or regulatory advice. Agency
          actions are editorial guidance; confirm your client’s procedures.
        </p>
        <button className="text-button" onClick={copy}>
          {copied ? <Check size={15} /> : <LinkIcon size={15} />}{" "}
          {copied ? "Link copied" : "Copy term link"}
        </button>
      </footer>
    </article>
  );
}
