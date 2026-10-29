# Content audit

60 original curated practice questions. Lectures 1–11 are covered selectively; Lecture 12 is additional bonus material. This is not an exhaustive transcription or an official marking memorandum.

## Source inventory

| Source | PDF pages | Status |
|---|---:|---|
| 2026-CSC4044Z-Lecture 8-ES(III) - Copy (1).pdf | 34 | Inspected; source untouched |
| 2026-CSC4044Z(ALIFE)-Lecture Notes-Lecture 5 - Copy (1).pdf | 7 | Inspected; source untouched |
| 2026-CSC4044Z(ALIFE)-Lecture Notes-Lecture 3.pdf | 9 | Inspected; source untouched |
| 2026-CSC4044Z(ALIFE)-Lecture Notes-Lecture 2.pdf | 5 | Inspected; source untouched |
| 2026-CSC4044Z-Lecture 3-Introduction(II) - Copy (1).pdf | 50 | Inspected; source untouched |
| CSC4044Z(ALIFE)-Exam-MOCK (1).pdf | 4 | Inspected; source untouched |
| 2026-CSC4044Z-Lecture 4-ABMs - Copy.pdf | 45 | Inspected; source untouched |
| 2026-CSC4044Z(ALIFE)-Lecture Notes-Lecture 1.pdf | 8 | Inspected; source untouched |
| 2026-CSC4044Z-Lecture 5-ABMs(II) - Copy (2).pdf | 34 | Inspected; source untouched |
| 2026-CSC4044Z-Lecture 12-ROB.pdf | 21 | Inspected; source untouched |
| 2026-CSC4044Z(ALIFE)-Lecture Notes-Lecture 4.pdf | 9 | Inspected; source untouched |
| 2026-CSC4044Z(ALIFE)-Lecture Notes-Lecture 6.pdf | 7 | Inspected; source untouched |
| 2026-CSC4044Z(ALIFE)-Lecture Notes-Lecture 7.pdf | 6 | Inspected; source untouched |
| 2026-CSC4044Z(ALIFE)-Lecture%20Notes-Lecture%208.pdf | 8 | Inspected; source untouched |
| 2026-CSC4044Z-Lecture 1-Introduction - Copy (2).pdf | 49 | Inspected; source untouched |
| 2026-CSC4044Z-Lecture 11-ROB - Copy.pdf | 33 | Inspected; source untouched |
| 2026-CSC4044Z-Lecture 6-ES(I) - Copy (1).pdf | 33 | Inspected; source untouched |
| 2026-CSC4044Z-Lecture 9-ES(IV) - Copy (2).pdf | 26 | Inspected; source untouched |
| 2026-CSC4044Z-Lecture 2-GOL.pdf | 16 | Inspected; source untouched |
| 2026-CSC4044Z-Lecture 7-ES(II) - Copy (1).pdf | 26 | Inspected; source untouched |
| 2026-CSC4044Z-Lecture 10-Coevol - Copy (1).pdf | 36 | Inspected; source untouched |

All 21 discovered PDFs have distinct SHA-256 hashes (see source-inventory.json). Each lecture deck is counted once despite “Copy” in filenames. No other relevant files or recordings were present. Supplementary notes 1–8 were included; notes for 9–12 were not found. Lecture 8 notes use URL-encoded spaces in their filename.

## Lecture coverage

| Lecture | Lesson | Questions | Emphasis |
|---|---|---:|---|
| 1 | Life, as it could be | 6 | The big questions behind artificial life |
| 2 | Small rules. Complex worlds. | 4 | Cellular automata and Conway’s Game of Life |
| 3 | Behaviour without a blueprint | 6 | Agents, Braitenberg vehicles and emergence |
| 4 | The collective takes shape | 6 | Boids, stigmergy and agent-based models |
| 5 | How a neighbourhood tips | 5 | Schelling’s model and phase transitions |
| 6 | Evolution as a search engine | 4 | Representations, fitness and the EA loop |
| 7 | Variation and survival | 5 | Mutation, recombination and selection |
| 8 | A genetic algorithm, under the lens | 6 | Worked arithmetic, landscapes and replacement |
| 9 | Who gets to reproduce? | 7 | Ranking, tournament selection and co-evolution |
| 10 | Evolving bodies and opponents | 4 | Sims’ creatures and robotic ALIFE |
| 11 | When machines feel almost human | 5 | Morphological computation and the uncanny valley |
| 12 | The uncanny, in the wild | 2 | Bonus source: field studies and research limits |

## Questions by topic

