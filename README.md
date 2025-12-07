# 🔥 Smash or Pass AI

An image analysis project based on the **Google Gemini Vision API** — Upload any image, and let the AI judge its "F\*\*kability" and give it a rating.

This project has been upgraded to a **Cloudflare Pages Full-Stack Architecture**, supporting backend API Key rotation, zero-cost health checks, and Bring Your Own Key (BYOK) functionality.

> ⚠️ **Disclaimer**: This project is assisted by Gemini and contains adult/explicit/vulgar vocabulary. It is intended solely for AI Prompt Engineering research and demonstration purposes. Do not use it for illegal activities, harassment, or to violate platform policies.

-----

## 👉 Author [𝕏 @Yamada\_Ryoooo](https://x.com/Yamada_Ryoooo)

-----

## 🌐 Live Demo

> [**Click Here for Online Demo**](https://ccb-2uw.pages.dev/)
>
> *Deployed on Cloudflare Pages. Serverless and completely free.*

-----

## 🧩 Project Structure

This project uses a **Static Frontend + Cloudflare Worker Backend** architecture. No build process required—just unzip and run.

```text
/
├── index.html        # Main Page (New Dashboard UI)
├── styles.css        # Glassmorphism Style + Responsive Layout
├── main.js           # Core Logic (UI Interaction, Auto-test, Event Listeners)
├── api.js            # Frontend API Module (Points to /submit)
├── _worker.js        # [Core] Cloudflare Backend (Proxy, Rotation, BYOK Logic)
├── settings.js       # Settings Management (LocalStorage)
├── store.js          # History Management
├── ui.js             # UI Rendering Helpers
├── prompts.js        # AI System Prompts (The "Personality")
├── config.js         # Basic Config
└── manifest.json     # PWA Configuration
```

-----

## ⚙️ Core Features

### 🤖 Powerful AI Analysis

  - **Brief Mode**: Quick, one-sentence evaluation. Straight to the point.
  - **Descriptive Mode**: Explicit, detailed analysis (3+ sentences) from head to toe.
  - **Novel Mode**: Generates a long-form, hardcore erotic scenario (400+ words).

### 🛡️ Backend Capabilities (New)

  - **🔄 API Key Rotation Pool**: Configure multiple API Keys in the Cloudflare dashboard. When a key is exhausted (429 Error), the system automatically switches to the next one, ensuring high availability.
  - **⚡ Zero-Cost Health Check**: Automatically tests connectivity on page load (using the `List Models` endpoint), consuming **zero** generation quota (Tokens).
  - **🔑 BYOK (Bring Your Own Key)**: Users can enter their own Key in "Advanced Settings". The system prioritizes the user's Key without consuming the server's shared quota.
  - **🔒 Privacy First**: Stateless backend. No database. User images are processed in memory streams and discarded immediately after analysis.

### 🎨 Ultimate Experience

  - **🖼️ Smart Image Processing**: Supports drag-and-drop, auto-detects and converts HEIC format, and automatically compresses images to under 10MB.
  - **🪟 Glassmorphism UI**: Brand new dashboard design with breathing status lights and smooth interactive animations.
  - **💾 Local History**: Saves rating records locally via LocalStorage, supporting review and sharing.
  - **🌏 Global Access**: Built-in reverse proxy allows access from restricted regions without needing a VPN.

-----

## 🚀 Deployment Guide (Cloudflare Pages)

Designed specifically for **Cloudflare Pages**. Deploy for free in just a few steps.

### 1\. Prepare Code

Ensure you have the complete project files, and that `_worker.js` is in the root directory.

### 2\. Create Project

1.  Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2.  Go to **Compute (Workers & Pages)** -\> **Pages**.
3.  Click **Create a project** -\> **Upload assets**.
4.  Enter a project name (e.g., `smash-or-pass`) and click **Create project**.

### 3\. Upload Code

Drag and drop the entire **project folder** containing all files into the upload area.

### 4\. Configure Environment Variables (Crucial)

After uploading, **do not visit the site yet**. You need to configure the API Key pool.

1.  On the project page, click **Settings** -\> **Environment variables**.
2.  Click **Add variable**.
3.  Add the variable:
      * **Variable name**: `GEMINI_API_KEY` (or `API_KEYS`)
      * **Value**: `AIzaSy... AIzaSy... AIzaSy...`
      * *Tip: Separate multiple keys with **spaces**. The system will automatically identify and rotate them.*
4.  Click **Save**.

### 5\. Redeploy

Environment variables only take effect after a new deployment.

1.  Go to the **Deployments** tab.
2.  Find the latest deployment record, click the `...` on the right -\> **Retry deployment**.
3.  Wait for the deployment to finish, then click the generated URL to access\!

-----

## 🛠️ Configuration Guide

### Method 1: Shared Quota (Default)

Once the deployer configures the `GEMINI_API_KEY` in Cloudflare, visitors can use the tool immediately without any setup. The system rotates the backend Key pool automatically.

### Method 2: Custom Key (BYOK)

If you want to use your own quota or run it locally:

1.  Click **⚙️ Advanced Settings** at the bottom of the dashboard.
2.  Enter your **Google Gemini API Key** in the input box.
3.  The system will auto-save the config and prioritize your Key for requests.

-----

## 🧠 Tech Stack

| Module | Technology |
|------|------|
| **Backend Runtime** | Cloudflare Pages Functions (`_worker.js`) |
| **Frontend Framework** | Native JavaScript (ES Modules) |
| **Visual Style** | CSS Glassmorphism |
| **Data Storage** | Browser LocalStorage |
| **AI Model** | Google Gemini 2.5 Flash / Pro |

-----

## 🚨 FAQ

**Q: Why do I get "Analysis Failed: Blocked by Safety Policy"?**

> **Important:** If you see this error or "Empty Content," it means the image triggered Google's official safety filters (e.g., CSAM or extreme violence). Although the app is configured to be permissive, the Google API retains final say. Please try a different image or model.

**Q: Why does the status bar show a red ERR?**

> Please check:
>
> 1.  Is the `GEMINI_API_KEY` environment variable configured correctly in Cloudflare?
> 2.  Did you perform a **Retry deployment** after adding the variable?
> 3.  Is your API Key expired or banned?

-----

## 🪪 License

MIT License © 2025 Yamada-Ryo4