import { useState, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import type { LearningPath } from "../data/types";
import { publishedTerms } from "../data/terms";
import { track } from "../lib/analytics";
export function Learning({
  path,
  completed,
  complete,
  onExplore,
}: {
  path: LearningPath;
  completed: string[];
  complete: (id: string) => void;
  onExplore: (id: string) => void;
}) {
  const [step, setStep] = useState(() => {
    const first = path.terms.findIndex(
      (id) => !completed.includes(`${path.id}:${id}`),
    );
    return first === -1 ? 0 : first;
  });
  const [finished, setFinished] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    rootRef.current
      ?.closest("dialog")
      ?.scrollTo({ top: 0, behavior: "instant" });
  }, [step, finished]);
  const term = publishedTerms.find((t) => t.id === path.terms[step])!;
  const count = path.terms.filter((id) =>
    completed.includes(`${path.id}:${id}`),
  ).length;
  function next() {
    complete(`${path.id}:${term.id}`);
    track("lesson_complete", { path: path.id, term: term.id });
    if (step === path.terms.length - 1) setFinished(true);
    else setStep(step + 1);
  }
  if (finished)
    return (
      <div className="learning finished" ref={rootRef}>
        <CheckCircle2 size={46} />
        <span className="eyebrow">PATH COMPLETE</span>
        <h2>
          A little more fluent.
          <br />A lot more confident.
        </h2>
        <p>
          You’ve explored all {path.terms.length} terms in{" "}
          <strong>{path.title}</strong>. Bring one new question to your next
          team conversation.
        </p>
        <div className="action-box">
          <span className="eyebrow">PUT IT INTO PRACTICE</span>
          <p>
            {path.id === "first-mlr"
              ? "Before your next submission, confirm the review cutoff, label version, required references, and owner of final approval."
              : "Choose one term from this path and explain the next action it suggests for a project you are working on."}
          </p>
        </div>
        <button
          className="button primary"
          onClick={() => onExplore(path.terms[0])}
        >
          Explore a term in depth <ArrowRight size={16} />
        </button>
        <button
          className="text-button"
          onClick={() => {
            setStep(0);
            setFinished(false);
          }}
        >
          Review this path again
        </button>
      </div>
    );
  return (
    <div className="learning" ref={rootRef}>
      <span className="eyebrow">LEARNING PATH / {path.minutes} MIN</span>
      <h2>{path.title}</h2>
      <div className="lesson-progress">
        <span>
          TERM {step + 1} OF {path.terms.length}
        </span>
        <span>{count} completed</span>
      </div>
      <div className="progress-track">
        <span style={{ width: `${(count / path.terms.length) * 100}%` }} />
      </div>
      <div className="lesson">
        <span className="lesson-acronym">{term.acronym}</span>
        <h3>{term.expandedPhrase}</h3>
        <p>{term.definition}</p>
        <blockquote>“{term.meetingExample}”</blockquote>
        <div className="action-box">
          <span className="eyebrow">TAKE THIS INTO YOUR NEXT MEETING</span>
          <p>{term.accountAction}</p>
        </div>
        <p className="small">
          Self-guided reading · completion records reading, not assessed
          proficiency.
        </p>
      </div>
      <div className="lesson-controls">
        <button
          className="text-button"
          disabled={step === 0}
          onClick={() => setStep(step - 1)}
        >
          <ArrowLeft size={16} />
          Previous
        </button>
        <button className="button primary" onClick={next}>
          {step === path.terms.length - 1
            ? "Complete path"
            : "Mark read & continue"}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