| Topic | Count |
|---|---:|
| ABM validation | 2 |
| Agents | 2 |
| Boids | 3 |
| Braitenberg vehicles | 3 |
| Coevolution | 3 |
| Crossover | 3 |
| Cybernetic wasteland | 1 |
| Digital evolution | 2 |
| EA fundamentals | 5 |
| Emergence | 1 |
| Field study methods | 2 |
| Foundations | 4 |
| Game of Life | 4 |
| Generation gap | 1 |
| Genetic drift | 1 |
| Landscapes | 2 |
| Lecturer exam hint | 4 |
| Linear ranking | 1 |
| Morphological computation | 2 |
| Mutation | 1 |
| Robots and androids | 1 |
| Roulette selection | 1 |
| Schelling | 4 |
| Stigmergy | 1 |
| Survivor selection | 1 |
| Tournament selection | 1 |
| Uncanny valley | 3 |
| Worked GA | 1 |

## Question formats

5 mcq, 4 matching, 26 written, 8 truefalse, 3 multiselect, 11 numeric, 3 fill

## Mock coverage and privacy

The source mock contains 8 main questions, 65 marks and a two-hour limit. Its topics guide original practice on biomimicry/emergence, AI vs ALIFE, reactive vehicles and open-ended evolution, Boids rules, cybernetic wasteland, robots/androids, morphology/cognition, uncanny valley experiments, generation gap, tournament/rank selection, drift, eventual optimal discovery and multi-parent crossover. Built-in questions are paraphrased or use changed numerical setups; exact assessment wording and raw PDF text are absent from the output. The personal JSON bank remains only in the browser.

The supplied mock has no marking memorandum. All model answers, rubrics and typical mistakes are author-created study aids. The timed built-in paper is an independent selection of mock-inspired questions; it is not presented as a 65-mark replica.

## Questions found in slides

Examples converted to practice: Lecture 1 slide 12 (AI vs ALIFE); Lecture 7 slide 13 (anytime behaviour); Lecture 8 slide 14 (sphere properties); Lecture 11 slide 31 (limits of uncanny valley evidence). Source-derived questions are adapted, not reproduced verbatim. Some teaching recall prompts are ungraded.

## Discrepancies and assumptions requiring review

- Lecture 8 notes PDF page 3 calls mutation a per-genotype event with one random bit flipped, but also discusses independent per-bit expectation (five flips among twenty bits at pm=.25). These are different models. The app states independent per-bit assumptions for expected-flip calculations.
- Lecture 8 slide 8 and subsequent tables are not consistent with the shown mutated strings; the strings imply 784+625+729+324=2462 and mean 615.5. Notes page 3 supports this arithmetic. The app teaches the shown-string calculation and flags it for review.
- Lecture 8 slide 13 characterises ruggedness using nonsmooth/discontinuous language; notes page 4 clarify ruggedness need not imply literal discontinuity. The app avoids identifying all nonlinear functions as rugged.
- Lecture 8 notes page 6 say mutation is required for novel genotypes; interpreted literally this is too broad: crossover can produce a new combination of existing alleles. Mutation is needed to introduce an allele absent at a locus from the available parents. The app uses this narrower mechanism-based statement.
- Some Lecture 11–12 slide titles appear reused (e.g. Sphere Function on robot ethics material); references use PDF page and actual content rather than trusting headings.
- Mock tournament question does not explicitly say whether tournament sampling is with or without replacement. The app teaches both conventions. Numerical quiz questions state their assumptions.
- Recording 4 hint is supplied by the user. No recording was available for verification. The supporting slide definitions are Lecture 9 PDF pages 11–15. It is labelled Lecturer exam hint, never a guaranteed question.
- The normalised selected fitness variance is distinct from repeated-trial sampling variance. The tendency toward lower selected fitness variance at larger k is not a universal monotonic theorem for every fitness distribution.
- A minimum flock-size answer is not asserted: the supplied materials do not establish a universal, convention-independent minimum. Boids interactions require neighbours, while convincing flocking depends on the model and interpretation.

## Deliberate limitations

- Lessons prioritise core mechanisms, especially Lectures 1–5 and mock topics. Detailed treatment of every digital ecology, benchmark function, archaeological parameter table and robotic case study remains future enrichment.
- Interactive visualisations are original simplified implementations. Schelling movement and Boids perception conventions are stated in the interface. They do not claim to exactly reproduce lecture software.
- Selection lab isolates parent selection of a fixed population, rather than simulating mutation and long-term evolution.
- Written answers are self-assessed; the app does not understand or automatically grade prose.
- No raw course diagrams are copied. Original simulations and a text concept connection explain the mechanisms.
- No external facts are attributed to the lecturer. Original reasoning, formulas derived under explicit assumptions and original practice are labelled accordingly.
