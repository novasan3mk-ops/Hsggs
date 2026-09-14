ESHARA static website

Files:
- index.html
- styles.css
- app.js

How to run locally:
1) Serve this folder through localhost (camera APIs usually need HTTPS or localhost).
2) Example: python -m http.server 8080
3) Open http://localhost:8080

Notes:
- The live demo intentionally uses MediaPipe Hands with modelComplexity=0 for stability.
- It tracks hand landmarks only; it does NOT claim full sign-language translation.
- The site labels performance numbers as engineering targets until measured on real hardware.
- Product images are hosted on Base44 URLs from the existing project; download and self-host them later if you want the site fully independent.


Ibdaa alignment additions:
- Scientific project title + suggested category (Embedded Systems / EBED).
- Testable engineering question comparing chest-mounted vs head-mounted camera placement.
- A/B experimental methodology, controlled variables, and measurable success criteria.
- Draft abstract clearly marked as pre-results, not a final abstract.
- Ethics/forms checklist including human-subject approval warning before collecting participant data.
- Research integrity rule: no fabricated metrics; unmeasured values stay labeled as targets/pending.
- Live camera session now reports local benchmark counters (processed frames, frames with hands, detection rate, inference time).
- Literature/reference section and originality-search reminder.
