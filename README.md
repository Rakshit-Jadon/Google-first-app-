# Goku Interactive AI Avatar 🐉🔥

**Version:** 1.0.0
**Author:** Raksh

## 📖 Description
An immersive, voice-driven 3D interactive virtual assistant featuring Goku from Dragon Ball. Powered by Google's cutting-edge Gemini 2.5 Flash AI, this application completely removes the traditional text-chat interface in favor of a full-screen, visually stunning procedural canvas avatar. Goku listens to your voice, calculates his emotional response, and dynamically animates in real-time while speaking back to you!

## ✨ Key Features
- **Voice-First Interaction:** Talk directly to Goku using the Web Speech API (Speech-to-Text).
- **Dynamic 2.5D Animations:** A beautifully coded procedural HTML5 Canvas renders Goku, his aura, and his Super Saiyan transformations dynamically.
- **Emotion Engine:** The Gemini AI actively determines Goku's emotional state (`laugh`, `idle`, `angry`, `attack`), which is parsed and visually acted out in the browser.
- **Native Voice Output:** Goku responds aloud using browser-native Text-to-Speech (TTS).
- **Interactive Subtitles:** A sleek, glowing subtitle UI provides visual feedback on Goku's thoughts and speech.

## 🛠️ Technology Stack
- **Backend:** Python 3.11, FastAPI, Uvicorn
- **AI Core:** Google Generative AI (`gemini-2.5-flash`)
- **Frontend:** Vanilla HTML/CSS/JS, HTML5 Canvas Rendering
- **Deployment:** Docker, Google Cloud Run

---

## 🚀 How to Run Locally

1. **Clone the repository** and navigate to the project folder.
2. **Double-click `run.bat`** (Windows).
3. The script will automatically start the FastAPI server and open your default web browser to `http://localhost:8000/`.

---

## ☁️ How to Deploy to Google Cloud Run

This repository is completely prepared for a 1-click deployment to Google Cloud using the included `Dockerfile` and `.dockerignore`.

1. Upload or push this entire folder to your **GitHub account**.
2. Go to the [Google Cloud Console - Cloud Run](https://console.cloud.google.com/run).
3. Click **"Create Service"**.
4. Choose **"Continuous Deployment from a repository"** and connect your GitHub account.
5. Select this repository. Cloud Run will automatically detect the `Dockerfile`.
6. Scroll down to **"Environment Variables"** and click **"Add Variable"**:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** *(Paste your Google Gemini API Key here)*
7. Click **Deploy**! 

Google Cloud will build the container and provide you with a live, public HTTPS URL that you can share with anyone!
