import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipForward, RotateCcw } from "lucide-react";
import { lifeStep, tournamentProb } from "./engine";
const size = 24;
function pattern(name: string) {
  const g = Array(size * size).fill(0);
  const points =
    name === "Glider"
      ? [
          [1, 0],
          [2, 1],
          [0, 2],
          [1, 2],
          [2, 2],
        ]
      : name === "Blinker"
        ? [
            [0, 0],
            [1, 0],
            [2, 0],
          ]
        : name === "Block"
          ? [
              [0, 0],
              [1, 0],
              [0, 1],
              [1, 1],
            ]
          : [];
  if (name === "Random") return g.map(() => (Math.random() < 0.26 ? 1 : 0));
  for (const [x, y] of points) g[(y + 10) * size + x + 10] = 1;
  return g;
}
type Bird = { x: number; y: number; vx: number; vy: number };
export function Lab({ initial = "Game of Life" }: { initial?: string }) {
  const [tab, setTab] = useState(initial);
  return (
    <div className="lab-wrap">
      <div className="lab-tabs">
        {["Game of Life", "Schelling", "Boids", "Selection"].map((t) => (
          <button
            key={t}
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div key={tab}>
        <div className="prediction">
          <span className="eyebrow">BEFORE YOU PRESS PLAY</span>
          <h3>
            {tab === "Game of Life"
              ? "What will survive three generations?"
              : tab === "Schelling"
                ? "Can tolerant agents still form separate clusters?"
                : tab === "Boids"
                  ? "What happens if every bird wants to gather, but none avoids collisions?"
                  : "Will stronger selection preserve more or fewer distinct genotypes?"}
          </h3>
          <input
            aria-label="Simulation prediction"
            placeholder="Make a prediction in your own words…"
          />
        </div>
        {tab === "Game of Life" ? (
          <Life />
        ) : tab === "Schelling" ? (
          <Schelling />
        ) : tab === "Boids" ? (
          <Boids />
        ) : (
          <Selection />
        )}
      </div>
    </div>
  );
}
function Life() {
  const [g, setG] = useState(() => pattern("Glider"));
  const [running, setRunning] = useState(false);
  const [gen, setGen] = useState(0);
  const [name, setName] = useState("Glider");
  const [largeCells, setLargeCells] = useState(
    () => matchMedia("(max-width: 760px)").matches,
  );
  const step = () => {
    setG((v) => lifeStep(v, size));
    setGen((v) => v + 1);
  };
  useEffect(() => {
    if (!running) return;
    const t = setInterval(step, 180);
    return () => clearInterval(t);
  }, [running]);
  return (
    <>
      <div className="sim-controls">
        <button className="primary" onClick={() => setRunning(!running)}>
          {running ? <Pause size={16} /> : <Play size={16} />}{" "}
          {running ? "Pause" : "Run"}
        </button>
        <button disabled={running} onClick={step}>
          <SkipForward size={16} /> Step
        </button>
        <select
          aria-label="Starting pattern"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setRunning(false);
            setG(pattern(e.target.value));
            setGen(0);
          }}
        >
          {["Glider", "Blinker", "Block", "Random"].map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
        <button
          onClick={() => {
            setG(pattern(name));
            setGen(0);
            setRunning(false);
          }}
        >
          <RotateCcw size={16} /> Reset
        </button>
        <span>
          Generation {gen} · {g.reduce((a, b) => a + b, 0)} alive
        </span>
      </div>
      <button
        className="grid-size-toggle"
        aria-pressed={largeCells}
        onClick={() => setLargeCells(!largeCells)}
      >
        {largeCells ? "Show entire grid" : "Enlarge cells for editing"}
      </button>
      {largeCells && (
        <p className="grid-help">
          Swipe or scroll within the grid to edit. Each cell is a 44px touch
          target.
        </p>
      )}
      <div
        className="life-grid-scroll"
        tabIndex={0}
        role="region"
        aria-label="Scrollable editable Game of Life"
      >
        <div
          className={"life-grid" + (largeCells ? " large-cells" : "")}
          role="group"
          aria-label="Game of Life grid. Click cells to edit. Toroidal boundaries."
        >
          {g.map((v, i) => (
            <button
              key={i}
              aria-label={`Cell ${(i % size) + 1}, ${Math.floor(i / size) + 1}: ${v ? "alive" : "dead"}`}
              aria-pressed={!!v}
              className={v ? "alive" : ""}
              onClick={() => {
                setRunning(false);
                setG(g.map((x, j) => (i === j ? 1 - x : x)));
              }}
            />
          ))}
        </div>
      </div>
      <div className="observation">
        <h3>One rule, many behaviours</h3>
        <p>
          B3/S23: birth with exactly three neighbours; survival with two or
          three. Updates are simultaneous. This experiment wraps at the edges (a
          torus). A blinker oscillates, a block stays still, and a glider
          translates. Click any cell to change the initial conditions.
        </p>
      </div>
    </>
  );
}
function Schelling() {
  const random = () =>
    Array.from({ length: size * size }, () =>
      Math.random() < 0.15 ? 0 : Math.random() < 0.5 ? 1 : 2,
    );
  const [g, setG] = useState<number[]>(random);
  const [threshold, setThreshold] = useState(35);
  const [run, setRun] = useState(false);
  const [step, setStep] = useState(0);
  function happy(a: number[], i: number) {
    let same = 0,
      total = 0;
    const x = i % size,
      y = Math.floor(i / size);
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++)
        if (
          (dx || dy) &&
          x + dx >= 0 &&
          x + dx < size &&
          y + dy >= 0 &&
          y + dy < size
        ) {
          const v = a[(y + dy) * size + x + dx];
          if (v) {
            total++;
            if (v === a[i]) same++;
          }
        }
    return total === 0 || same / total >= threshold / 100;
  }
  function tick() {
    setG((old) => {
      const next = [...old];
      const unhappy = old
        .map((v, i) => (v && !happy(old, i) ? i : -1))
        .filter((i) => i >= 0);
      for (let j = unhappy.length - 1; j > 0; j--) {
        const r = Math.floor(Math.random() * (j + 1));
        [unhappy[j], unhappy[r]] = [unhappy[r], unhappy[j]];
      }
      for (const i of unhappy) {
        const vacant = next
          .map((v, j) => (v === 0 ? j : -1))
          .filter((j) => j >= 0);
        if (!vacant.length) break;
        const dest = vacant[Math.floor(Math.random() * vacant.length)];
        next[dest] = next[i];
        next[i] = 0;
      }
      return next;
    });
    setStep((n) => n + 1);
  }
  useEffect(() => {
    if (!run) return;
    const t = setInterval(tick, 250);
    return () => clearInterval(t);
  }, [run, threshold]);
  const occupied = g.filter(Boolean).length;
  const satisfied = g.reduce((a, v, i) => a + (v && happy(g, i) ? 1 : 0), 0);
  return (
    <>
      <div className="sim-controls">
        <button className="primary" onClick={() => setRun(!run)}>
          {run ? "Pause" : "Run"}
        </button>
        <button disabled={run} onClick={tick}>
          Step
        </button>
        <label>
          Similarity preference: {threshold}%
          <input
            aria-label="Similarity preference"
            type="range"
            min="0"
            max="100"
            value={threshold}
            onChange={(e) => setThreshold(+e.target.value)}
          />
        </label>
        <button
          onClick={() => {
            setG(random());
            setStep(0);
            setRun(false);
          }}
        >
          New population
        </button>
        <span>
          Round {step} · {Math.round((satisfied / Math.max(1, occupied)) * 100)}
          % satisfied
        </span>
      </div>
      <div
        className="schelling-grid"
        aria-label="Schelling grid: blue and lime groups, dark vacant cells"
        role="img"
      >
        {g.map((v, i) => (
          <i key={i} className={"group-" + v} />
        ))}
      </div>
      <div className="observation">
        <h3>Local preferences can amplify a pattern</h3>
        <p>
          Unhappy agents move to randomly chosen vacancies each round. Vacancies
          are excluded from the similarity fraction; isolated agents count as
          happy. The finite grid has no wrapping. Initial occupancy is
          approximately 85%, with approximately equal groups. This deliberately
          simple variant can keep moving at high thresholds; it does not
          guarantee a satisfied final state. Run several initialisations before
          interpreting an outcome.
        </p>
      </div>
    </>
  );
}
function Boids() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [weights, setWeights] = useState([1.6, 1, 1]);
  const [run, setRun] = useState(false);
  const [reset, setReset] = useState(0);
  const params = useRef({ weights, run });
  params.current = { weights, run };
  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    let birds: Bird[] = Array.from({ length: 75 }, () => ({
      x: Math.random() * 800,
      y: Math.random() * 420,
      vx: Math.random() * 2 - 1,
      vy: Math.random() * 2 - 1,
    }));
    let frame = 0;
    const draw = () => {
      const { weights, run } = params.current;
      if (run) {
        birds = birds.map((b) => {
          let sx = 0,
            sy = 0,
            ax = 0,
            ay = 0,
            cx = 0,
            cy = 0,
            n = 0;
          for (const o of birds) {
            const dx = o.x - b.x,
              dy = o.y - b.y,
              d = Math.hypot(dx, dy);
            if (o !== b && d < 70) {
              n++;
              ax += o.vx;
              ay += o.vy;
              cx += dx;
              cy += dy;
              if (d < 23 && d > 0) {
                sx -= dx / (d * d);
                sy -= dy / (d * d);
              }
            }
          }
          let vx =
            b.vx +
            sx * weights[0] * 0.9 +
            (n
              ? (ax / n - b.vx) * weights[1] * 0.04 +
                (cx / n) * weights[2] * 0.001
              : 0);
          let vy =
            b.vy +
            sy * weights[0] * 0.9 +
            (n
              ? (ay / n - b.vy) * weights[1] * 0.04 +
                (cy / n) * weights[2] * 0.001
              : 0);
          const speed = Math.hypot(vx, vy) || 1;
          vx = (vx / speed) * 2;
          vy = (vy / speed) * 2;
          return {
            x: (b.x + vx + 800) % 800,
            y: (b.y + vy + 420) % 420,
            vx,
            vy,
          };
        });
      }
      ctx.fillStyle = "#132b37";
      ctx.fillRect(0, 0, 800, 420);
      for (const b of birds) {
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(Math.atan2(b.vy, b.vx));
        ctx.beginPath();
        ctx.moveTo(7, 0);
        ctx.lineTo(-5, -3);
        ctx.lineTo(-3, 0);
        ctx.lineTo(-5, 3);
        ctx.closePath();
        ctx.fillStyle = "#d3ec98";
        ctx.fill();
        ctx.restore();
      }
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [reset]);
  return (
    <>
      <div className="sim-controls">
        <button onClick={() => setRun(!run)}>{run ? "Pause" : "Run"}</button>
        <button onClick={() => setReset((n) => n + 1)}>Reset flock</button>
        <span>75 agents · local perception</span>
      </div>
      <div className="boid-sliders">
        {["Separation", "Alignment", "Cohesion"].map((t, i) => (
          <label key={t}>
            {t} <b>{weights[i].toFixed(1)}</b>
            <input
              aria-label={t}
              type="range"
              min="0"
              max="3"
              step=".1"
              value={weights[i]}
              onChange={(e) =>
                setWeights(
                  weights.map((v, j) => (i === j ? +e.target.value : v)),
                )
              }
            />
          </label>
        ))}
      </div>
      <canvas
        ref={canvas}
        width="800"
        height="420"
        aria-label="Interactive flock: triangles steer using local separation, alignment and cohesion"
      />
      <div className="observation">
        <h3>The flock has no leader</h3>
        <p>
          Each bird uses neighbours within 70 units; separation acts within 23
          units. Heading alignment, attraction to local centre, and short-range
          repulsion are combined and speed is capped. Positions wrap at the
          edges; neighbour distances use the visible plane. Changing a weight
          immediately changes steering in the current flock; Reset creates a
          fresh initialisation. Set separation to zero to observe crowding.
        </p>
      </div>
    </>
  );
}
function Selection() {
  const [k, setK] = useState(2);
  const [counts, setCounts] = useState(Array(10).fill(0));
  const n = 10;
  const probs = counts.map((_, i) => tournamentProb(i + 1, n, k));
  const mean = probs.reduce((s, p, i) => s + p * (i + 1), 0);
  const variance = probs.reduce((s, p, i) => s + p * (i + 1 - mean) ** 2, 0);
  const omitted = probs.reduce((s, p) => s + (1 - p) ** n, 0) / n;
  const draws = counts.reduce((a, b) => a + b, 0);
  function sample() {
    const c = Array(10).fill(0);
    for (let t = 0; t < 10; t++) {
      let winner = 0;
      for (let j = 0; j < k; j++)
        winner = Math.max(winner, Math.floor(Math.random() * 10));
      c[winner]++;
    }
    setCounts(c);
  }
  return (
    <>
      <div className="sim-controls">
        <label>
          Tournament size k = {k}
          <input
            aria-label="Tournament size"
            type="range"
            min="1"
            max="10"
            value={k}
            onChange={(e) => {
              setK(+e.target.value);
              setCounts(Array(10).fill(0));
            }}
          />
        </label>
        <button className="primary" onClick={sample}>
          Draw 10 parents
        </button>
      </div>
      <div className="selection-chart">
        {probs.map((p, i) => (
          <div key={i}>
            <small>{(p * 100).toFixed(1)}%</small>
            <div className="bar-zone">
              <i style={{ height: `${p * 145}%` }} />
              <b style={{ height: `${counts[i] * 14}%` }} />
            </div>
            <span>{i + 1}</span>
            <small>{counts[i]} drawn</small>
          </div>
        ))}
      </div>
      <p className="chart-key">
        Lime: theoretical winning probability · Blue: realised copy counts
        (separate scale) · X-axis: fitness / rank
      </p>
      <div className="stats">
        <div>
          <span>Mean selected fitness</span>
          <b>{mean.toFixed(2)}</b>
          <p>Original mean: 5.50</p>
        </div>
        <div>
          <span>Normalised fitness variance</span>
          <b>{(variance / 8.25).toFixed(3)}</b>
          <p>Original variance: 8.25</p>
        </div>
        <div>
          <span>Expected diversity loss</span>
          <b>{Math.round(omitted * 100)}%</b>
          <p>
            10 parent draws;{" "}
            {draws
              ? counts.filter((c) => c === 0).length * 10 + "% observed"
              : "not sampled yet"}
          </p>
        </div>
      </div>
      <div className="observation">
        <h3>Separate expectation from a single sample</h3>
        <p>
          Ten distinct genotypes have fitness 1…10. Each tournament samples
          independently with replacement; the highest fitness wins. The chart
          evaluates P(i wins)=(i/10)ᵏ−((i−1)/10)ᵏ. Selection intensity here is
          the increase in selected mean (current Δ = {(mean - 5.5).toFixed(2)});
          the displayed variance is Var(selected)/Var(original). Expected
          diversity loss is Σ(1−pᵢ)¹⁰/10. Copy counts change between samples.
          This is a parent-selection experiment, without mutation or a
          multi-generation evolutionary process.
        </p>
      </div>
    </>
  );
}
