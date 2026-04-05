<div align="center">

# ⚡ IdeaForge

### *AI-Powered Idea Analysis & Product Planning Platform*

**Turn a rough idea into investor-ready plans—pitches, research, roadmaps, diagrams, and decks—on demand.**

<br />

[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%2B_DB-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

<br />

[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](#-contributing)
[![Repo](https://img.shields.io/badge/GitHub-IdeaForge-181717?style=flat-square&logo=github)](https://github.com/yasar-pathan/IdeaForge)

<br />

![Demo Preview Placeholder](https://via.placeholder.com/900x420/0D0D18/7C6EFA?text=IdeaForge+%E2%80%94+Drop+your+hero+screenshot+or+GIF+here)

<sub>Replace the image URL above with a real screenshot or Loom/GIF link.</sub>

</div>

> **Security:** Do **not** commit `.env.local`, API keys, or Supabase **service role** keys. Use `.env.example` as a template only. Never paste secrets in issues or the README.

---

## 📑 Table of Contents

| | |
|:---:|:---|
| 1 | [Overview](#-project-overview) |
| 2 | [Problem & Solution](#-problem-statement) |
| 3 | [Key Features](#-key-features) |
| 4 | [Module Architecture](#-module-architecture) |
| 5 | [System Workflow](#-system-workflow-mermaid) |
| 6 | [Tech Stack](#-tech-stack) |
| 7 | [Folder Structure](#-folder-structure) |
| 8 | [Installation](#-installation) |
| 9 | [Environment Variables](#-environment-variables) |
| 10 | [Usage](#-usage) |
| 11 | [API Architecture](#-api-architecture) |
| 12 | [Screenshots](#-screenshots) |
| 13 | [Performance](#-performance-highlights) |
| 14 | [Roadmap](#-future-improvements) |
| 15 | [Contributing](#-contributing) |
| 16 | [License](#-license) |
| 17 | [Author](#-author) |
| 18 | [Stats](#-github-stats) |

---

## 🎯 Project Overview

**IdeaForge** is a full-stack web platform that transforms **raw product ideas** into **structured, modular outputs** using **Google Gemini**. Each analysis session stores rich artifacts in **Supabase**—from pitch copy and market sizing to UI flow diagrams, budgets, and downloadable pitch decks.

| Capability | Description |
|:-----------|:------------|
| 🧠 **AI core** | Gemini Flash / Pro for fast, structured JSON generation |
| 🧩 **Modular pipeline** | Generate sections independently from a live workspace |
| 📊 **Feasibility** | Success scoring, roast mode, checklists, monetization |
| 🗺 **UX planning** | Mermaid-based UI flow diagrams + screen breakdowns |
| 📥 **Exports** | PPTX pitch deck + PDF / shareable results |

---

## ❓ Problem Statement

Founders and builders often start with **a paragraph of intent**—not a PRD. Turning that into **credible research, a roadmap, and presentation assets** usually means hours of docs, slides, and ad-hoc prompting. Tools rarely **persist** structured outputs or **compose** them into one coherent “product package.”

---

## ✅ Solution

IdeaForge **normalizes the idea** into a **session**, runs **targeted AI modules** on demand, and **persists** every artifact in a relational model. Users move from **landing → analyze → workspace (per module) → results dashboard**, with **PDF / PPT** export and **dashboard history**.

---

## ✨ Key Features

| Feature | Emoji | What you get |
|:--------|:-----:|:-------------|
| Idea intake & session lifecycle | 📝 | Create sessions, track `processing` / `complete` / `failed` |
| Pitch & narrative | 🎤 | Hook, problem, solution, traction, ask |
| Market research | 📈 | TAM/SAM/SOM, trends, risks, regions |
| Competitors | 🥊 | Landscape, gaps, differentiation |
| Feature roadmap | 🛣 | MVP / v1 / v2 buckets + workflow hints |
| Domains | 🌐 | Name suggestions for branding |
| Roast mode | 🔥 | Critical feedback for iteration |
| Validation checklist | ✅ | Actionable validation tasks |
| Monetization | 💰 | Revenue models & pricing angles |
| Team & roles | 👥 | Suggested hiring / ownership |
| Budget breakdown | 💵 | Costs, burn, category charts |
| UI flow | 🗺 | Mermaid diagram + screen cards |
| Pitch deck (PPTX) | 📽 | Slide pack generation + download |
| Auth & dashboard | 🔐 | Supabase Auth, session history, rename/delete |
| Exports | 📄 | PPT API + client PDF via `html-to-image` + jsPDF |

---

## 🧩 Module Architecture

Each **module** is a **discrete backend job** backed by a **dedicated table** and a **boolean flag** on the session. The workspace UI triggers generation **per module**; results aggregate on the **results** page when data exists.

<details>
<summary><b>📦 Module list (expand)</b></summary>

| Module | Output (conceptual) |
|:-------|:--------------------|
| Core analysis | Title, category, pitch speech |
| Market research | Industry, TAM/SAM/SOM, JSON trends/risks |
| Competitors | JSON competitor list, gaps |
| Features | MVP/v1/v2 feature JSON |
| Domains | Suggested names JSON |
| Roast | Structured roast copy |
| Checklist | Validation items |
| Monetization | Strategy blocks |
| Team | Roles & structure |
| Budget | Costs, burn, categories |
| UI flow | Screens + `mermaid_code` |
| PPT | Slide rows (12 slides target) |

</details>

---

## 🔄 System Workflow (Mermaid)

```mermaid
flowchart LR
  subgraph User["👤 User"]
    A[Landing / Idea input]
    B[Auth Sign-in]
    C[Dashboard]
  end

  subgraph App["⚡ Next.js App"]
    D[/api/analyze]
    E[Workspace /results]
    F[Results UI]
  end

  subgraph Backend["🧠 Backend"]
    G[Supabase Postgres + RLS]
    H[Gemini generateContent]
    I[Module runner]
  end

  A --> B
  B --> C
  A --> D
  D --> G
  D --> I
  I --> H
  H --> G
  C --> E
  E --> I
  G --> F
  E --> F
```

---

## 🛠 Tech Stack

<div align="center">

| Layer | Stack |
|:-----:|:------|
| **Framework** | ![Next](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white) ![React](https://img.shields.io/badge/React-23272f?logo=react&logoColor=61dafb) |
| **Language** | ![TS](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) |
| **Styling** | ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white) |
| **UI** | Radix UI · Framer Motion · Lucide |
| **Auth & DB** | ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white) |
| **AI** | Google Generative AI SDK · Gemini 2.5 Flash/Pro |
| **Charts / Viz** | Recharts · Mermaid |
| **Exports** | pptxgenjs · jsPDF · html-to-image |
| **Validation** | Zod |

</div>

---

## 📁 Folder Structure

```text
ideaforge/
├── src/
│   ├── app/                 # App Router — pages & API routes
│   │   ├── api/             # analyze, sessions, download-ppt, auth
│   │   ├── dashboard/
│   │   ├── results/[id]/
│   │   ├── workspace/[id]/
│   │   └── ...
│   ├── components/          # UI, layout, results modules
│   ├── hooks/               # useSession, useAnalysis, etc.
│   └── lib/
│       ├── analysis/        # moduleRunner (per-module generation)
│       ├── gemini/          # client + prompts
│       ├── supabase/        # server/client + SQL migrations
│       └── exportResultsPdf.ts
├── public/
├── package.json
└── README.md
```

---

## 🚀 Installation

```bash
git clone https://github.com/yasar-pathan/IdeaForge.git
cd IdeaForge
npm install
```

```bash
cp .env.example .env.local
# Edit .env.local — add your keys (never commit this file)
```

```bash
npm run dev
```

Open **http://localhost:3000**.

---

## 🔐 Environment Variables

| Variable | Required | Purpose |
|:---------|:--------:|:--------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon (client) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role (server-only APIs) |
| `GOOGLE_GENERATIVE_AI_API_KEY` **or** `GEMINI_API_KEY` | ✅ | Gemini API access (**keep server-only**; never expose in client code) |
| `NEXT_PUBLIC_APP_URL` | ⬜ | Base URL for share links (e.g. `https://yourdomain.com`) |
| `GEMINI_FLASH_MODEL` | ⬜ | Override default Flash model id |
| `GEMINI_PRO_MODEL` | ⬜ | Override default Pro model id |
| `IDEAFORGE_UNLIMITED_ANALYSES` | ⬜ | Dev: `true` to skip usage limits |
| `IDEAFORGE_FREE_ANALYSIS_LIMIT` | ⬜ | Optional cap for free analyses |

> **Never** commit `.env.local`, push keys to GitHub, or share the **Supabase service role** key publicly. Configure secrets in Vercel / your host’s env UI for production.

---

## 📖 Usage

| Step | Action |
|:---:|:-------|
| 1 | Sign up / sign in |
| 2 | Submit an idea from the landing flow → **`/api/analyze`** creates a session |
| 3 | Open **Workspace** for that session and generate modules **one at a time** |
| 4 | Open **Results** for the full dashboard, sidebar navigation, exports |
| 5 | Use **Download PPT** / **Download PDF** from the results bar |

---

## 🌐 API Architecture

| Route | Role |
|:------|:-----|
| `POST /api/analyze` | Authenticated user → create `idea_sessions` + kick off processing |
| `GET /api/sessions` | List current user’s sessions (dashboard) |
| `GET/PATCH/DELETE /api/sessions/[id]` | Fetch, rename, or delete a session + joined module data |
| `POST /api/sessions/[id]/generate-module` | Run a single AI module by id |
| `GET /api/sessions/[id]/status` | Poll module completion flags |
| `GET /api/download-ppt` | Authorized PPTX download for a session |

**Pattern:** Route Handlers use **Supabase server client** for auth context and **service role** where needed for writes tied to AI pipelines—always scoped by **session ownership** checks.

---

## 📸 Screenshots

<div align="center">

| Placeholder | Suggested caption |
|:-----------:|:------------------|
| ![Home](https://via.placeholder.com/320x200/13131F/7C6EFA?text=Home) | Landing + idea capture |
| ![Workspace](https://via.placeholder.com/320x200/13131F/A855F7?text=Workspace) | Per-module generation |
| ![Results](https://via.placeholder.com/320x200/13131F/22C55E?text=Results) | Full analysis dashboard |

</div>

---

## ⚡ Performance Highlights

| Topic | Approach |
|:------|:---------|
| **AI calls** | JSON `responseMimeType`, retries on rate limits |
| **Modules** | On-demand generation avoids one giant blocking request |
| **Client PDF** | `html-to-image` + jsPDF (no legacy CSS color parser issues) |
| **UI** | Tailwind v4, code-split dynamic imports where appropriate |

---

## 🗺 Future Improvements

- [ ] Public share links polish + OG previews  
- [ ] Team workspaces & org billing  
- [ ] More export formats (Notion, Markdown bundle)  
- [ ] Evals / prompt versioning for reproducible outputs  
- [ ] Optional streaming responses for long modules  
- [ ] i18n for non-English ideas  

---

## 🤝 Contributing

1. **Fork** the repository  
2. Create a **feature branch**: `git checkout -b feat/amazing-thing`  
3. **Commit** with clear messages  
4. **Push** and open a **Pull Request**  

Please keep PRs focused, match existing code style, and run **`npm run lint`** before submitting.

<details>
<summary><b>Contributor code of conduct</b></summary>

Be respectful, assume good intent, and prefer constructive review comments. Harassment or discrimination is not tolerated.

</details>

---

## 📜 License

This project is licensed under the **MIT License** — see [`LICENSE`](./LICENSE).

---

## 👤 Author

<div align="center">

**yasar-pathan**

[![GitHub](https://img.shields.io/badge/GitHub-@yasar--pathan-181717?style=flat&logo=github)](https://github.com/yasar-pathan)

</div>

---

## 📊 GitHub Stats

<div align="center">

<img height="160" src="https://github-readme-stats.vercel.app/api?username=yasar-pathan&show_icons=true&theme=tokyonight&hide_border=true&count_private=true" alt="GitHub stats" />
<img height="160" src="https://github-readme-stats.vercel.app/api/top-langs/?username=yasar-pathan&layout=compact&theme=tokyonight&hide_border=true" alt="Top languages" />

<br />

<img src="https://github-readme-streak-stats.herokuapp.com/?user=yasar-pathan&theme=tokyonight&hide_border=true" alt="Streak stats" />

</div>

---

<div align="center">

### ⭐ If this project helped you, consider starring the repo—it keeps maintainers motivated!

[![Stars](https://img.shields.io/github/stars/yasar-pathan/IdeaForge?style=social)](https://github.com/yasar-pathan/IdeaForge)

**Built with curiosity, caffeine, and a lot of `console.log` → delete.**

🙏 **Acknowledgements** — [Next.js](https://nextjs.org/) · [Supabase](https://supabase.com/) · [Google AI](https://ai.google.dev/) · [Vercel](https://vercel.com/) · everyone who files issues & PRs.

</div>
