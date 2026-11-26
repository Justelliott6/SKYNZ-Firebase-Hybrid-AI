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

A live direct cloud request returned a valid structured creator page through Firebase AI Logic. Launch Canvas identified the response as **Gemini · Firebase cloud**; the draft filled the editor and preview, saved locally, and was restored after a page reload. A separate hybrid-mode request executed Gemini Nano on device, but its output did not pass the structured page validator. Because Nano was available, Firebase's hybrid mode did not fall back to cloud for that request. The cloud-only route was added to make direct cloud verification available without mislabeling the hybrid result. No simulated responses were used.

Ollama remains a separate local route. Its independent live inference was not retested in this deployment session.

- [Firebase hybrid Web setup](https://firebase.google.com/docs/ai-logic/hybrid/web/get-started)
- [Firebase hybrid configuration options](https://firebase.google.com/docs/ai-logic/hybrid/web/configuration-options)
- [App Check setup](https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider)
- [App Check local debugging](https://firebase.google.com/docs/app-check/web/debug-provider)
- [Hackathon rules](https://firebasehybridaihackathon.devpost.com/rules)

## Scope and license

The original Launch Canvas, Firebase AI Logic integration, App Check setup, standalone local provider and editor were developed for the November 2026 hackathon. The public implementation follows the existing Lippy and Floater roles. Established SKYNZ agent code and installations remain separate. The optional local beta adapter is excluded from this repository.

Licensed under [Apache License 2.0](LICENSE).
