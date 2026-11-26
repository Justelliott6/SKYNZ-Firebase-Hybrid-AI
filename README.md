# SKYNZ Firebase Hybrid AI

SKYNZ Launch Canvas turns a creator brief into an editable creator-page design. Lippy frames the creator's request, Floater routes the work to the selected interchangeable model, and the page-design capability validates and renders the resulting design. Pages can be customized, previewed, saved on the device, reopened, and exported as JSON.

- **Hosted baseline:** https://skynz-hybrid-ai-hackathon.web.app
- **Demonstration:** https://youtu.be/K1SL3r7tBss
- **Source:** https://github.com/Justelliott6/SKYNZ-Firebase-Hybrid-AI
- **Expanded designer release:** custom page layouts, media, and styling are included in the current application.

## Run locally

Install Node.js 22.12 or later. From this repository, run:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite (the configured default is http://127.0.0.1:4173). Run `npm test` for the focused design and URL validation checks. Use `npm run build` to create a production build and `npm run preview` to serve it locally.

### Ollama

Install and start Ollama from https://ollama.com/download. If you need a model, run `ollama pull qwen2.5:3b` and select it under Ollama in the app. This route runs locally and needs the local companion server.

An existing SKYNZ beta can provide its adapter without contributing proprietary source. Set the process environment variable `SKYNZ_LOCAL_OLLAMA_ADAPTER` to the absolute path of its `backend/floater/lib/ollama-provider.mjs`, then launch the local server. This integration is optional.

## Firebase setup

The public baseline is configured for the Firebase project `skynz-hybrid-ai-hackathon` on the Spark plan. The web client uses Firebase AI Logic with the Gemini Developer API backend and App Check with reCAPTCHA Enterprise. No paid billing was activated.

To configure another test project:

1. Register a Web app, configure Firebase AI Logic with the Gemini Developer API, and select a model available within its free quota.
2. Register the web app in App Check using a reCAPTCHA Enterprise site key. Allowlist the test host, verify attestation, then enforce App Check for Firebase AI Logic.
3. Copy `.env.example` to `.env.local` and fill in the web app API key, app ID, project ID, and reCAPTCHA Enterprise site key. Optionally set the Firebase model. Never put Gemini API secrets, private credentials, or service accounts in Vite variables.
4. In an eligible desktop Chrome installation, choose **Gemini Nano � on device only** or **Firebase � on device with cloud fallback**. The first on-device model initialization may take several minutes. Hybrid mode prefers Nano when it is available and uses cloud only when on-device inference is unavailable.
5. To test cloud inference directly, choose **Firebase � cloud only (direct)** and consent to Firebase processing the brief. The app displays the engine reported by Firebase for the response.
6. To deploy a static build to a Firebase test project, run `npm run build` and use the Firebase CLI to deploy Hosting only. Authorize the hosted domain in the App Check key. Static hosting does not run the Ollama server.

## Expanded AI Page Designer

The Launch Canvas generates structured creator-page designs from natural-language briefs. Lippy communicates with the creator; Floater routes each request to the selected interchangeable model; the design capability validates the response and renders it in the editor and live preview. Designs remain editable and can be saved locally, reopened, and exported as JSON.

A design can specify layout, background, custom colors, typography, page sections and navigation, artwork, optional motion, and widget position, size, and appearance. Validated Spotify, YouTube, SoundCloud, and Twitch URLs render through provider embed URLs. Public YouTube or Twitch streams can be shown after OBS sends a creator's broadcast to that provider. The app does not handle stream keys or run AI-generated JavaScript.

The project owner reports a successful local generation using Ollama with Qwen3:4B. Ollama uses the local service at 127.0.0.1:11434. The Vite development server and preview bind to 127.0.0.1; the local adapter checks the request origin against the actual Vite listener port and rejects cross-site requests. Static Firebase Hosting does not expose or proxy local Ollama.

Gemini Nano, Firebase AI Logic hybrid inference, cloud-only inference, App Check, and consent remain available in the existing application. Firebase settings continue to come from local environment configuration and are not committed. The existing demonstration video remains unchanged and documents the original working version; this release adds the expanded designer afterward.

Creator-owned direct publishing and unrestricted design generation are future platform capabilities. The current designer renders validated structured fields and safe provider embeds only.

## Verified baseline results

The public Hosting deployment is live. The existing reCAPTCHA Enterprise site key is 40 characters, and App Check enforcement is enabled for Firebase AI Logic.

The project owner manually verified Gemini Nano on desktop Chrome with a new **Midnight Highway** brief. Nano generated an original page, populated the editor, applied the requested Ember palette, and rendered the live preview. The app reported: **"Draft ready � Gemini Nano � on device. Review it before saving."** The project owner also reports Firebase AI Logic monitoring recorded a successful Gemini 3.5 Flash-Lite cloud inference at **2.25 seconds**.

An independent run of **Firebase � on device with cloud fallback** in a separate browser session returned a valid structured creator page and reported **"Draft ready � Gemini � Firebase cloud."** The page was accepted into the editor and live preview, saved, restored after reload, and reopened successfully. The route is configured with Firebase AI Logic `PREFER_ON_DEVICE`, verifying cloud fallback when Nano was unavailable in that browser. No simulated responses were used.

Ollama remains a separate local route. The project owner reports a successful local Qwen3:4B page-generation run; Ollama does not run in Firebase Hosting.

- [Firebase hybrid Web setup](https://firebase.google.com/docs/ai-logic/hybrid/web/get-started)
- [Firebase hybrid structured output](https://firebase.google.com/docs/ai-logic/hybrid/web/generate-structured-output)
- [App Check setup](https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider)
- [Hackathon rules](https://firebasehybridaihackathon.devpost.com/rules)

## Scope and license

The original Launch Canvas, Firebase AI Logic integration, App Check setup, standalone local provider, and editor were developed for the November 2026 hackathon. Established SKYNZ agent code and installations remain separate. The optional local beta adapter is excluded from this repository.

Licensed under [Apache License 2.0](LICENSE).

