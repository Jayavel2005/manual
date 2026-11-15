# FileHub – Public File Preview Website

FileHub is a modern, lightweight, single-asset public document preview website built with **HTML5**, **CSS3**, and **Vanilla JavaScript**. It delivers an instant, in-browser PDF viewing experience wrapped in a dark SaaS-inspired glassmorphism interface.

---

## 1. Project Overview

- **Single Purpose:** Instantly preview and access one specific document in the browser without sign-ups or downloads.
- **Pure Web Stack:** Zero frontend frameworks (no React, Vue, or Angular), zero backend, zero database, zero authentication.
- **Design Philosophy:** Premium dark theme, deep navy background, violet/blue gradient accents, frosted glass cards, and fluid responsive design across mobile, tablet, and desktop viewports.
- **Embedded Document Viewer:** Hardware-accelerated native PDF viewing via standard `iframe` and `object` embeds with full-screen capability, loading spinners, and error resilience.

---

## 2. Project Directory Structure

```text
filehub/
│
├── index.html        # Semantic HTML5 markup, accessible modal structure
├── style.css         # Dark theme CSS, glassmorphism, responsive styles
├── script.js         # Vanilla JS logic, fileConfig, fullscreen, modal management
│
├── files/
│   └── document.pdf  # Actual PDF document available for public preview
│
└── README.md         # Architecture, configuration, and deployment guides
```

---

## 3. Configuring the File

All document metadata and paths are managed through a single configurable JavaScript object located at the top of `script.js`:

```javascript
const fileConfig = {
  name: "Project Documentation",
  type: "PDF",
  size: "2.5 MB",
  updated: "November 15, 2026",
  path: "files/document.pdf"
};
```

### To preview a different file:
1. Place your new PDF inside the `files/` folder (e.g., `files/annual-report.pdf`).
2. Update the `fileConfig` fields in `script.js` to match your document's name, size, date, and relative path (`files/annual-report.pdf`).
3. Save the file. The homepage card, download links, modal title, and preview iframe will automatically update.

> **Important:** Always use relative file paths (e.g., `files/document.pdf`). Do not use local machine absolute paths (`/Users/...` or `C:\...`) or temporary blob URLs.

---

## 4. Key Features

- **Instant In-Browser Preview:** Opens a dedicated full-featured viewer modal displaying the real PDF document.
- **Full-Screen Inspection:** Native Fullscreen API integration with keyboard shortcut (`F` to toggle, `Esc` to exit).
- **Loading & Error States:** Dynamic spinner during document parsing, with automatic fallback retry and direct download buttons if the viewer encounters network errors.
- **Public Share Link:** One-click clipboard copy of the public URL with toast notification feedback.
- **Direct Download & Tab View:** Instant download options for users who prefer their system's default PDF viewer.
- **Mobile Responsive:** Seamlessly collapses to a full-screen mobile view on smartphones with touch-friendly tap targets and fallback links for mobile browsers.
- **Accessibility & Keyboard Navigation:**
  - `Esc` closes active preview and about dialogs.
  - `F` toggles full-screen preview.
  - Full ARIA dialog roles (`role="dialog"`, `aria-modal="true"`) and focus restoration.

---

## 5. Local Development and Testing

You can run FileHub locally using any simple HTTP server or by opening `index.html` directly in a modern browser.

### Option A: Python 3 Built-in HTTP Server (Recommended)
Open a terminal in the `filehub` folder and run:
```bash
python3 -m http.server 8080
```
Open your browser and navigate to:
```
http://localhost:8080
```

### Option B: Node.js `npx serve`
```bash
npx serve .
```

### Option C: Direct File Opening
Double-click `index.html` or open it with Google Chrome, Mozilla Firefox, Microsoft Edge, or Apple Safari.

---

## 6. Deployment Instructions

FileHub is 100% static and ready to be hosted on any edge CDN or static hosting platform.

### Option 1: Netlify (Easiest & Fastest)

Netlify provides instant drag-and-drop static hosting with global CDN and automated HTTPS.

1. **Create a Netlify Account:**
   - Go to [https://app.netlify.com/signup](https://app.netlify.com/signup) and create a free account.
2. **Access Netlify Drop:**
   - Navigate to [https://app.netlify.com/drop](https://app.netlify.com/drop) in your web browser.
3. **Upload the Project Folder:**
   - Drag and drop the complete `filehub` folder into the upload target area on the page.
   - Ensure the folder contains `index.html`, `style.css`, `script.js`, and the `files/` folder with `document.pdf`.
4. **Deploy the Website:**
   - Netlify will process and publish your site in seconds.
5. **Obtain the Public Website URL:**
   - Netlify will assign a unique public production URL (e.g., `https://filehub-preview-xyz.netlify.app`).
6. **Test the PDF Preview:**
   - Open your deployed URL on desktop and mobile.
   - Click **Preview File** to verify the PDF renders directly in the browser.
   - Test the **Fullscreen** button and **Download** button.

---

### Option 2: GitHub Pages (Free Static Hosting via Git)

GitHub Pages hosts static websites directly from a GitHub repository.

1. **Create a GitHub Repository:**
   - Log in to your GitHub account at [https://github.com](https://github.com).
   - Click **New repository** (e.g., repository name: `filehub`).
   - Set visibility to **Public** and create the repository.
2. **Upload All Project Files:**
   - In your local terminal, navigate to the `filehub` directory:
     ```bash
     cd filehub
     git init
     git add .
     git commit -m "Initial commit: FileHub public file preview"
     git branch -M main
     git remote add origin https://github.com/<your-username>/filehub.git
     git push -u origin main
     ```
   - Alternatively, use the **Upload files** button on the GitHub repository web page to upload `index.html`, `style.css`, `script.js`, `README.md`, and the `files/` directory.
3. **Enable GitHub Pages:**
   - In your GitHub repository, click the **Settings** tab.
   - On the left sidebar, click **Pages** (under the "Code and automation" section).
   - Under **Build and deployment > Source**, select **Deploy from a branch**.
   - Under **Branch**, select `main` and folder `/(root)`, then click **Save**.
4. **Obtain the Public Website URL:**
   - After 30–60 seconds, refresh the Pages settings tab.
   - A banner will show: `"Your site is live at https://<your-username>.github.io/filehub/"`.
5. **Test the PDF Preview:**
   - Visit the public GitHub Pages URL.
   - Confirm that the homepage loads, the PDF modal launches, and the document displays correctly.

---

## 7. Verification Checklist

Before publishing, verify all checklist items:

- [x] **Homepage Loads Correctly:** Clean SaaS dark theme with deep navy background and glassmorphism cards.
- [x] **PDF Preview Opens:** Clicking "Preview File" opens the dedicated viewer modal with smooth animation.
- [x] **PDF Displays the Actual Document:** Renders vector document pages with clear typography, tables, and sections.
- [x] **Close Button Works:** Returns to the homepage via top-right close icon (`X`), backdrop click, or the `Esc` key.
- [x] **Full-Screen Button Works:** Maximizes the PDF viewing interface to fill the screen (`Fullscreen` toggle / `F` key).
- [x] **Relative File Paths:** Document is referenced strictly via `files/document.pdf`.
- [x] **Mobile Layout Works:** Responsive layout adapts gracefully down to small screens with touch-friendly controls.
- [x] **Deployment Instructions Accurate:** Clear, verified steps for Netlify and GitHub Pages.

---

## 8. License

This project is open-source under the MIT License. You are free to modify, host, and distribute it.
