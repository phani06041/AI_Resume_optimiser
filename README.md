# 🌟 AI Resume Pro — Optimize Your Career

A premium, state-of-the-art Single Page Web Application (SPA) designed to parse, analyze, and optimize resumes against target job descriptions using client-side AI integration. Built using HTML, CSS, JavaScript, and Vite.

🔗 **[Launch Live Web Application](https://phani06041.github.io/AI_Resume_optimiser/)**

---

## 🎨 Preview & Interface Showcases

### 1. Cyber Dark Dashboard
An immersive, frosted dark glassmorphic UI with vibrant violet and emerald highlights, rounded dashes, and high-fidelity hovering icons.
![Dashboard UI](./screenshots/dashboard_dark.png)

### 2. Holographic Scanner & Analysis
A premium holographic laser document scanner displaying real-time keyword overlap tags and circular SVG progress matching meters.
![Analysis & Scanner](./screenshots/analysis.png)

### 3. Integrated AI Career Coach
A slide-out conversation assistant panel featuring translucent message bubbles and direct context integration.
![Chatbot Drawer](./screenshots/chatbot.png)

### 4. VS Code Monospace Editor
Interactive cover letter and resume previewers styled with Mac window control dots, code typography, and custom scrollbars.
![Monospace Editors](./screenshots/editor_premium.png)

---

## ⚡ Core Features

* **Real-time Document Parser**: Client-side extraction of `.pdf`, `.docx`, and `.txt` files directly in your browser.
* **Circular SVG Match Meter**: Visually synced score indicators across dashboard badges, analysis metrics, and sidebar progress trackers.
* **Self-Healing LLM Executor**: Automatic rate-limit detection fallback between Google Gemini and OpenAI models.
* **Brutal Resume Roaster**: A portal loading harsh feedback platforms into inline viewports with conditional developer config alerts.
* **Resume Exporter**: Download cover letters and refined resumes as Plain Text, Markdown, HTML, or styled print-ready PDF files.

---

## 🚀 Setup & Local Installation

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **npm** (comes bundled with Node)

### 1. Clone the repository
```bash
git clone https://github.com/phani06041/AI_Resume_optimiser.git
cd AI_Resume_optimiser
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the development server
```bash
npm run dev
```
Access the local preview at: **`http://localhost:5173/`**

### 4. Compile the production bundle
```bash
npm run build
```

---

## 🛸 GitHub Pages Auto-Deployment

The repository is pre-configured with a **GitHub Actions CI/CD Pipeline** that automates deployment on push.

### Workflow Configuration:
* File location: `.github/workflows/deploy.yml`
* Target Branch: `gh-pages`
* Project Base URL configured inside: `vite.config.js`

### To deploy your updates:
1. Ensure your settings branch is linked: Go to **Settings** -> **Pages** inside your GitHub repository.
2. Under **Build and deployment**, set the branch source option to **`gh-pages`** and click **Save**.
3. Push your commits to `main` and the pipeline will build and serve your site automatically!
