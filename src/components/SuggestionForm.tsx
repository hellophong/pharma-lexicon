import { useState, type FormEvent } from "react";
import { ArrowRight, Check, CheckCircle2 } from "lucide-react";
import { categories, type Suggestion } from "../data/types";
import { track } from "../lib/analytics";
export function SuggestionForm() {
  const [submitted, setSubmitted] = useState<Suggestion | null>(null);
  const [error, setError] = useState("");
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (name: string) => String(f.get(name) ?? "").trim();
    const entry: Suggestion = {
      id: crypto.randomUUID(),
      acronym: get("acronym"),
      expandedPhrase: get("expandedPhrase"),
      definition: get("definition"),
      category: get("category") as Suggestion["category"],
      meetingExample: get("meetingExample"),
      whyItMatters: get("whyItMatters"),
      source: get("source"),
      clientContext: get("clientContext"),
      submittedAt: new Date().toISOString(),
      status: "submitted",
    };
    if (
      !entry.acronym ||
      !entry.expandedPhrase ||
      !entry.definition ||
      !entry.whyItMatters ||
      !entry.source ||
      !entry.meetingExample
    ) {
      setError("Please complete every required field with more than spaces.");
      return;
    }
    try {
      const stored: unknown = JSON.parse(
        localStorage.getItem("pl:suggestions:v1") ?? "[]",
      );
      const items = Array.isArray(stored) ? stored : [];
      localStorage.setItem(
        "pl:suggestions:v1",
        JSON.stringify([...items, entry]),
      );
      setSubmitted(entry);
      track("suggestion_submit", { category: entry.category });
    } catch {
      setError(
        "Your browser could not save this suggestion. Your text is still here. Enable local storage and try again.",
      );
    }
  }
  if (submitted)
    return (
      <div className="submission-success">
        <CheckCircle2 size={44} />
        <span className="eyebrow">KNOWLEDGE STARTS WITH A QUESTION</span>
        <h2>
          A new field note.
          <br />A clearer next conversation.
        </h2>
        <p>
          <strong>{submitted.acronym}</strong> is saved in this browser’s local
          submission queue.
        </p>
        <ol className="review-flow">
          <li className="current">
            <Check size={16} />
            Submitted
          </li>
          <li>Editorial review</li>
          <li>Compliance review if needed</li>
          <li>Published</li>
        </ol>
        <p className="small">
          Prototype workflow: no editor has been notified, and this term is not
          published. Your suggestion stays on this device.
        </p>
        <button className="button primary" onClick={() => setSubmitted(null)}>
          Suggest another term <ArrowRight size={16} />
        </button>
      </div>
    );
  return (
    <div className="suggestion-form">
      <span className="eyebrow">BUILD THE SHARED LANGUAGE</span>
      <h2>What did we miss?</h2>
      <p>
        The best field guides grow with the people who use them. Add the term
        your team keeps asking about.
      </p>
      <p className="small">
        Required fields are marked *. Saved only in this browser. Use fictional
        examples; omit confidential or patient information.
      </p>
      <form onSubmit={submit}>
        <div className="form-grid">
          <label>
            Acronym *
            <input
              name="acronym"
              required
              maxLength={30}
              placeholder="e.g. MLR"
            />
          </label>
          <label>
            Expanded phrase *
            <input
              name="expandedPhrase"
              required
              maxLength={160}
              placeholder="What do the letters stand for?"
            />
          </label>
        </div>
        <label>
          Plain-language definition *
          <textarea
            name="definition"
            required
            maxLength={800}
            rows={3}
            placeholder="Explain it to someone on their first day."
          />
        </label>
        <label>
          Category *
          <select name="category">
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Example sentence *
          <input
            name="meetingExample"
            required
            maxLength={300}
            placeholder="How might someone say it in a meeting?"
          />
        </label>
        <label>
          Why it matters *
          <textarea
            name="whyItMatters"
            required
            maxLength={800}
            rows={2}
            placeholder="What does it change about the work?"
          />
        </label>
        <label>
          Source name or URL *
          <input
            name="source"
            required
            maxLength={500}
            placeholder="Where can an editor verify this?"
          />
        </label>
        <label>
          Client or team context <span>(optional)</span>
          <input
            name="clientContext"
            maxLength={300}
            placeholder="Public or non-confidential context only"
          />
        </label>
        <p className="small">
          Submitted → Editorial review → Compliance review if needed → Published
        </p>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <button className="button primary" type="submit">
          Submit for review <ArrowRight size={17} />
        </button>
      </form>
    </div>
  );
}
