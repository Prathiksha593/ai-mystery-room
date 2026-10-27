# Specification Sheet: AI Mystery Room

## 1. Project Overview & Problem Statement
AI Mystery Room is an interactive, web-based detective investigation platform powered by Google Gemini API, Node.js, Express, MongoDB, and React. The platform dynamically synthesizes crime scenarios, evidence arrays, suspect profiles, and narrative solution logic based on user inputs. 

The core architectural problem is delivering dynamically generated AI narratives while guaranteeing structural integrity, logical consistency, backend-enforced score security, and zero client-side leakage of the solution prior to formal accusation.

---

## 2. Target Users & User Journey
- **Target Audience:** Puzzle enthusiasts, murder mystery fans, narrative gamers, and developers studying structured AI integrations.
- **User Journey:**
  1. **Landing:** User opens application home page, reviews instructions, and clicks "Open Investigation Desk".
  2. **Initialization:** User selects a difficulty (Easy, Medium, Hard) and provides or selects a narrative premise (e.g., Navya Deshpande Homicide).
  3. **Investigation:** User explores suspect cards, examines unrevealed evidence to discover clues (+5 pts), and optionally requests progressive hints (-10 pts).
  4. **Accusation:** User accesses the warrant screen and submits an accusation against one suspect.
  5. **Resolution:** Backend verifies accusation against hidden culprit ID, computes final score, unlocks complete narrative explanation, and presents final metrics.

---

## 3. Technology Stack Specification
- **Frontend:** React 18, Vite, React Router DOM v6, Axios, Tailwind CSS.
- **Backend:** Node.js (ES Modules), Express.js, Mongoose ODM, Zod (Schema Validation), `@google/genai` SDK.
- **Database:** MongoDB / MongoDB Atlas.
- **Deployment:** Frontend on Vercel, Backend on Render/Railway.

---

## 4. System Architecture & API Specification

### Database Schema (`Case` Model)
- `title` (String, Required)
- `premise` (String, Required)
- `difficulty` (Enum: Easy, Medium, Hard)
- `story` (String, Required)
- `suspects` (Array of Suspect Objects: suspectId, name, role, bio, alibi, motive)
- `clues` (Array of Clue Objects: clueId, title, description, type, discovered, discoveredAt)
- `hints` (Array of Hint Objects: hintId, text, revealed)
- `culpritId` (String, Select: false) *[Hidden from default queries]*
- `solutionExplanation` (String, Select: false) *[Hidden from default queries]*
- `status` (Enum: Active, Completed)
- `playerAccusation` (Object: suspectId, submittedAt)
- `score` (Number)
- `verdict` (Enum: Pending, Guilty, Solitary Failure)

### REST API Endpoints
1. `POST /api/cases`
   - **Input:** `{ premise: string, difficulty: 'Easy'|'Medium'|'Hard' }`
   - **Action:** Triggers Gemini structured generation, validates via Zod, saves to MongoDB, returns public case object.
2. `GET /api/cases/:id`
   - **Action:** Returns active case state (excluding `culpritId` and `solutionExplanation`).
3. `POST /api/cases/:id/clues/:clueId/discover`
   - **Action:** Marks specified clue as `discovered: true` and logs timestamp.
4. `POST /api/cases/:id/hints`
   - **Action:** Unlocks next unrevealed hint in sequence.
5. `POST /api/cases/:id/accuse`
   - **Input:** `{ suspectId: string }`
   - **Action:** Unhides solution fields, validates against true culprit, calculates score, updates case status to Completed, returns full verdict payload.
6. `GET /api/cases/:id/result`
   - **Action:** Retrieves final metrics and full explanation for a completed case.

---

## 5. Security & Validation Protocols
- **Solution Privacy:** `culpritId` and `solutionExplanation` schema paths must specify `select: false`. Standard GET requests must never return these fields.
- **AI Validation:** Responses from `@google/genai` are enforced using Structured JSON schemas paired with Zod runtime parsing to guarantee strict object types.
- **State Protection:** Clue discovery, hint requests, and accusations are rejected with HTTP 400 if the case status is already `Completed`.

---

## 6. Scoring Rules Engine
- **Base Victory Score:**
  - Easy: 100 Points
  - Medium: 150 Points
  - Hard: 200 Points
- **Evidence Discovery Bonus:** +5 Points per discovered clue.
- **Hint Advisory Penalty:** -10 Points per revealed hint.
- **Minimum Floor:** Score is clamped to a minimum of 0 (no negative scores).
- **Incorrect Accusation:** Base victory score set to 0. (Final score = Clue Bonuses - Hint Penalties, minimum 0).

---

## 7. Acceptance Criteria Checklist
- [x] Application generates distinct cases for Easy, Medium, and Hard settings.
- [x] AI generated output matches exact counts:
  - Easy: 3 suspects, 5 clues, 2 hints.
  - Medium: 4 suspects, 7 clues, 3 hints.
  - Hard: 5 suspects, 9 clues, 3 hints.
- [x] Frontend inspect/network tools reveal zero traces of culprit identity before accusation.
- [x] Backend correctly logs clue discoveries, hint penalties, and calculates final score accurately.
- [x] Results screen cleanly renders accused vs actual perpetrator and full logic solution.
- [x] System handles API timeouts or failures gracefully with informative error cards.