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

An existing SKYNZ beta can provide its adapter without contributing proprietary source. Set the process environment variable `SKYNZ_LOCAL_OLLAMA_ADAPTER` to the absolute path of its `backend/floater/lib/ollama-provider.mjs), then launch the local server. This integration is optional.

## Firebase setup

The public app is configured for the Firebase project `skynz-hybrid-ai-hackathon` on the Spark plan. The web client uses Firebase AI Logic with the Gemini Developer API backend and App Check with reCAPTCHA Enterprise. The project does not use paid billing.

To configure another test project:

1. Register a Web app, configure Firebase AI Logic with the Gemini Developer API, and select a model available within its free quota.
2. Register the web app in App Check using a reCAPTCHA Enterprise site key. Allowlist the test host, verify attestation, then enforce App Check for Firebase AI Logic.
3. Copy `.env.example` to `.env.local` and fill in the web app API key, app ID, project ID and reCAPTCHA Enterprise site key. Optionally set the Firebase model. Never put Gemini API secrets, private credentials or service accounts in Vite variables.
4. Run the app in an eligible desktop Chrome installation with Gemini Nano available. The first on-device model initialization may take several minutes.
5. Choose the Firebase hybrid route and consent to cloud fallback for a request. On a device where Gemini Nano is unavailable, fallback may use Firebase cloud inference. The on-device-only mode does not use cloud fallback.
6. To deploy a static build to a Firebase test project, run `npm run build` and use the Firebase CLI to deploy Hosting only. Authorize the hosted domain in the App Check key. Static hosting does not run the Ollama server.

### Current verification note

The public Hosting deployment and App Check registration are active. The existing reCAPTCHA Enterprise site key is 40 characters and App Check enforcement is enabled for Firebase AI Logic. A live Firebase hybrid request reached the generation flow, but the returned content failed Launch Canvas structured-draft validation; no generated page was accepted. Ollama and the local page editor remain available. This known limitation is recorded here so hosted test results are not misrepresented.

- [Firebase hybrid Web setup](https://firebase.google.com/docs/ai-logic/hybrid/web/get-started)
- [App Check setup](https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider)
- [App Check local debugging](https://firebase.google.com/docs/app-check/web/debug-provider)
- [Hackathon rules](https://firebasehybridaihackathon.devpost.com/rules)

## Scope and license

Launch Canvas, its Firebase AI Logic integration, App Check setup, standalone local provider and editor were developed for the November 2026 hackathon. The public implementation follows the existing Lippy and Floater roles. Established SKYNZ agent code and installations remain separate. The optional local beta adapter is excluded from this repository.

Licensed under [Apache License 2.0](LICENSE).
