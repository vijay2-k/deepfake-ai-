# 🔍 KRYPTX — AI Media Forensics

<p align="center">
  <img src="https://img.shields.io/badge/AI-Media%20Forensics-6C63FF?style=for-the-badge" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-Enabled-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Google-Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" />
</p>

<p align="center">
  **Advanced AI-Powered Image, Video & Audio Forensics Platform**
</p>

---

## 🌐 Project Overview

KRYPTX is a full-stack web application for examining images, videos, and audio for signs of AI generation or manipulation. The source archive is named `truelens-ai--main`; the application UI uses the KRYPTX brand.

It combines local forensic analysis with Google Gemini and an optional Hive integration, and provides scan history, detailed findings, and administrator tools for managing forensic knowledge and dataset preparation.

> ⚠️ **Development / Prototype Notice:** Detection scores and generator attributions are estimates, not proof of authenticity. The bundled evaluation script generates simulated predictions; its reports do not establish real-world model accuracy.

**🔗 Repository:** [vijay2-k/truelens-ai-](https://github.com/vijay2-k/truelens-ai-)

---

## ✨ Key Features

- 🖼️ **Image Analysis:** Metadata inspection, local image forensic signals, spatial findings, and AI-assisted interpretation.
- 🎬 **Video Analysis:** Gemini-assisted examination of synthetic content and temporal inconsistencies.
- 🎧 **Audio Analysis:** Local signal analysis with optional Gemini-assisted interpretation.
- 📊 **Results & History:** Detailed reports, confidence indicators, previous scans, and usage statistics.
- 🛡️ **Administrator Workspace:** Authenticated administration, reference media, training conversations, approval workflows, knowledge releases, and audit logs.
- 🗂️ **Dataset Utilities:** Dataset registry, manifest generation, inspection scripts, and checkpoint compatibility reporting.
- 🎨 **Interactive Interface:** React UI with animation and Three.js visual components.

---

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| 💻 Frontend | React 19, TypeScript, Vite, Tailwind CSS 4 |
| 🎨 UI & Visuals | Motion, Lucide React, Three.js |
| ⚙️ Backend | Express, TypeScript executed with `tsx` |
| 🤖 AI Services | Google GenAI SDK, Optional Hive API |
| 🖼️ Media Processing | Sharp, exifr, Multer, FFmpeg/FFprobe packages |
| 💾 Persistence | Local JSON database and filesystem uploads |
| 🐍 Additional Utilities | Node.js scripts and Python inspection scripts |

---

## 🚀 Installation & Setup

### 📋 Prerequisites

- Node.js version compatible with the dependencies in `package.json`, plus npm. The project does not declare a Node.js `engines` requirement.
- Google Gemini API key for the normal image and video analysis paths.
- Internet access for dependency installation and external AI calls.
- Write access to the project's `data/` directory.

**Note:** Python is only needed for the separate Python inspection utilities, not for starting the web application.

### 1️⃣ Install Dependencies

Clone the repository and install dependencies:

```bash
git clone https://github.com/vijay2-k/truelens-ai-.git
cd truelens-ai-
npm install
```

Alternatively, extract the supplied ZIP, open a terminal in `truelens-ai--main`, and run `npm install`. The documentation below is based on that supplied archive; the GitHub branch may change independently.

The archive includes both `package-lock.json` and `bun.lock`. The commands below use npm consistently.

### 2️⃣ Configure Environment Variables

Copy `.env.example` to `.env`.

**Linux / macOS:**

```bash
cp .env.example .env
```

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

Edit `.env` and replace the placeholders:

```dotenv
GEMINI_API_KEY=replace_with_your_gemini_key
APP_URL=http://localhost:3000
HIVE_API_KEY=
HIVE_API_ENDPOINT=https://api.thehive.ai/api/v2/task/sync
KRYPTX_ADMIN_INITIAL_PASSWORD=replace_with_a_strong_unique_password
```

### 🔑 Environment Configuration

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Enables Gemini requests. Normal image and video routes return a configuration error without a usable key. |
| `GOOGLE_API_KEY` | Alternative Gemini key read by the server. |
| `HIVE_API_KEY` | Optional Hive integration. Leave empty if unused. |
| `HIVE_API_ENDPOINT` | Hive endpoint; defaults to the URL shown above. |
| `KRYPTX_ADMIN_INITIAL_PASSWORD` | Sets the administrator password only when the database has no administrator record. |
| `APP_URL` | URL documented in the example environment; does not control the server's listening port. |
| `PORT` | Server port; defaults to `3000`. |
| `NODE_ENV` | Set to `production` to serve an existing `dist/` build. |
| `DISABLE_HMR` | Set to `true` to disable development hot reload. |

> ℹ️ Local forensic code and some fallback paths exist, but the entire application should not be described as operating offline without API keys.

### 3️⃣ Start Development Server

```bash
npm run dev
```

🌐 Open **http://localhost:3000**.

Express serves the API and mounts Vite in middleware mode, so a second frontend server is unnecessary.

---

## 🧪 Application Usage

1. Open the application and choose the relevant media analysis option.
2. Select a media file and submit it for analysis.
3. Review the verdict, confidence, and supporting forensic observations.
4. Use the history dashboard to inspect previous scans.

### 📦 Media Upload Specifications

| Media | Maximum Size |
|---|---:|
| 🖼️ Image | 25 MiB |
| 🎬 Video | 100 MiB |
| 🎧 Audio | 50 MiB |
| 🛡️ Administrator Reference Media | 50 MiB |
| 🗂️ Training Dataset Archive | 500 MiB |

Actual format acceptance also depends on validation and the underlying media processors.

---

## 🛡️ Administrator Dashboard

### 🔐 Administrator Access

Use the administrator tab in the sign-in dialog.

**Configured administrator email:** `admin@kryptx-forensics.io`

For a fresh database, use the password set in `KRYPTX_ADMIN_INITIAL_PASSWORD` before the first server start.

The supplied archive already contains `data/db.json`; an existing administrator record means changing this variable will **not** reset the password.

An authenticated password-rotation endpoint is available at:

```text
/api/admin/rotate-password
```

### 🧹 Clean Local Installation

For a deliberately clean local installation:

1. Stop the server.
2. Back up the existing `data/db.json`.
3. Move the existing database out of the project.
4. Restart the server.

This initializes a new database and does not retain the previous history, administrator, or training records.

> ℹ️ The ordinary analyst sign-in is a profile/demo flow, not a production identity-verification system.

---

## ⚡ Available NPM Commands

| Command | Description |
|---|---|
| `npm run dev` | Starts Express with Vite development middleware. |
| `npm run build` | Builds the frontend into `dist/`. |
| `npm start` | Starts the same TypeScript server; behavior depends on `NODE_ENV` and whether `dist/` exists. |
| `npm run preview` | Starts Vite's frontend preview only; does not start the Express API. |
| `npm run lint` | Runs TypeScript checking with `tsc --noEmit`. |
| `npm run clean` | Deletes `dist/` and `server.js` using `rm`; requires a compatible shell. |

### 🏗️ Production Build

**Build the frontend:**

```bash
npm run build
```

**Start production server:**

```bash
NODE_ENV=production npm start
```

**Windows PowerShell:**

```powershell
npm run build
$env:NODE_ENV = "production"
npm start
```

> ⚠️ Keep the server dependencies available: the backend still runs through `tsx`; `npm run build` does not compile it into a standalone backend bundle. If `dist/` is missing, the server falls back to Vite middleware even when `NODE_ENV=production`.

---

## 📁 Project Architecture & Directory Structure

| Path | Description |
|---|---|
| `server.ts` | Express API, provider calls, persistence, administrator workflows, and frontend serving |
| `src/App.tsx` | Main application UI and state |
| `src/components/` | Upload, results, history, authentication, and administrator interfaces |
| `src/utils/` | Image/audio forensics, Hive integration, and analysis helpers |
| `src/types/detector.ts` | Detection and administrator data types |
| `src/data/` | UI sample data and generation-source definitions |
| `public/` | Static visual assets |
| `data/db.json` | Local application database |
| `data/uploads/` | Media upload working directory |
| `data/training_uploads/` | Administrator reference media |
| `data/datasets/` | Dataset manifests |
| `data/training_datasets/` | Dataset samples and inspection output |
| `data/evaluation/` | Evaluation output |
| `models/checkpoints/` | Bundled checkpoint artifacts |
| `scripts/` | Diagnostics, inspection, evaluation, and maintenance scripts |
| `.env.example` | Environment template |
| `vite.config.ts` | Frontend tooling configuration |

---

## 🔌 API Documentation

All paths are relative to the application server.

### 🖼️ Media Analysis APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/analyze` | Analyze an image |
| POST | `/api/analyze/video` | Analyze a video |
| POST | `/api/analyze/audio` | Analyze audio |
| GET | `/api/analyze/jobs/:jobId` | Retrieve image-analysis job progress |

### 📊 Application APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/provider-status` | Inspect configured provider status |
| GET | `/api/history` | Retrieve analysis history |
| GET | `/api/stats` | Retrieve usage statistics |
| GET | `/api/quota` | Retrieve quota information |
| GET | `/api/generation-sources` | Retrieve generation-source definitions |

### 🔐 Administrator APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/admin/login` | Authenticate the administrator |
| GET | `/api/admin/verify` | Verify an administrator session |

Additional administrator endpoints under `/api/admin/intelligence/` and `/api/admin/training/` manage sessions, releases, datasets, and configuration. Consult `server.ts` for complete request and response structures.

### 💻 API Request Example

The analysis routes accept multipart uploads under the field name `file`.

**Image Analysis:**

```bash
curl -X POST http://localhost:3000/api/analyze \
  -F "file=@/path/to/image.jpg"
```

---

## 🗂️ Dataset & Evaluation Utilities

From the project root:

### 📑 Dataset Manifest Generation

```bash
node scripts/dataset_pipeline/prepare_datasets.cjs
```

### 📈 Simulated Evaluation Report

```bash
node scripts/evaluation/evaluate_models.cjs
```

These commands write to `data/`. Manifest generation uses predefined sample counts and metadata; it does not download, verify, or train on the listed datasets.

The evaluation script uses randomized synthetic predictions, so its metrics are demonstration output rather than measured detector performance.

### 🐍 Python Inspection Utilities

Python utilities in `scripts/ml_pipeline/` inspect datasets and checkpoint structure.

Review their arguments and imports before use; the archive does not provide a dedicated Python requirements file.

### 🧠 Model Checkpoint Compatibility

The included checkpoint compatibility report identifies an EfficientNet-B0 binary face/deepfake checkpoint.

It explicitly marks it unsuitable as a general whole-image AI classifier.

Checkpoint files and an administrator "training" interface do not by themselves establish an integrated model-training or inference pipeline.

---

## 🧰 Validation & Troubleshooting

Run the available source and frontend checks:

```bash
npm run lint
npm run build
```

There is no `npm test` script. Individual `scripts/test_*` files are diagnostic utilities and may require a running server, API credentials, particular fixtures, or adjusted paths.

The `patch_*` and `update_*` scripts modify source files and are not installation steps.

### 🔧 Common Issues & Solutions

| Problem | What to Check |
|---|---|
| Missing-key or HTTP 503 response | Set a real `GEMINI_API_KEY` in the project-root `.env`; inspect the server output. |
| Hive is unavailable | Check its key and endpoint; local analysis paths are available, but Gemini configuration remains separately necessary. |
| Upload rejected | Check the media size, file contents, and accepted format. |
| Administrator password does not work | Check whether the bundled database already has an administrator record. The initial-password variable does not overwrite it. |
| Frontend loads but API calls fail | Run `npm run dev` or the Express production server, rather than only `npm run preview`. |
| Native dependency or media processing error | Check Node compatibility and successful installation of Sharp and FFmpeg/FFprobe packages. |
| Port is already occupied | Set `PORT` to an available port and open that port in the browser. |

---

## 🔒 Data Storage & Deployment Considerations

### 💾 Data Persistence

The application stores records and uploads locally.

Supabase schema guidance is included, but the current backend persists to `data/db.json`; Supabase is not required for local startup.

### 🔑 Security Considerations

The supplied archive contains existing database records and media. Review those contents before distributing the project.

- Keep API keys out of public repositories.
- Protect administrator tokens.
- Keep user uploads and private records secure.
- Configure a unique administrator password rather than relying on the source-code fallback.

### 🚀 Production Deployment Considerations

Before public deployment, review:

- Authentication and authorization.
- Quota enforcement.
- Upload handling.
- External URL fetching.
- Data retention.
- Database durability and concurrency.
- Multi-user production scalability.

The server binds to `0.0.0.0`, and a JSON-file database needs additional durability and concurrency planning for multi-user production use.

Media may be sent to configured external AI providers during analysis.

---

## ⚠️ Known Limitations & Disclaimer

- Detection scores are estimates, not proof of authenticity.
- Generator attributions are estimates.
- Bundled evaluation predictions are simulated.
- Dataset manifest generation does not download or train models.
- Checkpoint compatibility does not establish a complete inference pipeline.
- Normal image and video analysis requires a usable Gemini API key.
- Optional Hive functionality requires its own configuration.
- Local JSON persistence has production scalability limitations.

---

## 📜 License

No license file is included in this archive.

Add an appropriate project license before redistribution, and review the separate permissions for bundled datasets, media, and model checkpoints.

---

## 👨‍💻 Project Credits & Acknowledgements

**Project:** KRYPTX — AI Media Forensics

**Repository:** [GitHub Repository](https://github.com/vijay2-k/truelens-ai-)

**Technologies & Integrations:**
- React
- TypeScript
- Vite
- Express
- Google Gemini
- Hive AI (Optional)
- Three.js
- FFmpeg

---

<p align="center">
  🔍 **KRYPTX — Investigate. Analyze. Verify.**
  <br/>
  <i>Exploring the future of AI-powered digital media forensics.</i>
</p>

---

> 📌 **Documentation Note:** This README describes the supplied source archive. Installation, builds, and live provider calls were not executed as part of preparing this documentation.
