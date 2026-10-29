import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  FlaskConical,
  LayoutDashboard,
  BookOpen,
  Target,
  Timer,
  Activity,
  ChevronRight,
  Check,
  Download,
  Upload,
  Search,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import data from "./content.json";
import inventory from "../source-inventory.json";
import {
  Question,
  Progress,
  loadProgress,
  record,
  mark,
  validateBank,
  validateProgress,
} from "./engine";
import { Lab } from "./simulations";
import "./style.css";
const core = data.questions as Question[];
const download = (name: string, value: unknown) => {
  const u = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
};
function App() {
  const [page, setPage] = useState(location.hash.slice(1) || "dashboard");
  const [p, setP] = useState<Progress>(loadProgress);
  const [personal, setPersonal] = useState<Question[]>(() => {
    try {
      return validateBank(
        JSON.parse(localStorage.getItem("alife-bank") || "[]"),
      );
    } catch {
      return [];
    }
  });
  const [notice, setNotice] = useState("");
  const [lecture, setLecture] = useState(0);
  const [filter, setFilter] = useState("");
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState("all");
  const [exam, setExam] = useState(false);
  const [remaining, setRemaining] = useState(7200);
  const [examAnswers, setExamAnswers] = useState<Record<string, string>>({});
  const [review, setReview] = useState(false);
  const [paperSource, setPaperSource] = useState("built-in");
  const [examPaper, setExamPaper] = useState<Question[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const questions = [...core, ...personal];
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `ALIFE Lab · ${page === "dashboard" ? "Overview" : page.charAt(0).toUpperCase() + page.slice(1)}`;
  }, [page]);
  useEffect(() => {
    const fn = () => {
      setPage(location.hash.slice(1) || "dashboard");
      setActive(0);
    };
    addEventListener("hashchange", fn);
    return () => removeEventListener("hashchange", fn);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("alife-progress", JSON.stringify(p));
    } catch {
      setNotice(
        "Browser storage is unavailable. Export progress before leaving.",
      );
    }
  }, [p]);
  useEffect(() => {
    if (!exam || review) return;
    const id = setInterval(
      () =>
        setRemaining((r) => {
          if (r <= 1) {
            setReview(true);
            return 0;
          }
          return r - 1;
        }),
      1000,
    );
    return () => clearInterval(id);
  }, [exam, review]);
  const latest = Object.fromEntries(p.attempts.map((a) => [a.id, a]));
  const mastered = questions.filter((q) => latest[q.id]?.score >= 0.8).length;
  const weak = questions.filter(
    (q) =>
      latest[q.id] &&
      (latest[q.id].score < 0.8 || latest[q.id].confidence === 1),
  );
  const xp = Math.round(p.attempts.reduce((s, a) => s + a.score * 10, 0));
  const due = questions.filter(
    (q) => latest[q.id] && latest[q.id].due <= Date.now(),
  );
  const next =
    data.lessons.find((l) => !p.completed.includes(l.id)) || data.lessons[0];
  const nav = (to: string) => {
    location.hash = to;
    if (page === to) setActive(0);
  };
  const start = (m: string) => {
    setMode(m);
    setLecture(0);
    setFilter("");
    nav("quiz");
  };
  const submit = (q: Question, score: number, confidence: number) =>
    setP((v) => record(v, q.id, score, confidence));
  async function importFile(
    e: React.ChangeEvent<HTMLInputElement>,
    kind: string,
  ) {
    try {
      const f = e.target.files?.[0];
      if (!f) return;
      const parsed = JSON.parse(await f.text());
      if (kind === "progress") setP(validateProgress(parsed));
      else {
        const bank = validateBank(parsed);
        localStorage.setItem("alife-bank", JSON.stringify(bank));
        setPersonal(bank);
      }
      setNotice("Import complete. Saved in this browser.");
    } catch (e) {
      setNotice((e as Error).message);
    }
    e.target.value = "";
  }
  const list = questions.filter(
    (q) =>
      (!lecture || q.lecture === lecture) &&
      (!filter ||
        `${q.text} ${q.topic} ${q.category}`
          .toLowerCase()
          .includes(filter.toLowerCase())) &&
      (page === "written" ? q.type === "written" : q.type !== "written") &&
      (mode === "weak"
        ? weak.includes(q)
        : mode === "due"
          ? due.includes(q)
          : mode === "hint"
            ? q.category === "lecturer exam hint"
            : true),
  );
  const examQs = exam
    ? examPaper
    : paperSource === "personal"
      ? personal
      : core.filter((q) => q.category === "mock-inspired");
  const selectedLesson = data.lessons.find((l) => l.id === lecture) || next;
  return (
    <div className="shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        Skip to study content
      </a>
      <aside>
        <a className="brand" href="#dashboard">
          <span className="brand-icon">
            <FlaskConical size={25} />
          </span>
          ALIFE<span className="brand-light">Lab</span>
        </a>
        <div className="course-code">UCT · CSC4044Z · 2026</div>
        <div className="nav-label">YOUR LEARNING SPACE</div>
        <button
          className="mobile-menu-toggle"
          aria-expanded={mobileMenuOpen}
          aria-controls="site-navigation"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? "Close menu" : "Study menu"}
        </button>
        <nav
          id="site-navigation"
          aria-label="Study navigation"
          className={mobileMenuOpen ? "mobile-nav-open" : ""}
          onClick={() => setMobileMenuOpen(false)}
        >
          {[
            ["dashboard", "Overview", LayoutDashboard],
            ["learn", "Learn", BookOpen],
            ["quiz", "Practice", Target],
            ["written", "Written answers", BookOpen],
            ["exam", "Exam studio", Timer],
            ["lab", "Simulation lab", FlaskConical],
            ["revision", "My revision", Activity],
          ].map(([id, title, Icon]) => (
            <a
              key={String(id)}
              className={page === id ? "selected" : ""}
              href={"#" + id}
            >
              <Icon size={19} />
              {String(title)}
              {id === "revision" && weak.length > 0 && (
                <small>{weak.length}</small>
              )}
            </a>
          ))}
          <a className="mobile-only" href="#settings">
            Progress & imports
          </a>
          <a className="mobile-only" href="#sources">
            Source audit
          </a>
        </nav>
        <div className="sidebar-bottom">
          <div className="tiny-orbit">✳</div>
          <b>
            Small rules.
            <br />
            Extraordinary possibilities.
          </b>
          <p>Your personal artificial life laboratory.</p>
          <a href="#sources">
            Source audit <ArrowUpRight size={14} />
          </a>
          <a href="#settings">
            Progress & imports <ArrowUpRight size={14} />
          </a>
        </div>
      </aside>
      <main id="main-content" tabIndex={-1}>
        <header>
          <div>
            <span className="status-dot" /> PERSONAL STUDY LAB{" "}
            <span className="header-separator">/</span>{" "}
            {page === "dashboard" ? "OVERVIEW" : page.toUpperCase()}
          </div>
          <span className="exam-date">
            <Timer size={15} /> Exam · 05 Nov 2026
          </span>
        </header>
        {notice && (
          <div role="status" className="notice">
            {notice}
            <button onClick={() => setNotice("")}>Dismiss</button>
          </div>
        )}
        {page === "dashboard" && (
          <>
            <div className="title-row">
              <div>
                <div className="eyebrow">CURIOUS MINDS, COMPLEX SYSTEMS</div>
                <h1>A little closer to understanding life.</h1>
                <p>
                  Explore the ideas. Test your intuition. Make the connections.
                </p>
              </div>
              <span className="date-card">
                <b>05</b>NOVEMBER
                <br />
                <small>EXAM DAY</small>
              </span>
            </div>
            <section className="hero">
              <div className="hero-copy">
                <span className="pill">YOUR NEXT DISCOVERY</span>
                <h2>{next.title}</h2>
                <p>
                  {next.subtitle}. Learn through short explanations, active
                  recall and experiments.
                </p>
                <button
                  className="lime"
                  onClick={() => {
                    setLecture(next.id);
                    nav("learn");
                  }}
                >
                  Continue Learning <ArrowRight size={18} />
                </button>
                <span className="hero-meta">
                  LECTURE {String(next.id).padStart(2, "0")} <i />{" "}
                  SOURCE-REFERENCED LESSON
                </span>
              </div>
              <div className="organism" aria-hidden="true">
                {Array.from({ length: 44 }, (_, i) => (
                  <i
                    key={i}
                    style={{
                      left: `${15 + ((i * 37) % 75)}%`,
                      top: `${12 + ((i * 23) % 75)}%`,
                      transform: `rotate(${i * 29}deg)`,
                      animationDelay: `${i * 0.13}s`,
                    }}
                  />
                ))}
                <span className="organism-label">
                  LOCAL RULES → GLOBAL PATTERNS
                </span>
              </div>
            </section>
            <div className="stats">
              <div>
                <span>Course explored</span>
                <b>
                  {p.completed.length}
                  <small> / 12 lessons</small>
                </b>
                <div className="track">
                  <i style={{ width: `${(p.completed.length / 12) * 100}%` }} />
                </div>
              </div>
              <div>
                <span>Recall demonstrated</span>
                <b>
                  {mastered}
                  <small> / {questions.length} questions</small>
                </b>
                <p>Latest score ≥ 80%</p>
              </div>
              <div>
                <span>Ready for another look</span>
                <b>
                  {due.length}
                  <small> reviews due</small>
                </b>
                <button className="text-button" onClick={() => start("due")}>
                  Start a focused session <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
            <div className="section-heading">
              <div>
                <span className="eyebrow">MAKE IT STICK</span>
                <h2>Choose your next experiment</h2>
              </div>
              <button className="text-button" onClick={() => nav("revision")}>
                My revision <ArrowRight size={16} />
              </button>
            </div>
            <div className="activity-grid">
              {[
                [
                  "01",
                  "Test your recall",
                  "A little retrieval goes a long way.",
                  "Practice questions",
                  "quiz",
                  Target,
                ],
                [
                  "02",
                  "Think like an examiner",
                  "Build an answer, then compare the reasoning.",
                  "Open exam studio",
                  "exam",
                  Timer,
                ],
                [
                  "03",
                  "Let the rules play out",
                  "Turn an abstract idea into an observation.",
                  "Enter the lab",
                  "lab",
                  FlaskConical,
                ],
              ].map(([n, t, d, b, to, Icon]) => (
                <button
                  className="activity-card"
                  key={String(n)}
                  onClick={() => {
                    setMode("all");
                    nav(String(to));
                  }}
                >
                  <div className="card-top">
                    <Icon size={23} />
                    <span>{String(n)}</span>
                  </div>
                  <h3>{String(t)}</h3>
                  <p>{String(d)}</p>
                  <b>
                    {String(b)} <ArrowUpRight size={17} />
                  </b>
                </button>
              ))}
            </div>
            <section className="hint-banner">
              <Sparkles />
              <div>
                <span className="eyebrow">
                  LECTURER EXAM HINT · HIGH PRIORITY
                </span>
                <h3>Tournament selection: what changes as k grows?</h3>
                <p>
                  Selection intensity, diversity loss and selection variance. A
                  hint, not a guarantee.
                </p>
              </div>
              <button onClick={() => nav("hint")}>
                Investigate <ArrowRight size={17} />
              </button>
            </section>
            <div className="section-heading">
              <h2>Your course, connected</h2>
              <span className="muted">11 core lectures + 1 bonus source</span>
            </div>
            <div className="lecture-grid">
              {data.lessons.map((l) => (
                <button
                  className="lecture-card"
                  key={l.id}
                  onClick={() => {
                    setLecture(l.id);
                    nav("learn");
                  }}
                >
                  <span className="lecture-number">
                    {String(l.id).padStart(2, "0")}
                  </span>
                  <div>
                    <h3>{l.title}</h3>
                    <p>{l.subtitle}</p>
                    <span className="muted">
                      {p.completed.includes(l.id)
                        ? "✓ Explored"
                        : "Ready to explore"}{" "}
                      · {questions.filter((q) => q.lecture === l.id).length}{" "}
                      questions
                    </span>
                  </div>
                  <ChevronRight size={18} />
                </button>
              ))}
            </div>
          </>
        )}
        {page === "learn" && (
          <>
            <div className="eyebrow">THE LEARNING PATH</div>
            <h1>Understand the mechanism.</h1>
            <p>Short explanations. Better questions. Ideas that connect.</p>
            <div className="lesson-tabs">
              {data.lessons.map((l) => (
                <button
                  key={l.id}
                  className={selectedLesson.id === l.id ? "active" : ""}
                  onClick={() => setLecture(l.id)}
                >
                  {String(l.id).padStart(2, "0")}
                  {p.completed.includes(l.id) && " ✓"}
                </button>
              ))}
            </div>
            <article className="lesson">
              <span className="eyebrow">
                LECTURE {selectedLesson.id}{" "}
                {selectedLesson.id === 12 ? "· BONUS SOURCE" : ""}
              </span>
              <h2>{selectedLesson.title}</h2>
              <p className="lead">{selectedLesson.subtitle}</p>
              {selectedLesson.sections.map((s, i) => (
                <section key={s.title}>
                  <span className="step-number">{i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  <small className="source">
                    {selectedLesson.source} · PDF page {s.page}
                  </small>
                  {i === 1 && (
                    <details className="recall">
                      <summary>Pause & predict</summary>
                      <p>{selectedLesson.recall}</p>
                      <textarea
                        aria-label="Your prediction"
                        placeholder="Put your reasoning into words…"
                        value={p.drafts["lesson-" + selectedLesson.id] || ""}
                        onChange={(e) =>
                          setP({
                            ...p,
                            drafts: {
                              ...p.drafts,
                              ["lesson-" + selectedLesson.id]: e.target.value,
                            },
                          })
                        }
                      />
                    </details>
                  )}
                </section>
              ))}
              <div className="connection">
                <b>Connect the dots</b>
                <p>
                  Local interactions → emergence → self-organisation. Heritable
                  variation + selection → adaptation. Co-evolution connects
                  adaptation back to the environment.
                </p>
              </div>
              <button
                className="primary"
                onClick={() => {
                  setP((v) => ({
                    ...v,
                    completed: [
                      ...new Set([...v.completed, selectedLesson.id]),
                    ],
                  }));
                  setMode("all");
                  setLecture(selectedLesson.id);
                  nav("quiz");
                }}
              >
                Mark explored & practise <ArrowRight size={17} />
              </button>
            </article>
          </>
        )}
        {page === "hint" && (
          <>
            <span className="eyebrow">LECTURER EXAM HINT</span>
            <h1>Turn up k. What changes?</h1>
            <p>
              Recording 4 hint supplied by you; supporting terminology: Lecture
              9, pages 11–15.
            </p>
            <div className="hint-detail">
              <h2>Pressure, diversity, variance</h2>
              <p>
                For a fixed population, larger deterministic tournaments favour
                higher ranks. Mean selected fitness generally rises; lower ranks
                are more often omitted. Selected fitness tends to concentrate
                near the top. These are tendencies: fitness variance need not
                decrease monotonically for every arbitrary distribution.
              </p>
              <p>
                <b>Selection intensity:</b> increase in mean fitness after
                selection. <b>Loss of diversity:</b> proportion of genotypes not
                selected. <b>Selection variance:</b> selected fitness variance
                divided by original fitness variance. It is undefined if the
                original variance is zero.
              </p>
              <h3>State the sampling convention</h3>
              <p>
                With replacement, rank i (1 = worst) wins with (i/N)ᵏ −
                ((i−1)/N)ᵏ. The best wins with 1−(1−1/N)ᵏ. Without replacement,
                a unique best wins with k/N.
              </p>
              <p>
                For N=6, k=3: best probability = 91/216 ≈ 0.4213 with
                replacement, or 0.5 without. In m independent parent draws,
                expected omitted fraction = Σ(1−pᵢ)ᵐ/N. This is distinct from
                the fitness variance.
              </p>
              <button
                className="primary"
                onClick={() => {
                  setMode("hint");
                  nav("written");
                }}
              >
                Write the reasoning <ArrowRight size={16} />
              </button>{" "}
              <button onClick={() => start("hint")}>
                Practise the numbers
              </button>
            </div>
            <Lab initial="Selection" />
          </>
        )}
        {(page === "quiz" || page === "written") && (
          <>
            <span className="eyebrow">
              {page === "written"
                ? "EXPLAIN IT IN YOUR OWN WORDS"
                : "RETRIEVAL, NOT RECOGNITION ALONE"}
            </span>
            <h1>
              {page === "written"
                ? "Make your reasoning visible."
                : "A question worth thinking about."}
            </h1>
            <p>
              {page === "written"
                ? "Write first. Compare with the model. Assess yourself honestly."
                : "Immediate feedback, explicit assumptions and a source for every question."}
            </p>
            <div className="filters">
              <label>
                <Search size={17} />
                <input
                  aria-label="Search questions"
                  placeholder="Topic, concept or category…"
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    setActive(0);
                  }}
                />
              </label>
              <select
                aria-label="Lecture filter"
                value={lecture}
                onChange={(e) => {
                  setLecture(+e.target.value);
                  setActive(0);
                }}
              >
                <option value={0}>All lectures</option>
                {data.lessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    Lecture {l.id}
                  </option>
                ))}
              </select>
              <select
                aria-label="Session filter"
                value={mode}
                onChange={(e) => {
                  setMode(e.target.value);
                  setActive(0);
                }}
              >
                <option value="all">All questions</option>
                <option value="weak">Weak spots</option>
                <option value="due">Due for review</option>
                <option value="hint">Lecturer exam hint</option>
              </select>
            </div>
            {list.length ? (
              <>
                <div className="question-position">
                  <span>
                    {Math.min(active + 1, list.length)} / {list.length}{" "}
                    QUESTIONS
                  </span>
                  <div className="track">
                    <i
                      style={{
                        width: `${((active + 1) / list.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <QuestionCard
                  key={list[active % list.length].id}
                  q={list[active % list.length]}
                  saved={p.drafts[list[active % list.length].id] || ""}
                  save={(s) =>
                    setP((v) => ({
                      ...v,
                      drafts: {
                        ...v.drafts,
                        [list[active % list.length].id]: s,
                      },
                    }))
                  }
                  submit={submit}
                />
                <div className="question-nav">
                  <button
                    disabled={active === 0}
                    onClick={() => setActive((a) => a - 1)}
                  >
                    Previous
                  </button>
                  <button
                    className="primary"
                    onClick={() => setActive((a) => (a + 1) % list.length)}
                  >
                    Next question <ArrowRight size={16} />
                  </button>
                </div>
              </>
            ) : (
              <div className="empty">
                <Check />
                <h2>Nothing in this session yet.</h2>
                <p>Try all questions, another lecture or a broader search.</p>
                <button
                  onClick={() => {
                    setMode("all");
                    setLecture(0);
                    setFilter("");
                  }}
                >
                  Browse all questions
                </button>
              </div>
            )}
          </>
        )}
        {page === "lab" && (
          <>
            <span className="eyebrow">THE SIMULATION LAB</span>
            <h1>Change a rule. See what emerges.</h1>
            <p>Predict first, experiment next, explain what surprised you.</p>
            <Lab />
          </>
        )}
        {page === "revision" && (
          <>
            <span className="eyebrow">A CLEARER PICTURE</span>
            <h1>Your learning, honestly measured.</h1>
            <p>
              No inferred AI scores. These are your recorded attempts and
              self-assessments.
            </p>
            <div className="stats">
              <div>
                <span>Questions attempted</span>
                <b>{Object.keys(latest).length}</b>
              </div>
              <div>
                <span>Needs another look</span>
                <b>{weak.length}</b>
                <button className="text-button" onClick={() => start("weak")}>
                  Revise weak spots →
                </button>
              </div>
              <div>
                <span>Reviews due now</span>
                <b>{due.length}</b>
                <button className="text-button" onClick={() => start("due")}>
                  Review now →
                </button>
              </div>
            </div>
            <div className="panel">
              <div className="earned-badges">
                <span>✦ {xp} earned XP</span>
                {p.completed.length > 0 && <span>First discovery</span>}
                {mastered >= 10 && <span>Recall researcher</span>}
                {p.attempts.some(
                  (a) => core.find((q) => q.id === a.id)?.type === "written",
                ) && <span>Reasoning in writing</span>}
              </div>
              <h2>Topic mastery</h2>
              <p>
                Latest score ≥80%, divided by all questions in that topic.
                Unattempted topics stay at zero.
              </p>
              {[...new Set(questions.map((q) => q.topic))].map((t) => {
                const all = questions.filter((q) => q.topic === t);
                const done = all.filter(
                  (q) => latest[q.id]?.score >= 0.8,
                ).length;
                return (
                  <div className="mastery" key={t}>
                    <span>{t}</span>
                    <div className="track">
                      <i style={{ width: `${(done / all.length) * 100}%` }} />
                    </div>
                    <small>
                      {done}/{all.length}
                    </small>
                  </div>
                );
              })}
            </div>
            <details className="panel">
              <summary>How review dates work</summary>
              <p>
                An incorrect answer is due immediately. A correct answer with
                low or medium confidence is due in one day. High-confidence
                correct answers use 1, 2, 4, 8 then 14 days based on previous
                successes. Written answers use your own rubric score. Confidence
                and accuracy remain separate.
              </p>
            </details>
          </>
        )}
        {page === "exam" && (
          <>
            <span className="eyebrow">THE EXAM STUDIO</span>
            <h1>A calm place to practise under pressure.</h1>
            <p>
              Original practice informed by the mock. Model answers and rubrics
              are study aids, not an official marking memo.
            </p>
            {!exam ? (
              <div className="panel">
                <Timer size={35} />
                <h2>Personal practice paper</h2>
                <label>
                  Question source{" "}
                  <select
                    aria-label="Exam question source"
                    value={paperSource}
                    onChange={(e) => setPaperSource(e.target.value)}
                  >
                    <option value="built-in">
                      Built-in mock-inspired practice
                    </option>
                    <option value="personal" disabled={!personal.length}>
                      My private bank ({personal.length})
                    </option>
                  </select>
                </label>
                <p>
                  {examQs.length} questions ·{" "}
                  {examQs.reduce((n, q) => n + q.marks, 0)} marks · choose your
                  time limit
                </p>
                <p>
                  The source mock has 8 main questions, 65 marks and a two-hour
                  limit. This practice set is not a replica. It includes
                  conceptual questions, calculations and written reasoning.
                </p>
                <select
                  aria-label="Time limit"
                  value={remaining}
                  onChange={(e) => setRemaining(+e.target.value)}
                >
                  <option value={1800}>30 minutes</option>
                  <option value={3600}>60 minutes</option>
                  <option value={7200}>120 minutes</option>
                </select>{" "}
                <button
                  className="primary"
                  disabled={!examQs.length}
                  onClick={() => {
                    setExamPaper(examQs);
                    setExam(true);
                    setReview(false);
                    setActive(0);
                  }}
                >
                  Begin timed practice <ArrowRight size={17} />
                </button>
                <p>
                  Session timer and answers remain in memory until you finish.
                  For persistent writing use Written answers mode.
                </p>
              </div>
            ) : (
              <>
                <div className="exam-bar">
                  <strong>
                    {review
                      ? "POST-EXAM REVIEW"
                      : `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")} remaining`}
                  </strong>
                  <span>
                    {Object.values(examAnswers).filter((x) => x.trim()).length}/
                    {examQs.length} answered
                  </span>
                  {!review && (
                    <button onClick={() => setReview(true)}>
                      Finish & review
                    </button>
                  )}
                </div>
                <div className="lesson-tabs">
                  {examQs.map((q, i) => (
                    <button
                      key={q.id}
                      className={active === i ? "active" : ""}
                      onClick={() => setActive(i)}
                    >
                      {i + 1}
                      {examAnswers[q.id]?.trim() ? " •" : ""}
                    </button>
                  ))}
                </div>
                {review ? (
                  <>
                    <p>
                      Self-assess against each rubric. No automatic language
                      grading is performed.
                    </p>
                    {examQs.map((q) => (
                      <div key={q.id}>
                        <blockquote className="panel">
                          <b>Your answer</b>
                          <p>{examAnswers[q.id] || "No answer submitted."}</p>
                        </blockquote>
                        <QuestionCard
                          q={q}
                          saved={examAnswers[q.id] || ""}
                          submit={submit}
                          reviewMode
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        setExam(false);
                        setExamAnswers({});
                        setRemaining(7200);
                      }}
                    >
                      Set up another paper
                    </button>
                  </>
                ) : (
                  <div className="question-card">
                    <span className="eyebrow">
                      QUESTION {active + 1} · {examQs[active].marks} MARKS
                    </span>
                    <h2>{examQs[active].text}</h2>
                    {examQs[active].options.length > 0 && (
                      <p>{examQs[active].options.join(" · ")}</p>
                    )}
                    <p className="muted">
                      For matching: answers in prompt order, separated by |.
                      Multiple select: selected option texts separated by |.
                      Numbers: decimal values. True/false: True or False.
                    </p>
                    <textarea
                      aria-label="Exam answer"
                      rows={12}
                      value={examAnswers[examQs[active].id] || ""}
                      onChange={(e) =>
                        setExamAnswers({
                          ...examAnswers,
                          [examQs[active].id]: e.target.value,
                        })
                      }
                    />
                    <div className="question-nav">
                      <button
                        disabled={active === 0}
                        onClick={() => setActive((a) => a - 1)}
                      >
                        Previous
                      </button>
                      <button
                        disabled={active === examQs.length - 1}
                        onClick={() => setActive((a) => a + 1)}
                      >
                        Next question →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
        {page === "settings" && (
          <>
            <h1>Your study data belongs to you.</h1>
            <div className="panel">
              <h2>Progress backup</h2>
              <p>
                Export attempts, confidence, review dates, lesson completions
                and written drafts. To move devices, export here, transfer the
                JSON file, then import it on the other device. Import replaces
                current progress.
              </p>
              <button onClick={() => download("alife-progress.json", p)}>
                <Download size={16} /> Export progress
              </button>{" "}
              <label className="file-button">
                <Upload size={16} /> Import progress
                <input
                  type="file"
                  accept="application/json"
                  onChange={(e) => importFile(e, "progress")}
                />
              </label>
            </div>
            <div className="panel">
              <h2>Private question bank</h2>
              <p>
                Import personal questions from JSON. They stay in this browser’s
                localStorage and are never uploaded. Import replaces your
                existing personal bank. They appear in Practice or Written
                answers according to type; the timed paper can use your private
                bank or the built-in mock-inspired set.
              </p>
              <button
                onClick={() =>
                  download("personal-bank-template.json", [
                    {
                      ...core[0],
                      id: "personal-example",
                      text: "Replace with your personal question",
                      category: "personal import",
                    },
                  ])
                }
              >
                Download schema example
              </button>{" "}
              <label className="file-button">
                Import personal bank
                <input
                  type="file"
                  accept="application/json"
                  onChange={(e) => importFile(e, "bank")}
                />
              </label>
              <p>{personal.length} personal questions loaded.</p>
              {personal.length > 0 && (
                <button
                  onClick={() => {
                    localStorage.removeItem("alife-bank");
                    setPersonal([]);
                  }}
                >
                  Remove personal bank
                </button>
              )}
            </div>
          </>
        )}
        {page === "sources" && (
          <>
            <span className="eyebrow">CONTENT AUDIT</span>
            <h1>Built on your course material.</h1>
            <p>
              Page references are PDF page numbers. No raw PDFs or lecture
              transcripts are included in the application.
            </p>
            <div className="panel">
              <h2>Coverage and review notes</h2>
              <p>
                All Lectures 1–11 have lessons and questions. Lecture 12 is
                included as bonus field-study material. Supplementary notes 1–8
                were discovered, including the URL-encoded Lecture 8 filename.
                No supplementary notes for 9–12 or recording files were found.
              </p>
              <p>
                60 curated questions cover core mechanisms and mock topics, with
                deeper teaching in Lectures 1–5. This is selective coverage, not
                an exhaustive conversion of every slide. Slide diagrams are
                explained through original interactive models rather than
                copied.
              </p>
              <p>
                <b>Review flags:</b> Lecture 8 mutation wording alternates
                between per-genotype and per-bit interpretations; shown-string
                arithmetic must be calculated consistently. Some reused slide
                headings in Lectures 11–12 do not describe their visible topic.
                Tournament sampling convention is not fixed by the mock wording:
                both conventions are taught explicitly. Recording 4’s hint is
                user-supplied, not independently verified.
              </p>
              <p>
                Exact mock wording stays out of the app. All written model
                answers and rubrics are original study guidance. “Copy” in a
                filename does not establish duplication: all 21 discovered PDFs
                have distinct SHA-256 hashes.
              </p>
            </div>
            <div className="panel">
              {inventory.map((s) => (
                <div className="source-row" key={s.file}>
                  <BookOpen size={18} />
                  <span>{s.file}</span>
                  <small>{s.pages} pages</small>
                </div>
              ))}
            </div>
          </>
        )}
        <footer>
          <span>ALIFE Lab</span> Built for curiosity. Designed for
          understanding.
          <a href="#sources">
            Sources & coverage <ArrowUpRight size={13} />
          </a>
        </footer>
      </main>
    </div>
  );
}
function QuestionCard({
  q,
  submit,
  saved = "",
  save,
  reviewMode = false,
}: {
  q: Question;
  submit: (q: Question, s: number, c: number) => void;
  saved?: string;
  save?: (s: string) => void;
  reviewMode?: boolean;
}) {
  const [value, setValue] = useState<string | string[]>(
    q.type === "matching"
      ? reviewMode
        ? saved.split("|").map((s) => s.trim())
        : Array(q.options.length).fill("")
      : q.type === "multiselect"
        ? reviewMode
          ? saved.split("|").map((s) => s.trim())
          : []
        : saved,
  );
  const [revealed, setRevealed] = useState(reviewMode);
  const [confidence, setConfidence] = useState(2);
  const [graded, setGraded] = useState(false);
  const [hint, setHint] = useState(false);
  const [rubric, setRubric] = useState<string[]>([]);
  const written = q.type === "written";
  const correct = mark(q, value);
  const update = (v: string | string[]) => {
    setValue(v);
    if (typeof v === "string") save?.(v);
  };
  return (
    <div className="question-card">
      <div className="question-meta">
        <span className="tag">{q.category}</span>
        <span>
          LECTURE {q.lecture} · {q.marks} MARKS · {q.type}
        </span>
      </div>
      <h2>{q.text}</h2>
      {written ? (
        <textarea
          aria-label="Your written answer"
          rows={7}
          placeholder="Define the concept, explain the mechanism, justify your conclusion…"
          value={String(value)}
          disabled={revealed}
          onChange={(e) => update(e.target.value)}
        />
      ) : q.type === "matching" ? (
        <div className="matching">
          {q.options.map((s, i) => (
            <label key={s}>
              {s}
              <select
                disabled={revealed}
                aria-label={"Match " + s}
                value={(value as string[])[i]}
                onChange={(e) => {
                  const a = [...(value as string[])];
                  a[i] = e.target.value;
                  update(a);
                }}
              >
                <option value="">Choose a match</option>
                {[...(q.answer as string[])].reverse().map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
          ))}
        </div>
      ) : ["mcq", "multiselect", "truefalse"].includes(q.type) ? (
        <div className="options">
          {(q.type === "truefalse" ? ["True", "False"] : q.options).map(
            (s, i) => (
              <label
                key={s}
                className={
                  (Array.isArray(value) ? value.includes(s) : value === s)
                    ? "chosen"
                    : ""
                }
              >
                <input
                  type={q.type === "multiselect" ? "checkbox" : "radio"}
                  name={q.id}
                  disabled={revealed}
                  checked={
                    Array.isArray(value) ? value.includes(s) : value === s
                  }
                  onChange={() =>
                    update(
                      q.type === "multiselect"
                        ? (value as string[]).includes(s)
                          ? (value as string[]).filter((x) => x !== s)
                          : [...(value as string[]), s]
                        : s,
                    )
                  }
                />
                <span className="option-letter">
                  {String.fromCharCode(65 + i)}
                </span>
                {s}
              </label>
            ),
          )}
        </div>
      ) : (
        <input
          className="answer-input"
          aria-label="Your answer"
          type="text"
          inputMode={q.type === "numeric" ? "decimal" : "text"}
          disabled={revealed}
          placeholder={
            q.type === "numeric"
              ? "Enter a number (decimal, not %)"
              : "Your answer…"
          }
          value={String(value)}
          onChange={(e) => update(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && String(value).trim()) setRevealed(true);
          }}
        />
      )}
      {!revealed && (
        <>
          <div className="confidence">
            <span>How certain are you?</span>
            {["Still exploring", "Fairly sure", "Confident"].map((s, i) => (
              <button
                key={s}
                aria-pressed={confidence === i + 1}
                className={confidence === i + 1 ? "active" : ""}
                onClick={() => setConfidence(i + 1)}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="question-nav">
            <button className="text-button" onClick={() => setHint(!hint)}>
              A small hint
            </button>
            <button
              className="primary"
              disabled={
                written
                  ? !String(value).trim()
                  : Array.isArray(value)
                    ? !value.length || value.some((x) => !x)
                    : !String(value).trim()
              }
              onClick={() => {
                setRevealed(true);
                if (!written) {
                  submit(q, correct ? 1 : 0, confidence);
                  setGraded(true);
                }
              }}
            >
              {written ? "Reveal model & rubric" : "Check answer"}{" "}
              <ArrowRight size={16} />
            </button>
          </div>
          {hint && <p className="hint-text">{q.hint}</p>}
        </>
      )}
      {revealed && (
        <div
          className={
            "feedback " +
            (written ? "neutral" : correct ? "correct" : "incorrect")
          }
        >
          <h3>
            {written
              ? "Compare your reasoning"
              : correct
                ? "That’s it. Nicely reasoned."
                : "A useful place to look again."}
          </h3>
          <p>
            <b>{written ? "Model answer" : "Answer"}:</b>{" "}
            {Array.isArray(q.answer) ? q.answer.join(" · ") : String(q.answer)}
          </p>
          <p>{q.explanation}</p>
          {written && (
            <>
              <h4>Marking points · self-assessment</h4>
              <p>
                Each point has equal weight in this study rubric. Select the
                points your answer covers; the fraction becomes your
                self-assessed score.
              </p>
              {q.rubric.map((s) => (
                <label className="rubric-point" key={s}>
                  <input
                    type="checkbox"
                    disabled={graded}
                    checked={rubric.includes(s)}
                    onChange={() =>
                      setRubric(
                        rubric.includes(s)
                          ? rubric.filter((x) => x !== s)
                          : [...rubric, s],
                      )
                    }
                  />
                  {s}
                </label>
              ))}
              <p>
                <b>Typical mistakes:</b> {q.mistakes}
              </p>
              <button
                disabled={graded}
                onClick={() => {
                  submit(
                    q,
                    rubric.length / Math.max(1, q.rubric.length),
                    confidence,
                  );
                  setGraded(true);
                }}
              >
                {graded
                  ? "Self-assessment saved"
                  : `Save ${rubric.length}/${q.rubric.length} marking points`}
              </button>
            </>
          )}
          <p className="source">
            {q.source.file} · PDF page {q.source.page}
            {q.supportingSource && (
              <>
                <br />
                Supporting notes: {q.supportingSource.file} · PDF page{" "}
                {q.supportingSource.page}
              </>
            )}
          </p>
          {!written && !graded && (
            <button
              onClick={() => {
                submit(q, correct ? 1 : 0, confidence);
                setGraded(true);
              }}
            >
              Save this attempt
            </button>
          )}
          <button
            className="text-button"
            onClick={() => {
              setRevealed(false);
              setGraded(false);
              setValue(
                q.type === "matching"
                  ? Array(q.options.length).fill("")
                  : q.type === "multiselect"
                    ? []
                    : "",
              );
              setRubric([]);
            }}
          >
            <RotateCcw size={15} /> Try again
          </button>
        </div>
      )}
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
