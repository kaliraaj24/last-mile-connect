# LastMileConnect 🛺⚡

> **Smart Metro Commute & Auto Pooling**  
> *Match with commuters arriving at the same transit station and heading in the same direction to share an auto/e-rickshaw and split the fare.*

---

## 👥 Team Setup & Responsibilities

- **Sri (Integration Lead)**: Repo scaffolding, Git branch management, seed data, Vercel deployment, pitch script & slides. Branch: `sri-integration` / `main`.
- **Brundha**: `/components/RequestForm` (screen for commuter station exit selection, destination zone, and request submission). Branch: `brundha-request-screen`.
- **Priya**: Matching engine, filtering, and co-rider matching logic. Branch: `priya-matching-engine`.
- **Arima**: `/components/MatchConfirmation` (post-match payoff screen, co-rider initials, driver details, fare savings callout). Branch: `arima-fare-confirmation`.

---

## 📁 Repository Structure

```text
├── components/
│   ├── Home/
│   │   ├── Home.jsx              # Landing page & quick demo launcher
│   │   ├── Home.css
│   │   └── index.js
│   ├── RequestForm/              # 👤 Assigned to: Brundha (branch: brundha-request-screen)
│   │   ├── RequestForm.jsx       # Commuter request form with station & zone picker
│   │   ├── RequestForm.css
│   │   └── index.js
│   └── MatchConfirmation/        # 👤 Assigned to: Arima (branch: arima-fare-confirmation)
│       ├── MatchConfirmation.jsx # Shows co-riders, driver ETA, and fare savings
│       ├── MatchConfirmation.css
│       └── index.js
├── utils/
│   ├── fareCalc.js               # Dynamic split fare formula & savings calculator
│   ├── storage.js                # localStorage wrapper & instant matching engine (Priya)
│   └── index.js
├── data/
│   ├── seedData.js               # Realistic stations, destination zones, & concurrent demo requests
│   └── index.js
├── App.jsx                       # Main shell with top screen switcher (Home, Request, Match)
├── App.css
├── index.html
├── index.css                     # Global brand styling and CSS variables
├── main.jsx                      # Vite entry point
├── package.json
└── vite.config.js
```

---

## 🌿 Git Branching & Merging Workflow

1. **`main` is protected & stable**: Nobody commits directly to `main`.
2. **Feature branches**:
   - `brundha-request-screen`
   - `priya-matching-engine`
   - `arima-fare-confirmation`
   - `sri-integration`
3. **Commit often with clear messages**:
   ```bash
   git add <your-files>
   git commit -m "feat: description of work"
   git push origin <your-branch>
   ```
4. **Integration Checkpoints**:
   - **Checkpoint 1 (Midday)**: Sri merges feature branches into `main` to verify end-to-end data flow.
   - **Checkpoint 2 (Code Freeze)**: Final merge into `main`, test live demo matching, lock deployment on Vercel.

---

## ⚡ Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/kaliraaj24/last-mile-connect.git
cd last-mile-connect

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

App runs locally on `http://localhost:3000`.

---

## 💾 LocalStorage Contracts & Demo Flow

The app requires no backend server — all state is persisted via `localStorage`:
- `tripRequests`: Array of active ride requests (`WAITING` or `MATCHED`).
- `matchGroups`: Array of created ride matches with driver details and fare breakdowns.
- `currentMatch`: Active match displayed by `MatchConfirmation`.

### Live Demo Preset:
Pre-seeded with **Indiranagar Metro Station** ➡️ **Koramangala Block 4**. Two concurrent waiting riders (*Priya Patel* and *Rohan Verma*) are already in queue. Submitting a request for this route matches **instantaneously** on stage without awkward waiting spinners!
