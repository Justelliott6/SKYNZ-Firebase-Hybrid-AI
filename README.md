# SKYNZ Firebase Hybrid AI

SKYNZ Launch Canvas turns a creator brief into an editable launch page. Lippy frames the brief, Floater selects the requested route, and the page editor previews validated content. Creators can edit, save, reopen pages in the same browser, or export them as JSON.

- **Hosted app:** https://skynz-hybrid-ai-hackathon.web.app
- **Demonstration:** https://youtu.be/K1SL3r7tBss
- **Source:** https://github.com/Justelliott6/SKYNZ-Firebase-Hybrid-AI

## Run locally

Install Node.js 22.12 or later. From this repository, run:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite (the configured default is http://127.0.0.1:4173). Use `npm run build` to create a production build and `npm run preview` to serve it locally.

### Ollama

Install and start Ollama from https://ollama.com/download. If you need a model, run `ollama pull qwen2.5:3b` and select it under Ollama in the app. This route runs locally and needs the local companion server.

An existing SKYNZ beta can provide its adapter without contributing proprietary source. Set the process environment variable `SKYNZ_LOCAL_OLLAMA_ADAPTER` to the absolute path of its `backend/floater/lib/ollama-provider.mjs`, then launch the local server. This integration is optional.

## Firebase setup

The public app is configured for the Firebase project `skynz-hybrid-ai-hackathon` on the Spark plan. The web client uses Firebase AI Logic with the Gemini Developer API backend and App Check with reCAPTCHA Enterprise. No paid billing was activated.

To configure another test project:

1. Register a Web app, configure Firebase AI Logic with the Gemini Developer API, and select a model available within its free quota.
2. Register the web app in App Check using a reCAPTCHA Enterprise site key. Allowlist the test host, verify attestation, then enforce App Check for Firebase AI Logic.
3. Copy `.env.example` to `.env.local` and fill in the web app API key, app ID, project ID and reCAPTCHA Enterprise site key. Optionally set the Firebase model. Never put Gemini API secrets, private credentials or service accounts in Vite variables.
4. In an eligible desktop Chrome installation, choose **Gemini Nano · on device only** or **Firebase · on device with cloud fallback**. The first on-device model initialization may take several minutes. In hybrid mode, Firebase prefers Nano when it is available and uses cloud only when on-device inference is unavailable.
5. To test cloud inference directly, choose **Firebase · cloud only (direct)** and consent to Firebase processing the brief. The app displays the engine reported by Firebase for the response.
6. To deploy a static build to a Firebase test project, run `npm run build` and use the Firebase CLI to deploy Hosting only. Authorize the hosted domain in the App Check key. Static hosting does not run the Ollama server.

### Current verification note

The public Hosting deployment is live. The existing reCAPTCHA Enterprise site key is 40 characters, and App Check enforcement is enabled for Firebase AI Logic.

The project owner manually verified Gemini Nano on desktop Chrome with a new **Midnight Highway** brief. Nano generated an original page, populated the editor, applied the requested Ember palette, and rendered the live preview. The app reported: **“Draft ready · Gemini Nano · on device. Review it before saving.”** The project owner also reports Firebase AI Logic monitoring recorded a successful Gemini 3.5 Flash-Lite cloud inference at **2.25 seconds**.

I independently exercised **Firebase · on device with cloud fallback** in a separate browser session with the required per-brief Firebase consent. The hybrid route returned a valid structured creator page and reported **“Draft ready · Gemini · Firebase cloud.”** The page was accepted into the editor and live preview with the requested Ember palette, saved on the device, restored after reload, and reopened successfully. The source configures this route with Firebase AI Logic `PREFER_ON_DEVICE`; this run therefore verified its automatic cloud fallback path. No simulated responses were used.

App Check uses the existing 40-character reCAPTCHA Enterprise site key, and enforcement is enabled for Firebase AI Logic. The test project remains on the Spark plan; paid billing was not activated.

Ollama remains a separate local route. Its independent live inference was not retested in this deployment session.

- [Firebase hybrid Web setup](https://firebase.google.com/docs/ai-logic/hybrid/web/get-started)
- [Firebase hybrid configuration options](https://firebase.google.com/docs/ai-logic/hybrid/web/configuration-options)
- [App Check setup](https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider)
- [App Check local debugging](https://firebase.google.com/docs/app-check/web/debug-provider)
- [Hackathon rules](https://firebasehybridaihackathon.devpost.com/rules)

## Scope and license

The original Launch Canvas, Firebase AI Logic integration, App Check setup, standalone local provider and editor were developed for the November 2026 hackathon. The public implementation follows the existing Lippy and Floater roles. Established SKYNZ agent code and installations remain separate. The optional local beta adapter is excluded from this repository.

Licensed under [Apache License 2.0](LICENSE).
